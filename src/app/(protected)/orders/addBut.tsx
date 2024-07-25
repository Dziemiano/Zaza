"use client";

import { Button } from "@/components/ui/button";
import { addData } from "@/actions/orders";

const data = {
  productData: {
    name: "Sample Product",
    description: "This is a sample product used for demonstration purposes.",
    price: 100,
    created_by: "clyr6t9bv0000csxb55hfc5lu",
    category: "Sample Category",
  },
  orderData: {
    foreign_id: "foreign-id-123",
    customer_id: "clyx4rkcd00005bycxn8a1812",
    status: "Pending",
    is_proforma: false,
    proforma_payment_date: "2024-07-22T12:00:00.000Z",
    wz_type: "WZN",
    personal_collect: false,
    delivey_date: "2024-07-23T15:00:00.000Z",
    production_date: "2024-07-20T09:00:00.000Z",
    payment_deadline: "2024-07-21T17:00:00.000Z",
    delivery_place_id: "delivery-place-id-123",
    delivery_city: "Sample City",
    delivery_street: "Sample Street",
    delivery_building: "Building 10",
    delivery_zipcode: "12345",
    delivery_contact_number: "123-456-7890",
    delivery_date: "2024-07-24T08:00:00.000Z",
    deliver_time: "2024-07-24T12:00:00.000Z",
    transport_cost: 50,
    order_history: "Order created and pending payment",
    created_by: "clyr6t9bv0000csxb55hfc5lu",
    is_paid: false,
  },
  lineItems: [
    {
      quantity: 10,
      quant_unit: "pcs",
      helper_quantity: 0,
      help_quant_unit: "none",
      comment: "Initial order of sample product",
      discount: 5,
      netto_cost: 950,
      brutto_cost: 1000,
      vat_percentage: 10,
      vat_cost: 100,
    },
    {
      quantity: 5,
      quant_unit: "pcs",
      helper_quantity: 0,
      help_quant_unit: "none",
      comment: "Second batch of sample product",
      discount: 10,
      netto_cost: 450,
      brutto_cost: 500,
      vat_percentage: 10,
      vat_cost: 50,
    },
  ],
};

export const AddBut = () => {
  return (
    <Button
      variant="ghost"
      className="w-full font-normal"
      size="sm"
      onClick={() => addData(data)}
    >
      Dodaj Dane
    </Button>
  );
};
