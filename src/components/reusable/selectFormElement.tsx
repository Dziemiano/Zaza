import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface CategoryItem {
  value: string;
  label: string;
}

interface SelectFormElementProps {
  label: string;
  items: CategoryItem[];
  form: UseFormReturn<any>;
  name: string;
}

const SelectFormElement = ({
  label,
  items,
  form,
  name,
}: SelectFormElementProps) => {
  return (
    <div className="grid w-auto mr-5 min-w-64 items-center gap-1.5">
      <Label>{label}</Label>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="flex flex-row">
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Wybierz" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.label}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SelectFormElement;
