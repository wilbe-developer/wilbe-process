import { Link } from "react-router-dom";
import WilbeLogo from "@/assets/WilbeLogo"; // path to your .tsx, not the .svg anymore

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <WilbeLogo
        className="h-6"
        style={
          {
            '--sails-color': '#FF2C6D',
            '--text-color': '#FF2C6D',
          } as React.CSSProperties
        }
      />
    </Link>
  );
};

export default Logo;
