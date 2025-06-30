import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface CardHoverProps {
  children: React.ReactNode;
}

const CardHover = ({ children }: CardHoverProps) => {
  return <HoverCard>{children}</HoverCard>;
};

const CardTrigger = ({ children }: { children: React.ReactNode }) => {
  return <HoverCardTrigger>{children}</HoverCardTrigger>;
};

const CardContent = ({ children }: { children: React.ReactNode }) => {
  return <HoverCardContent>{children}</HoverCardContent>;
};

// Exportamos los subcomponentes
CardHover.Trigger = CardTrigger;
CardHover.Content = CardContent;

export { CardHover };