"use client";

import * as React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const slides = [
  {
    src: "https://placehold.co/1200x600.png",
    alt: "Abstract geometric shapes",
    "data-ai-hint": "abstract geometric",
  },
  {
    src: "https://placehold.co/1200x600.png",
    alt: "A vibrant cityscape at night",
    "data-ai-hint": "city night",
  },
  {
    src: "https://placehold.co/1200x600.png",
    alt: "A serene forest landscape",
    "data-ai-hint": "forest landscape",
  },
  {
    src: "https://placehold.co/1200x600.png",
    alt: "Ocean waves crashing on a shore",
    "data-ai-hint": "ocean waves",
  },
  {
    src: "https://placehold.co/1200x600.png",
    alt: "A futuristic high-tech interface",
    "data-ai-hint": "futuristic interface",
  },
];

export default function ImageCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const startAutoplay = React.useCallback(() => {
    // Clear any existing interval
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      api?.scrollNext();
    }, 4000);
  }, [api]);

  const stopAutoplay = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
    
    api.on("pointerDown", stopAutoplay);
    
    api.on("reInit", () => {
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());
        stopAutoplay();
        startAutoplay();
    });

    startAutoplay();
    return () => stopAutoplay();
  }, [api, startAutoplay, stopAutoplay]);

  return (
    <div
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
      className="relative w-full"
    >
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <Card className="overflow-hidden shadow-lg border-2 border-primary/10">
                <CardContent className="flex aspect-[2/1] items-center justify-center p-0">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    width={1200}
                    height={600}
                    className="object-cover w-full h-full"
                    data-ai-hint={slide["data-ai-hint"]}
                    priority={index === 0}
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 transition-opacity opacity-50 hover:opacity-100" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 transition-opacity opacity-50 hover:opacity-100" />
      </Carousel>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-300 ease-in-out",
              current === index ? "w-6 bg-accent" : "bg-primary/50 hover:bg-primary/75"
            )}
          />
        ))}
      </div>
    </div>
  );
}
