import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Command,
  CommandItem,
  CommandList,
  CommandGroup,
  CommandInput,
  CommandEmpty,
} from "@/components/ui/command";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
export type LineItem = {
  id?: string;
  product_id?: string;
  product_name?: string;
  quantity?: string;
  quant_unit?: string;
  helper_quantity?: string;
  help_quant_unit?: string;
  discount?: string;
  netto_cost?: string;
  brutto_cost?: string;
  vat_percentage?: string;
  vat_cost?: string;
};

type LineItemFormElementProps = {
  name: string;
  products: [];
  line_items: LineItem[];
};

export function LineItemFormElement({
  name,
  products,
  line_items,
}: LineItemFormElementProps) {
  const { control, setValue, getValues } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
    keyName: "key",
  });

  const newLineItem = useWatch({ control, name: `${name}.new` });

  useEffect(() => {
    line_items?.forEach((item) => {
      if (fields.length === 0) {
        append({ id: item.id, ...item });
      } else {
        const itemExists = fields.some(
          (field) => field.product_id === item.product_id
        );

        if (!itemExists) {
          append({ id: item.id, ...item });
        }
      }
    });
  }, [line_items, append, fields]);

  const nettoCost = useWatch({
    control,
    name: `${name}.new.netto_cost`,
  });
  const vatPercentage = useWatch({
    control,
    name: `${name}.new.vat_percentage`,
  });

  // Effect to update brutto_cost when netto_cost or vat_percentage change
  useEffect(() => {
    if (nettoCost && vatPercentage) {
      const netto = parseFloat(nettoCost);
      const vat = parseFloat(vatPercentage);
      if (!isNaN(netto) && !isNaN(vat)) {
        const vatCost = netto * (vat / 100);
        const brutto = netto + vatCost;
        setValue(`${name}.new.brutto_cost`, brutto.toFixed(2));
        setValue(`${name}.new.vat_cost`, vatCost.toFixed(2));
      }
    }
  }, [nettoCost, vatPercentage, setValue, name]);

  const addLineItem = () => {
    const newItemValues = getValues(`${name}.new`);
    const newItem = {
      ...newItemValues,
      netto_cost: newItemValues.netto_cost
        ? parseFloat(newItemValues.netto_cost).toFixed(2)
        : "",
      vat_percentage: newItemValues.vat_percentage
        ? parseFloat(newItemValues.vat_percentage).toFixed(2)
        : "",
      brutto_cost: newItemValues.brutto_cost || "",
      vat_cost: newItemValues.vat_cost || "",
    };

    append({
      ...newItem,
      quant_unit: newItem.quant_unit || "m3",
      discount: newItem.discount || "0",
    });

    // Reset the new item fields
    setValue(`${name}.new`, {
      id: "",
      product_id: "",
      product_name: "",
      quantity: "",
      quant_unit: "m3",
      helper_quantity: "",
      help_quant_unit: "",
      discount: "0",
      netto_cost: "",
      brutto_cost: "",
      vat_percentage: "",
      vat_cost: "",
    });
  };

  // useEffect(() => {
  //   //TODO fix appendig

  //   line_items?.forEach((item) => {
  //     console.log(item);
  //     if (fields.length === 0) {
  //       append({ id: item.id, ...item });
  //     } else {
  //       const itemExists = fields.some(
  //         (field) => field.product_id === item.product_id
  //       );

  //       if (!itemExists) {
  //         append({ id: item.id, ...item });
  //       }
  //     }
  //   });
  //   console.log(fields);
  // }, [line_items]);

  const productList = products.map((product) => {
    return {
      id: product.id,
      label: product.name,
      value: product.name,
    };
  });

  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2">
              <FormField
                control={control}
                name={`${name}.${index}`}
                render={({ field: formField }) => (
                  <Input
                    value={`${formField.value.product_name} Ilość: ${formField.value.quantity}  ${formField.value.quant_unit} Ilość pomocnicza: ${formField.value.helper_quantity} ${formField.value.help_quant_unit} Rabat: ${formField.value.discount} Cenna netto: ${formField.value.netto_cost} Cena brutto: ${formField.value.brutto_cost} Stawka VAT: ${formField.value.vat_percentage}% Wartość VAT: ${formField.value.vat_cost}`}
                    readOnly
                  />
                )}
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
              >
                Usuń
              </Button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-4">
          <FormField
            control={control}
            name={`${name}.new.product_id`}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Produkt</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "h-10 px-3 py-2 mr-4 mb-4 bg-white rounded-lg shadow justify-between items-center gap-2.5 inline-flex w-full",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? productList.find(
                              (product) => product.id === field.value
                            )?.label
                          : "Wybierz produkt"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]">
                    <Command>
                      <CommandInput placeholder="Znajdź produkt" />
                      <CommandList>
                        <CommandEmpty>Nie znaleziono produktów</CommandEmpty>
                        <CommandGroup>
                          {productList.map((product) => (
                            <CommandItem
                              value={product.label}
                              key={product.id}
                              onSelect={() => {
                                field.onChange(product.id);
                                setValue(
                                  `${name}.new.product_name`,
                                  product.label
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  product.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {product.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.quantity`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ilość</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ilość" />
                </FormControl>
              </FormItem>
            )}
          />
          {/* <FormField
            control={control}
            name={`${name}.new.quant_unit`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jednostka</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Jednostka" />
                </FormControl>
              </FormItem>
            )}
          /> */}
          <FormField
            control={control}
            name={`${name}.new.quant_unit`}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || "m3"}
                  value={field.value}
                >
                  <FormLabel>Jednostka</FormLabel>
                  <FormControl>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Wybierz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="m3">m3</SelectItem>
                      <SelectItem value="m2">m2</SelectItem>
                      <SelectItem value="opak">opak</SelectItem>
                      <SelectItem value="mb">mb</SelectItem>
                      <SelectItem value="kpl">kpl</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="szt">szt</SelectItem>
                      <SelectItem value="t">t</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.helper_quantity`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ilość pomocnicza</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ilość pomocnicza" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.help_quantity_unit`}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormLabel>Jednostka pomocnicza</FormLabel>
                  <FormControl>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Wybierz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="m3">m3</SelectItem>
                      <SelectItem value="m2">m2</SelectItem>
                      <SelectItem value="opak">opak</SelectItem>
                      <SelectItem value="mb">mb</SelectItem>
                      <SelectItem value="kpl">kpl</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="szt">szt</SelectItem>
                      <SelectItem value="t">t</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.discount`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rabat</FormLabel>
                <FormControl>
                  <Input {...field} value={"0"} placeholder="Rabat" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.netto_cost`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Netto</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="Netto"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.vat_percentage`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stawka VAT</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.1"
                    placeholder="Stawka VAT"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.brutto_cost`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brutto</FormLabel>
                <FormControl>
                  <Input {...field} readOnly placeholder="Brutto" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.vat_cost`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wartość VAT</FormLabel>
                <FormControl>
                  <Input {...field} readOnly placeholder="Wartość VAT" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button
          onClick={(e) => {
            e.preventDefault();
            addLineItem();
          }}
        >
          Dodaj pozycję
        </Button>
      </CardContent>
    </Card>
  );
}
