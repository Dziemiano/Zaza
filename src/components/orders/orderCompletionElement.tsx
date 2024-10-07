import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export const OrderCompletionElement = ({ lineItems }) => {
  const deliveredItems = lineItems.filter((item) => item.included_in_wz);
  const deliveredQuantities = deliveredItems.reduce(
    (total, item) => total + parseFloat(item.quantity || "0"),
    0
  );
  const totalQuantities = lineItems.reduce(
    (total, item) => total + parseFloat(item.quantity),
    0
  );
  const realization = isNaN(deliveredQuantities / totalQuantities)
    ? 0
    : Math.round((deliveredQuantities / totalQuantities) * 100);

  const remainingItems = lineItems.filter((item) => !item.included_in_wz);
  return (
    <>
      <div className="text-lg font-semibold mb-4">
        Zrealizowano {realization}% zamówienia{" "}
      </div>
      <div className="flex flex-row">
        <div className="mt-6 m-1">
          <h3 className="text-md font-semibold mb-4">Pozycje zrealizowane</h3>
          <Table>
            <TableHeader>
              <TableRow className="bg-white">
                <TableHead>Nazwa produktu</TableHead>
                <TableHead>Ilość</TableHead>
                <TableHead>Jednostka</TableHead>
                <TableHead>Dokument</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.quant_unit}</TableCell>
                  <TableCell>
                    {item.wz.type} {item.wz.doc_number}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 m-1 ml-10">
          <h3 className="text-md font-semibold mb-4">Pozycje do realizacji</h3>
          <Table>
            <TableHeader>
              <TableRow className="bg-white">
                <TableHead>Nazwa produktu</TableHead>
                <TableHead>Ilość</TableHead>
                <TableHead>Jednostka</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {remainingItems.map((item) => (
                <TableRow key={item.id} className="bg-white">
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.quant_unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default OrderCompletionElement;
