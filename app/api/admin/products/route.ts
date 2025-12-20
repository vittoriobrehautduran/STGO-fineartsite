import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      base_price,
      image_url,
      featured,
      sizes,
      framing_option_ids,
    } = body;

    // Use admin client to bypass RLS
    const supabaseAdmin = getSupabaseAdmin();

    // Create product
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .insert({
        name,
        description,
        base_price: parseFloat(base_price),
        image_url,
        featured: featured || false,
      })
      .select()
      .single();

    if (productError) {
      console.error("Error creating product:", productError);
      return NextResponse.json(
        { error: productError.message },
        { status: 400 }
      );
    }

    // Add sizes
    if (sizes && sizes.length > 0) {
      const validSizes = sizes.filter(
        (s: any) => s.width > 0 && s.height > 0 && s.price > 0
      );
      if (validSizes.length > 0) {
        const { error: sizesError } = await supabaseAdmin
          .from("product_sizes")
          .insert(
            validSizes.map((s: any) => ({
              product_id: product.id,
              width: s.width,
              height: s.height,
              unit: s.unit,
              price: s.price,
            }))
          );

        if (sizesError) {
          console.error("Error creating sizes:", sizesError);
          // Continue anyway, product is created
        }
      }
    }

    // Link framing options
    if (framing_option_ids && framing_option_ids.length > 0) {
      const { error: framingError } = await supabaseAdmin
        .from("product_framing_options")
        .insert(
          framing_option_ids.map((framingId: string) => ({
            product_id: product.id,
            framing_option_id: framingId,
          }))
        );

      if (framingError) {
        console.error("Error linking framing options:", framingError);
        // Continue anyway, product is created
      }
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Error in POST /api/admin/products:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      base_price,
      image_url,
      featured,
      sizes,
      framing_option_ids,
    } = body;

    // Use admin client to bypass RLS
    const supabaseAdmin = getSupabaseAdmin();

    // Update product
    const { error: productError } = await supabaseAdmin
      .from("products")
      .update({
        name,
        description,
        base_price: parseFloat(base_price),
        image_url,
        featured: featured || false,
      })
      .eq("id", id);

    if (productError) {
      console.error("Error updating product:", productError);
      return NextResponse.json(
        { error: productError.message },
        { status: 400 }
      );
    }

    // Delete existing sizes
    await supabaseAdmin
      .from("product_sizes")
      .delete()
      .eq("product_id", id);

    // Add new sizes
    if (sizes && sizes.length > 0) {
      const validSizes = sizes.filter(
        (s: any) => s.width > 0 && s.height > 0 && s.price > 0
      );
      if (validSizes.length > 0) {
        await supabaseAdmin
          .from("product_sizes")
          .insert(
            validSizes.map((s: any) => ({
              product_id: id,
              width: s.width,
              height: s.height,
              unit: s.unit,
              price: s.price,
            }))
          );
      }
    }

    // Delete existing framing relations
    await supabaseAdmin
      .from("product_framing_options")
      .delete()
      .eq("product_id", id);

    // Add new framing relations
    if (framing_option_ids && framing_option_ids.length > 0) {
      await supabaseAdmin
        .from("product_framing_options")
        .insert(
          framing_option_ids.map((framingId: string) => ({
            product_id: id,
            framing_option_id: framingId,
          }))
        );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/products:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

