import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Save, X, ArrowUp, ArrowDown } from "lucide-react";
import { ImageDropZone } from "@/components/admin/ImageDropZone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HeroSlide {
  id: string;
  image_url: string;
  label: string;
  alt_text: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminHeroSlides({ embedded = false }: { embedded?: boolean }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["admin-hero-slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as HeroSlide[];
    },
  });

  async function uploadImage(file: File): Promise<string> {
    const ext = file.name.split(".").pop();
    const fileName = `slides/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("hero-images").upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("hero-images").getPublicUrl(fileName);
    return data.publicUrl;
  }

  const handleImageUploaded = (url: string) => {
    setPreviewUrl(url);
    toast.success("Image uploaded");
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!previewUrl) throw new Error("Please upload an image first");
      const maxOrder = slides.length > 0 ? Math.max(...slides.map((s) => s.sort_order)) : -1;
      const { error } = await supabase.from("hero_slides").insert({
        image_url: previewUrl,
        label: label || "New Slide",
        alt_text: altText || label || "Hero slide",
        sort_order: maxOrder + 1,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Slide added");
      closeDialog();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hero_slides").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Slide deleted"); },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("hero_slides").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
    onError: (err: Error) => toast.error(err.message),
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const idx = slides.findIndex((s) => s.id === id);
      if (idx === -1) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= slides.length) return;

      const currentOrder = slides[idx].sort_order;
      const swapOrder = slides[swapIdx].sort_order;

      await Promise.all([
        supabase.from("hero_slides").update({ sort_order: swapOrder }).eq("id", slides[idx].id),
        supabase.from("hero_slides").update({ sort_order: currentOrder }).eq("id", slides[swapIdx].id),
      ]);
    },
    onSuccess: () => invalidate(),
    onError: (err: Error) => toast.error(err.message),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-hero-slides"] });
    queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
  }

  function closeDialog() {
    setDialogOpen(false);
    setLabel("");
    setAltText("");
    setPreviewUrl(null);
  }

  return (
    <div className={embedded ? "space-y-6" : "p-4 md:p-6 space-y-6"}>
      <div className="flex items-center justify-between">
        {!embedded && (
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hero Slider</h1>
            <p className="text-sm text-muted-foreground">
              Manage the images shown in the homepage hero slider. When no slides exist, default images are used.
            </p>
          </div>
        )}
        <div className={embedded ? "ml-auto" : ""}>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Slide
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 bg-muted rounded-t-lg" />
              <CardContent className="h-16" />
            </Card>
          ))}
        </div>
      ) : slides.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No custom slides. Default images are being used. Add slides to customize the hero carousel.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide, idx) => (
            <Card
              key={slide.id}
              className={`overflow-hidden transition-opacity ${!slide.is_active ? "opacity-50" : ""}`}
            >
              <div className="relative h-40 overflow-hidden">
                <img src={slide.image_url} alt={slide.alt_text} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  #{idx + 1}
                </div>
                {slide.label && (
                  <div className="absolute bottom-2 left-2 bg-white/20 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full border border-white/20">
                    {slide.label}
                  </div>
                )}
              </div>
              <CardContent className="p-3 space-y-2">
                <p className="text-sm font-medium text-foreground truncate">{slide.label || "Untitled"}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      disabled={idx === 0}
                      onClick={() => reorderMutation.mutate({ id: slide.id, direction: "up" })}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      disabled={idx === slides.length - 1}
                      onClick={() => reorderMutation.mutate({ id: slide.id, direction: "down" })}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={slide.is_active}
                      onCheckedChange={(checked) =>
                        toggleMutation.mutate({ id: slide.id, is_active: checked })
                      }
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7"
                      onClick={() => {
                        if (confirm("Delete this slide?")) deleteMutation.mutate(slide.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Slide Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Slide</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Slide Image *</Label>
              {previewUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-3 h-3 mr-1" /> Replace
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setPreviewUrl(null)}>
                      <X className="w-3 h-3 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {uploading ? (
                    <span className="text-sm">Uploading...</span>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-sm">Click to upload (max 5MB)</span>
                    </>
                  )}
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            </div>

            <div className="space-y-2">
              <Label>Label (shown on slide)</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Adventure Zone" />
            </div>

            <div className="space-y-2">
              <Label>Alt Text (accessibility)</Label>
              <Input value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="e.g. Children playing at playground" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeDialog}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending || uploading || !previewUrl}>
                <Save className="w-4 h-4 mr-1" />
                {addMutation.isPending ? "Saving..." : "Add Slide"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
