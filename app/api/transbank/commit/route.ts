import { NextRequest, NextResponse } from 'next/server';
import { getTransbankClient } from '@/lib/transbank';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { token_ws } = await request.json();

    if (!token_ws) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Commit the transaction in Transbank
    const transaction = getTransbankClient();
    const response = await transaction.commit(token_ws);

    if (!response) {
      return NextResponse.json(
        { error: 'Failed to commit transaction' },
        { status: 500 }
      );
    }

    // Extract order ID from buy_order (format: ORD-{shortId}-{timestamp})
    const buyOrder = response.buy_order || '';
    const orderIdMatch = buyOrder.match(/ORD-([^-]+)/);
    // Since we use a short ID, we need to find the order by transbank_buy_order instead
    const orderId = orderIdMatch ? orderIdMatch[1] : null;

    // Find order by buy_order since we can't reliably extract full order ID
    const { data: orderData, error: orderFindError } = await supabase
      .from('orders')
      .select('id')
      .eq('transbank_buy_order', buyOrder)
      .single();

    if (orderFindError || !orderData) {
      return NextResponse.json(
        { error: 'Order not found for this transaction' },
        { status: 404 }
      );
    }

    const orderId = orderData.id;

    // Update order status based on payment result
    const isApproved = response.response_code === 0;
    const orderStatus = isApproved ? 'paid' : 'payment_failed';
    
    const updateData: any = {
      status: orderStatus,
      transbank_response_code: response.response_code,
      transbank_status: response.status,
      transbank_authorization_code: response.authorization_code || null,
      transbank_payment_date: response.transaction_date || null,
    };

    if (isApproved) {
      updateData.paid_at = new Date().toISOString();
    }

    await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    return NextResponse.json({
      success: isApproved,
      orderId: orderId,
      response: response,
    });
  } catch (error: any) {
    console.error('Transbank commit error:', error);
    return NextResponse.json(
      { error: error.message || 'Error committing payment' },
      { status: 500 }
    );
  }
}

