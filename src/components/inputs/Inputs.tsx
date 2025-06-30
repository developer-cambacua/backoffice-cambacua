import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TInputs = {
  id: string;
  onChange: (e: any) => void;
  disabled?: boolean;
  initialValue?: string;
  classNames?: string;
  label: string;
  type: string;
  placeholder: string;
};

export function InputWithLabel({
  id,
  onChange,
  disabled,
  initialValue,
  classNames,
  label,
  type,
  placeholder,
}: TInputs) {
  return (
    <div className={`grid w-full max-w-sm items-center gap-1.5`}>
      <Label className="font-semibold" htmlFor={id}>
        {label}
      </Label>
      <Input
        onChange={onChange}
        disabled={disabled}
        type={type}
        defaultValue={initialValue}
        id={id}
        placeholder={placeholder}
        className={classNames}
      />
    </div>
  );
}
