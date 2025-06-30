export type SelectProps = {
  value: string | number;
  listValues: { key: string; label: string; value: string | number }[];
  onChange: (value: string | number) => void;
  errors: any;
  disabled?: boolean;
};

export type TMediosPago = {
  label: string;
  value: string;
}