import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Only import and initialize Stripe if the secret key is available
// Using dynamic import to avoid build errors when Stripe is not configured
let stripe: any = null;

async function initializeStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  
  try {
    const Stripe = (await import("stripe")).default;
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia" as any,
    });
  } catch (error) {
    console.warn("Stripe not available:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json(
      { error: "Order ID is required" },
      { status: 400 }
    );
  }

  // Initialize Stripe if not already done
  if (!stripe) {
    stripe = await initializeStripe();
  }

  // Check if Stripe is configured
  if (!stripe || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { 
        error: "Payment processing is not configured. Please contact support.",
        configured: false 
      },
      { status: 503 }
    );
  }

  try {
    // Fetch order from database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "Order already processed" },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Impresión Personalizada",
              description: `Impresión ${order.image_url}`,
            },
            unit_amount: Math.round(order.total_amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${request.nextUrl.origin}/upload?cancelled=true`,
      metadata: {
        order_id: orderId,
      },
    });

    // Update order with Stripe session ID
    await supabase
      .from("orders")
      .update({
        stripe_checkout_session_id: session.id,
      })
      .eq("id", orderId);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

