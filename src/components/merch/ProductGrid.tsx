
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
    name: "Wilbe Original",
    image: "/lovable-uploads/ec58856d-e030-4ce2-806d-cc07bd376fe5.png", // Scientists First Tee
    description: "Our original Scientists First t-shirt in navy blue with a white Wilbe logo on the back",
    materials: ["100% cotton"],
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: 2,
    name: "What Wilbe",
    image: "/lovable-uploads/12df36cf-639b-4312-9038-c34d69380df1.png", // What Wilbe Tee
    description: '"What is now and what Wilbe" t-shirt in navy blue',
    materials: ["100% cotton"],
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: 3,
    name: "Team Science",
    image: "/lovable-uploads/f6b0b0f6-7fbb-4aa3-b9f4-833ce7960135.png", // I Love Science Tee
    description: 'I ❤️ Science t-shirt in white with a black Wilbe logo on the back',
    materials: ["100% cotton"],
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: 4,
    name: "Wilbe on Campus",
    image: "/lovable-uploads/fdf11930-f17c-4bb7-b2a1-91a164c453d3.png", // Wilbe Hoodie
    description: "Wilbe hoodie in navy blue in a university campus font.",
    materials: ["100% cotton"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 5,
    name: "Post-money Value Cap",
    image: "/lovable-uploads/8d392a7c-c41b-4f91-a559-700227cf100a.png", // Wilbe Cap
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
