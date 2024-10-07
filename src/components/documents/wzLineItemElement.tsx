import React, { useEffect, useMemo } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export const WzLineItemsComponent = ({ lineItems }) => {
  const { control } = useFormContext();
  const { fields, update } = useFieldArray({
    control,
    name: "line_items",
    keyName: "key",
  });

  const filteredFields = useMemo(() => {
    return fields.filter(
      (item) =>
        item?.included_in_wz !== null && !item.is_used && item.wz === null
    );
  }, [fields]);

  const handleCheckboxChange = (originalIndex, checked) => {
    update(originalIndex, {
      ...fields[originalIndex],
      included_in_wz: checked,
      wz_quantity: checked ? fields[originalIndex].quantity : "",
      helper_quantity: checked ? fields[originalIndex].quantity : "",
    });
  };

  const handleQuantityChange = (originalIndex, value) => {
    const originalQuantity = parseFloat(fields[originalIndex].quantity);
    const newQuantity = parseFloat(value);

    if (newQuantity > originalQuantity) {
      update(originalIndex, {
        ...fields[originalIndex],
        wz_quantity: originalQuantity.toString(),
      });
    } else {
      update(originalIndex, { ...fields[originalIndex], wz_quantity: value });
    }
  };

  const handleUnitChange = (originalIndex, value) => {
    update(originalIndex, { ...fields[originalIndex], wz_unit: value });
  };

  // New helper handlers
  const handleHelpQuantityChange = (originalIndex, value) => {
    const originalQuantity = parseFloat(fields[originalIndex].quantity);
    const newQuantity = parseFloat(value);

    if (newQuantity > originalQuantity) {
      update(originalIndex, {
        ...fields[originalIndex],
        helper_quantity: originalQuantity.toString(),
      });
    } else {
      update(originalIndex, {
        ...fields[originalIndex],
        helper_quantity: value,
      });
    }
  };

  const handleHelpUnitChange = (originalIndex, value) => {
    update(originalIndex, { ...fields[originalIndex], help_quant_unit: value });
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Pozycje dokumentu WZ</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Uwzględnij</TableHead>
            <TableHead>Nazwa produktu</TableHead>
            <TableHead>Ilość pozostała w zamówieniu</TableHead>
            <TableHead>Jednostka</TableHead>
            <TableHead>Ilość w WZ</TableHead>
            <TableHead>Jednostka WZ</TableHead>
            <TableHead>Ilość pomocnicza</TableHead>
            <TableHead>Jednostka pomocnicza</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFields.map((item) => {
            const originalIndex = fields.findIndex(
              (field) => field.key === item.key
            );
            return (
              <TableRow key={item.key}>
                <TableCell>
                  <Checkbox
                    checked={item.included_in_wz}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(originalIndex, checked)
                    }
                  />
                </TableCell>
                <TableCell>{item.product_name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.quant_unit}</TableCell>
                <TableCell>
                  <Input
                    value={item.wz_quantity || ""}
                    onChange={(e) =>
                      handleQuantityChange(originalIndex, e.target.value)
                    }
                    disabled={!item.included_in_wz}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={item.wz_unit || ""}
                    onValueChange={(value) =>
                      handleUnitChange(originalIndex, value)
                    }
                    disabled={!item.included_in_wz}
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
                </TableCell>
                <TableCell>
                  <Input
                    value={item.helper_quantity || ""}
                    onChange={(e) =>
                      handleHelpQuantityChange(originalIndex, e.target.value)
                    }
                    disabled={!item.included_in_wz}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={item.help_quant_unit || ""}
                    onValueChange={(value) =>
                      handleHelpUnitChange(originalIndex, value)
                    }
                    disabled={!item.included_in_wz}
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default WzLineItemsComponent;
