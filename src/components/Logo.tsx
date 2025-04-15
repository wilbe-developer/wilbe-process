import { Link } from "react-router-dom";
import { ReactComponent as WilbeLogo } from "@/assets/WilbeLogo.svg";

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <WilbeLogo
        className="h-8"
        style={{
          '--sails-color': '#FF2C6D',
          '--text-color': '#FF2C6D', // or any Tailwind color value you want
        } as React.CSSProperties}
      />
    </Link>
  );
};

export default Logo;
