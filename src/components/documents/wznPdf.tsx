import { formatNumber } from "@/lib/utils";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    padding: 30,
    display: "flex",
    flexDirection: "column",
  },
  contentWrapper: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerImage: {
    width: 150,
    height: 70,
    objectFit: "contain",
  },
  header: {
    fontSize: 14,
    marginBottom: 20,
    marginLeft: 30,
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
    marginBottom: 2,
  },
  value: {
    marginBottom: 2,
  },
  table: {
    width: "auto",
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
  customerColumn: {
    flexDirection: "column",
    width: "50%",
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    marginBottom: 5,
    fontSize: 9,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 20,
  },
  signatureLine: {
    width: 120,
    borderTopWidth: 1,
    borderColor: "black",
    marginTop: 50,
    marginBottom: 5,
  },
  sumRow: {
    flexDirection: "row",
    borderColor: "black",
    fontWeight: "bold",
  },
});

const booleanToYesNo = (value: boolean): string => {
  return value ? "Tak" : "Nie";
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("pl-PL");
};

const calculateTotalM3 = (lineItems) => {
  console.log("Calculating total m3");
  let total = 0;

  lineItems.forEach((item, index) => {
    if (item.quant_unit === "m3") {
      const quantity = parseFloat(item.quantity);
      if (isNaN(quantity)) {
        console.warn(`Invalid quantity for item ${index + 1}:`, item.quantity);
      } else {
        total += quantity;
      }
    }
  });
  const roundedTotal = parseFloat(total.toFixed(4));
  return roundedTotal;
};

const date = new Date().toLocaleDateString("pl-PL");

