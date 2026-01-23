import { Facebook, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/BabyWorldLimited",
  youtube: "https://www.youtube.com/@BabyWorldLimited",
};

interface SocialLinksProps {
  variant?: "footer" | "header";
  className?: string;
  showLabels?: boolean;
}

export function SocialLinks({ variant = "footer", className, showLabels = false }: SocialLinksProps) {
  const links = [
    {
      name: "Facebook",
      nameBn: "ফেসবুক",
      href: SOCIAL_LINKS.facebook,
      icon: Facebook,
      ariaLabel: "Visit our Facebook page",
    },
    {
      name: "YouTube",
      nameBn: "ইউটিউব",
      href: SOCIAL_LINKS.youtube,
      icon: Youtube,
      ariaLabel: "Visit our YouTube channel",
    },
  ];

  const isHeader = variant === "header";

  return (
    <div 
      className={cn(
        "flex items-center",
        isHeader ? "gap-1" : "gap-3",
        className
      )}
      role="navigation"
      aria-label="Social media links"
    >
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.ariaLabel}
          className={cn(
            "inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg",
            isHeader
              ? "p-2 text-muted-foreground hover:text-primary hover:bg-accent"
              : "p-2.5 opacity-70 hover:opacity-100 bg-background/10 hover:bg-background/20"
          )}
        >
          <link.icon 
            className={cn(
              isHeader ? "w-4 h-4" : "w-5 h-5"
            )} 
          />
          {showLabels && (
            <span className="ml-2 text-sm">{link.name}</span>
          )}
        </a>
      ))}
    </div>
  );
}
