import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function RadioComponent({
  items,
  selectedValue,
  setSelectedValue,
}: {
  items: { key: string; value: string; htmlFor: string; label: string }[];
  selectedValue: string;
  setSelectedValue: (value: string) => void;
}) {
  return (
    <RadioGroup defaultValue={selectedValue} orientation="horizontal" onChange={(e) => setSelectedValue((e.target as HTMLInputElement).value)}>
      {items.map((item) => {
        return (
          <div className="flex items-center space-x-2" key={item.key}>
            <RadioGroupItem value={item.value} id={item.key} onClick={() => setSelectedValue(item.value)}/>
            <Label htmlFor={item.htmlFor} className="font-normal">{item.label}</Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}
