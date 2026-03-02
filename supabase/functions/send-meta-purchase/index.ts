import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, client_ip_address, client_user_agent } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "orderId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get IP from request headers if not provided (fallback)
    const requestIp = client_ip_address || 
                     req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     req.headers.get("x-real-ip") ||
                     null;
    
    // Get user agent from request if not provided (fallback)
    const requestUserAgent = client_user_agent || 
                            req.headers.get("user-agent") ||
                            null;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const metaPixelId = Deno.env.get("META_PIXEL_ID")!;
    const metaAccessToken = Deno.env.get("META_CAPI_ACCESS_TOKEN")!;

    if (!supabaseUrl || !supabaseServiceKey || !metaPixelId || !metaAccessToken) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch order and verify payment status
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify payment was successful
    if (order.status !== "paid") {
      console.log(`Order ${orderId} is not paid (status: ${order.status})`);
      return new Response(
        JSON.stringify({ error: "Order is not paid" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch checkout data (fbp, fbc, email)
    const { data: checkoutData, error: checkoutError } = await supabase
      .from("checkout_data")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (checkoutError || !checkoutData) {
      console.warn(`Checkout data not found for order ${orderId}, proceeding without fbp/fbc`);
    }

    // Use IP and user agent from request if checkout_data doesn't have them
    const finalClientIp = requestIp || checkoutData?.client_ip_address || null;
    const finalUserAgent = requestUserAgent || checkoutData?.client_user_agent || null;

    // Fetch order items for content data
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (itemsError) {
      console.warn("Error fetching order items:", itemsError);
    }

    // Hash email with SHA-256
    const hashEmail = async (email: string): Promise<string> => {
      const encoder = new TextEncoder();
      const data = encoder.encode(email.toLowerCase().trim());
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    };

    const hashedEmail = order.customer_email
      ? await hashEmail(order.customer_email)
      : null;

    // Build contents array from order items
    const contents = orderItems?.map((item, index) => ({
      id: item.id || `${orderId}-${index}`,
      quantity: 1,
      item_price: item.item_price || order.total_amount / (orderItems.length || 1),
    })) || [];

    const contentIds = contents.map((c) => c.id);
    const contentType = order.special_requests === "Donación" ? "donation" : "product";

    // Build Meta CAPI event
    const eventData = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(new Date(order.paid_at || order.updated_at || new Date()).getTime() / 1000),
          action_source: "website",
          event_id: orderId,
          event_source_url: checkoutData?.event_source_url || null,
          user_data: {
            em: hashedEmail ? [hashedEmail] : [],
            ph: [],
            client_ip_address: finalClientIp,
            client_user_agent: finalUserAgent,
            fbp: checkoutData?.fbp || null,
            fbc: checkoutData?.fbc || null,
          },
          custom_data: {
            currency: "CLP",
            value: order.total_amount.toString(),
            order_id: orderId,
            content_ids: contentIds,
            contents: contents,
            content_type: contentType,
            num_items: orderItems?.length || 1,
          },
        },
      ],
    };

    // Send to Meta Conversions API
    const metaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${metaPixelId}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...eventData,
          access_token: metaAccessToken,
        }),
      }
    );

    const metaResult = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error("Meta CAPI error:", metaResult);
      return new Response(
        JSON.stringify({ error: "Failed to send event to Meta", details: metaResult }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log event to meta_events table
    const { error: logError } = await supabase.from("meta_events").insert({
      order_id: orderId,
      event_type: "Purchase",
      event_id: orderId,
      meta_response: metaResult,
      sent_at: new Date().toISOString(),
    });

    if (logError) {
      console.warn("Failed to log event:", logError);
    }

    return new Response(
      JSON.stringify({ success: true, metaResponse: metaResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-meta-purchase:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

