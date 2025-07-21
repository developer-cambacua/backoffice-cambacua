import { Switch } from "@/components/ui/switch";

export default function Formularios({
  configuraciones,
  onUpdateConfig,
  isUpdating,
}: {
  configuraciones: any;
  onUpdateConfig: (data: Partial<any>) => void;
  isUpdating: boolean;
}) {
  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-12">
        <div className="outline outline-1 outline-gray-300 rounded-lg bg-white py-6 px-4">
          <div className="flex justify-between gap-6">
            <div className="flex flex-col">
              <h3 className="font-semibold">Permitir crear reservas con fecha anterior a la actual</h3>
              <p className="text-gray-400 text-sm">
                Habilita reservas con fechas anteriores a hoy a los empleados.
              </p>
            </div>
            <Switch
              checked={configuraciones?.allow_past_dates}
              disabled={isUpdating}
              onCheckedChange={(checked) =>
                onUpdateConfig({ allow_past_dates: checked })
              }
            />
          </div>
          <hr className="my-4"/>
        </div>
      </div>
    </div>
  );
}
