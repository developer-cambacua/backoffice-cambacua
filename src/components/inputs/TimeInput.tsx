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
export const TimeInput = React.forwardRef<any, ITimeInputProps>(
  ({ value, onChange, placeholder = "Selecciona una hora", error = false }, ref) => {
    return (
      <ConfigProvider
        theme={{
          components: {
            DatePicker: {
              colorPrimary: "#e5e7eb",
              borderRadius: 6,
              controlHeight: 40,
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
          className={`!border-0 !outline !outline-1 ${
            error ? "!outline-red-500" : "!outline-gray-300"
          } hover:!outline-secondary-500 !bg-slate-50`}
        />
      </ConfigProvider>
    );
  }
);

// Asigna un nombre al componente para facilitar la depuración
TimeInput.displayName = "TimeInput";
