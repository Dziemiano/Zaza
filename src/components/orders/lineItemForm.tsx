import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type CompanyBranch = {
  name: string;
  street: string;
  guant_unit: string;
  helper?: string | null;
  discount: string;
  netto_cost: string;
  brutto_cost: string;
  vat_percentage?: string;
  vat_cost?: string;
};

export type LineItem = {
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
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const form = useFormContext();
  const [newLineItem, setnewLineItem] = useState<LineItem>({
    product_id: "",
    product_name: "",
    quantity: "",
    quant_unit: "",
    helper_quantity: "",
    help_quant_unit: "",
    discount: "",
    netto_cost: "",
    brutto_cost: "",
    vat_percentage: "",
    vat_cost: "",
  });

  const addLineItem = () => {
    if (newLineItem.product_id && newLineItem.quantity) {
      append(newLineItem);
      setnewLineItem({
        product_id: "",
        product_name: "",
        quantity: "",
        quant_unit: "",
        helper_quantity: "",
        help_quant_unit: "",
        discount: "",
        netto_cost: "",
        brutto_cost: "",
        vat_percentage: "",
        vat_cost: "",
      });
    }
  };

  useEffect(() => {
    //TODO fix appendig
    line_items?.forEach((item) => {
      append(item);
    });
  }, [line_items]);

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
                    value={`${formField.value.product_name} ${formField.value.quantity}  ${formField.value.quant_unit} ${formField.value.helper_quantity} ${formField.value.help_quant_unit} ${formField.value.discount} ${formField.value.netto_cost} ${formField.value.brutto_cost} ${formField.value.vat_percentage} ${formField.value.vat_cost}`}
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
                              (product) => product.value === field.value
                            )?.label
                          : "Wybierz produkt"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opadiscount-50" />
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
                              key={product.value}
                              onSelect={() => {
                                field.onChange(product.value);
                                setnewLineItem((prev) => ({
                                  ...prev,
                                  product_id: product.id,
                                  product_name: product.label,
                                }));
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  product.value === field.value
                                    ? "opadiscount-100"
                                    : "opadiscount-0"
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
                  <Input
                    {...field}
                    value={newLineItem.quantity}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewLineItem((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }));
                    }}
                    placeholder="Ilość"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.quant_unit`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jednostka</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={newLineItem.quant_unit}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewLineItem((prev) => ({
                        ...prev,
                        quant_unit: e.target.value,
                      }));
                    }}
                    placeholder="Jednostka"
                  />
                </FormControl>
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
                  <Input
                    {...field}
                    value={newLineItem.helper_quantity || ""}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewLineItem((prev) => ({
                        ...prev,
                        helper_quantity: e.target.value,
                      }));
                    }}
                    placeholder="Ilość pomocnicza"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.help_quantity_unit`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jednostka pomocnicza</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={newLineItem.help_quantity_unit || ""}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewLineItem((prev) => ({
                        ...prev,
                        help_quantity_unit: e.target.value,
                      }));
                    }}
                    placeholder="Jednostka pomocnicza"
                  />
                </FormControl>
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
                  <Input
                    {...field}
                    value={newLineItem.discount}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewLineItem((prev) => ({
                        ...prev,
                        discount: e.target.value,
                      }));
                    }}
                    placeholder="Rabat"
                  />
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
                    value={newLineItem.netto_cost}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewLineItem((prev) => ({
                        ...prev,
                        netto_cost: e.target.value,
                      }));
                    }}
                    placeholder="Netto"
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
                  <Input
                    {...field}
                    value={newLineItem.brutto_cost}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewLineItem((prev) => ({
                        ...prev,
                        brutto_cost: e.target.value,
                      }));
                    }}
                    placeholder="Brutto"
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
                    value={newLineItem.vat_percentage}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewLineItem((prev) => ({
                        ...prev,
                        vat_percentage: e.target.value,
                      }));
                    }}
                    placeholder="Stawka VAT"
                  />
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
                  <Input
                    {...field}
                    value={newLineItem.vat_cost}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewLineItem((prev) => ({
                        ...prev,
                        vat_cost: e.target.value,
                      }));
                    }}
                    placeholder="Wartość VAT"
                  />
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
