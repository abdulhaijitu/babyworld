import { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageDropZoneProps {
  imageUrl: string | null;
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
  uploadFn: (file: File) => Promise<string>;
  uploading?: boolean;
  setUploading?: (v: boolean) => void;
  height?: string;
  maxSizeMB?: number;
  label?: string;
}

export function ImageDropZone({
  imageUrl,
  onImageUploaded,
  onImageRemoved,
  uploadFn,
  height = "h-40",
  maxSizeMB = 5,
  label = "ছবি আপলোড করুন",
}: ImageDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("শুধুমাত্র ইমেজ ফাইল গ্রহণযোগ্য");
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`ফাইল সাইজ ${maxSizeMB}MB এর কম হতে হবে`);
    }
    setUploading(true);
    setProgress(30);
    try {
      const url = await uploadFn(file);
      setProgress(100);
      onImageUploaded(url);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 300);
    }
  }, [uploadFn, onImageUploaded, maxSizeMB]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      try {
        await validateAndUpload(file);
      } catch (err: any) {
        // toast is handled by parent
      }
    }
  }, [validateAndUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await validateAndUpload(file);
      } catch {
        // handled
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [validateAndUpload]);

  if (imageUrl) {
    return (
      <div className={cn("relative rounded-lg overflow-hidden border border-border group", height)}>
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-3 h-3 mr-1" /> পরিবর্তন
          </Button>
          <Button size="sm" variant="destructive" onClick={onImageRemoved}>
            <X className="w-3 h-3 mr-1" /> মুছুন
          </Button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !uploading && fileInputRef.current?.click()}
      className={cn(
        "relative w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200",
        height,
        dragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5",
        uploading && "pointer-events-none"
      )}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-primary font-medium">আপলোড হচ্ছে...</span>
          <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : dragging ? (
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-10 h-10 text-primary animate-bounce" />
          <span className="text-sm font-medium text-primary">এখানে ড্রপ করুন</span>
        </div>
      ) : (
        <>
          <ImageIcon className="w-8 h-8" />
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">
            ড্র্যাগ & ড্রপ অথবা ক্লিক করুন (সর্বোচ্চ {maxSizeMB}MB)
          </span>
        </>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
    </div>
  );
}
