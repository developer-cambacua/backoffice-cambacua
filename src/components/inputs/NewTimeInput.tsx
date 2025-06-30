import React from "react";
import { ConfigProvider, TimePicker } from "antd";
import dayjs from "dayjs";

const format = "HH:mm";

interface ITimeInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
}

// Usa React.forwardRef para permitir refs
export const NewTimeInput = React.forwardRef<any, ITimeInputProps>(
  (
    { value, onChange, placeholder = "Selecciona una hora", error = false },
    ref
  ) => {
    return (
      <ConfigProvider
        theme={{
          components: {
            DatePicker: {
              colorPrimary: "#e5e7eb",
              borderRadius: 8,
              controlHeight: 48,
              fontSize: 16,
            },
          },
        }}>
        <TimePicker
          ref={ref}
          showNow={false}
          needConfirm={false}
          placeholder={placeholder}
          format={format}
          value={value ? dayjs(value, format) : undefined}
          onChange={(time) => onChange?.(time ? time.format(format) : "")}
          className={`!border-0 !ring-1 w-full !h-10 !rounded-md ${
            error ? "!ring-red-500" : "!ring-gray-300"
          } hover:!ring-secondary-500 !bg-white`}
        />
      </ConfigProvider>
    );
  }
);

// Asigna un nombre al componente para facilitar la depuración
NewTimeInput.displayName = "TimeInput";
