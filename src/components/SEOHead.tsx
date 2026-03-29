import { Helmet } from "react-helmet-async";
import { SOCIAL_LINKS } from "./SocialLinks";

interface SEOHeadProps {
  page: "home" | "play-booking" | "birthday-events" | "contact" | "gallery";
}

const seoData = {
  en: {
    home: {
      title: "Baby World - Premium Indoor Playground | Dhaka",
      description: "Baby World is a safe, hygienic, and joyful indoor playground for children aged 1-10 years in Dhaka. Book hourly play sessions and birthday parties. Located in Lalbagh.",
      keywords: "indoor playground Dhaka, kids play area, children activities, Baby World, Lalbagh, safe playground",
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
    gallery: {
      title: "Photo & Video Gallery | Baby World - Indoor Playground Dhaka",
      description: "Explore our photo and video gallery showcasing the fun, safe, and exciting environment at Baby World indoor playground in Dhaka.",
      keywords: "Baby World gallery, indoor playground photos, kids play area videos, Dhaka playground images",
    },
  },
};

const baseUrl = "https://babyworld.lovable.app";
const defaultOgImage = `${baseUrl}/favicon.png`;

const paths: Record<string, string> = {
  home: "",
  "play-booking": "/play-booking",
  "birthday-events": "/birthday-events",
  contact: "/contact",
  gallery: "/gallery",
};

export function SEOHead({ page }: SEOHeadProps) {
  const data = seoData.en[page];
  const canonicalUrl = `${baseUrl}${paths[page]}`;

  return (
    <Helmet>
      <title>{data.title}</title>
      <meta name="title" content={data.title} />
      <meta name="description" content={data.description} />
      <meta name="keywords" content={data.keywords} />
      <link rel="canonical" href={canonicalUrl} />
      <html lang="en" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={data.title} />
      <meta property="og:description" content={data.description} />
      <meta property="og:image" content={defaultOgImage} />
      <meta property="og:site_name" content="Baby World" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={data.title} />
      <meta name="twitter:description" content={data.description} />
      <meta name="twitter:image" content={defaultOgImage} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Baby World" />
      <meta name="geo.region" content="BD-C" />
      <meta name="geo.placename" content="Dhaka" />

      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Baby World",
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
          "image": defaultOgImage,
          "sameAs": [
            SOCIAL_LINKS.facebook,
            SOCIAL_LINKS.youtube,
            SOCIAL_LINKS.instagram,
            SOCIAL_LINKS.tiktok
          ]
        })}
      </script>
    </Helmet>
  );
}
