
import { Link } from "react-router-dom";
import { APP_NAME } from "@/lib/constants";

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <Link to="/" className={`flex items-center gap-1 ${className}`}>
      <span className="text-brand-pink font-bold text-2xl">
        <span className="text-brand-pink">⋉</span> {APP_NAME}
      </span>
    </Link>
  );
};

export default Logo;
