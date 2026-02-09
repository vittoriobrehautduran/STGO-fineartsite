import { getFeaturedProducts } from "@/lib/products";
import FeaturedProductsCarousel from "./FeaturedProductsCarousel";

export default async function FeaturedProducts() {
        const products = await getFeaturedProducts();

  return <FeaturedProductsCarousel products={products} />;
}
