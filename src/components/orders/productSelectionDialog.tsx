"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProductSelectionDialog({
  products,
  onProductsSelected,
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      products.map((product) => product.category).filter(Boolean)
    );
    return Array.from(uniqueCategories).map((category, index) => ({
      id: index.toString(),
      name: category,
    }));
  }, [products]);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredProducts(
        products.filter(
          (product) =>
            product.category === selectedCategory &&
            product.name.toLowerCase().includes(productSearch.toLowerCase())
        )
      );
    } else {
      setFilteredProducts([]);
    }
  }, [selectedCategory, products, productSearch]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleProductSelect = (product) => {
    setSelectedProducts((prevSelected) => {
      const existingIndex = prevSelected.findIndex((p) => p.id === product.id);
      if (existingIndex !== -1) {
        return prevSelected.filter((p) => p.id !== product.id);
      } else {
        return [...prevSelected, { ...product, quantity: 1 }];
      }
    });
  };

  const handleAddSelected = () => {
    onProductsSelected(selectedProducts);
    setSelectedProducts([]);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Wybierz produkty</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[80vw] max-h-[70vh] w-full h-full">
        <DialogHeader>
          <DialogTitle>Wybierz produkty</DialogTitle>
        </DialogHeader>
        <div className="flex space-x-4">
          <div className="w-1/2">
            <h3 className="mb-4 font-semibold">Wybrana grupa</h3>
            <Input
              placeholder="Szukaj"
              className="mb-4"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
            />
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nr.</TableHead>
                    <TableHead>Grupa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category, index) => (
                    <TableRow
                      key={category.id}
                      className={
                        selectedCategory === category.name ? "bg-muted" : ""
                      }
                      onClick={() => handleCategorySelect(category.name)}
                    >
                      <TableCell>
                        {String(index + 1).padStart(2, "0")}
                      </TableCell>
                      <TableCell>{category.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
          <div className="w-1/2">
            <h3 className="mb-4 font-semibold">Wybierz produkt</h3>
            <Input
              placeholder="Szukaj"
              className="mb-4"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Nr.</TableHead>
                    <TableHead>Nazwa pozycji</TableHead>
                    <TableHead>Objętość</TableHead>
                    <TableHead>Cena</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product, index) => (
                    <TableRow
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.some(
                            (p) => p.id === product.id
                          )}
                          onClick={() => handleProductSelect(product)}
                          onCheckedChange={() => handleProductSelect(product)}
                        />
                      </TableCell>
                      <TableCell>
                        {String(index + 1).padStart(2, "0")}
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        {product.actual_volume} {product.primary_unit}
                      </TableCell>
                      <TableCell>{product.price} zł</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Anuluj
          </Button>
          <Button onClick={handleAddSelected}>
            Dodaj wybrane ({selectedProducts.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
