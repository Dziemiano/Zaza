"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import OrderPdf from "./orderPdf";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  }
);

type OrderCheckPdfProps = { wzData: any };

export const OrderCheckPdf = ({ wzData }: OrderCheckPdfProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="zazaGrey" className="w-[186px] h-10 px-3 py-2">
          Drukuj zamówienie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[70vw] max-h-[90vh] w-full h-full">
        <div className="w-full h-full">
          <PDFViewer width="98%" height="100%">
            <OrderPdf wzData={wzData} />
          </PDFViewer>
        </div>
      </DialogContent>
    </Dialog>
  );
};
