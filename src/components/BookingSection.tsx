import { useState } from "react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Shield, Clock, Users, CalendarDays, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollFadeIn, StaggerContainer, StaggerItem } from "./ScrollAnimations";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const WHATSAPP_NUMBER = "8809606990128";

// WhatsApp icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Mock time slots - some marked as unavailable for demo
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 10; hour < 21; hour++) {
    const startTime = `${hour.toString().padStart(2, "0")}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;
    // Mock some slots as unavailable
    const isUnavailable = [12, 15, 18].includes(hour);
    slots.push({
      id: `slot-${hour}`,
      startTime,
      endTime,
      label: `${startTime} – ${endTime}`,
      available: !isUnavailable,
    });
  }
  return slots;
};

const timeSlots = generateTimeSlots();

export function BookingSection() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const { t } = useLanguage();

  const today = startOfDay(new Date());
  const maxDate = addDays(today, 30); // Allow booking up to 30 days ahead

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId === selectedSlot ? null : slotId);
  };

  const selectedSlotData = timeSlots.find((slot) => slot.id === selectedSlot);

  return (
    <section id="booking" className="py-24 bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <ScrollFadeIn className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            {t("booking.label")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t("booking.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("booking.description")}
          </p>
        </ScrollFadeIn>

        {/* Trust Badge */}
        <ScrollFadeIn delay={0.1} className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-accent rounded-xl">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {t("booking.trustBadge")}
            </span>
          </div>
        </ScrollFadeIn>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <ScrollFadeIn className="lg:col-span-1">
            <div className="bg-card rounded-3xl p-6 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t("booking.selectDate")}</h3>
                  <p className="text-sm text-muted-foreground">{t("booking.futureDate")}</p>
                </div>
              </div>

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
                  month: "space-y-4 w-full",
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

              {selectedDate && (
                <div className="mt-4 p-3 bg-primary/5 rounded-xl">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{t("booking.selected")}:</span>{" "}
                    {format(selectedDate, "dd MMMM, yyyy")}
                  </p>
                </div>
              )}
            </div>
          </ScrollFadeIn>

          {/* Time Slots Section */}
          <ScrollFadeIn delay={0.15} className="lg:col-span-1">
            <div className="bg-card rounded-3xl p-6 shadow-card h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t("booking.selectTime")}</h3>
                  <p className="text-sm text-muted-foreground">{t("booking.eachSlot")}</p>
                </div>
              </div>

              {!selectedDate ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <CalendarDays className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    {t("booking.selectDateFirst")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => slot.available && handleSlotSelect(slot.id)}
                      disabled={!slot.available}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                        slot.available
                          ? selectedSlot === slot.id
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-border bg-background hover:border-primary/30 hover:shadow-sm"
                          : "border-border bg-muted/50 cursor-not-allowed opacity-60"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "font-medium",
                            slot.available ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {slot.label}
                        </span>
                        {slot.available ? (
                          <span
                            className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              selectedSlot === slot.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-accent text-accent-foreground"
                            )}
                          >
                            {selectedSlot === slot.id ? t("booking.selected") : t("booking.available")}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                            {t("booking.booked")}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollFadeIn>

          {/* Summary Panel - Desktop */}
          <ScrollFadeIn delay={0.2} className="lg:col-span-1 hidden lg:block">
            <BookingSummary
              selectedDate={selectedDate}
              selectedSlotData={selectedSlotData}
            />
          </ScrollFadeIn>
        </div>

        {/* Summary Panel - Mobile (Sticky Bottom) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-md border-t border-border">
          <BookingSummaryMobile
            selectedDate={selectedDate}
            selectedSlotData={selectedSlotData}
          />
        </div>

        {/* Spacer for mobile sticky panel */}
        <div className="lg:hidden h-32" />
      </div>
    </section>
  );
}

interface SummaryProps {
  selectedDate: Date | undefined;
  selectedSlotData: { label: string } | undefined;
}

function generateWhatsAppBookingMessage(
  selectedDate: Date,
  selectedSlotData: { label: string },
  language: string
) {
  const greeting = language === "bn" 
    ? "আসসালামু আলাইকুম, Baby World!" 
    : "Hello, Baby World!";
  
  const bookingLabel = language === "bn" ? "প্লে সেশন বুকিং অনুরোধ" : "Play Session Booking Request";
  const dateLabel = language === "bn" ? "তারিখ" : "Date";
  const timeLabel = language === "bn" ? "সময়" : "Time";
  const ticketLabel = language === "bn" ? "টিকেট" : "Ticket";
  const ticketType = language === "bn" ? "১ শিশু + ১ অভিভাবক" : "1 Child + 1 Guardian";
  
  let message = `${greeting}\n\n`;
  message += `📋 ${bookingLabel}\n\n`;
  message += `📅 ${dateLabel}: ${format(selectedDate, "dd MMMM, yyyy")}\n`;
  message += `⏰ ${timeLabel}: ${selectedSlotData.label}\n`;
  message += `🎫 ${ticketLabel}: ${ticketType}\n\n`;
  message += language === "bn" 
    ? "অনুগ্রহ করে এই স্লট নিশ্চিত করুন।" 
    : "Please confirm this slot for me.";
  
  return encodeURIComponent(message);
}

function BookingSummary({ selectedDate, selectedSlotData }: SummaryProps) {
  const isComplete = selectedDate && selectedSlotData;
  const { t, language } = useLanguage();

  const handleWhatsAppBooking = () => {
    if (selectedDate && selectedSlotData) {
      const message = generateWhatsAppBookingMessage(selectedDate, selectedSlotData, language);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <div className="bg-card rounded-3xl p-6 shadow-card sticky top-24">
      <h3 className="font-semibold text-foreground mb-6">{t("booking.summary")}</h3>

      <div className="space-y-4">
        {/* Date */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
          <CalendarDays className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">{t("booking.date")}</p>
            {selectedDate ? (
              <p className="font-medium text-foreground">
                {format(selectedDate, "dd MMMM, yyyy")}
              </p>
            ) : (
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            )}
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">{t("booking.time")}</p>
            {selectedSlotData ? (
              <p className="font-medium text-foreground">{selectedSlotData.label}</p>
            ) : (
              <div className="h-5 w-24 bg-muted rounded animate-pulse" />
            )}
          </div>
        </div>

        {/* Ticket Type */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
          <Users className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">{t("booking.ticket")}</p>
            <p className="font-medium text-foreground">{t("booking.ticketType")}</p>
          </div>
        </div>

        {/* Price Placeholder */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">{t("booking.total")}</span>
            <div className="h-6 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>

        <Button
          size="lg"
          className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
          disabled={!isComplete}
          onClick={handleWhatsAppBooking}
        >
          {isComplete ? (
            <>
              <WhatsAppIcon className="w-5 h-5 mr-2" />
              {t("booking.bookViaWhatsApp")}
            </>
          ) : (
            t("booking.selectDateTime")
          )}
        </Button>

        {/* Info Note */}
        <div className="flex items-start gap-2 p-3 bg-accent rounded-xl">
          <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            {t("booking.whatsappNote")}
          </p>
        </div>
      </div>
    </div>
  );
}

function BookingSummaryMobile({ selectedDate, selectedSlotData }: SummaryProps) {
  const isComplete = selectedDate && selectedSlotData;
  const { t, language } = useLanguage();

  const handleWhatsAppBooking = () => {
    if (selectedDate && selectedSlotData) {
      const message = generateWhatsAppBookingMessage(selectedDate, selectedSlotData, language);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 min-w-0">
        {isComplete ? (
          <div>
            <p className="text-sm font-medium text-foreground truncate">
              {format(selectedDate!, "dd MMM")} • {selectedSlotData?.label}
            </p>
            <p className="text-xs text-muted-foreground">{t("booking.ticketType")}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("booking.selectDateTime")}</p>
        )}
      </div>
      <Button 
        size="lg" 
        disabled={!isComplete}
        className="bg-[#25D366] hover:bg-[#128C7E] text-white"
        onClick={handleWhatsAppBooking}
      >
        {isComplete ? (
          <>
            <WhatsAppIcon className="w-4 h-4 mr-1" />
            {t("booking.bookViaWhatsApp")}
          </>
        ) : (
          t("booking.select")
        )}
      </Button>
    </div>
  );
}
