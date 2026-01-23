import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, User, Phone, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollFadeIn } from "./ScrollAnimations";
import { useLanguage } from "@/contexts/LanguageContext";

export function ContactForm() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleNewMessage = () => {
    setFormData({ name: "", phone: "", email: "", message: "" });
    setIsSubmitted(false);
  };

  const isFormValid = formData.name && formData.phone && formData.message;

  return (
    <ScrollFadeIn className="w-full">
      <div className="bg-card rounded-3xl p-8 shadow-card">
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12 space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-primary" />
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">
                  {t("contactForm.successTitle")}
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {t("contactForm.successMessage")}
                </p>
              </div>
              <Button variant="outline" onClick={handleNewMessage}>
                {t("contactForm.sendAnother")}
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Header */}
              <div className="space-y-2 mb-8">
                <h3 className="text-xl font-bold text-foreground">
                  {t("contactForm.title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("contactForm.description")}
                </p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-foreground">
                  <User className="w-4 h-4 text-muted-foreground" />
                  {t("contactForm.name")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("contactForm.namePlaceholder")}
                  className="h-12"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-foreground">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {t("contactForm.phone")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t("contactForm.phonePlaceholder")}
                  className="h-12"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {t("contactForm.email")}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("contactForm.emailPlaceholder")}
                  className="h-12"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-2 text-foreground">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  {t("contactForm.message")} <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t("contactForm.messagePlaceholder")}
                  rows={4}
                  className="resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    {t("contactForm.sending")}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {t("contactForm.submit")}
                  </>
                )}
              </Button>

              {/* Note */}
              <p className="text-xs text-center text-muted-foreground">
                {t("contactForm.note")}
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </ScrollFadeIn>
  );
}
