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
import { ContactPersonFormElement } from "../customers/contactPersonFormElement";
import { formatNumber } from "@/lib/utils";

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
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove, replace, update } = useFieldArray({
    control,
    name,
    keyName: "key",
  });

  const [test, setTest] = useState(true);
  const [m3FirstProvided, setM3FirstProvided] = useState({});

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

  const shouldUseHelperQuantity = useCallback(
    (productId) => {
      const product = products.find((p) => p.id === productId);
      return (
        product &&
        (product.category === "Kształtki" || product.category === "Formatki")
      );
    },
    [products]
  );

  const getEffectiveQuantity = useCallback(
    (item) => {
      if (shouldUseHelperQuantity(item.product_id) && item.helper_quantity) {
        return parseFloat(item.helper_quantity) || 0;
      }
      return parseFloat(item.quantity) || 0;
    },
    [shouldUseHelperQuantity]
  );

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

      const calculateHelperQuantity = (mainQuantity) => {
        return mainQuantity && m3PerPackage
          ? Math.ceil(parseFloat(mainQuantity) / m3PerPackage).toString()
          : "";
      };

      if (field === "quantity" && updatedItem.quant_unit === "m3") {
        if (!m3FirstProvided[index]) {
          updatedItem.help_quant_unit = "opak";
          updatedItem.helper_quantity = calculateHelperQuantity(
            updatedItem.quantity
          );
          setM3FirstProvided((prev) => ({ ...prev, [index]: true }));
        }
      } else if (field === "quant_unit") {
        if (
          updatedItem.quant_unit === "m3" &&
          updatedItem.quantity !== "" &&
          !m3FirstProvided[index]
        ) {
          updatedItem.help_quant_unit = "opak";
          updatedItem.helper_quantity = calculateHelperQuantity(
            updatedItem.quantity
          );
          setM3FirstProvided((prev) => ({ ...prev, [index]: true }));
        } else if (updatedItem.quant_unit !== "m3") {
          updatedItem.help_quant_unit = "";
          updatedItem.helper_quantity = "";
          setM3FirstProvided((prev) => ({ ...prev, [index]: false }));
        }
      }

      const nettoCost = parseFloat(updatedItem.netto_cost) || 0;
      const vatPercentage = parseFloat(updatedItem.vat_percentage) || 0;
      updatedItem.brutto_cost = (nettoCost * (1 + vatPercentage / 100)).toFixed(
        2
      );

      update(index, updatedItem);
    },
    [fields, update, calculateM3, products, m3FirstProvided]
  );

  const calculateItemValues = useCallback(
    (item) => {
      const quantity = getEffectiveQuantity(item);
      const nettoPrice = parseFloat(item.netto_cost) || 0;
      const discount = parseFloat(item.discount) || 0;
      const vatPercentage = parseFloat(item.vat_percentage) || 0;

      // Calculate discounted netto price
      const discountedNettoPrice = nettoPrice * ((100 - discount) / 100);

      // Calculate total netto value (quantity * discounted price)
      const nettoValue = quantity * discountedNettoPrice;

      // Calculate brutto price (single unit with VAT)
      const bruttoCost = discountedNettoPrice * (1 + vatPercentage / 100);

      // Calculate total brutto value
      const bruttoValue = nettoValue * (1 + vatPercentage / 100);

      return {
        nettoValue: nettoValue.toFixed(2),
        bruttoCost: bruttoCost.toFixed(2),
        bruttoValue: bruttoValue.toFixed(2),
        discountedNettoPrice: discountedNettoPrice.toFixed(2),
      };
    },
    [getEffectiveQuantity]
  );

  const handleProductsSelected = useCallback(
    (selectedProducts) => {
      const newLineItems = selectedProducts.map((product) => ({
        product_id: product.id,
        product_name: product.name,
        product_category: product.category,
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

  const calculateM3Total = useCallback(() => {
    return fields
      .reduce((total, item) => {
        // Handle items with m3 as main unit
        if (item.quant_unit === "m3") {
          return total + (parseFloat(item.quantity) || 0);
        }
        // Calculate m3 from dimensions for other items
        const product = products.find((p) => p.id === item.product_id);
        if (product && product.height && product.length && product.width) {
          const quantity = parseFloat(item.quantity) || 0;
          const m3PerUnit = calculateM3(
            product.height,
            product.length,
            product.width
          );
          return total + quantity * m3PerUnit;
        }
        return total;
      }, 0)
      .toFixed(3);
  }, [fields, products, calculateM3]);

  const calculateNettoTotal = useCallback(() => {
    return fields
      .reduce((total, item) => {
        const { nettoValue } = calculateItemValues(item);
        return total + parseFloat(nettoValue);
      }, 0)
      .toFixed(2);
  }, [fields, calculateItemValues]);

  const calculateBruttoTotal = useCallback(() => {
    return fields
      .reduce((total, item) => {
        const { bruttoValue } = calculateItemValues(item);
        return total + parseFloat(bruttoValue);
      }, 0)
      .toFixed(2);
  }, [fields, calculateItemValues]);

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

  const handleRemoveItem = useCallback(
    (index) => {
      remove(index);
    },
    [remove]
  );

  const displayCellError = (err: { message: string }) =>
    err?.message && (
      <p className="text-xs mr-1 leading-none text-destructive">
        {err.message}
      </p>
    );

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {errors.line_items?.message && (
          <p className="text-sm font-small text-destructive mt-1 h5  min-h-5 max-h-5">
            {errors.line_items.message as string}
          </p>
        )}
        <div className="mb-4 flex justify-between items-center">
          <ProductSelectionDialog
            products={products}
            onProductsSelected={handleProductsSelected}
          />
          <div className="font-semibold flex flex-row">
            <div className="mr-5">
              Suma m³: {formatNumber(calculateM3Total(), true)} m³
            </div>
            <div className="mr-5">
              Suma netto: {formatNumber(calculateNettoTotal(), true)} zł
            </div>
            <div>
              Suma brutto: {formatNumber(calculateBruttoTotal(), true)} zł
            </div>
          </div>
        </div>
        <div className="max-h-[300px] overflow-auto">
          <h3 className="mb-4 font-semibold">Wybrane produkty</h3>
          <Table>
            <TableHeader>
              <TableRow className="bg-white">
                <TableHead>Nr.</TableHead>
                <TableHead>Nazwa pozycji</TableHead>
                <TableHead>Ilość</TableHead>
                <TableHead>Jednostka</TableHead>
                <TableHead>Ilość pomocnicza</TableHead>
                <TableHead>Jednostka pomocnicza</TableHead>
                <TableHead>Cena netto *</TableHead>
                <TableHead>Rabat</TableHead>
                <TableHead>Wartość netto</TableHead>
                <TableHead>VAT</TableHead>
                <TableHead>Cena brutto</TableHead>
                <TableHead>Wartość brutto</TableHead>
                <TableHead>Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((item, index) => {
                const {
                  nettoValue,
                  bruttoCost,
                  bruttoValue,
                  discountedNettoPrice,
                } = calculateItemValues(item);

                const itemErrors =
                  errors.line_items &&
                  Array.isArray(errors.line_items) &&
                  errors.line_items[index];

                return (
                  <TableRow key={item.id}>
                    <TableCell>{String(index + 1).padStart(2, "0")}</TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>
                      <Input
                        value={item.quantity?.toString()}
                        onChange={(e) =>
                          handleInputChange(index, "quantity", e.target.value)
                        }
                        className={`w-20 ${
                          itemErrors?.quantity
                            ? "text-red-500 border-red-500"
                            : ""
                        }`}
                        type="number"
                        step=".0001"
                        min="0"
                      />
                      {displayCellError(itemErrors?.quantity)}
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
                        className={`w-20 ${
                          itemErrors?.helper_quantity
                            ? "text-red-500 border-red-500"
                            : ""
                        }`}
                        type="number"
                        step=".0001"
                        min="0"
                      />
                      {displayCellError(itemErrors?.helper_quantity)}
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
                        className={`w-24 ${
                          itemErrors?.netto_cost
                            ? "text-red-500 border-red-500"
                            : ""
                        }`}
                        type="number"
                        step=".01"
                        min="0"
                      />
                      {displayCellError(itemErrors?.netto_cost)}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.discount}
                        onChange={(e) =>
                          handleInputChange(index, "discount", e.target.value)
                        }
                        className="w-24"
                        type="number"
                        step=".01"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>{formatNumber(nettoValue, true)} zł</TableCell>
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
                    <TableCell>{formatNumber(bruttoCost, true)} zł</TableCell>
                    <TableCell>{formatNumber(bruttoValue, true)} zł</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveItem(index);
                        }}
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
