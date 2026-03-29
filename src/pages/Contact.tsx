import { Navbar } from "@/components/Navbar";
import { ContactSection } from "@/components/ContactSection";
import { GoogleMap } from "@/components/GoogleMap";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { NewsBar } from "@/components/NewsBar";

const Contact = () => {
  return (
    <PageTransition>
      <SEOHead page="contact" />
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />
        <NewsBar />
        <main>
          <ContactSection />
          <GoogleMap />
        </main>
        <Footer />
        <div className="lg:hidden h-20" />
        <WhatsAppButton variant="floating" />
        <MobileBottomNav />
      </div>
    </PageTransition>
  );
};

export default Contact;
