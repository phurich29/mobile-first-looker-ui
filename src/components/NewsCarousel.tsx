
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type NewsItem = {
  id: number;
  title: string;
  imageUrl: string;
};

const newsItems: NewsItem[] = [
  {
    id: 1,
    title: "C2E Technology Announces New Blockchain Partnership",
    imageUrl: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Green Initiatives in Cryptocurrency Mining",
    imageUrl: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Latest Market Trends in Digital Assets",
    imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=1000&auto=format&fit=crop",
  },
];

export const NewsCarousel = () => {
  return (
    <div className="mb-6 mx-4">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {newsItems.map((item) => (
            <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="bg-white rounded-xl overflow-hidden shadow-md h-48 relative">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="text-white font-medium text-sm">{item.title}</h3>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-sm hover:bg-white/50" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-sm hover:bg-white/50" />
      </Carousel>
    </div>
  );
};
