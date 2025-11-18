import { NextRequest, NextResponse } from 'next/server';
import { getTransbankClient, getReturnUrls } from '@/lib/transbank';
import { supabase } from '@/lib/supabase';
import '@/lib/env-validation'; // Validate environment variables on import

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount } = await request.json();

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Order ID and amount are required' },
        { status: 400 }
      );
    }

    // Verify order exists and validate amount matches
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Validate that the amount matches the order total
    // Allow small rounding differences (1 CLP) due to integer conversion
    const amountDifference = Math.abs(amount - order.total_amount);
    if (amountDifference > 1) {
      console.error('Amount mismatch in create request', {
        requestedAmount: amount,
        orderAmount: order.total_amount,
        difference: amountDifference,
      });
      
      return NextResponse.json(
        { error: 'El monto no coincide con el pedido' },
        { status: 400 }
      );
    }

    // Prevent creating new transaction if order is already paid
    if (order.status === 'paid') {
      return NextResponse.json(
        { error: 'Este pedido ya ha sido pagado' },
        { status: 400 }
      );
    }

    // Get Transbank client
    const transaction = getTransbankClient();
    const returnUrls = getReturnUrls(orderId);

    // Create transaction in Transbank
    // buyOrder must be max 26 characters
    // Format: ORD-{shortId}-{timestamp}
    const shortId = orderId.substring(0, 8).replace(/-/g, '');
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const buyOrder = `ORD-${shortId}-${timestamp}`.substring(0, 26);
    const sessionId = orderId.substring(0, 61); // Max 61 characters
    
    // Log transaction creation without sensitive data
    console.log('Creating Transbank transaction:', {
      buyOrder,
      amount,
      orderId: orderId.substring(0, 8) + '...',
    });
    
    // Transbank expects amount as integer (in cents/CLP)
    // Convert to integer if it's a decimal
    const amountInCents = Math.round(amount);
    
    const response = await transaction.create(
      buyOrder,
      sessionId,
      amountInCents,
      returnUrls.returnUrl
    );

    // Log response without exposing full token
    const safeResponse = {
      token: response.token ? response.token.substring(0, 10) + '...' : null,
      url: response.url ? '***' : null,
      hasToken: !!response.token,
      hasUrl: !!response.url,
    };
    console.log('Transbank response received:', safeResponse);

    if (!response) {
      return NextResponse.json(
        { error: 'No response from Transbank' },
        { status: 500 }
      );
    }

    // Check for token and url in different possible formats
    const token = response.token || (response as any)?.Token || (response as any)?.token_ws;
    const url = response.url || (response as any)?.Url || (response as any)?.url;

    if (!token || !url) {
      console.error('Invalid Transbank response - missing token or url:', {
        token: !!token,
        url: !!url,
        fullResponse: response
      });
      return NextResponse.json(
        { 
          error: 'Failed to create Transbank transaction',
          details: response 
        },
        { status: 500 }
      );
    }

    // Update order with Transbank transaction info
    await supabase
      .from('orders')
      .update({
        transbank_token: token,
        transbank_buy_order: buyOrder,
        transbank_session_id: sessionId,
        status: 'pending_payment',
      })
      .eq('id', orderId);

    return NextResponse.json({
      token: token,
      url: url,
    });
  } catch (error: any) {
    console.error('Transbank create error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
    });
    
    // Provide more helpful error messages
    let errorMessage = error.message || 'Error creating payment';
    
    if (error.message?.includes('401') || error.message?.includes('Not Authorized')) {
      errorMessage = 'Error de autenticación con Transbank. Verifica que las credenciales (commerce code y API key) estén correctamente configuradas en las variables de entorno.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Error de autenticación con Transbank. Las credenciales no son válidas.';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          originalError: error.message,
          responseData: error.response?.data,
        } : undefined
      },
      { status: 500 }
    );
  }
}