const renderTable = (unitType, lineItems) => {
  const totalM3 = calculateTotalM3(lineItems);
  if (unitType === "main") {
    return (
      <View style={[styles.breakable, styles.table]}>
        <View style={[styles.tableRow, { fontWeight: "bold" }]}>
          <View style={[styles.tableCol, { width: "3%" }]}>
            <Text style={styles.tableCell}>Lp.</Text>
          </View>
          <View style={[styles.tableCol, { width: "50%" }]}>
            <Text style={styles.tableCell}>Nazwa towaru lub usługi</Text>
          </View>
          <View style={[styles.tableCol, { width: "33%" }]}>
            <Text style={styles.tableCell}>Ilość</Text>
          </View>
          <View style={[styles.tableCol, { width: "14%" }]}>
            <Text style={styles.tableCell}>J.m.</Text>
          </View>
        </View>
        {lineItems?.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "3%" }]}>
              <Text style={styles.tableCell}>{i + 1}</Text>
            </View>
            <View style={[styles.tableCol, { width: "50%" }]}>
              <Text style={styles.tableCell}>{item.product_name}</Text>
            </View>
            <View style={[styles.tableCol, { width: "33%" }]}>
              <Text style={styles.tableCell}>{item.quantity}</Text>
            </View>
            <View style={[styles.tableCol, { width: "14%" }]}>
              <Text style={styles.tableCell}>{item.quant_unit}</Text>
            </View>
          </View>
        ))}
        <View style={styles.sumRow}>
          <View style={[styles.tableCol, { width: "53%" }]}>
            <Text style={styles.tableCell}>Suma m³</Text>
          </View>
          <View style={[styles.tableCol, { width: "47%" }]}>
            <Text style={styles.tableCell}>{totalM3}</Text>
          </View>
        </View>
      </View>
    );
  } else if (unitType === "helper") {
    return (
      <View style={[styles.breakable, styles.table]}>
        <View style={[styles.tableRow, { fontWeight: "bold" }]}>
          <View style={[styles.tableCol, { width: "3%" }]}>
            <Text style={styles.tableCell}>Lp.</Text>
          </View>
          <View style={[styles.tableCol, { width: "50%" }]}>
            <Text style={styles.tableCell}>Nazwa towaru lub usługi</Text>
          </View>
          <View style={[styles.tableCol, { width: "33%" }]}>
            <Text style={styles.tableCell}>Ilość</Text>
          </View>
          <View style={[styles.tableCol, { width: "14%" }]}>
            <Text style={styles.tableCell}>J.m.</Text>
          </View>
        </View>
        {lineItems?.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "3%" }]}>
              <Text style={styles.tableCell}>{i + 1}</Text>
            </View>
            <View style={[styles.tableCol, { width: "50%" }]}>
              <Text style={styles.tableCell}>{item.product_name}</Text>
            </View>
            <View style={[styles.tableCol, { width: "33%" }]}>
              <Text style={styles.tableCell}>
                {formatNumber(item.helper_quantity)}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "14%" }]}>
              <Text style={styles.tableCell}>{item.help_quant_unit}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  } else {
    return (
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
        {lineItems?.map((item, i) => (
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
        <View style={styles.sumRow}>
          <View style={[styles.tableCol, { width: "53%" }]}>
            <Text style={styles.tableCell}>Suma m³</Text>
          </View>
          <View style={[styles.tableCol, { width: "47%" }]}>
            <Text style={styles.tableCell}>{formatNumber(totalM3)}</Text>
          </View>
        </View>
      </View>
    );
  }
};

const DeliveryNote = (wzData: any, index: number) => {
  if (!wzData?.wzData?.wz || !wzData.wzData.wz[0]) {
    console.error(
      `No data found for index ${wzData.index} in wzData.wzData.wz array`
    );
    return null;
  }

  const currentWz = wzData.wzData.wz[wzData.index];
  return (
    <Document title="Dokument WZ">
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View>
          <View style={styles.headerContainer}>
            <Image
              style={styles.headerImage}
              src="https://res.cloudinary.com/dng31aime/image/upload/v1728654269/Amitec_Logo_RGB_MAIN_Dark_owawdj.png"
            />
            <Text style={styles.header}>
              Wydanie {currentWz.type || ""} nr{" "}
              {currentWz.doc_number || "****/**/****"}
            </Text>
          </View>

          {/* Seller and Date Info */}
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Sprzedawca:</Text>
              <Text style={styles.value}>Amitec</Text>
              <Text style={styles.value}>Agnieszka Misiek</Text>
              <Text style={styles.value}>98-405 Galewice</Text>
              <Text style={styles.value}>ul. Stefana Żeromskiego 1A</Text>
              <Text style={styles.value}>NIP: 9970089494</Text>
              <Text style={styles.value}>BDO: 000137095</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.value}>
                <Text style={styles.label}>Data wystawienia:</Text>{" "}
                {formatDate(currentWz.issue_date)}
              </Text>
              <Text style={styles.value}>
                <Text style={styles.label}>Data wydania:</Text>{" "}
                {formatDate(currentWz.out_date)}
              </Text>
              <Text style={styles.value}>
                <Text style={styles.label}>Data transportu:</Text>{" "}
                {formatDate(wzData.wzData.delivery_date)}
              </Text>
              <Text style={styles.value}>
                <Text style={styles.label}>Samochód:</Text> {currentWz.car}
              </Text>
              <Text style={styles.value}>
                <Text style={styles.label}>Kierowca:</Text> {currentWz.driver}
              </Text>
              <Text style={styles.value}>
                <Text style={styles.label}>Załadunek:</Text>{" "}
                {currentWz.cargo_person}
              </Text>
              <Text style={styles.value}>
                <Text style={styles.label}>Odbiór osobisty:</Text>{" "}
                {booleanToYesNo(wzData.wzData.personal_collect)}
              </Text>
            </View>
          </View>

          {/* Customer Info */}
          <View style={styles.row}>
            <View style={styles.customerColumn}>
              <Text style={styles.label}>Nabywca:</Text>
              <Text style={styles.value}>{wzData.wzData.customer.name}</Text>
              <Text style={styles.value}>
                {wzData.wzData.customer.street}{" "}
                {wzData.wzData.customer.building}
                {wzData.wzData.customer.premises}
              </Text>
              <Text style={styles.value}>
                {wzData.wzData.customer.postal_code}{" "}
                {wzData.wzData.customer.city}
              </Text>
              <Text style={styles.value}>
                NIP: {wzData.wzData.customer.nip}
              </Text>
            </View>
            <View style={styles.customerColumn}>
              <Text style={styles.label}>Adres dostawy:</Text>
              <Text style={styles.value}>
                {wzData.wzData.delivery_street}{" "}
                {wzData.wzData.delivery_building}{" "}
                {wzData.wzData.delivery_premises}
              </Text>
              <Text style={styles.value}>
                {wzData.wzData.delivery_city} {wzData.wzData.delivery_zipcode}
              </Text>
              <Text style={styles.value}>{wzData.wzData.delivery_contact}</Text>
              <Text style={styles.label}>Informacje dodatkowe:</Text>
              <Text style={styles.value}>{currentWz.additional_info}</Text>
            </View>
          </View>

          {/* Order Numbers */}
          <View style={styles.row}>
            <Text>
              <Text style={styles.label}>Numer zamówienia:</Text>{" "}
              {wzData.wzData.id}
            </Text>
          </View>
          <View style={styles.row}>
            <Text>
              <Text style={styles.label}>Numer obcy:</Text>{" "}
              {wzData.wzData.foreign_id}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text>
            <Text style={styles.label}>Uwagi ogólne:</Text>{" "}
            {wzData.wzData.comments
              .filter((item) => item.type === "general")
              .map((item, i, array) => (
                <Text style={styles.value}>
                  {item.body}
                  {i < array.length - 1 ? ", " : ""}
                </Text>
              ))}
          </Text>
        </View>
        <View style={styles.row}>
          <Text>
            <Text style={styles.label}>Uwagi dla transportu:</Text>{" "}
            {wzData.wzData.comments
              .filter((item) => item.type === "transport")
              .map((item, i, array) => (
                <Text style={styles.value}>
                  {item.body}
                  {i < array.length - 1 ? ", " : ""}
                </Text>
              ))}
          </Text>
        </View>

        {/* Table Section - Fixed Height */}
        <View>{renderTable(currentWz.unit_type, currentWz.line_items)}</View>

        {/* Footer Section */}
        <View style={styles.bottomSection}>
          {/* Signatures */}
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <View style={styles.column}>
              <View style={styles.signatureLine} />
              <Text>Podpis osoby uprawnionej</Text>
              <Text>do wystawienia dokumentu</Text>
            </View>
            <View style={styles.column}>
              <View style={styles.signatureLine} />
              <Text>Podpis osoby uprawnionej</Text>
              <Text>do wydania towaru</Text>
            </View>
            <View style={styles.column}>
              <View style={styles.signatureLine} />
              <Text>Podpis osoby uprawnionej</Text>
              <Text>do odbioru dokumentu</Text>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.row}>
            <Text>Biuro: +48 531 581 109, Księgowość: +48 883 004 444</Text>
          </View>
          <View style={styles.row}>
            <Text>Email: biuro@amitec.com.pl, amisiek@amitec.com.pl</Text>
          </View>

          {/* Pallet Info */}
          <View style={styles.column}>
            <Text style={[styles.label, { fontSize: 15 }]}>
              AMITEC - Palety zwrotne:
            </Text>
            <Text style={{ fontSize: 15, marginTop: 10 }}>
              Wydano {currentWz.pallet_type} {currentWz.pallet_count} szt. Zwrot
              ............ szt.
            </Text>
            <Text style={{ fontSize: 15 }}>
              Nie rozliczenie palet spowoduje obciążenie fakturą VAT!
            </Text>
            <Text style={{ fontSize: 15, marginTop: 10 }}>
              Do obowiązku kierowcy NIE NALEŻY rozładunek towaru!
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default DeliveryNote;
