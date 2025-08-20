import ImageCarousel from "@/components/image-carousel";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 md:p-12 lg:p-24 bg-background">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight font-headline">
            Kinetic Carousel
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            A seamless, animated, and interactive image slider.
          </p>
        </header>
        <ImageCarousel />
      </div>
    </main>
  );
}
