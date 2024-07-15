"use client";

import React from "react";
import { ReactDOM } from "react";
import dynamic from "next/dynamic";
import DeliveryNote from "@/components/documents/wznPdf";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  }
);

const AnalyticsPage = () => {
  const [showPDF, setShowPDF] = useState(false);

  const togglePDFViewer = () => {
    setShowPDF(!showPDF);
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <Button onClick={togglePDFViewer} className="mb-4">
        {showPDF ? "Hide PDF" : "Show PDF"}
      </Button>
      {showPDF && (
        <div className="w-full flex-grow">
          <PDFViewer width="100%" height="100%">
            <DeliveryNote />
          </PDFViewer>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
