
import React, { useState } from 'react';
import Section from './Section';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const founders = [
  {
    name: "Kärt Tomberg",
    title: "Co-founder & CEO",
    company: "ExpressionEdits",
    description: "Redefining the status quo of protein expression",
    image: "https://iatercfyoclqxmohyyke.supabase.co/storage/v1/object/public/founders//kart.png"
  },
  {
    name: "Francesco Sciortino",
    title: "Co-founder & CEO",
    company: "Proxima Fusion",
    description: "Bridging the energy of stars to Earth with fusion power plants",
    image: "https://iatercfyoclqxmohyyke.supabase.co/storage/v1/object/public/founders//francesco.png"
  },
  {
    name: "Assia Kasdi",
    title: "Co-founder & CEO",
    company: "Milvus Advanced",
    description: "Developing affordable substitutes to rare Earth materials",
    image: "https://iatercfyoclqxmohyyke.supabase.co/storage/v1/object/public/founders//assia.png"
  },
  {
    name: "Shamit Shrivastava",
    title: "Co-founder & CEO",
    company: "Apoha",
    description: "Building the first machine that understands sensory data",
    image: "https://iatercfyoclqxmohyyke.supabase.co/storage/v1/object/public/founders//shamit.png"
  }
];

const WhySection: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <Section className="bg-white">
      <h2 className="text-3xl font-bold mb-10">The scientists who became founders with us</h2>
      <div className="relative">
        <Carousel className="w-full">
          <CarouselContent className="-ml-2">
            {founders.map((founder, idx) => (
              <CarouselItem key={idx} className="pl-2 basis-full sm:basis-1/2 md:basis-1/3">
                <div 
                  className="p-4 bg-zinc-50 rounded-md h-64 relative overflow-hidden transition-all duration-300 ease-in-out"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent transition-opacity duration-300 ${hoveredIndex === idx ? 'opacity-100' : 'opacity-0'}`} />
                  
                  {founder.image ? (
                    <img 
                      src={founder.image} 
                      alt={founder.name}
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <div className="h-full w-full bg-zinc-200 flex items-center justify-center">
                      <span className="text-zinc-400">{founder.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                  )}
                  
                  {/* Info overlay */}
                  <div 
                    className={`absolute bottom-0 left-0 right-0 p-4 text-white transform transition-transform duration-300 ${
                      hoveredIndex === idx ? 'translate-y-0' : 'translate-y-full'
                    }`}
                  >
                    <h3 className="font-bold">{founder.name}</h3>
                    <p className="text-sm">{founder.title}, {founder.company}</p>
                    <p className="text-xs mt-1 opacity-80">{founder.description}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-2">
            <CarouselPrevious className="relative left-0 translate-y-0 bg-white" />
            <CarouselNext className="relative right-0 translate-y-0 bg-white" />
          </div>
        </Carousel>
      </div>
    </Section>
  );
};

export default WhySection;
