import { Button } from "@/components/buttons/Button";
import { Spinner } from "@/components/spinner/Spinner";
import { SelectedGuest } from "@/types/supabaseTypes";

export const StepForm1 = ({
  setCurrentStep,
  searchQuery,
  setSearchQuery,
  setSelectedGuest,
  guests,
  isFetching,
  debouncedSearchQuery,
  // isError,
}: {
  setCurrentStep: (value: number) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  setSelectedGuest: (value: SelectedGuest | null) => void;
  guests: any[];
  isFetching: boolean;
  debouncedSearchQuery: string;
  // isError: boolean;
}) => {
  return (
    <div className="col-span-12">
      <div className="bg-white">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <div className="flex flex-col items-center">
              <h4 className="font-bold text-xl gap-2">
                ¿El huésped ya existe en el sistema?
              </h4>
              <p className="text-sm">
                Buscá por nombre, número de identificación o email para
                verificar si ya está en el sistema
              </p>
            </div>
          </div>
          <div className="col-span-12">
            <div className="flex items-center justify-center w-full">
              <div className="flex items-center gap-x-2 px-2 outline outline-1 rounded-[4px] min-w-full sm:min-w-80 w-full max-w-44 border-0 outline-gray-300 transition-[outline] hover:outline-secondary-600 active:outline-secondary-600 focus:outline-secondary-600 focus-within:outline-secondary-600 focus-visible:outline-secondary-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  className="fill-primary-500 size-6"
                  fill="currentColor"
                  viewBox="0 0 256 256">
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                </svg>
                <input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="Buscar huésped"
                  className="w-full outline-none py-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          {isFetching && (
            <div className="col-span-12">
              <Spinner />
            </div>
          )}
          {debouncedSearchQuery !== "" &&
            !isFetching &&
            guests.length === 0 && (
              <div className="col-span-12 my-4">
                <div className="flex items-center justify-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor">
                    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                  <p className="font-semibold">
                    No se encontraron huéspedes con ese criterio.
                  </p>
                </div>
              </div>
            )}

          {guests.length > 0 && (
            <div className="col-span-12">
              <p className="mb-3 font-bold">Huéspedes encontrados:</p>
              <div className="flex flex-col gap-3">
                {guests.map((guest, index) => {
                  return (
                    <div
                      key={`${guest.nombre}-${guest.apellido}-${index}`}
                      className="bg-slate-50 outline outline-1 outline-gray-300 rounded-md px-4 py-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-y-4 md:gap-y-2">
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold">{`${guest.nombre} ${guest.apellido}`}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:divide-x-[1px] sm:divide-gray-400">
                            <p className="sm:pr-2 text-sm">{`${guest.tipo_identificacion}: ${guest.numero_identificacion}`}</p>
                            <p className="sm:pl-2 text-sm">{guest.email}</p>
                          </div>
                        </div>
                        <div>
                          <Button
                            color="secondary"
                            variant="ghost"
                            type="button"
                            width="responsive"
                            onClick={() => {
                              setSelectedGuest(guest);
                              setCurrentStep(1);
                            }}>
                            Seleccionar
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="col-span-12">
            <div className="flex flex-col items-center gap-y-3">
              <p>
                {debouncedSearchQuery === ""
                  ? "¿Es un huésped nuevo?"
                  : "¿No encontrás al huésped que buscás?"}
              </p>
              <Button
                color="secondary"
                variant="solid"
                width="responsive"
                onClick={() => {
                  setSelectedGuest(null);
                  setCurrentStep(1);
                }}>
                + Crear nuevo huésped
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
