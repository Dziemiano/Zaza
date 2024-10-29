import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";

const PALLET_TYPES = [
  { value: "Jednorazowa", label: "Jednorazowa" },
  { value: "EURO 1200x800", label: "EURO 1200x800" },
  { value: "LEMAR 1200x800", label: "LEMAR 1200x800" },
];

export const PalletManagement = () => {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pallets",
  });

  const getAvailablePalletTypes = (currentIndex: number) => {
    const selectedTypes = fields
      .filter((_, index) => index !== currentIndex)
      .map((field: any) => field.type)
      .filter(Boolean);

    return PALLET_TYPES.filter((type) => !selectedTypes.includes(type.value));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Label>Palety</Label>
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ type: "", count: 0 })}
          className="h-8 px-2 ml-3"
          disabled={fields.length >= PALLET_TYPES.length}
        >
          <Plus className="h-4 w-4 mr-1" />
          Dodaj paletę
        </Button>
      </div>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-4">
            <Controller
              control={control}
              name={`pallets.${index}.type`}
              render={({ field: { onChange, value } }) => (
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Wybierz typ palety" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {getAvailablePalletTypes(index).map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            <Controller
              control={control}
              name={`pallets.${index}.count`}
              render={({ field: { onChange, value } }) => (
                <Input
                  type="number"
                  value={value || ""}
                  onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                  className="w-[100px]"
                  min="0"
                  placeholder="Ilość"
                />
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
