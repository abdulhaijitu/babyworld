import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Gift, Calendar, Save, X, Upload, ImageIcon, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HeroCard {
  id: string;
  type: string;
  badge: string;
  title: string;
  description: string;
  cta_text: string;
  cta_link: string;
  date_text: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

type CardForm = Omit<HeroCard, "id" | "created_at" | "updated_at">;

const emptyCard: CardForm = {
  type: "offer",
  badge: "",
  title: "",
  description: "",
  cta_text: "Learn More",
  cta_link: "/",
  date_text: null,
  image_url: null,
  is_active: true,
  sort_order: 0,
};

export default function AdminHeroCards() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HeroCard | null>(null);
  const [form, setForm] = useState<CardForm>(emptyCard);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["admin-hero-cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_cards")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as HeroCard[];
    },
  });

  async function uploadImage(file: File): Promise<string> {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("hero-images")
      .upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("hero-images").getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, image_url: url }));
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const saveMutation = useMutation({
    mutationFn: async (card: CardForm & { id?: string }) => {
      const payload = {
        type: card.type,
        badge: card.badge,
        title: card.title,
        description: card.description,
        cta_text: card.cta_text,
        cta_link: card.cta_link,
        date_text: card.date_text,
        image_url: card.image_url,
        is_active: card.is_active,
        sort_order: card.sort_order,
      };
      if (card.id) {
        const { error } = await supabase.from("hero_cards").update(payload).eq("id", card.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("hero_cards").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-cards"] });
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
      toast.success(editing ? "Card updated" : "Card created");
      closeDialog();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hero_cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-cards"] });
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
      toast.success("Card deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("hero_cards").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-cards"] });
      queryClient.invalidateQueries({ queryKey: ["hero-cards"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyCard);
    setDialogOpen(true);
  }

  function openEdit(card: HeroCard) {
    setEditing(card);
    setForm({
      type: card.type,
      badge: card.badge,
      title: card.title,
      description: card.description,
      cta_text: card.cta_text,
      cta_link: card.cta_link,
      date_text: card.date_text,
      image_url: card.image_url,
      is_active: card.is_active,
      sort_order: card.sort_order,
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyCard);
  }

  function handleSave() {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    saveMutation.mutate({ ...form, id: editing?.id });
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hero Cards</h1>
          <p className="text-sm text-muted-foreground">
            Manage the offer and event cards displayed on the homepage hero section.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add Card
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted rounded-t-lg" />
              <CardContent className="h-32" />
            </Card>
          ))}
        </div>
      ) : cards.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No hero cards yet. Click "Add Card" to create one.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={`relative overflow-hidden transition-opacity ${!card.is_active ? "opacity-50" : ""}`}
            >
              {/* Image preview */}
              {card.image_url && (
                <div className="h-32 w-full overflow-hidden">
                  <img
                    src={card.image_url}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {card.type === "offer" ? (
                      <Gift className="w-4 h-4 text-primary" />
                    ) : (
                      <Calendar className="w-4 h-4 text-primary" />
                    )}
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      {card.type}
                    </span>
                    <span className="text-xs bg-accent px-2 py-0.5 rounded-full">
                      {card.badge}
                    </span>
                  </div>
                  <Switch
                    checked={card.is_active}
                    onCheckedChange={(checked) =>
                      toggleActive.mutate({ id: card.id, is_active: checked })
                    }
                  />
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {card.description}
                </p>
                {card.date_text && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {card.date_text}
                  </p>
                )}
                <div className="text-xs text-muted-foreground">
                  CTA: "{card.cta_text}" → {card.cta_link}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(card)} className="gap-1">
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Delete this card?")) deleteMutation.mutate(card.id);
                    }}
                    className="gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Card" : "Create Card"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Background Image (optional)</Label>
              {form.image_url ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img
                    src={form.image_url}
                    alt="Card background"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-3 h-3 mr-1" /> Replace
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setForm({ ...form, image_url: null })}
                    >
                      <X className="w-3 h-3 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {uploading ? (
                    <span className="text-sm">Uploading...</span>
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-xs">Click to upload image</span>
                    </>
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            <div className="space-y-2">
              <Label>Badge Text</Label>
              <Input
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="e.g. Eid Special!"
              />
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Card title"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CTA Text</Label>
                <Input
                  value={form.cta_text}
                  onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                  placeholder="Book Now"
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Link</Label>
                <Input
                  value={form.cta_link}
                  onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
                  placeholder="/play-booking"
                />
              </div>
            </div>

            {form.type === "event" && (
              <div className="space-y-2">
                <Label>Date Text (optional)</Label>
                <Input
                  value={form.date_text || ""}
                  onChange={(e) => setForm({ ...form, date_text: e.target.value || null })}
                  placeholder="April 10–12, 2026"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
              <Label>Active</Label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeDialog}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending || uploading}>
                <Save className="w-4 h-4 mr-1" />
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
