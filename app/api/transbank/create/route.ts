import { NextRequest, NextResponse } from 'next/server';
import { getTransbankClient, getReturnUrls } from '@/lib/transbank';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount } = await request.json();

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Order ID and amount are required' },
        { status: 400 }
      );
    }

    // Verify order exists
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
    
    console.log('Creating Transbank transaction:', {
      buyOrder,
      sessionId,
      amount,
      returnUrl: returnUrls.returnUrl,
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

    console.log('Transbank response:', JSON.stringify(response, null, 2));
    console.log('Response type:', typeof response);
    console.log('Response keys:', Object.keys(response || {}));

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
    return NextResponse.json(
      { error: error.message || 'Error creating payment' },
      { status: 500 }
    );
  }
}

