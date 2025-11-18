import { NextRequest, NextResponse } from 'next/server';
import { getTransbankClient } from '@/lib/transbank';
import { supabase } from '@/lib/supabase';
import '@/lib/env-validation'; // Validate environment variables on import

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
      response = await transaction.commit(token_ws);
    } catch (error: any) {
      console.error('Transbank commit error:', error);
      
      // Check for specific timeout/session expired errors
      const errorMessage = error.message || error.toString() || '';
      const isSessionExpired = errorMessage.includes('expired') || 
                              errorMessage.includes('not found') ||
                              errorMessage.includes('invalid') ||
                              errorMessage.includes('timeout');
      
      return NextResponse.json(
        { 
          error: isSessionExpired 
            ? 'La sesión de pago ha expirado. Por favor, intenta realizar el pago nuevamente.'
            : 'Error al procesar el pago',
          success: false,
          isTimeout: isSessionExpired,
        },
        { status: 400 }
      );
    }

    // Log response without sensitive data
    const safeResponse = {
      response_code: response.response_code,
      status: response.status,
      buy_order: response.buy_order,
      amount: response.amount,
      transaction_date: response.transaction_date,
      // Don't log authorization_code or other sensitive fields in production
    };
    console.log('Transbank commit response:', JSON.stringify(safeResponse, null, 2));

    if (!response) {
      console.error('No response from Transbank commit');
      return NextResponse.json(
        { error: 'No se recibió respuesta de Transbank. La sesión puede haber expirado.', success: false, isTimeout: true },
        { status: 500 }
      );
    }

    // Find order - prioritize order_id if provided, then token, then buy_order
    const buyOrder = response.buy_order || '';
    let orderData = null;
    let orderId = null;
    
    // First: try to find by order_id if provided (most reliable)
    if (order_id) {
      console.log('Looking for order by provided order_id:', order_id.substring(0, 8) + '...');
      const { data: orderById, error: idError } = await supabase
        .from('orders')
        .select('id, transbank_buy_order, transbank_token, total_amount, status')
        .eq('id', order_id)
        .single();
      
      if (orderById && !idError) {
        orderData = orderById;
        orderId = orderById.id;
        console.log('Order found by order_id');
      }
    }
    
    // Second: try to find by token if order_id didn't work
    if (!orderData && token_ws) {
      const tokenPrefix = token_ws.substring(0, 10) + '...';
      console.log('Looking for order by token_ws:', tokenPrefix);
      const { data: orderByToken, error: tokenError } = await supabase
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
      const { data: orderByBuyOrder, error: buyOrderError } = await supabase
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
    
    // If still not found, return error
    if (!orderData || !orderId) {
      console.error('Order not found by any method', {
        orderIdProvided: order_id ? order_id.substring(0, 8) + '...' : null,
        buyOrderSearched: buyOrder || null,
        hasToken: !!token_ws,
      });
      
      return NextResponse.json(
        { 
          error: 'Order not found for this transaction', 
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
    const isApproved = response.response_code === 0;
    const orderStatus = isApproved ? 'paid' : 'payment_failed';
    
    // Log payment result without sensitive data
    console.log('Payment result:', { 
      isApproved, 
      response_code: response.response_code, 
      status: response.status 
    });
    
    const updateData: any = {
      status: orderStatus,
      transbank_response_code: response.response_code,
      transbank_status: response.status,
      transbank_authorization_code: response.authorization_code || null,
      transbank_payment_date: response.transaction_date || null,
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

    const { error: updateError } = await supabase
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

