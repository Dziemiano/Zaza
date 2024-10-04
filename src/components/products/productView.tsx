import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductForm } from "./productsForm";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  sku?: string;
  length?: string;
  width: string;
  height: string;
  quantity_in_package?: string;
  actual_volume?: string;
  quantity_needed_for_production?: string;
  sales_volume?: string;
  technological_volume?: string;
  eps_type?: string;
  ean?: string;
  weight?: string;
  seasoning_time?: string;
  manufacturer?: string;
  primary_unit?: string;
  secondary_unit?: string;
  secondary_unit_volume?: string;
  is_sold?: boolean;
  is_produced?: boolean;
  is_internal?: boolean;
  is_one_time?: boolean;
  is_entrusted?: boolean;
  description?: string;
  image_path?: string;
  raw_material_type?: string;
  raw_material_granulation?: string;
  packaging_weight?: string;
  packaging_type?: string;
  price?: string;
  auto_price_translate?: boolean;
  min_price?: string;
  vat?: string;
  price_tolerance?: string;
  created_at: Date;
  created_by: string;
  comments: Comment[];
  users: [];
  lineItems: [];
}
export interface ProductViewProps {
  product: Product;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export const ProductView = ({
  product,
  isOpen,
  setIsOpen,
}: ProductViewProps) => {
  const volume = (product: Product) => {
    return product.length
      ? (parseInt(product.length) *
          parseInt(product.width) *
          parseInt(product.height) *
          parseInt(product.quantity_in_package || 1)) /
          1000000000
      : "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"></Button>
      </DialogTrigger>
      <DialogContent className="min-w-[90%] min-h-[90%] max-h-[95vh] flex flex-col content-start overflow-y-auto">
        <DialogHeader className="flex justify-between bg-white rounded-2xl shadow-sm max-md:flex-wrap max-md:pr-5 max-h-[30%]">
          <DialogTitle>
            {product.name} • {product.sku}
          </DialogTitle>
          <div className="flex gap-1 mt-4 text-xs text-neutral-400">
            <div>
              <Link href="/">Pulpit</Link>
            </div>
            <div>/</div>
            <div>
              <Link href="/products" onClick={() => setIsOpen(false)}>
                Produkty
              </Link>
            </div>
            <div>/</div>
            <div>{product?.name}</div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="product" className="w-full">
          <TabsList>
            <TabsTrigger value="product">Produkt</TabsTrigger>
            <TabsTrigger value="sales">Sprzedaż</TabsTrigger>
            <TabsTrigger value="images">Zdjęcia i dokumenty</TabsTrigger>
            <TabsTrigger value="visibility">Widoczność</TabsTrigger>
            <TabsTrigger value="recipes">Receptury</TabsTrigger>
            <TabsTrigger value="comments">Uwagi</TabsTrigger>
            <ProductForm product={product} editMode />
          </TabsList>

          <TabsContent value="product">
            <div className="product-status flex gap-2 my-4">
              <span
                className={`status px-2 py-1 rounded ${
                  product.is_sold
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800 line-through"
                }`}
              >
                W sprzedaży
              </span>
              <span
                className={`status px-2 py-1 rounded ${
                  product.is_produced
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800 line-through"
                }`}
              >
                W produkcji
              </span>
              <span
                className={`status px-2 py-1 rounded ${
                  product.is_internal
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800 line-through"
                }`}
              >
                Produkt wewnętrzny
              </span>
              <span
                className={`status px-2 py-1 rounded ${
                  product.is_one_time
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800 line-through "
                }`}
              >
                Produkt jednorazowy
              </span>
              <span
                className={`status px-2 py-1 rounded ${
                  product.is_entrusted
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800 line-through"
                }`}
              >
                Produkt powierzony
              </span>
            </div>
            <div className="flex flex-row mt-10">
              <div className="detail-item mr-10">
                <span className="block font-medium">{product.name}</span>
                <label className="text-sm text-muted-foreground">
                  Nazwa produktu
                </label>
              </div>
              <div className="detail-item mr-10">
                <span className="block font-medium">{product.category}</span>
                <label className="text-sm text-muted-foreground">
                  Kategoria produktu
                </label>
              </div>
              <div className="detail-item mr-10">
                <span className="block font-medium">
                  {product.primary_unit}
                </span>
                <label className="text-sm text-muted-foreground">
                  Jednostka
                </label>
              </div>
              <div className="detail-item mr-10">
                <span className="block font-medium">
                  {product.manufacturer}
                </span>
                <label className="text-sm text-muted-foreground">
                  Producent
                </label>
              </div>
            </div>
            <div className="product-details mt-10">
              <h2 className="text-xl font-semibold mb-4">
                Właściwości produktu
              </h2>
              <div className="details-grid grid grid-cols-4 gap-4">
                <div className="detail-item">
                  <span className="block font-medium">
                    {formatNumber(product.length)} mm
                  </span>
                  <label className="text-sm text-muted-foreground after:content-['/ Długość'] after:ml-1">
                    Długość
                  </label>
                </div>
                <div className="detail-item">
                  <span className="block font-medium">
                    {formatNumber(product.width)} mm
                  </span>
                  <label className="text-sm text-muted-foreground after:content-['/ Szerokość'] after:ml-1">
                    Szerokość
                  </label>
                </div>
                <div className="detail-item">
                  <span className="block font-medium">
                    {formatNumber(product.height)} mm
                  </span>
                  <label className="text-sm text-muted-foreground after:content-['/ Wysokość'] after:ml-1">
                    Wysokość
                  </label>
                </div>
                <div>
                  <span className="block font-medium">
                    {formatNumber(volume(product))} m3
                  </span>
                  <label className="text-sm text-muted-foreground after:content-['/ Wysokość'] after:ml-1">
                    Objętość
                  </label>
                </div>
                <div className="detail-item">
                  <span className="block font-medium">
                    {formatNumber(product.quantity_in_package)}
                  </span>
                  <label className="text-sm text-muted-foreground after:content-['/ Wysokość'] after:ml-1">
                    Ilość w paczce
                  </label>
                </div>
                <div className="detail-item">
                  <span className="block font-medium">
                    {formatNumber(product.weight)} kg
                  </span>
                  <label className="text-sm text-muted-foreground after:content-['/ Wysokość'] after:ml-1">
                    Waga
                  </label>
                </div>
                <div className="detail-item">
                  <span className="block font-medium">
                    {product.seasoning_time} h
                  </span>
                  <label className="text-sm text-muted-foreground after:content-['/ Wysokość'] after:ml-1">
                    Czas sezonowania
                  </label>
                </div>
                <div className="detail-item">
                  <span className="block font-medium">
                    {product.packaging_type}{" "}
                  </span>
                  <label className="text-sm text-muted-foreground after:content-['/ Wysokość'] after:ml-1">
                    Typ opakowania
                  </label>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-4 mt-8">Opis produktu</h2>
              <div className="detail-item">
                <span className="block font-medium">{product.description}</span>
                <label className="text-sm text-muted-foreground after:content-['/ Wysokość'] after:ml-1">
                  Opis
                </label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sales">
            <div className="sales-details mt-10">
              <h2 className="text-xl font-semibold mb-4">
                Informacje o sprzedaży
              </h2>
              <div className="details-grid grid grid-cols-4 gap-4">
                <div className="detail-item">
                  <span className="block font-medium">
                    {formatNumber(product.price, true)}
                  </span>
                  <label className="text-sm text-muted-foreground after:content-['/ Cena domyślna'] after:ml-1">
                    Cena domyślna
                  </label>
                </div>
                <div className="detail-item">
                  <span className="block font-medium">
                    {formatNumber(product.min_price, true)}
                  </span>
                  <label className="text-sm text-muted-foreground after:content-['/ Cena minimalna'] after:ml-1">
                    Cena minimalna
                  </label>
                </div>
                <div className="detail-item">
                  <span className="block font-medium">{product.vat}%</span>
                  <label className="text-sm text-muted-foreground after:content-['/ Stawka VAT'] after:ml-1">
                    Stawka VAT
                  </label>
                </div>
                <div className="detail-item">
                  <span className="block font-medium">
                    {product.price_tolerance}%
                  </span>
                  <label className="text-sm text-muted-foreground after:content-['/ Wysokość'] after:ml-1">
                    Tolerancja ceny
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
