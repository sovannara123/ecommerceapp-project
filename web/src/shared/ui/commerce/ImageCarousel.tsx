"use client";

import { useState } from "react";

interface ImageCarouselProps {
  images: string[];
  alt?: string;
}

export function ImageCarousel({ images, alt = "" }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-[rgb(var(--color-bg-tertiary))]">
        <span className="text-4xl">N/A</span>
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <img
          src={images[current]}
          alt={alt}
          className="h-full w-full object-cover transition-opacity duration-300"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrent((c) => (c - 1 + images.length) % images.length)
              }
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 transition-colors hover:bg-white"
              aria-label="Previous image"
            >
              {"<"}
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % images.length)}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 transition-colors hover:bg-white"
              aria-label="Next image"
            >
              {">"}
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === current
                  ? "border-[rgb(var(--color-accent))]"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
