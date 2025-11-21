import { NextRequest, NextResponse } from 'next/server';
import { getTransbankClient } from '@/lib/transbank';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { token_ws, order_id } = await request.json();

    if (!token_ws) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Log token prefix only (first 10 chars) for security
    const tokenPrefix = token_ws.substring(0, 10) + '...';
    console.log('Committing Transbank transaction with token:', tokenPrefix);

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

    // Log response without sensitive data
    const safeResponse = {
      response_code: response.response_code,
      status: response.status,
      buy_order: response.buy_order,
      amount: response.amount,
      transaction_date: response.transaction_date,
      payment_type_code: response.payment_type_code, // VD = débito, VP = prepago, VN = crédito
      // Don't log authorization_code or other sensitive fields in production
    };
    console.log('Transbank commit response:', JSON.stringify(safeResponse, null, 2));

    // Find order - prioritize order_id if provided, then token, then buy_order
    const supabaseAdmin = getSupabaseAdmin();
    const buyOrder = response.buy_order || '';
    let orderData = null;
    let orderId = null;
    
    // First: try to find by order_id if provided (most reliable)
    if (order_id) {
      console.log('Looking for order by provided order_id:', order_id.substring(0, 8) + '...');
      const { data: orderById, error: idError } = await supabaseAdmin
        .from('orders')
        .select('id, transbank_buy_order, transbank_token, total_amount, status')
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
        console.log('Order found by order_id:', {
          orderId: orderId.substring(0, 8) + '...',
          hasBuyOrder: !!orderById.transbank_buy_order,
          buyOrderValue: orderById.transbank_buy_order,
          hasToken: !!orderById.transbank_token,
          tokenPrefix: orderById.transbank_token ? orderById.transbank_token.substring(0, 10) + '...' : null,
          status: orderById.status,
        });
      } else {
        console.log('Order not found by order_id, will try other methods');
      }
    }
    
    // Second: try to find by token if order_id didn't work
    if (!orderData && token_ws) {
      const tokenPrefix = token_ws.substring(0, 10) + '...';
      console.log('Looking for order by token_ws:', tokenPrefix);
      const { data: orderByToken, error: tokenError } = await supabaseAdmin
        .from('orders')
        .select('id, transbank_token, transbank_buy_order, total_amount, status')
        .eq('transbank_token', token_ws)
        .single();
      
      if (orderByToken && !tokenError) {
        orderData = orderByToken;
        orderId = orderByToken.id;
        console.log('Order found by token');
      }
    }
    
    // Third: try to find by buy_order as last resort
    if (!orderData && buyOrder) {
      console.log('Looking for order by buy_order:', buyOrder);
      const { data: orderByBuyOrder, error: buyOrderError } = await supabaseAdmin
        .from('orders')
        .select('id, transbank_buy_order, transbank_token, total_amount, status')
        .eq('transbank_buy_order', buyOrder)
        .single();
      
      if (orderByBuyOrder && !buyOrderError) {
        orderData = orderByBuyOrder;
        orderId = orderByBuyOrder.id;
        console.log('Order found by buy_order');
      }
    }
    
    // If still not found, return error with more details
    if (!orderData || !orderId) {
      // Try one more time with full order_id (not truncated) to see if it exists
      let fullOrderCheck = null;
      if (order_id) {
        const { data: fullOrder } = await supabaseAdmin
          .from('orders')
          .select('id, status, transbank_token, transbank_buy_order')
          .eq('id', order_id)
          .maybeSingle();
        fullOrderCheck = fullOrder;
      }
      
      console.error('Order not found by any method', {
        orderIdProvided: order_id ? order_id.substring(0, 8) + '...' : null,
        orderIdFull: order_id,
        buyOrderSearched: buyOrder || null,
        hasToken: !!token_ws,
        tokenPrefix: token_ws ? token_ws.substring(0, 20) + '...' : null,
        fullOrderCheck: fullOrderCheck ? {
          found: true,
          hasToken: !!fullOrderCheck.transbank_token,
          hasBuyOrder: !!fullOrderCheck.transbank_buy_order,
          status: fullOrderCheck.status,
        } : { found: false },
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
      console.log('Order already paid, skipping commit');
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
    
    // Log payment result without sensitive data
    console.log('Payment result:', { 
      isApproved, 
      response_code: response.response_code, 
      status: response.status,
      buy_order: response.buy_order,
      // Log full response in development to debug test payments
      ...(process.env.NODE_ENV === 'development' && { fullResponse: response })
    });
    
    // If payment was rejected, log why (for debugging test payments)
    if (!isApproved) {
      console.warn('Payment rejected by Transbank:', {
        response_code: response.response_code,
        status: response.status,
        // Common response codes: 0 = approved, -1 = rejected, others = various errors
      });
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

