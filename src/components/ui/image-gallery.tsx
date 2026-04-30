
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageGalleryProps {
  images: { url: string; alt?: string }[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0) {
    return <div className={cn("rounded-lg bg-neutral-100 aspect-square flex items-center justify-center", className)}>Pas d images</div>;
  }

  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative rounded-lg overflow-hidden bg-neutral-100 aspect-square">
        <img src={images[index].url} alt={images[index].alt} className="w-full h-full object-cover cursor-pointer" onClick={() => setLightbox(true)} />
        
        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white"><ChevronRight className="w-4 h-4" /></button>
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/50 text-white text-xs">{index + 1}/{images.length}</div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button key={i} onClick={() => setIndex(i)} className={cn("w-16 h-16 rounded-md overflow-hidden shrink-0", i === index ? "ring-2 ring-mint" : "opacity-60 hover:opacity-100")}>
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20"><X className="w-6 h-6 text-white" /></button>
          <img src={images[index].url} alt={images[index].alt} className="max-w-[90vw] max-h-[90vh] object-contain" />
          {images.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20"><ChevronLeft className="w-6 h-6 text-white" /></button>
              <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20"><ChevronRight className="w-6 h-6 text-white" /></button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
