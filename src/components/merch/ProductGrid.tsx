
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
    name: "Scientists First Tee",
    image: "/lovable-uploads/59e3659c-9de4-457d-b70a-b1047d15237e.png",
    description: "Navy t-shirt with 'Scientists First' text",
    materials: ["100% Organic Cotton", "Premium Quality"],
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: 2,
    name: "I ❤️ Science Tee",
    image: "/lovable-uploads/d2c1a955-3ce2-47b2-91d4-0cb095b83a8d.png",
    description: "White t-shirt with 'I ❤️ Science' print",
    materials: ["100% Organic Cotton", "Premium Quality"],
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: 3,
    name: "Wilbe Hoodie",
    image: "/lovable-uploads/3e738ede-3221-440e-8abf-282324291fe2.png",
    description: "Black hoodie with Wilbe logo",
    materials: ["80% Cotton", "20% Polyester", "Heavy Weight"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 4,
    name: "Wilbe Cap",
    image: "/lovable-uploads/c261565b-ab74-49b1-9be1-70ed67d32191.png",
    description: "Black cap with embroidered Wilbe logo",
    materials: ["100% Cotton", "Adjustable Strap"],
    sizes: ["One Size"]
  },
  {
    id: 5,
    name: "What Wilbe Tee",
    image: "/lovable-uploads/d2adef55-edba-455a-9952-2a1d35e7f7c7.png",
    description: "Navy t-shirt with 'What Wilbe' design",
    materials: ["100% Organic Cotton", "Premium Quality"],
    sizes: ["XS", "S", "M", "L", "XL"]
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
