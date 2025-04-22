
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
    name: "Wilbe Original (scientists first)",
    image: "/lovable-uploads/59e3659c-9de4-457d-b70a-b1047d15237e.png", // 1st real tee image
    description: "Our original t-shirt in navy blue with a white Wilbe logo on the back",
    materials: ["100% cotton"],
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: 2,
    name: "What Wilbe",
    image: "/lovable-uploads/d2adef55-edba-455a-9952-2a1d35e7f7c7.png",
    description: '"What is now and what Wilbe" t-shirt in navy blue',
    materials: ["100% cotton"],
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: 3,
    name: "Team Science (I ❤️ Science)",
    image: "/lovable-uploads/d2c1a955-3ce2-47b2-91d4-0cb095b83a8d.png",
    description: '"I ❤️ Science" merch with a black Wilbe logo on the back',
    materials: ["100% cotton"],
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: 4,
    name: "Wilbe on Campus (Wilbe in uni font hoodie)",
    image: "/lovable-uploads/e63aae6f-8753-4509-aff4-323cac4af598.png", // new hoodie image
    description: "Wilbe hoodie in navy blue in a university campus font.",
    materials: ["100% cotton"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 5,
    name: "Post-money Value Cap (Wilbe cap)",
    image: "/lovable-uploads/783800c2-496d-4441-b067-52820a7f1ad8.png", // new cap image
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
