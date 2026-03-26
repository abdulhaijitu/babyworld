import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, SlidersHorizontal } from "lucide-react";
import AdminHeroCards from "./AdminHeroCards";
import AdminHeroSlides from "./AdminHeroSlides";

export default function AdminHomepage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Homepage Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage the hero slider images and promotional/event cards displayed on the homepage.
        </p>
      </div>

      <Tabs defaultValue="slides" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="slides" className="gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Slider Images
          </TabsTrigger>
          <TabsTrigger value="cards" className="gap-2">
            <ImageIcon className="w-4 h-4" />
            Offer & Event Cards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="slides" className="mt-4">
          <AdminHeroSlides embedded />
        </TabsContent>

        <TabsContent value="cards" className="mt-4">
          <AdminHeroCards embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
