import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import React from "react";
import { Checkbox } from "./checkbox";

type Props = {
  options: { name: string; value: string }[];
  values: string[];
  onChange: (value: string) => void;
};

export const MultiSelectDropdown = ({ options, values, onChange }: Props) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger className="border p-2 rounded-md flex items-center justify-between w-48">
      <span>{values?.length > 0 ? values.join(", ") : "Wybierz..."}</span>
      <ChevronDownIcon className="ml-2" />
    </DropdownMenu.Trigger>

    <DropdownMenu.Portal>
      <DropdownMenu.Content
        className="bg-white shadow-md border rounded-md p-2 w-48 z-10"
        sideOffset={5}
      >
        {options.map((option) => (
          <DropdownMenu.Item
            key={option.name}
            className="flex items-center mb-2 cursor-pointer"
            onClick={() => onChange(option.value)}
          >
            <Checkbox
              checked={values?.includes(option.value)}
              className="w-4 h-4 bg-gray-100 border rounded"
            />
            <label className="ml-2 text-sm">{option.name}</label>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);
