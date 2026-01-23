import { Navbar } from "@/components/Navbar";
import { ContactSection } from "@/components/ContactSection";
import { GoogleMap } from "@/components/GoogleMap";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { MobileBottomNav } from "@/components/MobileBottomNav";

const Contact = () => {
  return (
    <PageTransition>
      <SEOHead page="contact" />
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />
        <main className="pt-20">
          <ContactSection />
          <GoogleMap />
        </main>
        <Footer />
        {/* Safe spacing for mobile bottom nav */}
        <div className="lg:hidden h-20" />
        <MobileBottomNav />
      </div>
    </PageTransition>
  );
};

export default Contact;
