import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";

interface SEOHeadProps {
  page: "home" | "play-booking" | "birthday-events" | "contact";
}

const seoData = {
  en: {
    home: {
      title: "Baby World (বেবি ওয়ার্ল্ড) - Premium Indoor Playground | Dhaka",
      description: "Baby World is a safe, hygienic, and joyful indoor playground for children aged 1-10 years in Dhaka. Book hourly play sessions and birthday parties. Located in Lalbagh.",
      keywords: "indoor playground Dhaka, kids play area, children activities, Baby World, বেবি ওয়ার্ল্ড, Lalbagh, safe playground",
    },
    "play-booking": {
      title: "Play & Booking | Baby World - Indoor Playground Dhaka",
      description: "Book your child's play session at Baby World. Hourly play options with supervised environment. Safe and clean indoor playground for ages 1-10.",
      keywords: "book playground, hourly play session, kids activities Dhaka, indoor play area booking",
    },
    "birthday-events": {
      title: "Birthday Parties & Events | Baby World Dhaka",
      description: "Celebrate your child's birthday at Baby World! Premium party packages with decorations, photography, and supervised play. Safe, stress-free celebrations for ages 1-10.",
      keywords: "birthday party venue Dhaka, kids birthday party, children event venue, party packages Bangladesh",
    },
    contact: {
      title: "Contact Us | Baby World - Indoor Playground Dhaka",
      description: "Get in touch with Baby World. Visit us at Jannat Tower, Lalbagh, Dhaka. Call 09606990128 or send us a message via WhatsApp.",
      keywords: "Baby World contact, indoor playground Dhaka address, Lalbagh playground",
    },
  },
  bn: {
    home: {
      title: "বেবি ওয়ার্ল্ড (Baby World) - প্রিমিয়াম ইনডোর প্লেগ্রাউন্ড | ঢাকা",
      description: "বেবি ওয়ার্ল্ড ঢাকায় ১-১০ বছর বয়সী শিশুদের জন্য একটি নিরাপদ, পরিচ্ছন্ন এবং আনন্দদায়ক ইনডোর প্লেগ্রাউন্ড। ঘণ্টা ভিত্তিক প্লে সেশন এবং জন্মদিনের পার্টি বুক করুন।",
      keywords: "ইনডোর প্লেগ্রাউন্ড ঢাকা, শিশুদের খেলার জায়গা, বেবি ওয়ার্ল্ড, লালবাগ, নিরাপদ প্লেগ্রাউন্ড",
    },
    "play-booking": {
      title: "প্লে ও বুকিং | বেবি ওয়ার্ল্ড - ইনডোর প্লেগ্রাউন্ড ঢাকা",
      description: "বেবি ওয়ার্ল্ডে আপনার সন্তানের প্লে সেশন বুক করুন। তত্ত্বাবধানে থাকা পরিবেশে ঘণ্টা ভিত্তিক খেলার সুযোগ। ১-১০ বছর বয়সীদের জন্য নিরাপদ ও পরিচ্ছন্ন।",
      keywords: "প্লেগ্রাউন্ড বুকিং, ঘণ্টা ভিত্তিক খেলা, শিশুদের কার্যক্রম ঢাকা",
    },
    "birthday-events": {
      title: "জন্মদিন ও ইভেন্ট | বেবি ওয়ার্ল্ড ঢাকা",
      description: "বেবি ওয়ার্ল্ডে আপনার সন্তানের জন্মদিন উদযাপন করুন! সাজসজ্জা, ফটোগ্রাফি এবং তত্ত্বাবধানে খেলা সহ প্রিমিয়াম পার্টি প্যাকেজ। ১-১০ বছর বয়সীদের জন্য নিরাপদ উদযাপন।",
      keywords: "জন্মদিনের পার্টি ভেন্যু ঢাকা, শিশুদের জন্মদিন, পার্টি প্যাকেজ বাংলাদেশ",
    },
    contact: {
      title: "যোগাযোগ করুন | বেবি ওয়ার্ল্ড - ইনডোর প্লেগ্রাউন্ড ঢাকা",
      description: "বেবি ওয়ার্ল্ডের সাথে যোগাযোগ করুন। জান্নাত টাওয়ার, লালবাগ, ঢাকায় আসুন। ফোন: ০৯৬০৬৯৯০১২৮ অথবা WhatsApp এ মেসেজ পাঠান।",
      keywords: "বেবি ওয়ার্ল্ড যোগাযোগ, ইনডোর প্লেগ্রাউন্ড ঢাকা ঠিকানা, লালবাগ প্লেগ্রাউন্ড",
    },
  },
};

const ogImages = {
  home: "https://babyworld.lovable.app/og-home.jpg",
  "play-booking": "https://babyworld.lovable.app/og-play.jpg",
  "birthday-events": "https://babyworld.lovable.app/og-events.jpg",
  contact: "https://babyworld.lovable.app/og-contact.jpg",
};

export function SEOHead({ page }: SEOHeadProps) {
  const { language } = useLanguage();
  const data = seoData[language][page];
  const baseUrl = "https://babyworld.lovable.app";
  
  const paths = {
    home: "",
    "play-booking": "/play-booking",
    "birthday-events": "/birthday-events",
    contact: "/contact",
  };

  const canonicalUrl = `${baseUrl}${paths[page]}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{data.title}</title>
      <meta name="title" content={data.title} />
      <meta name="description" content={data.description} />
      <meta name="keywords" content={data.keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Language */}
      <html lang={language === "bn" ? "bn-BD" : "en"} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={data.title} />
      <meta property="og:description" content={data.description} />
      <meta property="og:image" content={ogImages[page]} />
      <meta property="og:site_name" content="Baby World (বেবি ওয়ার্ল্ড)" />
      <meta property="og:locale" content={language === "bn" ? "bn_BD" : "en_US"} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={data.title} />
      <meta name="twitter:description" content={data.description} />
      <meta name="twitter:image" content={ogImages[page]} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Baby World" />
      <meta name="geo.region" content="BD-C" />
      <meta name="geo.placename" content="Dhaka" />
      
      {/* Structured Data - Local Business */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Baby World (বেবি ওয়ার্ল্ড)",
          "description": data.description,
          "url": baseUrl,
          "telephone": "+8809606990128",
          "email": "babyworld.dm@gmail.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "27/B, Jannat Tower (Lift #3)",
            "addressLocality": "Lalbagh",
            "addressRegion": "Dhaka",
            "postalCode": "1211",
            "addressCountry": "BD"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "23.7195",
            "longitude": "90.3882"
          },
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
              "opens": "10:00",
              "closes": "21:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": "Friday",
              "opens": "15:00",
              "closes": "21:00"
            }
          ],
          "priceRange": "৳৳",
          "image": ogImages.home,
          "sameAs": []
        })}
      </script>
    </Helmet>
  );
}
