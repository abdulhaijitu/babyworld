import { useState } from "react";
import { Star, Send, CheckCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollFadeIn } from "./ScrollAnimations";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";

// Input validation schema
const reviewSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  review: z.string().trim().min(10, "Review must be at least 10 characters").max(500, "Review must be less than 500 characters"),
  rating: z.number().min(1, "Please select a rating").max(5),
});

export function ReviewForm() {
  const { t, language } = useLanguage();
  const [name, setName] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const result = reviewSchema.safeParse({ name, review, rating });
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    
    setErrors({});
    // UI only - simulate submission
    setIsSubmitted(true);
  };

  const handleNewReview = () => {
    setIsSubmitted(false);
    setName("");
    setReview("");
    setRating(0);
    setErrors({});
  };

  if (isSubmitted) {
    return (
      <section className="py-16 sm:py-20 lg:py-24 bg-card overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto bg-background rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-card text-center space-y-4 sm:space-y-6"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              {language === "bn" ? "ধন্যবাদ!" : "Thank You!"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              {language === "bn" 
                ? "আপনার মূল্যবান মতামতের জন্য ধন্যবাদ। আমরা সবসময় উন্নতির জন্য কাজ করছি।" 
                : "Thank you for your valuable feedback. We are always working to improve."}
            </p>
            <Button size="lg" onClick={handleNewReview} className="touch-target">
              {language === "bn" ? "আরেকটি রিভিউ দিন" : "Write Another Review"}
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-card overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <ScrollFadeIn className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 lg:mb-12 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">
              {language === "bn" ? "আপনার মতামত" : "Your Feedback"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            {language === "bn" ? "আপনার অভিজ্ঞতা শেয়ার করুন" : "Share Your Experience"}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
            {language === "bn" 
              ? "আপনার সন্তান কি মজা পেয়েছে? আমাদের জানান!" 
              : "Did your child have fun? Let us know!"}
          </p>
        </ScrollFadeIn>

        {/* Form */}
        <ScrollFadeIn delay={0.2}>
          <form 
            onSubmit={handleSubmit} 
            className="max-w-lg mx-auto bg-background rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-card space-y-5 sm:space-y-6"
          >
            {/* Rating */}
            <div className="space-y-2 sm:space-y-3">
              <label className="block text-sm font-medium text-foreground">
                {language === "bn" ? "আপনার রেটিং" : "Your Rating"} *
              </label>
              <div className="flex gap-1 sm:gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform duration-200 hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={cn(
                        "w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-200",
                        (hoveredRating || rating) >= star
                          ? "text-secondary fill-secondary"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="text-xs text-destructive text-center">{errors.rating}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {language === "bn" ? "আপনার নাম" : "Your Name"} *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === "bn" ? "নাম লিখুন" : "Enter your name"}
                className={cn("h-11 sm:h-12", errors.name && "border-destructive")}
                maxLength={100}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Review */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {language === "bn" ? "আপনার অভিজ্ঞতা" : "Your Experience"} *
              </label>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder={language === "bn" 
                  ? "আপনার অভিজ্ঞতা সম্পর্কে লিখুন..." 
                  : "Write about your experience..."}
                className={cn("min-h-[120px] resize-none", errors.review && "border-destructive")}
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                {errors.review ? (
                  <p className="text-xs text-destructive">{errors.review}</p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-muted-foreground">
                  {review.length}/500
                </span>
              </div>
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              size="lg" 
              className="w-full touch-target gap-2"
              disabled={!name || !review || !rating}
            >
              <Send className="w-4 h-4" />
              {language === "bn" ? "জমা দিন" : "Submit Review"}
            </Button>

            {/* Note */}
            <p className="text-xs text-center text-muted-foreground">
              {language === "bn" 
                ? "আপনার রিভিউ অন্যান্য অভিভাবকদের সাহায্য করবে।" 
                : "Your review will help other parents."}
            </p>
          </form>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
