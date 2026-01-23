import { Button } from "@/components/ui/button";
import { Shield, Star, Clock } from "lucide-react";

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-background" />
      
      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container relative mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-card">
              <Star className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-foreground">
                Ages 1–10 Years
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Where Kids{" "}
              <span className="text-primary">Learn</span> &{" "}
              <span className="text-secondary">Play</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              A safe, hygienic, and joyful indoor playground designed for
              children aged 1–10 years. Let your little ones explore, learn,
              and make memories in our supervised play environment.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Safe Environment
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Hourly Play
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="hero">
                View Play Options
              </Button>
              <Button size="lg" variant="heroOutline">
                Birthday & Events
              </Button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Main card */}
              <div className="absolute inset-0 bg-card rounded-3xl shadow-card-hover overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-float">
                      <span className="text-5xl">🎈</span>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      Baby World
                    </h3>
                    <p className="text-lg text-primary font-medium">
                      বেবি ওয়ার্ল্ড
                    </p>
                    <p className="text-muted-foreground">Learn & Play</p>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-secondary/20 rounded-2xl flex items-center justify-center animate-float" style={{ animationDelay: "0.5s" }}>
                <span className="text-3xl">🧸</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center animate-float" style={{ animationDelay: "1s" }}>
                <span className="text-2xl">🎨</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
