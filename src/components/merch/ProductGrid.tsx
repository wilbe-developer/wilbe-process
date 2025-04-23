
import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Product {
  id: number;
  name: string;
  image: string;
  description: string;
  materials: string[];
  sizes: string[];
}

export const products: Product[] = [
  {
    id: 1,
    name: "Wilbe OG",
    image: "https://iatercfyoclqxmohyyke.supabase.co/storage/v1/object/public/merch//unisex-organic-cotton-t-shirt-french-navy-front-and-back-6808b8592850d.png", // Scientists First Tee
    description: "Our original Scientists First t-shirt in navy blue with a white Wilbe logo on the back",
    materials: ["100% cotton"],
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: 2,
    name: "What Wilbe",
    image: "https://iatercfyoclqxmohyyke.supabase.co/storage/v1/object/public/merch//what%20wilbe.png", // What Wilbe Tee
    description: 'What is now & what Wilbe t-shirt in navy blue',
    materials: ["100% cotton"],
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: 3,
    name: "Team Science",
    image: "https://iatercfyoclqxmohyyke.supabase.co/storage/v1/object/public/merch//i%20heart%20science.png", // I Love Science Tee
    description: 'I ❤️ Science t-shirt in white with a black Wilbe logo on the back',
    materials: ["100% cotton"],
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: 4,
    name: "Wilbe on Campus",
    image: "https://iatercfyoclqxmohyyke.supabase.co/storage/v1/object/public/merch//wilbe%20on%20campus.png", // Wilbe Hoodie
    description: "Wilbe hoodie in navy blue in a university campus font",
    materials: ["100% cotton"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 5,
    name: "Post-money Value Cap",
    image: "https://iatercfyoclqxmohyyke.supabase.co/storage/v1/object/public/merch//post%20money%20cap.png", // Wilbe Cap
    description: "Wilbe cap in navy blue with our original pink logo embroidery",
    materials: ["100% cotton"],
    sizes: ["One Size"]
  }
];

interface ProductGridProps {
  onProductSelect: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ onProductSelect }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-6 md:p-12">
    {products.map((product) => (
      <button
        key={product.id}
        onClick={() => onProductSelect(product)}
        className="group relative aspect-square overflow-hidden bg-gray-100 rounded-lg transition-all hover:opacity-90 border border-slate-200"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-4 transform transition-transform translate-y-full group-hover:translate-y-0">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">{product.name}</span>
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </button>
    ))}
  </div>
);
