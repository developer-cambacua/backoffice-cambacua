import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SelectValueType = string;

type ListValueItem = {
  key: string;
  label: string;
  value: string;
};

interface ISelectProps {
  classNames?: string;
  placeholder?: string;
  value: SelectValueType;
  values: ListValueItem[];
  onChange: (value: string) => void;
  errors?: boolean;
}

export function SelectOriginal({
  classNames = "bg-slate-50",
  placeholder = "Seleccioná una opción",
  values,
  value,
  onChange,
  errors,
}: ISelectProps) {
  const handleValueChange = (newValue: string) => {
    onChange(newValue);
  };
console.log("este es el value:", value)
  return (
    <Select onValueChange={handleValueChange} value={value}>
      <SelectTrigger
        className={`${classNames} ${errors ? "outline-red-500" : ""}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {/* <SelectLabel>Not used</SelectLabel> */}
          {values.map((item) => (
            <SelectItem key={item.key} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
