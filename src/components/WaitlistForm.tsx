
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWaitlistSignup } from "@/hooks/useWaitlistSignup";
import { useParams } from "react-router-dom";

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { code: referralCode } = useParams();
  const { signup, isLoading } = useWaitlistSignup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup(name, email, referralCode);
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
          disabled={isLoading}
        />
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 rounded-none"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          className="w-full h-12 text-lg font-semibold rounded-none transition-colors"
          style={{ backgroundColor: buttonColor }}
          onMouseEnter={() => setButtonColor(getRandomColor())}
          disabled={isLoading}
        >
          {isLoading ? "Joining..." : "Join waitlist"}
        </Button>
      </form>
    </div>
  );
}
