import { Tab } from "@headlessui/react";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

interface ITabs {
  labels: string[];
  tab: number;
  onChangeTab: (tab: number) => void;
}

export default function NewTabs({ labels, tab, onChangeTab }: ITabs) {
  return (
    <div className="w-full max-w-md px-2 py-16 sm:px-0">
      <Tab.Group selectedIndex={tab} onChange={onChangeTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {labels.map((label, index) => {
            return (
              <Tab
                key={`${label}-${index}`}
                className={({ selected }) =>
                  classNames(
                    "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                    "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                    selected
                      ? "bg-white text-blue-700 shadow"
                      : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                  )
                }>
                {label}
              </Tab>
            );
          })}
        </Tab.List>
      </Tab.Group>
    </div>
  );
}
