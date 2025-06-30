import {
  Popover,
  PopoverContent as BasePopoverContent,
  PopoverTrigger as BasePopoverTrigger,
} from "@/components/ui/popover";

export const PopoverComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <Popover>{children}</Popover>;
};

const PopoverTrigger = ({ children }: { children: React.ReactNode }) => {
  return <BasePopoverTrigger>{children}</BasePopoverTrigger>;
};

const PopoverContent = ({ children }: { children: React.ReactNode }) => {
  return <BasePopoverContent>{children}</BasePopoverContent>;
};

PopoverComponent.Trigger = PopoverTrigger;
PopoverComponent.Content = PopoverContent;
