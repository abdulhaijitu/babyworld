import { Clock, Users, Ticket, CheckCircle, Sparkles, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollFadeIn, ScaleIn } from "./ScrollAnimations";
import { t } from "@/lib/translations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/useSettings";

export function PricingSection() {
  const { packagePricing, pricing } = useSettings();

  // Fetch rides for ride zone pricing
  const { data: rides = [] } = useQuery({
    queryKey: ['public-rides'],
    queryFn: async () => {
      const { data } = await supabase
        .from('rides')
        .select('name, price, offer_price, ride_type, category')
        .eq('is_active', true)
        .order('name');
      return data || [];
    }
  });

  const paidRides = rides.filter(r => r.ride_type === 'Paid' && (r.price || 0) > 0);

  const softPlayItems = [
    "Happy Kitchen", "Rainbow Slide", "Projector Game", "Coconut Tree",
    "Tube Slide", "Toy Sensory Play", "Sand Play", "Rock Climbing Wall",
    "Net Crawling", "Fun Trampoline"
  ];

  const rules = [
    { icon: "🧦", text: "Socks are mandatory" },
    { icon: "👶", text: "Age: 1-12 years" },
    { icon: "🍱", text: "Outside food not allowed" },
    { icon: "👨‍👩‍👧", text: "Guardian must accompany child" },
  ];

  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <ScrollFadeIn className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            {t("pricing.label")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t("pricing.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("pricing.description")}
          </p>
        </ScrollFadeIn>

        {/* Package Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {/* Hourly Play Pricing */}
          <ScaleIn>
            <div className="bg-card rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 h-full border">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Hourly Play</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Per Person Pricing</h3>
                  <p className="text-sm text-muted-foreground">Soft Play Zone access</p>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Guardian Fee</span>
                    <span className="text-lg font-bold text-foreground">৳{pricing.hourlyPlay.guardianFee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Child Fee</span>
                    <span className="text-lg font-bold text-foreground">৳{pricing.hourlyPlay.childFee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Socks Fee</span>
                    <span className="text-lg font-bold text-foreground">৳{pricing.hourlyPlay.socksFee}</span>
                  </div>
                </div>
              </div>
            </div>
          </ScaleIn>

          {/* Full Board */}
          <ScaleIn delay={0.1}>
            <div className="bg-primary/5 rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 h-full border border-primary/20 relative">
              <Badge className="absolute -top-2.5 right-4 bg-primary text-primary-foreground">Popular</Badge>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Full Board</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">1 Child + 1 Guardian</h3>
                  <p className="text-sm text-muted-foreground">Soft Zone + Ride Zone</p>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-foreground">৳{packagePricing.fullBoard}</span>
                </div>
                <div className="text-sm text-muted-foreground pt-2 border-t border-border">
                  Includes all soft play + all rides
                </div>
              </div>
            </div>
          </ScaleIn>

          {/* Ride Zone Package */}
          <ScaleIn delay={0.2}>
            <div className="bg-card rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 h-full border">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent rounded-full">
                  <Ticket className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Ride Zone Package</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">All Rides Access</h3>
                  <p className="text-sm text-muted-foreground">All ride zone rides included</p>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-foreground">৳{packagePricing.rideZoneRegular}</span>
                  <Badge variant="secondary" className="text-xs">Regular</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span>Eid Offer: <strong className="text-orange-600">৳{packagePricing.rideZoneOffer}</strong></span>
                </div>
              </div>
            </div>
          </ScaleIn>
        </div>

        {/* Soft Play Zone */}
        <ScrollFadeIn delay={0.1}>
          <div className="bg-accent rounded-3xl p-8 max-w-5xl mx-auto mb-12">
            <h3 className="text-xl font-bold text-foreground mb-2 text-center">🎠 Soft Play Zone</h3>
            <p className="text-center text-sm text-muted-foreground mb-6">Free with Family Package / Full Board</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {softPlayItems.map((item) => (
                <div key={item} className="flex items-center gap-2 bg-background rounded-lg px-3 py-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollFadeIn>

        {/* Individual Ride Pricing */}
        {paidRides.length > 0 && (
          <ScrollFadeIn delay={0.15}>
            <div className="bg-card rounded-3xl p-8 border max-w-4xl mx-auto mb-12">
              <h3 className="text-xl font-bold text-foreground mb-6 text-center">🎢 Individual Ride Prices</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {paidRides.map((ride) => (
                  <div key={ride.name} className="flex items-center justify-between bg-accent rounded-xl px-4 py-3">
                    <span className="font-medium text-foreground">{ride.name}</span>
                    <div className="text-right">
                      <span className="font-bold text-foreground">৳{ride.price}</span>
                      {ride.offer_price > 0 && (
                        <span className="block text-xs text-orange-600">Eid: ৳{ride.offer_price}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollFadeIn>
        )}

        {/* Play Rules */}
        <ScrollFadeIn delay={0.2}>
          <div className="bg-accent rounded-3xl p-8 lg:p-12 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center">
              {t("pricing.guidelines")}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {rules.map((rule) => (
                <div key={rule.text} className="text-center">
                  <span className="text-3xl">{rule.icon}</span>
                  <p className="mt-2 text-sm text-muted-foreground">{rule.text}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}