import { Navbar } from "@/components/Navbar";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";

const Contact = () => {
  return (
    <PageTransition>
      <SEOHead page="contact" />
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20">
          <ContactSection />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Contact;
