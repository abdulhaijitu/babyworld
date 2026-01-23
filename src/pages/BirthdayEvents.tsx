import { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { EventsHero } from "@/components/events/EventsHero";
import { EventPackages } from "@/components/events/EventPackages";
import { EventBookingForm } from "@/components/events/EventBookingForm";
import { EventsGallery } from "@/components/events/EventsGallery";
import { EventsTrust } from "@/components/events/EventsTrust";

const BirthdayEvents = () => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const packagesRef = useRef<HTMLDivElement>(null);
  const bookingRef = useRef<HTMLDivElement>(null);

  const scrollToPackages = () => {
    packagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <EventsHero 
            onExplorePackages={scrollToPackages}
            onRequestBooking={scrollToBooking}
          />
          <div ref={packagesRef}>
            <EventPackages 
              selectedPackage={selectedPackage}
              onSelectPackage={handleSelectPackage}
            />
          </div>
          <div ref={bookingRef}>
            <EventBookingForm 
              selectedPackage={selectedPackage}
              onSelectPackage={handleSelectPackage}
            />
          </div>
          <EventsGallery />
          <EventsTrust />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default BirthdayEvents;
