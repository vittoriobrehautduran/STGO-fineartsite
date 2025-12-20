import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// Delete orders (bulk delete)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderIds } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: "Order IDs are required" },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS
    const supabaseAdmin = getSupabaseAdmin();

    // Check if we're using service role (for debugging)
    const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasServiceRole) {
      console.warn("⚠️  Using anon key - deletions may fail due to RLS");
    }

    console.log(`Attempting to delete ${orderIds.length} order(s):`, orderIds);

    // First, delete order items (if they exist)
    const { error: itemsError, data: itemsData } = await supabaseAdmin
      .from("order_items")
      .delete()
      .in("order_id", orderIds)
      .select();

    if (itemsError) {
      console.error("Error deleting order items:", itemsError);
      // Continue anyway, order items might not exist
    } else {
      console.log(`Deleted ${itemsData?.length || 0} order item(s)`);
    }

    // Delete orders
    const { error: ordersError, data: ordersData } = await supabaseAdmin
      .from("orders")
      .delete()
      .in("id", orderIds)
      .select();

    if (ordersError) {
      console.error("Error deleting orders:", ordersError);
      console.error("Error details:", {
        message: ordersError.message,
        code: ordersError.code,
        details: ordersError.details,
        hint: ordersError.hint,
      });
      return NextResponse.json(
        { 
          error: ordersError.message || "Failed to delete orders",
          details: process.env.NODE_ENV === 'development' ? {
            code: ordersError.code,
            hint: ordersError.hint,
          } : undefined
        },
        { status: 500 }
      );
    }

    const deletedCount = ordersData?.length || 0;
    console.log(`Successfully deleted ${deletedCount} order(s)`);

    if (deletedCount === 0) {
      return NextResponse.json(
        { 
          error: "No orders were deleted. They may not exist or you may not have permission.",
          warning: hasServiceRole ? undefined : "Using anon key - RLS may be blocking deletion"
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount: deletedCount,
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/orders:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

