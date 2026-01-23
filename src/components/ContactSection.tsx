import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactSection() {
  return (
    <section id="contact" className="py-24 bg-card">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Contact Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Visit Baby World Today
              </h2>
              <p className="text-lg text-muted-foreground">
                Have questions? We'd love to hear from you. Reach out via phone,
                email, or visit us in person.
              </p>
            </div>

            <div className="space-y-6">
              <a
                href="tel:09606990128"
                className="flex items-start gap-4 group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Phone</p>
                  <p className="text-muted-foreground group-hover:text-primary transition-colors">
                    09606990128
                  </p>
                </div>
              </a>

              <a
                href="mailto:babyworld.dm@gmail.com"
                className="flex items-start gap-4 group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Email</p>
                  <p className="text-muted-foreground group-hover:text-primary transition-colors">
                    babyworld.dm@gmail.com
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Address</p>
                  <p className="text-muted-foreground">
                    27/B, Jannat Tower (Lift #3),
                    <br />
                    Lalbagh, Dhaka 1211
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Operating Hours</p>
                  <p className="text-muted-foreground">
                    Saturday - Thursday: 10:00 AM – 9:00 PM
                    <br />
                    Friday: 3:00 PM – 9:00 PM
                  </p>
                </div>
              </div>
            </div>

            <Button size="lg" className="mt-4">
              Get Directions
            </Button>
          </div>

          {/* Map Placeholder */}
          <div className="relative">
            <div className="w-full h-full min-h-[400px] bg-muted rounded-3xl overflow-hidden flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Jannat Tower, Lalbagh
                  </p>
                  <p className="text-sm text-muted-foreground">Dhaka 1211</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Interactive map coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
