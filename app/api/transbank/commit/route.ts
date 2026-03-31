import { NextRequest, NextResponse } from 'next/server';
import { getTransbankClient } from '@/lib/transbank';
import { getSupabaseAdmin } from '@/lib/supabase';
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const SES_REGION = process.env.SES_REGION || "us-east-1";
const SES_ACCESS_KEY_ID = process.env.SES_ACCESS_KEY_ID;
const SES_SECRET_ACCESS_KEY = process.env.SES_SECRET_ACCESS_KEY;
const AWS_SES_FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || "noreply@stgofineart.com";

const sesClient = SES_ACCESS_KEY_ID && SES_SECRET_ACCESS_KEY
  ? new SESClient({
      region: SES_REGION,
      credentials: {
        accessKeyId: SES_ACCESS_KEY_ID,
        secretAccessKey: SES_SECRET_ACCESS_KEY,
      },
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    const { token_ws, order_id } = await request.json();

    if (!token_ws) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Log token prefix only in development
    if (process.env.NODE_ENV === 'development') {
      const tokenPrefix = token_ws.substring(0, 10) + '...';
      console.log('Committing Transbank transaction with token:', tokenPrefix);
    }

    // Commit the transaction in Transbank
    const transaction = getTransbankClient();
    let response;
    
    try {
      // Add timeout wrapper for the commit call
      // Transbank can sometimes take a while to respond, especially in integration
      const commitPromise = transaction.commit(token_ws);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Transbank no respondió en 30 segundos')), 30000);
      });
      
      response = await Promise.race([commitPromise, timeoutPromise]) as any;
    } catch (error: any) {
      console.error('Transbank commit error:', {
        error: error.message || error.toString(),
        code: error.code,
        name: error.name,
        stack: error.stack?.substring(0, 200),
      });
      
      // Check for specific timeout/session expired errors
      const errorMessage = error.message || error.toString() || '';
      const isTimeout = errorMessage.includes('timeout') || 
                       errorMessage.includes('Timeout') ||
                       errorMessage.includes('Empty reply') ||
                       errorMessage.includes('ECONNRESET') ||
                       errorMessage.includes('ETIMEDOUT');
      const isSessionExpired = errorMessage.includes('expired') || 
                              errorMessage.includes('not found') ||
                              errorMessage.includes('invalid');
      
      return NextResponse.json(
        { 
          error: isTimeout
            ? 'El servidor de Transbank no respondió a tiempo. Por favor, intenta realizar el pago nuevamente.'
            : isSessionExpired 
            ? 'La sesión de pago ha expirado. Por favor, intenta realizar el pago nuevamente.'
            : 'Error al procesar el pago',
          success: false,
          isTimeout: isTimeout || isSessionExpired,
          errorCode: error.code,
        },
        { status: isTimeout ? 504 : 400 }
      );
    }

    // Check if response is empty or invalid
    if (!response || typeof response !== 'object') {
      console.error('Invalid or empty response from Transbank commit:', {
        responseType: typeof response,
        responseValue: response,
      });
      return NextResponse.json(
        { error: 'No se recibió respuesta válida de Transbank. La sesión puede haber expirado.', success: false, isTimeout: true },
        { status: 500 }
      );
    }

    // Log response without sensitive data (only in development)
    if (process.env.NODE_ENV === 'development') {
      const safeResponse = {
        response_code: response.response_code,
        status: response.status,
        buy_order: response.buy_order,
        amount: response.amount,
        transaction_date: response.transaction_date,
        payment_type_code: response.payment_type_code,
      };
      console.log('Transbank commit response:', JSON.stringify(safeResponse, null, 2));
    }

    // Find order - prioritize order_id if provided, then token, then buy_order
    const supabaseAdmin = getSupabaseAdmin();
    const buyOrder = response.buy_order || '';
    let orderData = null;
    let orderId = null;
    
    // First: try to find by order_id if provided (most reliable)
    if (order_id) {
      const { data: orderById, error: idError } = await supabaseAdmin
        .from('orders')
        .select('id, transbank_buy_order, transbank_token, total_amount, status, customer_email')
        .eq('id', order_id)
        .single();
      
      if (idError) {
        console.error('Error finding order by order_id:', {
          error: idError,
          code: idError.code,
          message: idError.message,
          details: idError.details,
          hint: idError.hint,
        });
      }
      
      if (orderById && !idError) {
        orderData = orderById;
        orderId = orderById.id;
      }
    }
    
    // Second: try to find by token if order_id didn't work
    if (!orderData && token_ws) {
      const { data: orderByToken, error: tokenError } = await supabaseAdmin
        .from('orders')
        .select('id, transbank_token, transbank_buy_order, total_amount, status, customer_email')
        .eq('transbank_token', token_ws)
        .single();
      
      if (orderByToken && !tokenError) {
        orderData = orderByToken;
        orderId = orderByToken.id;
      }
    }
    
    // Third: try to find by buy_order as last resort
    if (!orderData && buyOrder) {
      const { data: orderByBuyOrder, error: buyOrderError } = await supabaseAdmin
        .from('orders')
        .select('id, transbank_buy_order, transbank_token, total_amount, status, customer_email')
        .eq('transbank_buy_order', buyOrder)
        .single();
      
      if (orderByBuyOrder && !buyOrderError) {
        orderData = orderByBuyOrder;
        orderId = orderByBuyOrder.id;
      }
    }
    
    // If still not found, return error
    if (!orderData || !orderId) {
      console.error('Order not found for transaction', {
        orderIdProvided: order_id ? order_id.substring(0, 8) + '...' : null,
        buyOrderSearched: buyOrder || null,
        hasToken: !!token_ws,
      });
      
      return NextResponse.json(
        { 
          error: 'Order not found for this transaction. The order may not have been saved correctly during payment creation.', 
          success: false,
        },
        { status: 404 }
      );
    }

    // Protection against re-commits: check if order is already paid
    if (orderData.status === 'paid') {
      return NextResponse.json({
        success: true,
        orderId: orderId,
        message: 'Order was already processed',
        alreadyPaid: true,
      });
    }

    // Validate amount: ensure the amount from Transbank matches the original order amount
    const transbankAmount = response.amount || 0;
    const orderAmount = orderData.total_amount || 0;
    
    // Allow small rounding differences (1 CLP) due to integer conversion
    const amountDifference = Math.abs(transbankAmount - orderAmount);
    if (amountDifference > 1) {
      console.error('Amount mismatch detected', {
        transbankAmount,
        orderAmount,
        difference: amountDifference,
      });
      
      return NextResponse.json(
        { 
          error: 'El monto de la transacción no coincide con el pedido. Por favor, contacta con soporte.',
          success: false,
        },
        { status: 400 }
      );
    }

    // Update order status based on payment result
    // In Transbank, response_code === 0 means approved, any other value means rejected/failed
    const isApproved = response.response_code === 0;
    const orderStatus = isApproved ? 'paid' : 'payment_failed';
    
    // Log payment result only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Payment result:', { 
        isApproved, 
        response_code: response.response_code, 
        status: response.status,
        buy_order: response.buy_order,
      });
      
      if (!isApproved) {
        console.warn('Payment rejected by Transbank:', {
          response_code: response.response_code,
          status: response.status,
        });
      }
    }
    
    // Extract card number from various possible response structures
    const cardNumber = response.card_detail?.card_number || 
                       response.card_number || 
                       (response.card_detail && typeof response.card_detail === 'string' ? response.card_detail : null) ||
                       null;
    
    // Extract installments from various possible response structures
    const installments = response.installments_number || 
                         response.installments || 
                         response.installment_amount ? 1 : null; // If installment_amount exists, it's at least 1 installment
    
    const updateData: any = {
      status: orderStatus,
      transbank_response_code: response.response_code,
      transbank_status: response.status,
      transbank_authorization_code: response.authorization_code || null,
      transbank_payment_date: response.transaction_date || null,
      // Store additional transaction details for display
      transbank_card_number: cardNumber, // Last 4 digits
      transbank_installments: installments,
      transbank_payment_type: response.payment_type_code || null, // VD, VP, or VN
    };

    // Update token if not set
    if (!orderData.transbank_token && token_ws) {
      updateData.transbank_token = token_ws;
    }

    // Update buy_order if not set
    if (!orderData.transbank_buy_order && buyOrder) {
      updateData.transbank_buy_order = buyOrder;
    }

    if (isApproved) {
      updateData.paid_at = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return NextResponse.json(
        { 
          error: 'Failed to update order', 
          success: false,
          details: updateError.message
        },
        { status: 500 }
      );
    }

    // Call Supabase Edge Function to send Purchase event to Meta CAPI
    // Only if payment was approved
    if (isApproved) {
      // Send customer confirmation email from backend once payment is approved.
      // This runs server-side to avoid dependency on browser callbacks.
      if (orderData.customer_email) {
        try {
          await sendOrderPaidEmail({
            customerEmail: orderData.customer_email,
            orderId,
            amount: orderAmount,
          });
        } catch (emailError) {
          console.warn('Could not send order confirmation email:', emailError);
        }
      }

      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseAnonKey) {
          const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-meta-purchase`;
          
          // Get client IP from x-forwarded-for header (Netlify)
          const forwardedFor = request.headers.get('x-forwarded-for');
          const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : 
                          request.headers.get('x-real-ip') || 
                          null;
          
          // Get user agent
          const userAgent = request.headers.get('user-agent') || null;
          
          const edgeResponse = await fetch(edgeFunctionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({ 
              orderId,
              client_ip_address: clientIp,
              client_user_agent: userAgent,
            }),
          });

          if (!edgeResponse.ok) {
            const errorData = await edgeResponse.json().catch(() => ({}));
            console.warn('Failed to send Meta CAPI event:', errorData);
            // Don't fail the commit if Meta event fails
          } else {
            const edgeResult = await edgeResponse.json();
            if (process.env.NODE_ENV === 'development') {
              console.log('Meta CAPI event sent successfully:', edgeResult);
            }
          }
        } else {
          console.warn('Supabase URL or Anon Key not configured, skipping Meta CAPI event');
        }
      } catch (metaError: any) {
        console.warn('Error calling Meta CAPI Edge Function:', metaError);
        // Don't fail the commit if Meta event fails
      }
    }

    return NextResponse.json({
      success: isApproved,
      orderId: orderId,
      response: response,
    });
  } catch (error: any) {
    console.error('Transbank commit error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: error.message || 'Error committing payment',
        success: false,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

async function sendOrderPaidEmail(params: { customerEmail: string; orderId: string; amount: number }) {
  if (!sesClient) {
    return;
  }

  const subject = `Pago confirmado - Pedido ${params.orderId.substring(0, 8)}`;
  const amountText = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(params.amount || 0);

  const textBody = `
Tu pago fue confirmado correctamente.

Pedido: ${params.orderId.substring(0, 8)}
Monto: ${amountText}

Gracias por comprar en STGO Fine Art.
Te contactaremos pronto con los detalles de tu pedido.
  `.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
    <h2 style="margin-bottom: 12px;">Pago confirmado</h2>
    <p>Tu pago fue confirmado correctamente.</p>
    <p><strong>Pedido:</strong> ${params.orderId.substring(0, 8)}</p>
    <p><strong>Monto:</strong> ${amountText}</p>
    <p>Gracias por comprar en STGO Fine Art. Te contactaremos pronto con los detalles de tu pedido.</p>
  </body>
</html>
  `.trim();

  const command = new SendEmailCommand({
    Source: AWS_SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [params.customerEmail],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Text: {
          Data: textBody,
          Charset: "UTF-8",
        },
        Html: {
          Data: htmlBody,
          Charset: "UTF-8",
        },
      },
    },
  });

  await sesClient.send(command);
}

