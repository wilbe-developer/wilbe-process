
import React from "react";
import { Button } from "@/components/ui/button";
import { Product } from "./ProductGrid";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ProductSidebarProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSizeSelect: (size: string) => void;
}

export const ProductSidebar: React.FC<ProductSidebarProps> = ({
  product,
  isOpen,
  onClose,
  onSizeSelect,
}) => {
  if (!product) return null;
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-['Poppins']">{product.name}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6 font-['Poppins']">
          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-square object-cover rounded-lg"
          />
          <div>
            <h3 className="text-sm font-medium mb-2">Description</h3>
            <p className="text-sm text-gray-500">{product.description}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Materials</h3>
            <ul className="text-sm text-gray-500">
              {product.materials.map((material) => (
                <li key={material}>{material}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Select Size</h3>
            <div className="grid grid-cols-2 gap-2">
              {product.sizes.map((size) => (
                <Button
                  key={size}
                  variant="outline"
                  onClick={() => onSizeSelect(size)}
                  className="w-full"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
