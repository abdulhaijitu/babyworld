import { Clock, Users, Ticket, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollFadeIn, ScaleIn } from "./ScrollAnimations";

const inclusions = [
  "Access to all play zones",
  "Supervised environment",
  "Clean & sanitized equipment",
  "Comfortable seating for guardians",
  "Air-conditioned facility",
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <ScrollFadeIn className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Play & Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the play option that works best for your family. Each session
            includes one child and one guardian.
          </p>
        </ScrollFadeIn>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Hourly Play Card */}
          <ScaleIn className="lg:col-span-2">
            <div className="bg-card rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-shadow duration-300 h-full">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left side */}
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      Hourly Play
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      1-Hour Play Session
                    </h3>
                    <p className="text-muted-foreground">
                      Perfect for a quick visit. Enjoy all play zones with your
                      little one.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-5 h-5" />
                    <span>1 Child + 1 Guardian</span>
                  </div>

                  <Button size="lg" className="w-full sm:w-auto">
                    Book Session
                  </Button>
                </div>

                {/* Right side - inclusions */}
                <div className="flex-1 bg-accent rounded-2xl p-6">
                  <h4 className="font-semibold text-foreground mb-4">
                    What's Included
                  </h4>
                  <ul className="space-y-3">
                    {inclusions.map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </ScaleIn>

          {/* Physical Ticket Card */}
          <ScaleIn delay={0.15}>
            <div className="bg-muted rounded-3xl p-8 h-full">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-foreground/5 rounded-full">
                  <Ticket className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Walk-in Available
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Physical Tickets
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Prefer to pay in person? Physical tickets are available at our
                    reception.
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    No advance booking required. Simply walk in during operating
                    hours.
                  </p>
                </div>
              </div>
            </div>
          </ScaleIn>
        </div>

        {/* Play Rules */}
        <ScrollFadeIn delay={0.2}>
          <div className="mt-16 bg-accent rounded-3xl p-8 lg:p-12 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center">
              Play Zone Guidelines
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "👧", text: "Socks required for all" },
                { icon: "🧴", text: "Hand sanitization on entry" },
                { icon: "🍱", text: "No outside food allowed" },
                { icon: "👨‍👩‍👧", text: "Guardian must stay on-site" },
              ].map((rule) => (
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
