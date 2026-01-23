import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { TrustSection } from "@/components/TrustSection";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SEOHead } from "@/components/SEOHead";

const Index = () => {
  return (
    <PageTransition>
      <SEOHead page="home" />
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          <AboutSection />
          <TestimonialsSection />
          <TrustSection />
        </main>
        <Footer />
        <WhatsAppButton variant="floating" />
      </div>
    </PageTransition>
  );
};

export default Index;
