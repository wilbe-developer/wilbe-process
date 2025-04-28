
import { Link } from "react-router-dom";
import WilbeLogo from "@/assets/WilbeLogo"; 

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

const Logo = ({ className = "", style }: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <WilbeLogo
        className="h-6"
        style={style || {
          '--sails-color': 'var(--brand-pink, #FF2C6D)',
          '--text-color': 'var(--brand-pink, #FF2C6D)',
        } as React.CSSProperties}
      />
    </Link>
  );
};

export default Logo;
