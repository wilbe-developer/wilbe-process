import { Link } from "react-router-dom";
import WilbeLogo from "@/components/WilbeLogo";

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <WilbeLogo className="text-brand-pink font-bold text-2xl" />
    </Link>
  );
};

export default Logo;
