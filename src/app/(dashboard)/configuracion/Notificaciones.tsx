"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Spinner } from "@/components/spinner/Spinner";
import { Button } from "@/components/buttons/Button";
import Modal from "@/components/modals/Modal";
import { DataTable } from "@/components/dataTables/DataTable";
import { getColumns } from "@/components/dataTables/notificaciones/columns";
import TextArea from "@/components/inputs/Textarea";
import { NewSelect } from "@/components/select/NewSelect";
import { DatePickerSingle } from "@/components/datePicker/DatePickerSingle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  alertStyles,
  iconsByType,
} from "@/components/notifications/notificationStyles";
import {
  NOTIFICATION_MESSAGE_MAX,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
  NotificationType,
} from "@/constants/notificaciones";
import {
  NotificacionGestion,
  useNotificacionesGestion,
  useNotificacionMutations,
} from "@/hooks/useNotificacionesGestion";
import {
  defaultValueNotificacion,
  notificacionSchema,
} from "@/utils/objects/validationSchema";
import {
  diaArgentinaDesdeISO,
  finDelDiaArgentina,
} from "@/utils/functions/functions";

type FormValues = z.infer<typeof notificacionSchema>;

const tiposList = NOTIFICATION_TYPES.map((t) => ({
  key: t,
  label: NOTIFICATION_TYPE_LABELS[t],
  value: t as string,
}));

