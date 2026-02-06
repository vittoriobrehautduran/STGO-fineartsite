import { getFeaturedProducts } from "@/lib/products";
import HomeClient from "./HomeClient";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return <HomeClient featuredProducts={featuredProducts} />;
}
