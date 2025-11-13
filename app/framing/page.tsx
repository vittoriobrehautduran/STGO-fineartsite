import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function FramingPage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <Navbar />
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 text-gray-900 animate-fade-in">
            Framing Services
          </h1>
          <div className="text-center text-gray-600 animate-slide-up delay-100">
            <p>Content coming soon...</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

