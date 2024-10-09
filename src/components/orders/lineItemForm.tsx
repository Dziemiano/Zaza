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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

import { cn, formatNumber } from "@/lib/utils";
import { z } from "zod";
import { FixedSizeList as List } from "react-window";

import { LineItemSchema } from "@/schemas";

export type LineItem = {
  id?: string;
  ordinal_number?: number;
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
  const { control, setValue, getValues, setError, clearErrors } =
    useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
    keyName: "key",
  });

  const [open, setOpen] = useState(false);
  const [ordinalNumber, setOrdinalNumber] = useState(
    line_items?.length + 1 || 1
  );
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    const updatedProductList = products.map((product) => ({
      id: product.id,
      label: product.name,
      value: product.name,
    }));
    setProductList(updatedProductList);
    setFilteredProducts(updatedProductList);
  }, [products]);

  const handleSearch = (value: string) => {
    const filtered = productList.filter((product) =>
      product.label.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  useEffect(() => {
    setValue(`${name}.new.vat_percentage`, "23");
  }, []);

  const nettoCost = useWatch({
    control,
    name: `${name}.new.netto_cost`,
  });
  const vatPercentage = useWatch({
    control,
    name: `${name}.new.vat_percentage`,
  });

  useEffect(() => {
    if (nettoCost || vatPercentage) {
      const netto = parseFloat(nettoCost) || 0;
      const vat = parseFloat(vatPercentage) || 23;
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
    try {
      const validatedNewItem = LineItemSchema.parse(newItemValues);

      if (!validatedNewItem.quantity || !validatedNewItem.netto_cost) {
        throw new Error("Required fields are missing");
      }

      append({
        ...validatedNewItem,
        ordinal_number: ordinalNumber,
        vat_percentage: validatedNewItem.vat_percentage || "23",
        quant_unit: validatedNewItem.quant_unit || "m3",
        discount: validatedNewItem.discount || "0",
      });

      setOrdinalNumber((prevOrdinalNumber) => prevOrdinalNumber + 1);

      setValue(`${name}.new`, {
        id: "",
        ordinal_number: ordinalNumber,
        product_id: "",
        product_name: "",
        quantity: "",
        quant_unit: "m3",
        helper_quantity: "",
        help_quant_unit: "",
        discount: "0",
        netto_cost: "",
        brutto_cost: "",
        vat_percentage: "23",
        vat_cost: "",
      });

      Object.keys(newItemValues).forEach((fieldName) => {
        clearErrors(`${name}.new.${fieldName}`);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((issue) => {
          setError(`${name}.new.${issue.path[0]}`, {
            message: issue.message,
          });
        });
      } else if (error instanceof Error) {
        setError(`${name}.new.quantity`, { message: "Ilość jest wymagana" });
      } else {
        console.log("Error adding line item:", error);
      }
    }
  };

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
    line_items?.sort((a, b) => a.ordinal_number - b.ordinal_number);
  }, [line_items]);

  const VirtualizedProductList = React.memo(function VirtualizedProductList({
    data,
    height,
    itemSize,
    width,
  }) {
    return (
      <List
        height={height}
        itemCount={data.length}
        itemSize={itemSize}
        width={width}
      >
        {({ index, style }) => (
          <CommandItem
            value={data[index].label}
            key={data[index].id}
            onSelect={() => {
              setValue(`${name}.new.product_id`, data[index].id);
              setValue(`${name}.new.product_name`, data[index].label);
              setOpen(false);
            }}
            style={style}
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                data[index].id === getValues(`${name}.new.product_id`)
                  ? "opacity-100"
                  : "opacity-0"
              )}
            />
            {data[index].label}
          </CommandItem>
        )}
      </List>
    );
  });

  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2 overflow-y-auto max-h-36">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2">
              <FormField
                control={control}
                name={`${name}.${index}`}
                render={({ field: formField }) => (
                  <Input
                    value={`${index + 1} | ${
                      formField.value.product_name
                    } | Ilość: ${formatNumber(formField.value.quantity)} ${
                      formField.value.quant_unit
                    } | Ilość pomocnicza: ${
                      formatNumber(formField.value.helper_quantity) ||
                      "nie dotyczy"
                    } ${
                      formField.value.help_quant_unit || ""
                    } | Rabat: ${formatNumber(
                      formField.value.discount
                    )} | Cenna netto: ${formatNumber(
                      formField.value.netto_cost
                    )} | Cena brutto: ${formatNumber(
                      formField.value.brutto_cost
                    )} | Stawka VAT: ${formatNumber(
                      formField.value.vat_percentage
                    )}% | Wartość VAT: ${formatNumber(
                      formField.value.vat_cost
                    )}`}
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
        <div className="grid grid-cols-6 gap-4">
          <FormField
            control={control}
            name={`${name}.new.product_id`}
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Produkt</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "h-10 min-w-[400px] px-3 py-2 mr-4 mb-4 bg-white rounded-lg shadow justify-between items-center gap-2.5 inline-flex w-full",
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
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Znajdź produkt"
                        onValueChange={handleSearch}
                      />
                      <CommandList>
                        <CommandEmpty>Nie znaleziono produktów</CommandEmpty>
                        <CommandGroup>
                          <VirtualizedProductList
                            data={filteredProducts}
                            height={250}
                            itemSize={30}
                            width={"full"}
                          />
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
              <FormItem className="w-[180px]">
                <FormLabel>Ilość*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ilość" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.quant_unit`}
            render={({ field }) => (
              <FormItem>
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
            name={`${name}.new.help_quant_unit`}
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue=""
                >
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
                <FormLabel>Netto*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Netto" />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <FormField
              control={control}
              name={`${name}.new.vat_percentage`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stawka VAT*</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={"23"}>
                    <FormControl>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Wybierz" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="23">23%</SelectItem>
                        <SelectItem value="8">8%</SelectItem>
                        <SelectItem value="0">0%</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
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
