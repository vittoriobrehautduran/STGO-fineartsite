import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Image too large. Maximum size is ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use admin client to bypass RLS for storage uploads
    let supabaseAdmin;
    try {
      supabaseAdmin = getSupabaseAdmin();
    } catch (error: any) {
      console.error("Failed to get Supabase admin client:", error.message);
      return NextResponse.json(
        { 
          error: "Server configuration error. SUPABASE_SERVICE_ROLE_KEY is missing in production environment.",
          details: error.message
        },
        { status: 500 }
      );
    }

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("product-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", {
        message: error.message,
        fileName: fileName,
        fileSize: file.size,
        fileType: file.type
      });
      
      if (error.message?.includes("Bucket not found") || error.message?.includes("404")) {
        return NextResponse.json(
          { 
            error: "Storage bucket 'product-images' not found. Please create it in Supabase Storage.",
            details: error.message
          },
          { status: 500 }
        );
      }
      
      if (error.message?.includes("duplicate") || error.message?.includes("already exists")) {
        const retryFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data: retryData, error: retryError } = await supabaseAdmin.storage
          .from("product-images")
          .upload(retryFileName, buffer, {
            contentType: file.type,
            upsert: false,
          });
        
        if (retryError) {
          return NextResponse.json(
            { 
              error: error.message || "Failed to upload image",
              details: retryError.message
            },
            { status: 500 }
          );
        }
        
        const { data: { publicUrl: retryUrl } } = supabaseAdmin.storage
          .from("product-images")
          .getPublicUrl(retryFileName);
        
        return NextResponse.json({ url: retryUrl, path: retryFileName });
      }
      
      return NextResponse.json(
        { 
          error: error.message || "Failed to upload image",
          details: error.message
        },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("product-images").getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl, path: fileName });
  } catch (error: any) {
    console.error("Error in POST /api/admin/upload-image:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    const errorMessage = error.message || "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

