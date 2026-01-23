import { Facebook, Youtube, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

// TikTok icon (not available in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/BabyWorldLimited",
  youtube: "https://www.youtube.com/@BabyWorldLimited",
  // Instagram এবং TikTok লিংক যোগ করুন যখন অ্যাকাউন্ট তৈরি হবে
  // instagram: "https://www.instagram.com/BabyWorldLimited",
  // tiktok: "https://www.tiktok.com/@BabyWorldLimited",
};

interface SocialLinksProps {
  variant?: "footer" | "header";
  className?: string;
  showLabels?: boolean;
}

export function SocialLinks({ variant = "footer", className, showLabels = false }: SocialLinksProps) {
  // Active links - শুধু যেগুলোর URL আছে সেগুলো দেখাবে
  const links = [
    {
      name: "Facebook",
      nameBn: "ফেসবুক",
      href: SOCIAL_LINKS.facebook,
      icon: Facebook,
      ariaLabel: "Visit our Facebook page",
      active: true,
    },
    {
      name: "YouTube",
      nameBn: "ইউটিউব",
      href: SOCIAL_LINKS.youtube,
      icon: Youtube,
      ariaLabel: "Visit our YouTube channel",
      active: true,
    },
    // Instagram - লিংক যোগ করলে active: true করুন
    // {
    //   name: "Instagram",
    //   nameBn: "ইনস্টাগ্রাম",
    //   href: SOCIAL_LINKS.instagram,
    //   icon: Instagram,
    //   ariaLabel: "Visit our Instagram profile",
    //   active: false,
    // },
    // TikTok - লিংক যোগ করলে active: true করুন
    // {
    //   name: "TikTok",
    //   nameBn: "টিকটক",
    //   href: SOCIAL_LINKS.tiktok,
    //   icon: TikTokIcon,
    //   ariaLabel: "Visit our TikTok profile",
    //   active: false,
    // },
  ].filter(link => link.active);

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
