import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Palette, Loader2, Save } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface SeoMeta {
  homeTitle: string;
  homeDescription: string;
  homeKeywords: string;
  playTitle: string;
  playDescription: string;
  eventsTitle: string;
  eventsDescription: string;
  contactTitle: string;
  contactDescription: string;
  ogImageUrl: string;
}

interface SiteBranding {
  siteName: string;
  siteNameBn: string;
  tagline: string;
  taglineBn: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
}

const defaultSeo: SeoMeta = {
  homeTitle: "Baby World (বেবি ওয়ার্ল্ড) - Premium Indoor Playground | Dhaka",
  homeDescription: "Baby World is a safe, hygienic, and joyful indoor playground for children aged 1-10 years in Dhaka.",
  homeKeywords: "indoor playground Dhaka, kids play area, Baby World, বেবি ওয়ার্ল্ড",
  playTitle: "Play & Booking | Baby World - Indoor Playground Dhaka",
  playDescription: "Book your child's play session at Baby World. Hourly play options with supervised environment.",
  eventsTitle: "Birthday Parties & Events | Baby World Dhaka",
  eventsDescription: "Celebrate your child's birthday at Baby World! Premium party packages.",
  contactTitle: "Contact Us | Baby World - Indoor Playground Dhaka",
  contactDescription: "Get in touch with Baby World. Visit us at Jannat Tower, Lalbagh, Dhaka.",
  ogImageUrl: "",
};

const defaultBranding: SiteBranding = {
  siteName: "Baby World",
  siteNameBn: "বেবি ওয়ার্ল্ড",
  tagline: "Where Learning Meets Play",
  taglineBn: "যেখানে শেখা আর খেলা একসাথে",
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "#FF6B35",
  accentColor: "#4ECDC4",
};

export default function AdminSeoBranding() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seo, setSeo] = useState<SeoMeta>(defaultSeo);
  const [branding, setBranding] = useState<SiteBranding>(defaultBranding);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["seo_meta", "site_branding"]);

      if (data) {
        data.forEach((s) => {
          const val = s.value as Record<string, unknown>;
          if (s.key === "seo_meta" && val) setSeo((p) => ({ ...p, ...val } as SeoMeta));
          if (s.key === "site_branding" && val) setBranding((p) => ({ ...p, ...val } as SiteBranding));
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

  const handleSave = async (section: "seo" | "branding") => {
    setSaving(true);
    try {
      if (section === "seo") await saveKey("seo_meta", seo);
      if (section === "branding") await saveKey("site_branding", branding);
      toast.success("সফলভাবে সেভ হয়েছে!");
    } catch (e) {
      toast.error("সেভ করতে সমস্যা হয়েছে");
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
        <h1 className="text-2xl font-bold text-foreground">SEO & Branding</h1>
        <p className="text-sm text-muted-foreground">সার্চ ইঞ্জিন অপটিমাইজেশন এবং ব্র্যান্ডিং সেটিংস কন্ট্রোল করুন</p>
      </div>

      <Tabs defaultValue="seo" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="seo" className="gap-2">
            <Search className="w-4 h-4" />
            SEO Meta Tags
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="w-4 h-4" />
            Branding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="seo" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Homepage SEO</CardTitle>
              <CardDescription>হোমপেজের মেটা ট্যাগ সেটিংস</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Page Title</Label>
                <Input value={seo.homeTitle} onChange={(e) => setSeo({ ...seo, homeTitle: e.target.value })} />
                <p className="text-xs text-muted-foreground">{seo.homeTitle.length}/60 characters</p>
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea rows={2} value={seo.homeDescription} onChange={(e) => setSeo({ ...seo, homeDescription: e.target.value })} />
                <p className="text-xs text-muted-foreground">{seo.homeDescription.length}/160 characters</p>
              </div>
              <div className="space-y-2">
                <Label>Keywords</Label>
                <Input value={seo.homeKeywords} onChange={(e) => setSeo({ ...seo, homeKeywords: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Other Pages SEO</CardTitle>
              <CardDescription>অন্যান্য পেজের মেটা তথ্য</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Play & Booking Title</Label>
                  <Input value={seo.playTitle} onChange={(e) => setSeo({ ...seo, playTitle: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Play & Booking Description</Label>
                  <Input value={seo.playDescription} onChange={(e) => setSeo({ ...seo, playDescription: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Events Title</Label>
                  <Input value={seo.eventsTitle} onChange={(e) => setSeo({ ...seo, eventsTitle: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Events Description</Label>
                  <Input value={seo.eventsDescription} onChange={(e) => setSeo({ ...seo, eventsDescription: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Title</Label>
                  <Input value={seo.contactTitle} onChange={(e) => setSeo({ ...seo, contactTitle: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Description</Label>
                  <Input value={seo.contactDescription} onChange={(e) => setSeo({ ...seo, contactDescription: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>OG Image URL</Label>
                <Input value={seo.ogImageUrl} onChange={(e) => setSeo({ ...seo, ogImageUrl: e.target.value })} placeholder="https://..." />
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => handleSave("seo")} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save SEO Settings
          </Button>
        </TabsContent>

        <TabsContent value="branding" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Branding</CardTitle>
              <CardDescription>সাইটের নাম, ট্যাগলাইন এবং ব্র্যান্ড কালার</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Site Name (English)</Label>
                  <Input value={branding.siteName} onChange={(e) => setBranding({ ...branding, siteName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Site Name (বাংলা)</Label>
                  <Input value={branding.siteNameBn} onChange={(e) => setBranding({ ...branding, siteNameBn: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tagline (English)</Label>
                  <Input value={branding.tagline} onChange={(e) => setBranding({ ...branding, tagline: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Tagline (বাংলা)</Label>
                  <Input value={branding.taglineBn} onChange={(e) => setBranding({ ...branding, taglineBn: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={branding.primaryColor} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} className="w-16 h-10 p-1" />
                    <Input value={branding.primaryColor} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={branding.accentColor} onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })} className="w-16 h-10 p-1" />
                    <Input value={branding.accentColor} onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })} />
                  </div>
                </div>
              </div>
              <Button onClick={() => handleSave("branding")} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Branding
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
