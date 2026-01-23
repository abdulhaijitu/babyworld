import { useState } from "react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CalendarDays, 
  PartyPopper, 
  Sparkles, 
  Package, 
  Baby, 
  User, 
  Check,
  ArrowLeft,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { ScrollFadeIn } from "@/components/ScrollAnimations";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface EventBookingFormProps {
  selectedPackage: string | null;
  onSelectPackage: (packageId: string) => void;
}

const TOTAL_STEPS = 5;

export function EventBookingForm({ selectedPackage, onSelectPackage }: EventBookingFormProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [eventType, setEventType] = useState<"birthday" | "other" | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const today = startOfDay(new Date());
  const maxDate = addDays(today, 90);

  const steps = [
    { number: 1, label: t("eventsPage.booking.step1"), icon: PartyPopper },
    { number: 2, label: t("eventsPage.booking.step2"), icon: Package },
    { number: 3, label: t("eventsPage.booking.step3"), icon: CalendarDays },
    { number: 4, label: t("eventsPage.booking.step4"), icon: Baby },
    { number: 5, label: t("eventsPage.booking.step5"), icon: User },
  ];

  const packages = [
    { id: "basic", name: t("events.basicName") },
    { id: "premium", name: t("events.premiumName") },
    { id: "grand", name: t("events.grandName") },
    { id: "custom", name: t("eventsPage.packages.customName") },
  ];

  const ageGroups = [
    { id: "1-3", label: t("eventsPage.booking.ageGroup1") },
    { id: "4-6", label: t("eventsPage.booking.ageGroup2") },
    { id: "7-10", label: t("eventsPage.booking.ageGroup3") },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1: return eventType !== null;
      case 2: return selectedPackage !== null;
      case 3: return selectedDate !== undefined;
      case 4: return ageGroup !== null;
      case 5: return parentName.trim() !== "" && parentPhone.trim() !== "";
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // UI only - no actual submission
    setIsSubmitted(true);
  };

  const handleNewRequest = () => {
    setIsSubmitted(false);
    setCurrentStep(1);
    setEventType(null);
    onSelectPackage("");
    setSelectedDate(undefined);
    setAgeGroup(null);
    setParentName("");
    setParentPhone("");
  };

  if (isSubmitted) {
    return (
      <section id="booking" className="py-24 bg-background">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-3xl p-8 md:p-12 shadow-card text-center space-y-6"
          >
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {t("eventsPage.booking.successTitle")}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t("eventsPage.booking.successMessage")}
            </p>
            <Button size="lg" onClick={handleNewRequest}>
              {t("eventsPage.booking.newRequest")}
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-24 bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <ScrollFadeIn className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            {t("eventsPage.booking.label")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t("eventsPage.booking.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("eventsPage.booking.description")}
          </p>
        </ScrollFadeIn>

        {/* Step Indicators */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300",
                      currentStep >= step.number
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs mt-2 text-muted-foreground hidden md:block">
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2 rounded transition-all duration-300",
                      currentStep > step.number ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Step 1: Event Type */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-foreground">
                      {t("eventsPage.booking.selectEventType")}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setEventType("birthday")}
                        className={cn(
                          "p-6 rounded-2xl border-2 transition-all duration-200 text-left",
                          eventType === "birthday"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <PartyPopper className={cn(
                          "w-8 h-8 mb-3",
                          eventType === "birthday" ? "text-primary" : "text-muted-foreground"
                        )} />
                        <p className="font-semibold text-foreground">
                          {t("eventsPage.booking.eventTypeBirthday")}
                        </p>
                      </button>
                      <button
                        onClick={() => setEventType("other")}
                        className={cn(
                          "p-6 rounded-2xl border-2 transition-all duration-200 text-left",
                          eventType === "other"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <Sparkles className={cn(
                          "w-8 h-8 mb-3",
                          eventType === "other" ? "text-primary" : "text-muted-foreground"
                        )} />
                        <p className="font-semibold text-foreground">
                          {t("eventsPage.booking.eventTypeOther")}
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Package Selection */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-foreground">
                      {t("eventsPage.booking.selectPackageStep")}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {packages.map((pkg) => (
                        <button
                          key={pkg.id}
                          onClick={() => onSelectPackage(pkg.id)}
                          className={cn(
                            "p-4 rounded-2xl border-2 transition-all duration-200 text-left",
                            selectedPackage === pkg.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          )}
                        >
                          <p className="font-semibold text-foreground">{pkg.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Date Selection */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-foreground">
                      {t("eventsPage.booking.selectDateStep")}
                    </h3>
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) =>
                          isBefore(date, today) || isBefore(maxDate, date)
                        }
                        className="rounded-xl border-0 pointer-events-auto"
                        classNames={{
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-medium text-foreground",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-accent rounded-lg transition-all",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex-1 text-center",
                          row: "flex w-full mt-2",
                          cell: "flex-1 text-center text-sm p-0 relative",
                          day: "h-9 w-9 mx-auto p-0 font-normal rounded-lg hover:bg-accent transition-colors aria-selected:opacity-100",
                          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                          day_today: "bg-accent text-accent-foreground font-semibold",
                          day_outside: "text-muted-foreground opacity-50",
                          day_disabled: "text-muted-foreground opacity-30 cursor-not-allowed",
                          day_hidden: "invisible",
                        }}
                      />
                    </div>
                    {selectedDate && (
                      <div className="text-center p-3 bg-primary/5 rounded-xl">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">{t("booking.selected")}:</span>{" "}
                          {format(selectedDate, "dd MMMM, yyyy")}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Age Group */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-foreground">
                      {t("eventsPage.booking.selectAgeGroup")}
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {ageGroups.map((group) => (
                        <button
                          key={group.id}
                          onClick={() => setAgeGroup(group.id)}
                          className={cn(
                            "p-4 rounded-2xl border-2 transition-all duration-200 text-center",
                            ageGroup === group.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          )}
                        >
                          <Baby className={cn(
                            "w-6 h-6 mx-auto mb-2",
                            ageGroup === group.id ? "text-primary" : "text-muted-foreground"
                          )} />
                          <p className="font-semibold text-foreground text-sm">{group.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Contact Info */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {t("eventsPage.booking.parentName")}
                        </label>
                        <Input
                          value={parentName}
                          onChange={(e) => setParentName(e.target.value)}
                          placeholder={t("eventsPage.booking.parentNamePlaceholder")}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {t("eventsPage.booking.parentPhone")}
                        </label>
                        <Input
                          value={parentPhone}
                          onChange={(e) => setParentPhone(e.target.value)}
                          placeholder={t("eventsPage.booking.parentPhonePlaceholder")}
                          className="h-12"
                          type="tel"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-accent rounded-xl">
                      <p className="text-sm text-muted-foreground text-center">
                        {t("eventsPage.booking.confirmNote")}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("eventsPage.booking.back")}
              </Button>

              {currentStep < TOTAL_STEPS ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2"
                >
                  {t("eventsPage.booking.next")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed()}
                  className="gap-2"
                >
                  {t("eventsPage.booking.submit")}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sticky CTA - positioned above bottom nav */}
        <div className="lg:hidden fixed bottom-20 left-0 right-0 z-30 p-4 bg-card/98 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack} className="px-4 touch-target">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {currentStep < TOTAL_STEPS ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 touch-target"
              >
                {t("eventsPage.booking.next")}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="flex-1 touch-target"
              >
                {t("eventsPage.booking.submit")}
              </Button>
            )}
          </div>
        </div>
        <div className="lg:hidden h-36" />
      </div>
    </section>
  );
}
