import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ListValueItem<T = string> = {
  key: string;
  label: string;
  value: T;
};

interface NewSelectProps<T = string> {
  classNames?: string;
  placeholder?: string;
  value: T | undefined;
  listValues: ListValueItem<T>[];
  onChange: (value: T | undefined) => void;
  errors?: boolean;
  disabled?: boolean;
}

export function NewSelect<T extends string | number>({
  classNames = "bg-slate-50",
  placeholder = "Seleccioná una opción",
  listValues,
  value,
  onChange,
  errors,
  disabled,
}: NewSelectProps<T>) {
  const currentValue = value !== undefined ? String(value) : "";

  const handleChange = (newValue: string) => {
    if (newValue === "") {
      onChange(undefined);
    } else {
      const found = listValues.find((item) => String(item.value) === newValue);
      if (found) onChange(found.value);
    }
  };

  return (
    <Select
      onValueChange={handleChange}
      value={currentValue}
      disabled={disabled}>
      <SelectTrigger
        className={`${classNames} ${errors ? "outline-red-500" : ""}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="z-[1100]">
        <SelectGroup>
          {listValues.map((item) => (
            <SelectItem key={item.key} value={String(item.value)}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
