import { useLanguage, Language } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const handleToggle = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center gap-1 px-1 py-1 bg-muted/50 rounded-full">
      <button
        onClick={() => handleToggle("en")}
        className={cn(
          "px-3 py-1 text-xs font-medium rounded-full transition-all duration-200",
          language === "en"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
      <button
        onClick={() => handleToggle("bn")}
        className={cn(
          "px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 font-bangla",
          language === "bn"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        বাংলা
      </button>
    </div>
  );
}
