import { supabase } from "./supabase";
import { Product, ProductSize, FramingOption, MediaType } from "@/types/product";

// Fetch all products with their sizes and framing options
export async function getAllProducts(): Promise<Product[]> {
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (productsError) {
    console.error("Error fetching products:", productsError);
    throw productsError;
  }

  if (!products || products.length === 0) {
    return [];
  }

  // Fetch sizes and framing options for all products
  const productIds = products.map((p) => p.id);

  const { data: sizes, error: sizesError } = await supabase
    .from("product_sizes")
    .select("*")
    .in("product_id", productIds);

  if (sizesError) {
    console.error("Error fetching product sizes:", sizesError);
    throw sizesError;
  }

  const { data: productFramingRelations, error: relationsError } =
    await supabase
      .from("product_framing_options")
      .select("product_id, framing_option_id")
      .in("product_id", productIds);

  if (relationsError) {
    console.error("Error fetching framing relations:", relationsError);
    throw relationsError;
  }

  const framingOptionIds = [
    ...new Set(
      productFramingRelations?.map((r) => r.framing_option_id) || []
    ),
  ];

  const { data: framingOptions, error: framingError } = await supabase
    .from("framing_options")
    .select("*")
    .in("id", framingOptionIds);

  if (framingError) {
    console.error("Error fetching framing options:", framingError);
    throw framingError;
  }

  // Combine data into Product format
  const productsWithDetails: Product[] = products.map((product) => {
    // Filter and map all sizes for this product - ensure we get all of them
    const productSizes: ProductSize[] =
      sizes
        ?.filter((s) => s.product_id === product.id)
        .map((s) => ({
          id: s.id,
          width: s.width,
          height: s.height,
          unit: s.unit as "inches" | "cm",
          price: parseFloat(s.price.toString()),
        }))
        .sort((a, b) => a.width - b.width) || []; // Sort by width for consistent display

    const productFramingIds =
      productFramingRelations
        ?.filter((r) => r.product_id === product.id)
        .map((r) => r.framing_option_id) || [];

    const productFramingOptions: FramingOption[] =
      framingOptions
        ?.filter((f) => productFramingIds.includes(f.id))
        .map((f) => ({
          id: f.id,
          name: f.name,
          description: f.description,
          price: parseFloat(f.price.toString()),
        })) || [];

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.base_price.toString()),
      image: product.image_url,
      sizes: productSizes,
      framingOptions: productFramingOptions,
    };
  });

  return productsWithDetails;
}

// Fetch featured products (products with featured = true)
export async function getFeaturedProducts(): Promise<Product[]> {
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(4);

  if (productsError) {
    console.error("Error fetching featured products:", productsError);
    throw productsError;
  }

  if (!products || products.length === 0) {
    return [];
  }

  // Fetch sizes and framing options (same logic as getAllProducts)
  const productIds = products.map((p) => p.id);

  const { data: sizes, error: sizesError } = await supabase
    .from("product_sizes")
    .select("*")
    .in("product_id", productIds);

  if (sizesError) {
    console.error("Error fetching product sizes:", sizesError);
    throw sizesError;
  }

  const { data: productFramingRelations, error: relationsError } =
    await supabase
      .from("product_framing_options")
      .select("product_id, framing_option_id")
      .in("product_id", productIds);

  if (relationsError) {
    console.error("Error fetching framing relations:", relationsError);
    throw relationsError;
  }

  const framingOptionIds = [
    ...new Set(
      productFramingRelations?.map((r) => r.framing_option_id) || []
    ),
  ];

  const { data: framingOptions, error: framingError } = await supabase
    .from("framing_options")
    .select("*")
    .in("id", framingOptionIds);

  if (framingError) {
    console.error("Error fetching framing options:", framingError);
    throw framingError;
  }

  // Combine data into Product format
  const productsWithDetails: Product[] = products.map((product) => {
    // Filter and map all sizes for this product - ensure we get all of them
    const productSizes: ProductSize[] =
      sizes
        ?.filter((s) => s.product_id === product.id)
        .map((s) => ({
          id: s.id,
          width: s.width,
          height: s.height,
          unit: s.unit as "inches" | "cm",
          price: parseFloat(s.price.toString()),
        }))
        .sort((a, b) => a.width - b.width) || []; // Sort by width for consistent display

    const productFramingIds =
      productFramingRelations
        ?.filter((r) => r.product_id === product.id)
        .map((r) => r.framing_option_id) || [];

    const productFramingOptions: FramingOption[] =
      framingOptions
        ?.filter((f) => productFramingIds.includes(f.id))
        .map((f) => ({
          id: f.id,
          name: f.name,
          description: f.description,
          price: parseFloat(f.price.toString()),
        })) || [];

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.base_price.toString()),
      image: product.image_url,
      sizes: productSizes,
      framingOptions: productFramingOptions,
    };
  });

  return productsWithDetails;
}

// Fetch a single product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (productError) {
    console.error("Error fetching product:", productError);
    return null;
  }

  if (!product) {
    return null;
  }

  // Fetch sizes
  const { data: sizes, error: sizesError } = await supabase
    .from("product_sizes")
    .select("*")
    .eq("product_id", product.id);

  if (sizesError) {
    console.error("Error fetching product sizes:", sizesError);
  }

  // Fetch framing options
  const { data: productFramingRelations, error: relationsError } =
    await supabase
      .from("product_framing_options")
      .select("framing_option_id")
      .eq("product_id", product.id);

  if (relationsError) {
    console.error("Error fetching framing relations:", relationsError);
  }

  const framingOptionIds =
    productFramingRelations?.map((r) => r.framing_option_id) || [];

  const { data: framingOptions, error: framingError } = await supabase
    .from("framing_options")
    .select("*")
    .in("id", framingOptionIds);

  if (framingError) {
    console.error("Error fetching framing options:", framingError);
  }

  // Fetch media types
  const { data: productMediaRelations, error: mediaRelationsError } =
    await supabase
      .from("product_media_types")
      .select("media_type_id")
      .eq("product_id", product.id);

  if (mediaRelationsError) {
    console.error("Error fetching media relations:", mediaRelationsError);
  }

  const mediaTypeIds =
    productMediaRelations?.map((r) => r.media_type_id) || [];

  const { data: mediaTypes, error: mediaError } = await supabase
    .from("media_types")
    .select("*")
    .in("id", mediaTypeIds);

  if (mediaError) {
    console.error("Error fetching media types:", mediaError);
  }

  const productSizes: ProductSize[] =
    sizes
      ?.map((s) => ({
        id: s.id,
        width: s.width,
        height: s.height,
        unit: s.unit as "inches" | "cm",
        price: parseFloat(s.price.toString()),
      }))
      .sort((a, b) => a.width - b.width) || []; // Sort by width for consistent display

  const productFramingOptions: FramingOption[] =
    framingOptions?.map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description,
      price: parseFloat(f.price.toString()),
    })) || [];

  const productMediaTypes: MediaType[] =
    mediaTypes?.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
    })) || [];

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: parseFloat(product.base_price.toString()),
    image: product.image_url,
    sizes: productSizes,
    framingOptions: productFramingOptions,
    mediaTypes: productMediaTypes.length > 0 ? productMediaTypes : undefined,
  };
}

