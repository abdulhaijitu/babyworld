import { Heart, Sparkles, Users } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-card">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <div className="relative">
            <div className="relative bg-accent rounded-3xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-card rounded-2xl p-6 shadow-card">
                    <span className="text-4xl">🏰</span>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      Adventure Zone
                    </p>
                  </div>
                  <div className="bg-card rounded-2xl p-6 shadow-card">
                    <span className="text-4xl">📚</span>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      Learning Corner
                    </p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-card rounded-2xl p-6 shadow-card">
                    <span className="text-4xl">🎨</span>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      Creative Space
                    </p>
                  </div>
                  <div className="bg-card rounded-2xl p-6 shadow-card">
                    <span className="text-4xl">🎭</span>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      Pretend Play
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                About Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                A Space Where{" "}
                <span className="text-primary">Learning Meets Play</span>
              </h2>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              At Baby World, we believe that every child deserves a safe,
              nurturing environment where they can explore, discover, and grow.
              Our indoor playground is thoughtfully designed to encourage
              learning through play.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Safe & Hygienic
                  </h3>
                  <p className="text-muted-foreground">
                    Regular sanitization and child-safe equipment for peace of
                    mind.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Trained Staff
                  </h3>
                  <p className="text-muted-foreground">
                    Our friendly team ensures supervision and assistance at all
                    times.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Age-Appropriate Activities
                  </h3>
                  <p className="text-muted-foreground">
                    Curated play zones for children aged 1–10 years old.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
