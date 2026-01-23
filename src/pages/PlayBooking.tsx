import { Navbar } from "@/components/Navbar";
import { PricingSection } from "@/components/PricingSection";
import { BookingSection } from "@/components/BookingSection";
import { TrustSection } from "@/components/TrustSection";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";

const PlayBooking = () => {
  return (
    <PageTransition>
      <SEOHead page="play-booking" />
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20">
          <PricingSection />
          <BookingSection />
          <TrustSection />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default PlayBooking;
