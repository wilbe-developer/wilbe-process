
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShippingFormProps {
  onSubmit: (data: FormData) => void;
  selectedProduct: string;
  selectedSize: string;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({
  onSubmit,
  selectedProduct,
  selectedSize,
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Shipping Details</CardTitle>
        <CardDescription>
          Your selected item: {selectedProduct} - Size {selectedSize}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 space-y-2">
              <Label htmlFor="countryCode">Country Code</Label>
              <Input 
                id="countryCode" 
                name="countryCode" 
                placeholder="+1" 
                required 
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel" 
                required 
                placeholder="123-456-7890" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal">Postal Code</Label>
              <Input id="postal" name="postal" required />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
