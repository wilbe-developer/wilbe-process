
import Logo from "@/components/Logo";

export const Header = () => {
  return (
    <header className="p-6 flex justify-center">
      <Logo 
        className="h-8" 
        style={{
          '--sails-color': 'var(--brand-pink, #FF2C6D)',
          '--text-color': 'var(--brand-blue, #0F1F3C)',
        } as React.CSSProperties}
      />
    </header>
  );
};
