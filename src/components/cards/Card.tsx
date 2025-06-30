export const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="outline outline-1 outline-gray-300 rounded-lg h-full bg-white">
      {children}
    </div>
  );
};

const Header = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const Main = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const Footer = ({ children }: { children: React.ReactNode }) => <>{children}</>;

Card.Header = Header;
Card.Main = Main;
Card.Footer = Footer;
