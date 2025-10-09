import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Tab {
  value: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsSectionProps {
  tabs: Tab[];
  defaultValue?: string;
  className?: string;
}

export const TabsSection = ({
  tabs,
  defaultValue,
  className,
}: TabsSectionProps) => {
  return (
    <Tabs defaultValue={defaultValue || tabs[0]?.value} className={className}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
