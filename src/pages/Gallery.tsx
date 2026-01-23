import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ScrollFadeIn, StaggerContainer, StaggerItem } from "@/components/ScrollAnimations";
import { useLanguage } from "@/contexts/LanguageContext";
import { ImageLightbox, GalleryItem } from "@/components/ImageLightbox";
import { Helmet } from "react-helmet-async";
import { Camera, Play, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";

// Import images
import arcadeGames from "@/assets/arcade-games.jpg";
import birthdayParty from "@/assets/birthday-party.jpg";
import carouselRides from "@/assets/carousel-rides.jpg";
import clawMachine from "@/assets/claw-machine.jpg";
import mascotClaw from "@/assets/mascot-claw.jpg";
import mascotKids from "@/assets/mascot-kids.jpg";
import newYearEvent from "@/assets/new-year-event.jpg";
import playgroundKids from "@/assets/playground-kids.jpg";
import tomMascot from "@/assets/tom-mascot.jpg";

const Gallery = () => {
  const { language } = useLanguage();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const photos = [
    { src: playgroundKids, alt: language === "bn" ? "প্লেগ্রাউন্ডে খেলছে শিশুরা" : "Children playing in playground" },
    { src: arcadeGames, alt: language === "bn" ? "আর্কেড গেমস এরিয়া" : "Arcade games area" },
    { src: carouselRides, alt: language === "bn" ? "ক্যারোসেল রাইড" : "Carousel rides" },
    { src: clawMachine, alt: language === "bn" ? "ক্ল মেশিন গেমস" : "Claw machine games" },
    { src: birthdayParty, alt: language === "bn" ? "জন্মদিনের পার্টি" : "Birthday party celebration" },
    { src: newYearEvent, alt: language === "bn" ? "নতুন বছরের অনুষ্ঠান" : "New Year celebration event" },
    { src: mascotKids, alt: language === "bn" ? "মাসকটের সাথে শিশুরা" : "Kids with mascot" },
    { src: mascotClaw, alt: language === "bn" ? "মাসকট ক্ল মেশিনে" : "Mascot at claw machine" },
    { src: tomMascot, alt: language === "bn" ? "টম মাসকট শিশুদের সাথে" : "Tom mascot with children" },
  ];

  const videos = [
    {
      id: "1",
      thumbnail: playgroundKids,
      title: language === "bn" ? "প্লেগ্রাউন্ড ট্যুর" : "Playground Tour",
      youtubeId: "dQw4w9WgXcQ", // Placeholder - replace with actual video
    },
    {
      id: "2",
      thumbnail: birthdayParty,
      title: language === "bn" ? "জন্মদিনের পার্টি" : "Birthday Party",
      youtubeId: "dQw4w9WgXcQ", // Placeholder - replace with actual video
    },
  ];

  const seoData = {
    en: {
      title: "Photo & Video Gallery | Baby World - Indoor Playground Dhaka",
      description: "Explore our photo and video gallery showcasing the fun, safe, and exciting environment at Baby World indoor playground in Dhaka.",
    },
    bn: {
      title: "ফটো ও ভিডিও গ্যালারি | বেবি ওয়ার্ল্ড - ইনডোর প্লেগ্রাউন্ড ঢাকা",
      description: "বেবি ওয়ার্ল্ড ইনডোর প্লেগ্রাউন্ডের মজার, নিরাপদ এবং উত্তেজনাপূর্ণ পরিবেশ দেখুন আমাদের ফটো ও ভিডিও গ্যালারিতে।",
    },
  };

  const data = seoData[language];

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  return (
    <PageTransition>
      <Helmet>
        <title>{data.title}</title>
        <meta name="description" content={data.description} />
      </Helmet>
      
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />
        
        <main className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            {/* Header */}
            <ScrollFadeIn className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 lg:mb-16 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Camera className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                  {language === "bn" ? "গ্যালারি" : "Gallery"}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                {language === "bn" ? "ফটো ও ভিডিও গ্যালারি" : "Photo & Video Gallery"}
              </h1>
              <p className="text-lg text-muted-foreground">
                {language === "bn" 
                  ? "বেবি ওয়ার্ল্ডে শিশুদের আনন্দময় মুহূর্তগুলো দেখুন"
                  : "See the joyful moments of children at Baby World"}
              </p>
            </ScrollFadeIn>

            {/* Tabs */}
            <Tabs defaultValue="photos" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="photos" className="gap-2">
                    <Camera className="w-4 h-4" />
                    {language === "bn" ? "ফটো" : "Photos"}
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="gap-2">
                    <Play className="w-4 h-4" />
                    {language === "bn" ? "ভিডিও" : "Videos"}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Photos Tab */}
              <TabsContent value="photos">
                <StaggerContainer 
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
                  staggerDelay={0.1}
                >
                  {photos.map((photo, index) => (
                    <StaggerItem key={index}>
                      <GalleryItem
                        src={photo.src}
                        alt={photo.alt}
                        onClick={() => openLightbox(index)}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </TabsContent>

              {/* Videos Tab */}
              <TabsContent value="videos">
                <div className="grid md:grid-cols-2 gap-6">
                  {videos.map((video) => (
                    <ScrollFadeIn key={video.id}>
                      <button
                        onClick={() => {
                          setSelectedVideo(video.youtubeId);
                          setVideoOpen(true);
                        }}
                        className="relative group overflow-hidden rounded-xl sm:rounded-2xl aspect-video w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors duration-300 flex items-center justify-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground ml-1" fill="currentColor" />
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-background font-semibold text-lg drop-shadow-lg">
                            {video.title}
                          </p>
                        </div>
                      </button>
                    </ScrollFadeIn>
                  ))}
                </div>
                
                {/* YouTube Channel Link */}
                <ScrollFadeIn delay={0.3} className="text-center mt-10">
                  <a
                    href="https://www.youtube.com/@BabyWorldLimited"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="lg" className="gap-2">
                      <Play className="w-4 h-4" />
                      {language === "bn" ? "আমাদের YouTube চ্যানেল দেখুন" : "Visit our YouTube Channel"}
                    </Button>
                  </a>
                </ScrollFadeIn>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Image Lightbox */}
        <ImageLightbox
          images={photos}
          initialIndex={selectedImageIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />

        {/* Video Modal */}
        <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
          <DialogContent className="max-w-4xl p-0 bg-black border-none">
            <DialogClose className="absolute -top-10 right-0 text-white hover:text-primary z-50">
              <X className="w-8 h-8" />
            </DialogClose>
            {selectedVideo && (
              <div className="aspect-video w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Footer />
        <div className="lg:hidden h-20" />
        <WhatsAppButton variant="floating" />
        <MobileBottomNav />
      </div>
    </PageTransition>
  );
};

export default Gallery;
