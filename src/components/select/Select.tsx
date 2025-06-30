import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon } from "lucide-react";
import { SelectProps } from "@/types/select";
import { cn } from "@/lib/utils";

export default function Select({
  value,
  listValues,
  onChange,
  errors,
  disabled,
}: SelectProps) {
  const [selected, setSelected] = useState<string | number>(value);

  return (
    <div className="w-full">
      {!disabled ? (
        <Listbox
          value={selected}
          onChange={(newValue) => {
            setSelected(newValue);
            onChange(newValue);
          }}>
          {({ open }) => (
            <>
              <div className="relative">
                <Listbox.Button
                  className={`transition-all relative w-full cursor-pointer rounded-md bg-slate-50 py-2 pl-3 pr-10 text-left outline outline-1 focus:outline-secondary-600 ${
                    open
                      ? "outline-secondary-400"
                      : !errors
                      ? "outline-gray-300"
                      : ""
                  } ${
                    errors
                      ? "outline-red-500"
                      : "hover:outline-secondary-400 focus-visible:border-secondary-400 focus-visible:outline-secondary-600"
                  }`}>
                  <span className="block truncate">
                    {listValues.find((item) => item.value === selected)
                      ?.label || "Seleccioná una opción"}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="currentColor"
                      className={cn(
                        "text-slate-500 transition-all duration-200",
                        open && "rotate-180"
                      )}>
                      <path d="M480-361q-8 0-15-2.5t-13-8.5L268-556q-11-11-11-28t11-28q11-11 28-11t28 11l156 156 156-156q11-11 28-11t28 11q11 11 11 28t-11 28L508-372q-6 6-13 8.5t-15 2.5Z" />
                    </svg>
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0">
                  <Listbox.Options className="absolute mt-1 max-h-36 2xl:max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none z-20">
                    {listValues.map((item, index: number) => (
                      <Listbox.Option
                        key={`${item.key}`}
                        value={item.value}
                        className={({ active }) =>
                          `relative cursor-default text-sm select-none py-2 pl-10 pr-4 ${
                            active ? "bg-yellow-50 text-secondary-500" : ""
                          }`
                        }>
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? "font-medium" : "font-normal"
                              }`}>
                              {item.label}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-inherit">
                                <CheckIcon
                                  className="size-5"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </>
          )}
        </Listbox>
      ) : (
        <input
          disabled
          value={
            listValues.find((item) => item.value === selected)?.label || ""
          }
        />
      )}
    </div>
  );
}
