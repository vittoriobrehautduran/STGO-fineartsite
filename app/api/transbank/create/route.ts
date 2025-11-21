import { NextRequest, NextResponse } from 'next/server';
import { getTransbankClient, getReturnUrls } from '@/lib/transbank';
import { supabaseAdmin } from '@/lib/supabase';

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
    const { data: order, error: orderError } = await supabaseAdmin
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
      commerceCode: process.env.NEXT_PUBLIC_TRANSBANK_COMMERCE_CODE || 'using default test code',
      environment: process.env.TRANSBANK_ENV || process.env.NODE_ENV,
    });
    
    // Transbank expects amount as integer (in cents/CLP)
    // Convert to integer if it's a decimal
    const amountInCents = Math.round(amount);
    
    // Add timeout wrapper for the create call
    const createPromise = transaction.create(
      buyOrder,
      sessionId,
      amountInCents,
      returnUrls.returnUrl
    );
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: Transbank no respondió en 30 segundos')), 30000);
    });
    
    const response = await Promise.race([createPromise, timeoutPromise]) as any;

    // Log response without exposing full token
    // Log the actual URL to verify it's correct (URLs are safe to log)
    const safeResponse = {
      token: response.token ? response.token.substring(0, 10) + '...' : null,
      url: response.url || null, // Log actual URL to verify it's correct
      hasToken: !!response.token,
      hasUrl: !!response.url,
      fullResponseKeys: Object.keys(response || {}),
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
    // This is critical - if this fails, the commit won't be able to find the order
    const { error: updateError, data: updateData } = await supabaseAdmin
      .from('orders')
      .update({
        transbank_token: token,
        transbank_buy_order: buyOrder,
        transbank_session_id: sessionId,
        status: 'pending_payment',
      })
      .eq('id', orderId)
      .select();

    if (updateError) {
      console.error('CRITICAL: Error updating order with Transbank info:', {
        error: updateError,
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        orderId: orderId.substring(0, 8) + '...',
      });
      // This is critical - return error so we know the update failed
      return NextResponse.json(
        { 
          error: 'Failed to save payment information. Please try again.',
          details: process.env.NODE_ENV === 'development' ? updateError.message : undefined
        },
        { status: 500 }
      );
    }

    if (!updateData || updateData.length === 0) {
      console.error('CRITICAL: Order update returned no rows. Order may not exist or RLS is blocking update:', {
        orderId: orderId.substring(0, 8) + '...',
        buyOrder,
      });
      return NextResponse.json(
        { 
          error: 'Failed to update order. The order may not exist or there may be a permissions issue.',
        },
        { status: 500 }
      );
    }

    console.log('Order updated successfully with Transbank info:', {
      orderId: orderId.substring(0, 8) + '...',
      buyOrder,
      tokenSet: !!token,
      rowsUpdated: updateData.length,
      updatedOrder: {
        id: updateData[0].id?.substring(0, 8) + '...',
        status: updateData[0].status,
        hasToken: !!updateData[0].transbank_token,
        hasBuyOrder: !!updateData[0].transbank_buy_order,
        buyOrderValue: updateData[0].transbank_buy_order,
        tokenPrefix: updateData[0].transbank_token ? updateData[0].transbank_token.substring(0, 10) + '...' : null,
      },
    });

    // Verify the update was actually saved by reading it back
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('orders')
      .select('id, transbank_token, transbank_buy_order, status')
      .eq('id', orderId)
      .single();

    if (verifyError || !verifyData) {
      console.error('CRITICAL: Could not verify order update:', {
        error: verifyError,
        orderId: orderId.substring(0, 8) + '...',
      });
      // Still return success to allow payment flow, but log the critical error
    } else if (!verifyData.transbank_token || !verifyData.transbank_buy_order) {
      console.error('CRITICAL: Order update verification failed - fields not saved:', {
        orderId: orderId.substring(0, 8) + '...',
        hasToken: !!verifyData.transbank_token,
        hasBuyOrder: !!verifyData.transbank_buy_order,
        status: verifyData.status,
      });
      // Still return success to allow payment flow, but log the critical error
    } else {
      console.log('Order update verified successfully:', {
        orderId: orderId.substring(0, 8) + '...',
        buyOrder: verifyData.transbank_buy_order,
        tokenPrefix: verifyData.transbank_token.substring(0, 10) + '...',
      });
    }

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

