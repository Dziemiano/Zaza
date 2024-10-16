import React, { useEffect } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { formatNumber } from "@/lib/utils";

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    padding: 30,
  },
  header: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  column: {
    flexDirection: "column",
    flexGrow: 1,
  },
  label: {
    fontWeight: "bold",
    marginRight: 5,
  },
  value: {
    marginBottom: 3,
  },
  table: {
    display: "table",
    width: "auto",
    height: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
    marginBottom: 20,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    marginBottom: 5,
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 60,
    left: 30,
    right: 30,
  },
  signatureLine: {
    width: 120,
    textOverflow: "ellipsis",
    borderTopWidth: 1,
    borderColor: "black",
    marginTop: 50,
    marginBottom: 5,
  },
});

const booleanToYesNo = (value: boolean): string => {
  return value ? "Tak" : "Nie";
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("pl-PL");
};

const date = new Date().toLocaleDateString("pl-PL");

// const renderTable = (unitType, lineItems) => {
//   if (unitType === "main") {
//     return (
//       <View style={[styles.breakable, styles.table]}>
//         <View style={[styles.tableRow, { fontWeight: "bold" }]}>
//           <View style={[styles.tableCol, { width: "3%" }]}>
//             <Text style={styles.tableCell}>Lp.</Text>
//           </View>
//           <View style={[styles.tableCol, { width: "50%" }]}>
//             <Text style={styles.tableCell}>Nazwa towaru lub usługi</Text>
//           </View>
//           <View style={[styles.tableCol, { width: "33%" }]}>
//             <Text style={styles.tableCell}>Ilość</Text>
//           </View>
//           <View style={[styles.tableCol, { width: "14%" }]}>
//             <Text style={styles.tableCell}>J.m.</Text>
//           </View>
//         </View>
//         {lineItems.map((item, i) => (
//           <View key={i} style={styles.tableRow}>
//             <View style={[styles.tableCol, { width: "3%" }]}>
//               <Text style={styles.tableCell}>{i + 1}</Text>
//             </View>
//             <View style={[styles.tableCol, { width: "50%" }]}>
//               <Text style={styles.tableCell}>{item.product_name}</Text>
//             </View>
//             <View style={[styles.tableCol, { width: "33%" }]}>
//               <Text style={styles.tableCell}>{item.quantity}</Text>
//             </View>
//             <View style={[styles.tableCol, { width: "14%" }]}>
//               <Text style={styles.tableCell}>{item.quant_unit}</Text>
//             </View>
//           </View>
//         ))}
//       </View>
//     );
//   } else if (unitType === "helper") {
//     return (
//       <View style={[styles.breakable, styles.table]}>
//         <View style={[styles.tableRow, { fontWeight: "bold" }]}>
//           <View style={[styles.tableCol, { width: "3%" }]}>
//             <Text style={styles.tableCell}>Lp.</Text>
//           </View>
//           <View style={[styles.tableCol, { width: "50%" }]}>
//             <Text style={styles.tableCell}>Nazwa towaru lub usługi</Text>
//           </View>
//           <View style={[styles.tableCol, { width: "33%" }]}>
//             <Text style={styles.tableCell}>Ilość</Text>
//           </View>
//           <View style={[styles.tableCol, { width: "14%" }]}>
//             <Text style={styles.tableCell}>J.m.</Text>
//           </View>
//         </View>
//         {lineItems.map((item, i) => (
//           <View key={i} style={styles.tableRow}>
//             <View style={[styles.tableCol, { width: "3%" }]}>
//               <Text style={styles.tableCell}>{i + 1}</Text>
//             </View>
//             <View style={[styles.tableCol, { width: "50%" }]}>
//               <Text style={styles.tableCell}>{item.product_name}</Text>
//             </View>
//             <View style={[styles.tableCol, { width: "33%" }]}>
//               <Text style={styles.tableCell}>{item.helper_quantity}</Text>
//             </View>
//             <View style={[styles.tableCol, { width: "14%" }]}>
//               <Text style={styles.tableCell}>{item.help_quant_unit}</Text>
//             </View>
//           </View>
//         ))}
//       </View>
//     );
//   } else {
//     return (

//     );
//   }
// };

const OrderPdf = (wzData: any) => {
  return (
    <Document title="Zamówienie">
      <Page size="A4" style={styles.page}>
        <View style={styles.row}>
          <Text style={styles.header}>Zamówienie nr {wzData.wzData.id}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Nabywca:</Text>
            <Text style={styles.value}>{wzData.wzData.customer.name}</Text>
            <Text style={styles.value}>
              {wzData.wzData.customer.street} {wzData.wzData.customer.building}
              {wzData.wzData.customer.premises}
            </Text>
            <Text style={styles.value}>
              {wzData.wzData.customer.postal_code} {wzData.wzData.customer.city}
            </Text>
            <Text style={styles.value}>NIP: {wzData.wzData.customer.nip}</Text>
          </View>
        </View>

        <View style={[styles.breakable, styles.table]}>
          <View style={[styles.tableRow, { fontWeight: "bold" }]}>
            <View style={[styles.tableCol, { width: "3%" }]}>
              <Text style={styles.tableCell}>Lp.</Text>
            </View>
            <View style={[styles.tableCol, { width: "50%" }]}>
              <Text style={styles.tableCell}>Nazwa towaru lub usługi</Text>
            </View>
            <View style={[styles.tableCol, { width: "17%" }]}>
              <Text style={styles.tableCell}>Ilość</Text>
            </View>
            <View style={[styles.tableCol, { width: "7%" }]}>
              <Text style={styles.tableCell}>J.m.</Text>
            </View>
            <View style={[styles.tableCol, { width: "17%" }]}>
              <Text style={styles.tableCell}>Ilość</Text>
            </View>
            <View style={[styles.tableCol, { width: "6%" }]}>
              <Text style={styles.tableCell}>J.m.</Text>
            </View>
          </View>
          {wzData.wzData.lineItems.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "3%" }]}>
                <Text style={styles.tableCell}>{i + 1}</Text>
              </View>
              <View style={[styles.tableCol, { width: "50%" }]}>
                <Text style={styles.tableCell}>{item.product_name}</Text>
              </View>
              <View style={[styles.tableCol, { width: "17%" }]}>
                <Text style={styles.tableCell}>
                  {formatNumber(item.quantity)}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: "7%" }]}>
                <Text style={styles.tableCell}>{item.quant_unit}</Text>
              </View>
              <View style={[styles.tableCol, { width: "17%" }]}>
                <Text style={styles.tableCell}>
                  {formatNumber(item.helper_quantity)}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: "6%" }]}>
                <Text style={styles.tableCell}>{item.help_quant_unit}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View
            style={[
              styles.row,
              {
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              },
            ]}
          >
            <View style={styles.column}>
              <View style={styles.signatureLine} />
              <Text>Podpis osoby uprawnionej</Text>
              <Text>do wystawienia dokumentu</Text>
            </View>
            <View style={styles.column}>
              <View style={styles.signatureLine} />
              <Text>Podpis osoby uprawnionej</Text>
              <Text>do odbioru dokumentu</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default OrderPdf;
