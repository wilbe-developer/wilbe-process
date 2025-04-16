
import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "@/lib/constants";
import Logo from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const Sidebar = () => {
  const { isAuthenticated, user } = useAuth();
  const isMobile = useIsMobile();

  if (!isAuthenticated || isMobile) return null;

  return (
    <div className="w-[214px] min-h-screen bg-brand-darkBlue flex flex-col fixed left-0 top-0 text-white">
      <div className="p-6">
        <Logo className="text-white" />
      </div>

      <nav className="flex-1">
        <ul className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "block py-2 px-4 rounded-md hover:bg-brand-navy/50 transition-colors",
                    isActive ? "bg-brand-navy font-medium" : ""
                  )
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-6 space-y-2">
        <a 
          href="https://wilbe.com/apply" 
          target="_blank" 
          rel="noreferrer" 
          className="block w-full bg-green-500 text-white py-2 rounded-md text-center font-medium hover:bg-green-600 transition-colors"
        >
          Apply to BSF
        </a>
        <a 
          href="https://wilbe.com/bsf" 
          target="_blank" 
          rel="noreferrer" 
          className="block w-full text-white text-center text-sm hover:underline"
        >
          Learn about BSF
        </a>
        <div className="flex items-center justify-center pt-4 gap-4">
          <a href="https://linkedin.com/company/wilbe" target="_blank" rel="noreferrer">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
          <a href="https://x.com/wilbe_science" target="_blank" rel="noreferrer">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
            </svg>
          </a>
          <a href="https://youtube.com/@wilbescience" target="_blank" rel="noreferrer">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
        </div>
        <div className="text-xs text-center pt-2 text-gray-400">
          #ScientistsFirst
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