const hoy = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function Notificaciones() {
  const { data, isLoading, error } = useNotificacionesGestion();
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState<NotificacionGestion | null>(null);
  const [aEliminar, setAEliminar] = useState<NotificacionGestion | null>(null);
  const [aCambiarVisibilidad, setACambiarVisibilidad] =
    useState<NotificacionGestion | null>(null);

  const { crear, actualizar, eliminar } = useNotificacionMutations(() => {
    setFormOpen(false);
    setAEliminar(null);
    setACambiarVisibilidad(null);
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(notificacionSchema),
    defaultValues: defaultValueNotificacion,
  });

  const isPending =
    crear.isPending || actualizar.isPending || eliminar.isPending;

  /* El reset va ANTES de abrir: el TextArea calcula su contador al montarse */
  const abrirNueva = () => {
    setEditando(null);
    reset(defaultValueNotificacion);
    setFormOpen(true);
  };

  const abrirEdicion = (n: NotificacionGestion) => {
    setEditando(n);
    reset({
      message: n.message,
      type: n.type,
      visible: n.visible,
      expires_at: n.expires_at,
    });
    setFormOpen(true);
  };

  const onSubmit = handleSubmit((values) => {
    if (editando) {
      actualizar.mutate({ id: editando.id, data: values });
    } else {
      crear.mutate(values);
    }
  });

  const columns = useMemo(
    () =>
      getColumns({
        onToggleVisible: setACambiarVisibilidad,
        onEdit: abrirEdicion,
        onDelete: setAEliminar,
        disabled: isPending,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPending],
  );

  const mensaje = watch("message");
  const tipo = watch("type") as NotificationType;

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <p className="text-red-600 mt-4">
        {(error as Error).message || "Ocurrió un error."}
      </p>
    );
  }

  const notificaciones = data ?? [];

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-gray-500 sm:max-w-xl">
          Las notificaciones activas se muestran como aviso en la parte superior
          del sistema a todos los usuarios, hasta su fecha de vencimiento.
        </p>
        <Button color="primary" variant="solid" onClick={abrirNueva}>
          Nueva notificación
        </Button>
      </div>

      {notificaciones.length > 0 ? (
        <DataTable
          columns={columns}
          data={notificaciones}
          getRowClassName={() =>
            "odd:bg-slate-50 even:bg-white hover:bg-secondary-50"
          }
          getCellClassName={(_, columnId) =>
            columnId === "acciones" ? "sticky right-0 z-10 bg-inherit" : ""
          }
        />
      ) : (
        <p>Todavía no hay notificaciones cargadas.</p>
      )}

      {/* Alta / edición */}
      <Modal
        isOpen={formOpen}
        onClose={() => !isPending && setFormOpen(false)}
        size="max-w-xl"
      >
        <Modal.Header
          title={editando ? "Editar notificación" : "Nueva notificación"}
        />
        <form onSubmit={onSubmit} noValidate>
          <Modal.Main>
            <div className="space-y-4 my-4">
              <TextArea
                name="message"
                label="Mensaje"
                control={control}
                maxLength={NOTIFICATION_MESSAGE_MAX}
                placeholder="Escribí el aviso que van a ver los usuarios"
                required
              />

              <Controller
                name="type"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div className="space-y-2">
                    <Label className="font-semibold">Tipo</Label>
                    <NewSelect
                      listValues={tiposList}
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                      errors={!!error}
                      disabled={isPending}
                    />
                    {error && (
                      <p className="text-sm text-destructive">
                        {error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="expires_at"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div className="space-y-2">
                    <Label className="font-semibold">Vence el</Label>
                    <DatePickerSingle
                      date={
                        field.value
                          ? diaArgentinaDesdeISO(field.value)
                          : undefined
                      }
                      setDate={(d?: Date) =>
                        field.onChange(d ? finDelDiaArgentina(d) : "")
                      }
                      error={!!error}
                      disabledDatesBefore={hoy()}
                    />
                    {error && (
                      <p className="text-sm text-destructive">
                        {error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="visible"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label className="font-semibold">Visible</Label>
                      <p className="text-sm text-gray-400">
                        Si está apagada, el aviso no se muestra aunque no haya
                        vencido.
                      </p>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </div>
                )}
              />

              <div className="space-y-2">
                <Label className="font-semibold">Vista previa</Label>
                <div
                  className={`border-l-8 rounded-lg py-3 px-4 ${
                    alertStyles[tipo] ?? alertStyles.info
                  }`}
                >
                  <div className="flex items-center gap-x-4">
                    {iconsByType[tipo] ?? iconsByType.info}
                    <p className="text-sm text-inherit break-words min-w-0">
                      {mensaje?.trim() || "Acá se verá el mensaje del aviso"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Main>
          <Modal.Footer className="flex flex-col-reverse sm:items-center sm:flex-row justify-end gap-y-4 sm:gap-x-4">
            <Button
              color="tertiary"
              variant="ghost"
              disabled={isPending}
              onClick={() => setFormOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="solid"
              disabled={isPending || isSubmitting}
            >
              {isPending || isSubmitting
                ? "Guardando..."
                : editando
                  ? "Guardar cambios"
                  : "Crear notificación"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Confirmación de cambio de visibilidad */}
      <Modal
        isOpen={!!aCambiarVisibilidad}
        onClose={() => !actualizar.isPending && setACambiarVisibilidad(null)}
        size="max-w-xl"
      >
        <Modal.Header title="Cambiar visibilidad" />
        <Modal.Main>
          <div className="my-6">
            <p className="2xl:text-lg">
              {aCambiarVisibilidad?.visible
                ? "Esta notificación dejará de mostrarse a los usuarios."
                : "Esta notificación se mostrará a los usuarios hasta su fecha de vencimiento."}
            </p>
            {/* <p className="text-sm text-muted-foreground mt-2 break-words">
              “{aCambiarVisibilidad?.message}”
            </p> */}
          </div>
        </Modal.Main>
        <Modal.Footer className="flex flex-col-reverse sm:items-center sm:flex-row justify-end gap-y-4 sm:gap-x-4">
          <Button
            color="tertiary"
            variant="ghost"
            disabled={actualizar.isPending}
            onClick={() => setACambiarVisibilidad(null)}
          >
            Cancelar
          </Button>
          <Button
            variant="solid"
            color="primary"
            disabled={actualizar.isPending}
            onClick={() =>
              aCambiarVisibilidad &&
              actualizar.mutate({
                id: aCambiarVisibilidad.id,
                data: { visible: !aCambiarVisibilidad.visible },
              })
            }
          >
            {actualizar.isPending
              ? "Guardando..."
              : aCambiarVisibilidad?.visible
                ? "Confirmar"
                : "Confirmar"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmación de borrado */}
      <Modal
        isOpen={!!aEliminar}
        onClose={() => !eliminar.isPending && setAEliminar(null)}
        size="max-w-xl"
      >
        <Modal.Header title="Eliminar notificación" />
        <Modal.Main>
          <div className="my-6">
            <p className="2xl:text-lg">
              ¿Seguro que querés eliminar esta notificación?
            </p>
            <p className="text-sm text-muted-foreground mt-2 break-words">
              “{aEliminar?.message}”
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              *Esta acción es irreversible. Si sólo querés ocultarla, apagá la
              opción “Visible”.
            </p>
          </div>
        </Modal.Main>
        <Modal.Footer className="flex flex-col-reverse sm:items-center sm:flex-row justify-end gap-y-4 sm:gap-x-4">
          <Button
            color="tertiary"
            variant="ghost"
            disabled={eliminar.isPending}
            onClick={() => setAEliminar(null)}
          >
            Cancelar
          </Button>
          <Button
            variant="solid"
            color="error"
            disabled={eliminar.isPending}
            onClick={() => aEliminar && eliminar.mutate(aEliminar.id)}
          >
            {eliminar.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
