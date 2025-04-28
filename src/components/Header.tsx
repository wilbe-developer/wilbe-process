
import Logo from "@/components/Logo";

export const Header = () => {
  return (
    <header className="p-6">
      <Logo 
        className="h-8" 
        style={{
          '--sails-color': 'var(--brand-blue, #0F1F3C)',
          '--text-color': 'var(--brand-pink, #FF2C6D)',
        } as React.CSSProperties}
      />
    </header>
  );
};
