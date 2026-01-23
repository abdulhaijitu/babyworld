import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { VideoSection } from "@/components/VideoSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ReviewForm } from "@/components/ReviewForm";
import { TrustSection } from "@/components/TrustSection";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SEOHead } from "@/components/SEOHead";
import { PromoBanner } from "@/components/PromoBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";

const Index = () => {
  return (
    <PageTransition>
      <SEOHead page="home" />
      <div className="min-h-screen bg-background overflow-x-hidden">
        <PromoBanner />
        <Navbar />
        <main>
          <HeroSection />
          <AboutSection />
          <VideoSection />
          <TestimonialsSection />
          <ReviewForm />
          <TrustSection />
        </main>
        <Footer />
        {/* Add safe spacing for mobile bottom nav */}
        <div className="lg:hidden h-20" />
        <WhatsAppButton variant="floating" />
        <MobileBottomNav />
      </div>
    </PageTransition>
  );
};

export default Index;
