
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const uniqueCode = btoa(email).slice(0, 8);
    const referralLink = `${window.location.origin}/sprint/ref/${uniqueCode}`;
    navigate('/sprint/referral', { state: { referralLink } });
  };

  // Array of colors for instant hover changes
  const hoverColors = [
    '#ff0052',   // Specific Red
    '#D946EF',   // Magenta Pink
    '#8B5CF6',   // Vivid Purple
    '#0EA5E9',   // Ocean Blue
    '#F97316',   // Bright Orange
    '#10B981',   // Emerald Green
  ];

  const getRandomColor = () => hoverColors[Math.floor(Math.random() * hoverColors.length)];
  const [buttonColor, setButtonColor] = useState('#ff0052');

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <form onSubmit={handleSubmit} className="space-y-1">
        <Input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-12 rounded-none"
        />
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 rounded-none"
        />
        <Button 
          type="submit" 
          className="w-full h-12 text-lg font-semibold rounded-none transition-colors"
          style={{ backgroundColor: buttonColor }}
          onMouseEnter={() => setButtonColor(getRandomColor())}
        >
          Join waitlist
        </Button>
      </form>
    </div>
  );
}
