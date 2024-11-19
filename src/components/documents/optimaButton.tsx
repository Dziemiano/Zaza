import { Button } from "../ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { ToastVariants } from "../ui/toast";
import { splitCustomerName } from "@/lib/utils";
import {
  getOptimaItemByCode,
  postOptimaDocument,
  postOptimaItem,
  getOptimaDocumentsByType,
  getOptimaCustomerByCode,
  postOptimaCustomer,
  getOptimaToken,
} from "@/lib/optima";
import { Category } from "@/types/product.types";
import { useSession } from "next-auth/react";

type Product = {
  id: string;
  sku: string;
  price: number;
  vat: number;
  unit: string;
  category: string;
};

const getProductFromOrder = (
  productId: string,
  order: any
): Product | undefined => {
  const lineItem = order.lineItems?.find(
    (item) => item.product?.id === productId || item.product_id === productId
  );
  return lineItem?.product;
};

const OptimaIntegrationButton = ({ wz, order, type = "WZS" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();

  // Only render if user is admin
  if (session?.user?.role !== "ADMIN") {
    return null;
  }

  const enrichLineItemsWithProducts = (items) => {
    return items
      .map((item) => {
        const product = getProductFromOrder(item.product_id, order);
        if (!product) {
          console.warn(`Product not found for ID: ${item.product_id}`);
          return null;
        }

        return {
          ...item,
          product_sku: product.sku,
          product: {
            ...product,
            price: product.price,
            vat: product.vat,
            unit: product.unit,
            category: product.category,
          },
          included_in_wz: true,
        };
      })
      .filter(Boolean);
  };

  const createOptimaDocument = async (
    items,
    data,
    foreign_id,
    customerData
  ) => {
    setIsLoading(true);
    const enrichedItems = enrichLineItemsWithProducts(items);

    if (enrichedItems.length === 0) {
      throw new Error("No valid items found after enrichment");
    }

    const { name1, name2, name3 } = splitCustomerName(customerData.name);

    try {
      const token = await getOptimaToken(type);
      if (!token && type !== "WZU") {
        throw new Error("Failed to get token");
      }

      // Customer processing
      try {
        let existingCustomer = null;
        try {
          existingCustomer = await getOptimaCustomerByCode(
            customerData.symbol.toUpperCase(),
            token ?? "",
            type
          );
          if (existingCustomer?.status === 404) {
            const newCustomer = await postOptimaCustomer(
              {
                code: customerData.symbol.toUpperCase(),
                name1,
                name2,
                name3,
                country: customerData.country,
                city: customerData.city,
                street: customerData.street,
                houseNumber: customerData.building,
                flatNumber: customerData.premises,
                postCode: customerData.postal_code,
                vatNumber: customerData.nip,
                countrycode: "PL",
              },
              token ?? "",
              type
            );

            if (!newCustomer) {
              throw new Error(
                `Failed to create customer: ${customerData.symbol}`
              );
            }
          }
        } catch (error) {
          console.error("Error processing customer:", error);
          throw error;
        }
      } catch (error) {
        console.error("Error in customer processing block:", error);
        throw error;
      }

      // Items processing
      for (const item of enrichedItems) {
        let existingItem = null;
        try {
          existingItem = await getOptimaItemByCode(
            item.product_sku.toUpperCase(),
            token ?? "",
            type
          );
          if (existingItem?.status === 404) {
            const newItem = await postOptimaItem(
              {
                type: 1,
                inactive: 0,
                code: item.product_sku.toUpperCase(),
                name: item.product_name,
                manufacturerCode: "Amitec",
                vatRate:
                  item.product.vat === null || item.product.vat === ""
                    ? 23
                    : item.product.vat,
                unit:
                  item.product.category === Category.ShapedForms ||
                  item.product.category === Category.Sheets
                    ? "szt"
                    : "m3",
                barcode: "",
                description: "",
                prices: [
                  { number: 2, type: 1, name: "hurtowa 1", value: 0 },
                  { number: 3, type: 1, name: "hurtowa 2", value: 0 },
                  { number: 4, type: 1, name: "hurtowa 3", value: 0 },
                  {
                    number: 5,
                    type: 2,
                    name: "detaliczna",
                    value:
                      item.product.price === null || item.product.price === ""
                        ? 1
                        : item.product.price,
                  },
                ],
                supplierCode: "Amitec",
                package_deposit: 0,
                product: 1,
              },
              token ?? "",
              type
            );

            if (!newItem) {
              throw new Error(`Failed to create item: ${item.product_name}`);
            }
          }
        } catch (error) {
          console.error("Error processing item:", error);
          throw error;
        }
      }

      // PW Document creation
      try {
        const existingDocuments = await getOptimaDocumentsByType(
          303,
          token ?? "",
          data.type
        );

        const documentsCount =
          Array.isArray(existingDocuments) && existingDocuments.length > 0
            ? existingDocuments.length + 10
            : 1;

        const warehouseQuantityChangeDocumentData = {
          type: 303,
          elements: enrichedItems.map((item) => ({
            code: item.product_sku.toUpperCase(),
            quantity:
              item.product.category === Category.ShapedForms ||
              item.product.category === Category.Sheets
                ? parseFloat(item.helper_quantity)
                : parseFloat(item.quantity),
            purchaseAmount: 1000,
            currentQuantity: 1000,
          })),
          description: "tworzenie dokumentu wz",
          status: 0,
          sourceWarehouseId: 1,
          documentIssueDate: data.issue_date,
          number: documentsCount + 1,
          paymentMethod: "przelew",
          currency: "PLN",
          calculatedOn: 1,
          targetWarehouseId: 1,
        };

        const quantityResponse = await postOptimaDocument(
          warehouseQuantityChangeDocumentData,
          token ?? "",
          data.type
        );

        if (!quantityResponse) {
          throw new Error(`Failed to post PW`);
        }
      } catch (error) {
        console.error("Error processing PW:", error);
        throw error;
      }

      const symbol = type === "WZS" ? "WZ_S" : "WZ_N";

      console.log(data);

      const [number] = data.doc_number.split("/");
      console.log(number);

      // let nextNumber = 1;
      // try {
      //   const currentMonth = new Date(data.issue_date).getMonth();
      //   const documentsResponse = await getOptimaDocumentsByType(
      //     306,
      //     token ?? "",
      //     type
      //   );

      //   if (documentsResponse) {
      //     const documents = Array.isArray(documentsResponse)
      //       ? documentsResponse
      //       : [documentsResponse];
      //     const currentMonthDocuments = documents.filter(
      //       (doc) => new Date(doc.documentIssueDate).getMonth() === currentMonth
      //     );

      //     if (currentMonthDocuments.length > 0) {
      //       nextNumber =
      //         Math.max(...currentMonthDocuments.map((doc) => doc.number)) + 1;
      //     }
      //   }
      // } catch (error) {
      //   console.log("Starting numbering from 1");
      // }

      const optimaDoc = {
        type: 306,
        foreignNumber: foreign_id,
        calculatedOn: 1,
        paymentMethod: "przelew",
        currency: "PLN",
        symbol,
        elements: enrichedItems.map((item) => ({
          code: item.product_sku.toUpperCase(),
          quantity:
            item.product.category === Category.ShapedForms ||
            item.product.category === Category.Sheets
              ? parseFloat(item.helper_quantity)
              : parseFloat(item.quantity),
          unit:
            item.product.category === Category.ShapedForms ||
            item.product.category === Category.Sheets
              ? "szt"
              : "m3",
          unitNetPrice: parseFloat(item.netto_cost),
          unitGrossPrice: parseFloat(item.brutto_cost),
          totalNetValue:
            (item.product.category === Category.ShapedForms ||
            item.product.category === Category.Sheets
              ? parseFloat(item.helper_quantity)
              : parseFloat(item.quantity)) * parseFloat(item.netto_cost),
          totalGrossValue:
            (item.product.category === Category.ShapedForms ||
            item.product.category === Category.Sheets
              ? parseFloat(item.helper_quantity)
              : parseFloat(item.quantity)) * parseFloat(item.brutto_cost),
          setCustomValue: true,
        })),
        payer: {
          code: customerData.symbol.toUpperCase().slice(0, 20),
          name1,
          name2,
          name3,
          country: customerData.country,
          city: customerData.city,
          street: customerData.street,
          houseNumber: customerData.building,
          flatNumber: customerData.premises,
          postCode: customerData.postal_code,
          vatNumber: customerData.nip,
          countrycode: "PL",
        },
        recipient: {
          code: customerData.symbol.toUpperCase().slice(0, 20),
          name1,
          name2,
          name3,
          country: customerData.country,
          city: customerData.city,
          street: customerData.street,
          houseNumber: customerData.building,
          flatNumber: customerData.premises,
          postCode: customerData.postal_code,
          vatNumber: customerData.nip,
          countrycode: "PL",
        },
        description: "",
        status: 1,
        sourceWarehouseId: 1,
        documentReleaseDate: new Date(
          new Date(data.out_date).setHours(
            new Date(data.out_date).getHours() + 2
          )
        ).toISOString(),

        documentIssueDate: data.issue_date,
        series: "TEST",
        number: number,
      };

      const documentResponse = await postOptimaDocument(
        optimaDoc,
        token ?? "",
        type
      );

      if (!documentResponse) {
        throw new Error("Failed to create Optima document");
      }

      toast({
        title: "Sukces!",
        description: "Dokument został pomyślnie wysłany do systemu Optima",
        variant: ToastVariants.success,
      });
    } catch (error) {
      console.error("Error in createOptimaDocument:", error);
      toast({
        title: "Błąd!",
        description:
          "Nie udało się wysłać dokumentu do systemu Optima: " + error.message,
        variant: ToastVariants.error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (!wz.line_items?.length) {
      toast({
        title: "Błąd!",
        description: "Brak produktów w dokumencie WZ",
        variant: ToastVariants.error,
      });
      return;
    }
    console.log("Processing WZ:", wz);
    createOptimaDocument(wz.line_items, wz, order.id, order.customer);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      {isLoading ? "Wysyłanie..." : "Wyślij do Optima"}
    </Button>
  );
};

export default OptimaIntegrationButton;
