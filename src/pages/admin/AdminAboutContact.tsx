import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Info, Phone, Share2, Loader2, Save } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface AboutContent {
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  ageRange: string;
  features: string[];
}

interface ContactInfo {
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  addressLine1Bn: string;
  addressLine2Bn: string;
  whatsapp: string;
  mapEmbedUrl: string;
}

interface SocialLinksData {
  facebook: string;
  youtube: string;
  instagram: string;
  tiktok: string;
}

const defaultAbout: AboutContent = {
  title: "Where Learning Meets Play",
  titleBn: "যেখানে শেখা আর খেলা একসাথে",
  description: "Baby World is a premium indoor playground designed for children aged 1-10 years. Our safe, clean, and stimulating environment encourages physical activity, creativity, and social skills.",
  descriptionBn: "বেবি ওয়ার্ল্ড ১-১০ বছর বয়সী শিশুদের জন্য একটি প্রিমিয়াম ইনডোর প্লেগ্রাউন্ড।",
  ageRange: "1-10",
  features: ["Adventure Zone", "Learning Corner", "Creative Space", "Party Area"],
};

const defaultContact: ContactInfo = {
  phone: "09606990128",
  email: "babyworld.dm@gmail.com",
  addressLine1: "27/B, Jannat Tower (Lift #3)",
  addressLine2: "Lalbagh, Dhaka-1211",
  addressLine1Bn: "২৭/বি, জান্নাত টাওয়ার (লিফট #৩)",
  addressLine2Bn: "লালবাগ, ঢাকা-১২১১",
  whatsapp: "8801XXXXXXXXX",
  mapEmbedUrl: "",
};

const defaultSocial: SocialLinksData = {
  facebook: "https://www.facebook.com/BabyWorldLimited",
  youtube: "https://www.youtube.com/@BabyWorldLimited",
  instagram: "https://www.instagram.com/BabyWorldLimited",
  tiktok: "https://www.tiktok.com/@BabyWorldLimited",
};

export default function AdminAboutContact() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [about, setAbout] = useState<AboutContent>(defaultAbout);
  const [contact, setContact] = useState<ContactInfo>(defaultContact);
  const [social, setSocial] = useState<SocialLinksData>(defaultSocial);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["about_content", "contact_info", "social_links"]);

      if (data) {
        data.forEach((s) => {
          const val = s.value as Record<string, unknown>;
          if (s.key === "about_content" && val) setAbout((p) => ({ ...p, ...val } as AboutContent));
          if (s.key === "contact_info" && val) setContact((p) => ({ ...p, ...val } as ContactInfo));
          if (s.key === "social_links" && val) setSocial((p) => ({ ...p, ...val } as SocialLinksData));
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveKey = async (key: string, value: unknown) => {
    const { data: existing } = await supabase.from("settings").select("id").eq("key", key).maybeSingle();
    if (existing) {
      const { error } = await supabase.from("settings").update({ value: value as Json, category: "frontend" }).eq("key", key);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("settings").insert([{ key, value: value as Json, category: "frontend" }]);
      if (error) throw error;
    }
  };

  const handleSave = async (section: "about" | "contact" | "social") => {
    setSaving(true);
    try {
      if (section === "about") await saveKey("about_content", about);
      if (section === "contact") await saveKey("contact_info", contact);
      if (section === "social") await saveKey("social_links", social);
      toast.success("Saved successfully!");
    } catch (e) {
      toast.error("Failed to save");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">About & Contact Management</h1>
        <p className="text-sm text-muted-foreground">Manage About, Contact and Social Links content</p>
      </div>

      <Tabs defaultValue="about" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="about" className="gap-2">
            <Info className="w-4 h-4" />
            About Section
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Phone className="w-4 h-4" />
            Contact Info
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="w-4 h-4" />
            Social Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>About Section Content</CardTitle>
              <CardDescription>Edit the About section content on the homepage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Input value={about.title} onChange={(e) => setAbout({ ...about, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Title (Bangla)</Label>
                  <Input value={about.titleBn} onChange={(e) => setAbout({ ...about, titleBn: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (English)</Label>
                <Textarea rows={3} value={about.description} onChange={(e) => setAbout({ ...about, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description (Bangla)</Label>
                <Textarea rows={3} value={about.descriptionBn} onChange={(e) => setAbout({ ...about, descriptionBn: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Age Range</Label>
                <Input value={about.ageRange} onChange={(e) => setAbout({ ...about, ageRange: e.target.value })} placeholder="e.g. 1-10" />
              </div>
              <Button onClick={() => handleSave("about")} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save About
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Contact information displayed on the website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Address Line 1 (English)</Label>
                  <Input value={contact.addressLine1} onChange={(e) => setContact({ ...contact, addressLine1: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 2 (English)</Label>
                  <Input value={contact.addressLine2} onChange={(e) => setContact({ ...contact, addressLine2: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Address Line 1 (Bangla)</Label>
                  <Input value={contact.addressLine1Bn} onChange={(e) => setContact({ ...contact, addressLine1Bn: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 2 (Bangla)</Label>
                  <Input value={contact.addressLine2Bn} onChange={(e) => setContact({ ...contact, addressLine2Bn: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>WhatsApp Number</Label>
                <Input value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} />
              </div>
              <Button onClick={() => handleSave("contact")} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Contact
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Update social media profile links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Facebook URL</Label>
                <Input value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>YouTube URL</Label>
                <Input value={social.youtube} onChange={(e) => setSocial({ ...social, youtube: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Instagram URL</Label>
                <Input value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>TikTok URL</Label>
                <Input value={social.tiktok} onChange={(e) => setSocial({ ...social, tiktok: e.target.value })} />
              </div>
              <Button onClick={() => handleSave("social")} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Social Links
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
