import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, User, Phone, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollFadeIn } from "./ScrollAnimations";
import { useLanguage } from "@/contexts/LanguageContext";

// WhatsApp icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const WHATSAPP_NUMBER = "8809606990128"; // Baby World's WhatsApp number (with country code)

export function ContactForm() {
  const { t, language } = useLanguage();
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

  const generateWhatsAppMessage = () => {
    const greeting = language === "bn" 
      ? "আসসালামু আলাইকুম, Baby World!" 
      : "Hello, Baby World!";
    
    const nameLabel = language === "bn" ? "নাম" : "Name";
    const phoneLabel = language === "bn" ? "ফোন" : "Phone";
    const emailLabel = language === "bn" ? "ইমেইল" : "Email";
    const messageLabel = language === "bn" ? "বার্তা" : "Message";
    
    let message = `${greeting}\n\n`;
    message += `${nameLabel}: ${formData.name}\n`;
    message += `${phoneLabel}: ${formData.phone}\n`;
    if (formData.email) {
      message += `${emailLabel}: ${formData.email}\n`;
    }
    message += `\n${messageLabel}:\n${formData.message}`;
    
    return encodeURIComponent(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Small delay for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Generate WhatsApp URL and open it
    const whatsappMessage = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;
    
    window.open(whatsappUrl, "_blank");
    
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
                className="w-20 h-20 mx-auto bg-[#25D366]/10 rounded-full flex items-center justify-center"
              >
                <WhatsAppIcon className="w-10 h-10 text-[#25D366]" />
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">
                  {t("contactForm.whatsappOpened")}
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {t("contactForm.whatsappMessage")}
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
                <div className="flex items-center gap-2">
                  <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                  <h3 className="text-xl font-bold text-foreground">
                    {t("contactForm.title")}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("contactForm.whatsappDescription")}
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
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    {t("contactForm.sending")}
                  </>
                ) : (
                  <>
                    <WhatsAppIcon className="w-5 h-5 mr-2" />
                    {t("contactForm.sendViaWhatsApp")}
                  </>
                )}
              </Button>

              {/* Note */}
              <p className="text-xs text-center text-muted-foreground">
                {t("contactForm.whatsappNote")}
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </ScrollFadeIn>
  );
}
