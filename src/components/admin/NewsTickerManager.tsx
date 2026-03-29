import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface NewsItem {
  id: string;
  text: string;
  link: string;
  active: boolean;
}

interface NewsTickerData {
  enabled: boolean;
  speed: string;
  items: NewsItem[];
}

const defaultData: NewsTickerData = {
  enabled: false,
  speed: "normal",
  items: [],
};

export default function NewsTickerManager() {
  const [data, setData] = useState<NewsTickerData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: setting } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "news_ticker")
        .maybeSingle();

      if (setting?.value) {
        const val = setting.value as unknown as NewsTickerData;
        setData({
          enabled: val.enabled ?? false,
          speed: val.speed ?? "normal",
          items: (val.items ?? []).map((item: any) => ({
            id: item.id || crypto.randomUUID(),
            text: item.text || "",
            link: item.link || "",
            active: item.active !== false,
          })),
        });
      }
    } catch (err) {
      console.error("Error loading news ticker:", err);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const value = {
        enabled: data.enabled,
        speed: data.speed,
        items: data.items.map((item) => ({
          id: item.id,
          text: item.text,
          link: item.link || null,
          active: item.active,
        })),
      };

      const { data: existing } = await supabase
        .from("settings")
        .select("id")
        .eq("key", "news_ticker")
        .maybeSingle();

      let error;
      if (existing) {
        const res = await supabase
          .from("settings")
          .update({ value: value as unknown as Json, category: "frontend" })
          .eq("key", "news_ticker");
        error = res.error;
      } else {
        const res = await supabase
          .from("settings")
          .insert([{ key: "news_ticker", value: value as unknown as Json, category: "frontend" }]);
        error = res.error;
      }

      if (error) throw error;
      toast.success("নিউজ টিকার সেভ হয়েছে!");
    } catch (err) {
      console.error(err);
      toast.error("সেভ করতে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: crypto.randomUUID(), text: "", link: "", active: true },
      ],
    }));
  };

  const removeItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  };

  const updateItem = (id: string, field: keyof NewsItem, value: any) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === id ? { ...i, [field]: value } : i
      ),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Master Toggle & Speed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">নিউজ টিকার সেটিংস</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ticker-enabled">টিকার চালু/বন্ধ</Label>
            <Switch
              id="ticker-enabled"
              checked={data.enabled}
              onCheckedChange={(checked) =>
                setData((prev) => ({ ...prev, enabled: checked }))
              }
            />
          </div>
          <div className="flex items-center gap-4">
            <Label>স্ক্রল স্পিড</Label>
            <Select
              value={data.speed}
              onValueChange={(val) =>
                setData((prev) => ({ ...prev, speed: val }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">ধীর</SelectItem>
                <SelectItem value="normal">সাধারণ</SelectItem>
                <SelectItem value="fast">দ্রুত</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">নিউজ আইটেম</CardTitle>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="w-4 h-4 mr-1" />
            যোগ করুন
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              কোনো নিউজ আইটেম নেই। "যোগ করুন" বাটনে ক্লিক করুন।
            </p>
          )}
          {data.items.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30"
            >
              <GripVertical className="w-4 h-4 mt-2.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="নিউজ টেক্সট লিখুন..."
                  value={item.text}
                  onChange={(e) => updateItem(item.id, "text", e.target.value)}
                />
                <Input
                  placeholder="লিংক (ঐচ্ছিক) — যেমন: /play-booking"
                  value={item.link}
                  onChange={(e) => updateItem(item.id, "link", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Switch
                  checked={item.active}
                  onCheckedChange={(checked) =>
                    updateItem(item.id, "active", checked)
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          সেভ করুন
        </Button>
      </div>
    </div>
  );
}
