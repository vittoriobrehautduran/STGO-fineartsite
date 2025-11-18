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

    console.log('Committing Transbank transaction with token:', token_ws);

    // Commit the transaction in Transbank
    const transaction = getTransbankClient();
    const response = await transaction.commit(token_ws);

    console.log('Transbank commit response:', JSON.stringify(response, null, 2));

    if (!response) {
      console.error('No response from Transbank commit');
      return NextResponse.json(
        { error: 'Failed to commit transaction', success: false },
        { status: 500 }
      );
    }

    // Find order by buy_order since we use a shortened buyOrder format
    const buyOrder = response.buy_order || '';
    
    console.log('Looking for order with buy_order:', buyOrder);
    
    const { data: orderData, error: orderFindError } = await supabase
      .from('orders')
      .select('id')
      .eq('transbank_buy_order', buyOrder)
      .single();

    if (orderFindError || !orderData) {
      console.error('Order not found:', orderFindError);
      // Try to find by token as fallback
      const { data: orderByToken, error: tokenError } = await supabase
        .from('orders')
        .select('id')
        .eq('transbank_token', token_ws)
        .single();
      
      if (orderByToken) {
        const orderId = orderByToken.id;
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
      }
      
      return NextResponse.json(
        { error: 'Order not found for this transaction', success: false },
        { status: 404 }
      );
    }

    const orderId = orderData.id;

    // Update order status based on payment result
    const isApproved = response.response_code === 0;
    const orderStatus = isApproved ? 'paid' : 'payment_failed';
    
    console.log('Payment result:', { isApproved, response_code: response.response_code, status: response.status });
    
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

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
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

