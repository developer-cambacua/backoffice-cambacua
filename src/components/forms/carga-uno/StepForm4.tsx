import { Control } from "react-hook-form";

import TextArea from "@/components/inputs/Textarea";

type Props = {
  control: Control<any>;
};

export const StepForm4 = ({ control }: Props) => {
  return (
    <>
      <div className="col-span-12 lg:col-span-8 2xl:col-span-6">
        <TextArea
          name="observaciones"
          label="Información adicional"
          control={control}
          maxLength={250}
          placeholder="Ej: Huésped con mascota, llegada tardía, solicitudes especiales..."
        />
      </div>
    </>
  );
};
