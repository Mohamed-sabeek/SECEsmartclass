import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function Dropdown({
  value,
  options,
  onChange,
  placeholder = "Select",
  className = "",
  buttonClassName = "",
}) {
  // Find the label for the current value if options is an array of objects
  const selectedOption = options.find(opt => {
    const val = typeof opt === "string" ? opt : opt.value;
    return val === value;
  });
  
  const displayLabel = selectedOption 
    ? (typeof selectedOption === "string" ? selectedOption : selectedOption.label)
    : placeholder;

  return (
    <Menu as="div" className={`relative inline-block ${className}`}>
      <Menu.Button className={`w-full flex items-center justify-between px-6 py-3 rounded-full border border-[#FFD700] bg-white text-sm font-black text-[#1A1A1A] uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 ${buttonClassName}`}>
        <span className="truncate mr-2">
          {displayLabel}
        </span>
        <ChevronDown size={16} className="text-[#FFD700] flex-shrink-0" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 mt-2 w-full origin-top-left rounded-2xl bg-white shadow-2xl border border-gray-100 z-[100] focus:outline-none ring-1 ring-black ring-opacity-5">
          <div className="py-2 max-h-60 overflow-auto custom-scrollbar">
            {options.map((option, idx) => {
              const label =
                typeof option === "string" ? option : option.label;
              const val =
                typeof option === "string" ? option : option.value;

              const isSelected = val === value;

              return (
                <Menu.Item key={`${val}-${idx}`}>
                  {({ active }) => (
                    <button
                      onClick={() => onChange(val)}
                      className={`w-full flex items-center justify-between px-6 py-3 text-[10px] font-black uppercase tracking-[0.1em] transition-colors ${
                        active ? "bg-yellow-50 text-[#1A1A1A]" : "text-gray-500"
                      } ${isSelected ? "bg-yellow-100 text-[#1A1A1A]" : ""}`}
                    >
                      <span className="truncate">{label}</span>
                      {isSelected && <Check size={14} className="text-[#FFD700]" />}
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
