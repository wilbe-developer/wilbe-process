
import React, { useState } from "react";
import { ProductGrid, Product } from "@/components/merch/ProductGrid";
import { ProductSidebar } from "@/components/merch/ProductSidebar";
import { ShippingForm } from "@/components/merch/ShippingForm";
import { useToast } from "@/components/ui/use-toast";

const MerchPage = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsSidebarOpen(true);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setIsSidebarOpen(false);
    setShowForm(true);
  };

  const handleFormSubmit = (formData: FormData) => {
    toast({
      title: "Order Submitted",
      description: "Thank you for your order! We'll be in touch soon.",
    });
    setShowForm(false);
    setSelectedProduct(null);
    setSelectedSize('');
  };

  return (
    <div className="min-h-screen bg-white">
      {!showForm ? (
        <>
          <div className="text-center py-12 px-4">
            <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-dark">
              Choose Your Complimentary Wilbe Merch
            </h1>
            <p className="text-gray-600 text-lg max-w-lg mx-auto">
              Select one item from our collection, on us.
            </p>
          </div>
          <ProductGrid onProductSelect={handleProductSelect} />
          <ProductSidebar
            product={selectedProduct}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onSizeSelect={handleSizeSelect}
          />
        </>
      ) : (
        <div className="p-8">
          <ShippingForm
            onSubmit={handleFormSubmit}
            selectedProduct={selectedProduct?.name || ""}
            selectedSize={selectedSize}
          />
        </div>
      )}
    </div>
  );
};

export default MerchPage;
