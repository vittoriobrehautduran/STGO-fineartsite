import HomeClient from "./HomeClient";

export default async function Home() {
  // Featured products are now hardcoded in FeaturedProductsCarousel
  // No need to fetch from database
  return <HomeClient featuredProducts={[]} />;
}
