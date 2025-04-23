
import React, { useState } from "react";
import { ProductGrid, Product } from "@/components/merch/ProductGrid";
import { ProductSidebar } from "@/components/merch/ProductSidebar";
import { ShippingForm } from "@/components/merch/ShippingForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import WilbeLogo from "@/assets/WilbeLogo";
import { Helmet } from "react-helmet";

const MerchPage = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsSidebarOpen(true);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setIsSidebarOpen(false);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: FormData) => {
    if (!selectedProduct) return;
    setSubmitting(true);

    // Save order to merch_orders
    const order = {
      product_name: selectedProduct.name,
      product_size: selectedSize,
      full_name: formData.get("name") as string,
      email: formData.get("email") as string,
      country_code: formData.get("countryCode") as string,
      phone: formData.get("phone") as string,
      country: formData.get("country") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      postal: formData.get("postal") as string,
    };
    let saved = false;
    let emailSent = false;

    try {
      const { error } = await supabase.from("merch_orders").insert([order]);
      if (!error) saved = true;
    } catch (e) {
      saved = false;
    }

    // Send confirmation email and Slack notification
    try {
      const response = await fetch('/api/send-merch-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: order.full_name,
          email: order.email,
          product: order.product_name,
          size: order.product_size,
          address: `${order.address}, ${order.city}, ${order.postal}, ${order.country}`,
        }),
      });

      emailSent = response.ok;
    } catch (e) {
      console.error("Error sending notifications:", e);
      emailSent = false;
    }

    toast({
      title: saved && emailSent
        ? "Order Submitted"
        : "Submission Issue",
      description: saved && emailSent
        ? "Thank you for your order! We'll be in touch soon."
        : (saved
            ? "Order saved, but we couldn't send a confirmation email. Please check your email later."
            : "There was an issue submitting your order. Please try again."),
    });
    setShowForm(false);
    setSelectedProduct(null);
    setSelectedSize('');
    setSubmitting(false);
  };

  const handleChangeSelection = () => {
    setShowForm(false);
    setIsSidebarOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Wilbe Merch</title>
        <meta name="description" content="Get your Wilbe merch - Welcome to the Wilbe family!" />
      </Helmet>
      <div className="min-h-screen bg-white">
        {!showForm ? (
          <>
            <div className="flex flex-col items-center py-8">
              <WilbeLogo 
                className="w-16 mb-8"
                style={{
                  '--sails-color': '#FF1462',
                  '--text-color': '#0F1F3C',
                } as React.CSSProperties}
              />
              <div className="text-center px-4">
                <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-dark font-[Helvetica] tracking-wider">
                  Welcome to the Wilbe family!
                </h1>
                <p className="text-gray-600 text-lg max-w-lg mx-auto font-['Poppins']">
                  Pick your complimentary merch item
                </p>
              </div>
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
              disabled={submitting}
              onChangeSelection={handleChangeSelection}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default MerchPage;
