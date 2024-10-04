import React, { useEffect, useCallback, useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductSelectionDialog from "./productSelectionDialog";
import { set } from "date-fns";

const quantityUnits = [
  { value: "m3", label: "m3" },
  { value: "m2", label: "m2" },
  { value: "opak", label: "opak" },
  { value: "mb", label: "mb" },
  { value: "kpl", label: "kpl" },
  { value: "kg", label: "kg" },
  { value: "szt", label: "szt" },
  { value: "t", label: "t" },
];

export default function ProductSelectionForm({
  name,
  products,
  lineItems = [],
}) {
  const { control, setValue, getValues } = useFormContext();
  const { fields, append, remove, replace, update } = useFieldArray({
    control,
    name,
    keyName: "key",
  });

  const [test, setTest] = useState(true);

  useEffect(() => {
    if (lineItems.length > 0 && fields.length === 0 && test) {
      replace(lineItems);
      setTest(false);
    }
  }, [lineItems, replace, fields.length]);

  useEffect(() => {
    setValue(`${name}.new.vat_percentage`, "23");
  }, [setValue, name]);

  const calculateM3 = useCallback((height, length, width) => {
    return (height * length * width) / 1000000000;
  }, []);

  const handleInputChange = useCallback(
    (index, field, value) => {
      const updatedItem = { ...fields[index], [field]: value };
      const product = products.find((p) => p.id === updatedItem.product_id);

      if (!product) {
        console.error("Product not found");
        return;
      }

      const m3PerProduct = calculateM3(
        product.height,
        product.length,
        product.width
      );
      const m3PerPackage = m3PerProduct * product.quantity_in_package;

      const updateHelperQuantity = (mainQuantity, fromUnit, toUnit) => {
        if (fromUnit === "m3" && toUnit === "opak") {
          return mainQuantity && m3PerPackage
            ? Math.ceil(parseFloat(mainQuantity) / m3PerPackage).toString()
            : "0";
        } else if (fromUnit === "opak" && toUnit === "m3") {
          return mainQuantity && m3PerPackage
            ? (parseFloat(mainQuantity) * m3PerPackage).toFixed(3)
            : "0";
        }
        return "0";
      };

      if (field === "quantity" || field === "quant_unit") {
        if (
          updatedItem.quant_unit === "m3" ||
          updatedItem.quant_unit === "opak"
        ) {
          updatedItem.help_quant_unit =
            updatedItem.quant_unit === "m3" ? "opak" : "m3";
          updatedItem.helper_quantity = updateHelperQuantity(
            updatedItem.quantity,
            updatedItem.quant_unit,
            updatedItem.help_quant_unit
          );
        } else {
          updatedItem.help_quant_unit = "m3";
          updatedItem.helper_quantity = "0";
        }
      } else if (field === "helper_quantity" || field === "help_quant_unit") {
        if (
          updatedItem.help_quant_unit === "m3" ||
          updatedItem.help_quant_unit === "opak"
        ) {
          updatedItem.quant_unit =
            updatedItem.help_quant_unit === "m3" ? "opak" : "m3";
          updatedItem.quantity = updateHelperQuantity(
            updatedItem.helper_quantity,
            updatedItem.help_quant_unit,
            updatedItem.quant_unit
          );
        } else {
          updatedItem.quant_unit = "m3";
          updatedItem.quantity = "0";
        }
      }

      updatedItem.quantity = updatedItem.quantity || "0";
      updatedItem.helper_quantity = updatedItem.helper_quantity || "0";

      const nettoCost = parseFloat(updatedItem.netto_cost) || 0;
      const vatPercentage = parseFloat(updatedItem.vat_percentage) || 0;
      updatedItem.brutto_cost = (nettoCost * (1 + vatPercentage / 100)).toFixed(
        2
      );

      update(index, updatedItem);
    },
    [fields, update, calculateM3, products]
  );

  const handleProductsSelected = useCallback(
    (selectedProducts) => {
      const newLineItems = selectedProducts.map((product) => ({
        product_id: product.id,
        product_name: product.name,
        quantity: "0",
        quant_unit: product.primary_unit,
        helper_quantity: "",
        help_quant_unit: "",
        netto_cost: product.price,
        brutto_cost: product.brutto_cost,
        vat_percentage: product.vat,
        vat_cost: product.vat_cost,
        height: product.height,
        length: product.length,
        width: product.width,
        quantity_in_package: product.quantity_in_package,
      }));
      append(newLineItems);
    },
    [append]
  );

  const calculateNettoTotal = useCallback(() => {
    return fields
      .reduce((total, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const nettoPrice = parseFloat(item.netto_cost) || 0;
        return total + quantity * nettoPrice;
      }, 0)
      .toFixed(2);
  }, [fields]);

  const calculateBruttoTotal = useCallback(() => {
    return fields
      .reduce((total, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const nettoPrice = parseFloat(item.netto_cost) || 0;
        const vatPercentage = parseFloat(item.vat_percentage) || 0;
        const bruttoPrice = nettoPrice * (1 + vatPercentage / 100);
        return total + quantity * bruttoPrice;
      }, 0)
      .toFixed(2);
  }, [fields]);

  const renderQuantitySelect = useCallback(
    (item, index, field) => (
      <Select
        value={item[field]}
        onValueChange={(value) => handleInputChange(index, field, value)}
      >
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent>
          {quantityUnits.map((unit) => (
            <SelectItem key={unit.value} value={unit.value}>
              {unit.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
    [handleInputChange]
  );

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="mb-4 flex justify-between items-center">
          <ProductSelectionDialog
            products={products}
            onProductsSelected={handleProductsSelected}
          />
          <div className="font-semibold">
            Suma netto: {calculateNettoTotal()} zł
            <br />
            Suma brutto: {calculateBruttoTotal()} zł
          </div>
        </div>
        <div className="max-h-[300px] overflow-auto">
          <h3 className="mb-4 font-semibold">Wybrane produkty</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nr.</TableHead>
                <TableHead>Nazwa pozycji</TableHead>
                <TableHead>Ilość</TableHead>
                <TableHead>Jednostka</TableHead>
                <TableHead>Ilość pomocnicza</TableHead>
                <TableHead>Jednostka pomocnicza</TableHead>
                <TableHead>Cena netto</TableHead>
                <TableHead>Rabat</TableHead>
                <TableHead>Wartość netto</TableHead>
                <TableHead>VAT</TableHead>
                <TableHead>Cena netto</TableHead>
                <TableHead>Wartość brutto</TableHead>
                <TableHead>Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((item, index) => {
                const nettoValue = (
                  item.discount
                    ? (parseFloat(item.quantity) *
                        parseFloat(item.netto_cost) *
                        parseFloat(100 - item.discount)) /
                      100
                    : parseFloat(item.quantity) * parseFloat(item.netto_cost)
                ).toFixed(2);
                const bruttoValue = (
                  parseFloat(nettoValue) *
                  (1 + parseFloat(item.vat_percentage) / 100)
                ).toFixed(2);
                const bruttoCost = (
                  item.discount
                    ? (parseFloat(item.netto_cost) *
                        (1 + parseFloat(item.vat_percentage) / 100) *
                        parseFloat(100 - item.discount)) /
                      100
                    : parseFloat(item.netto_cost) *
                      (1 + parseFloat(item.vat_percentage) / 100)
                ).toFixed(2);
                return (
                  <TableRow key={item.id}>
                    <TableCell>{String(index + 1).padStart(2, "0")}</TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>
                      <Input
                        value={item.quantity.toString()}
                        onChange={(e) =>
                          handleInputChange(index, "quantity", e.target.value)
                        }
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      {renderQuantitySelect(item, index, "quant_unit")}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.helper_quantity}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "helper_quantity",
                            e.target.value
                          )
                        }
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      {renderQuantitySelect(item, index, "help_quant_unit")}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.netto_cost}
                        onChange={(e) =>
                          handleInputChange(index, "netto_cost", e.target.value)
                        }
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.discount}
                        onChange={(e) =>
                          handleInputChange(index, "discount", e.target.value)
                        }
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>{nettoValue} zł</TableCell>
                    <TableCell>
                      <Select
                        value={item.vat_percentage}
                        onValueChange={(value) =>
                          handleInputChange(index, "vat_percentage", value)
                        }
                      >
                        <SelectTrigger className="w-[70px]">
                          <SelectValue placeholder="VAT" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="8">8%</SelectItem>
                          <SelectItem value="11.5">11.5%</SelectItem>
                          <SelectItem value="23">23%</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{bruttoCost} zł</TableCell>
                    <TableCell>{bruttoValue} zł</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        onClick={() => handleRemoveItem(index)}
                      >
                        Usuń
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
