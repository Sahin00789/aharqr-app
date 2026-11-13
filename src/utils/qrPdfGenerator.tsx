import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import QRCode from "qrcode";

export interface TableQrData {
  qrUrl: string;
  tableNumber: string;
  tableName?: string;
  restaurantName?: string;
  capacity?: number;
  isTakeaway?: boolean;
}

const styles = StyleSheet.create({
  page: {
    padding: 22,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  pageHeader: {
    marginBottom: 15,
    paddingHorizontal: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  pageTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#142238",
  },
  pageSubtitle: {
    marginTop: 3,
    fontSize: 8,
    color: "#64748b",
  },
  pageMeta: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#d97736",
    letterSpacing: 1.1,
  },
  stickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  stickerCell: {
    width: "48.5%",
    height: 350,
    marginBottom: 14,
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#dbe2ea",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },
  accent: {
    width: "100%",
    height: 7,
    backgroundColor: "#d97736",
  },
  stickerContent: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 13,
    paddingTop: 12,
    paddingBottom: 10,
  },
  brandRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    maxWidth: "74%",
    fontSize: 11,
    fontWeight: "bold",
    color: "#142238",
    letterSpacing: 0.2,
  },
  brandTag: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#9a552b",
    letterSpacing: 0.8,
  },
  tableName: {
    marginTop: 11,
    fontSize: 17,
    fontWeight: "bold",
    color: "#142238",
    textAlign: "center",
  },
  tableNumber: {
    marginTop: 3,
    fontSize: 8,
    fontWeight: "bold",
    color: "#64748b",
    letterSpacing: 1.2,
    textAlign: "center",
  },
  qrFrame: {
    marginTop: 10,
    padding: 7,
    borderWidth: 1,
    borderColor: "#e5eaf0",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  qrImage: {
    width: 164,
    height: 164,
  },
  scanCallout: {
    marginTop: 9,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#142238",
  },
  scanText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 1,
    textAlign: "center",
  },
  footer: {
    width: "100%",
    marginTop: "auto",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#edf0f4",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#64748b",
  },
  footerCapacity: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#64748b",
  },
  emptyCell: {
    width: "48.5%",
    height: 350,
    marginBottom: 14,
  },
});

export async function downloadQrStickersPdf(
  tablesList: TableQrData[],
): Promise<void> {
  const pagesCount = Math.max(1, Math.ceil(tablesList.length / 4));
  const pagesData: TableQrData[][] = [];

  for (let pageIdx = 0; pageIdx < pagesCount; pageIdx++) {
    pagesData.push(tablesList.slice(pageIdx * 4, (pageIdx + 1) * 4));
  }

  const pagesWithQr = await Promise.all(
    pagesData.map(async (pageTables) =>
      Promise.all(
        pageTables.map(async (item) => ({
          ...item,
          qrDataUrl: await QRCode.toDataURL(item.qrUrl, {
            margin: 2,
            width: 220,
            errorCorrectionLevel: "H",
            color: { dark: "#111827", light: "#ffffff" },
          }),
        })),
      ),
    ),
  );

  const doc = (
    <Document title="AharQR Table QR Stickers" author="AharQR">
      {pagesWithQr.map((pageTables, pageIdx) => (
        <Page key={pageIdx} size="A4" style={styles.page}>
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>Scan. Order. Enjoy.</Text>
              <Text style={styles.pageSubtitle}>
                A custom QR for every table, ready to print and place.
              </Text>
            </View>
            <Text style={styles.pageMeta}>
              A4 · 2×2 · {pageIdx + 1}/{pagesCount}
            </Text>
          </View>
          <View style={styles.stickerGrid}>
            {[0, 1, 2, 3].map((index) => {
              const item = pageTables[index];
              if (!item) {
                return <View key={`empty-${index}`} style={styles.emptyCell} />;
              }

              const isTakeaway = item.isTakeaway;
              const tableName =
                item.tableName?.trim() ||
                (isTakeaway ? "Takeaway Counter" : `Table ${item.tableNumber}`);
              const restaurantName = item.restaurantName?.trim() || "Restaurant";

              return (
                <View key={item.qrUrl} style={styles.stickerCell}>
                  <View style={styles.accent} />
                  <View style={styles.stickerContent}>
                    <View style={styles.brandRow}>
                      <Text style={styles.brand}>{restaurantName}</Text>
                      <Text style={styles.brandTag}>
                        {isTakeaway ? "AHARQR · PICKUP" : "AHARQR · MENU"}
                      </Text>
                    </View>
                    <Text style={styles.tableName}>{tableName}</Text>
                    <Text style={styles.tableNumber}>
                      {isTakeaway
                        ? "SCAN TO ORDER"
                        : `TABLE ${item.tableNumber}`}
                    </Text>
                    <View style={styles.qrFrame}>
                      <Image src={item.qrDataUrl} style={styles.qrImage} />
                    </View>
                    <View style={styles.scanCallout}>
                      <Text style={styles.scanText}>SCAN TO VIEW MENU</Text>
                    </View>
                    <View style={styles.footer}>
                      <Text style={styles.footerText}>Point your camera here</Text>
                      {item.capacity != null && !isTakeaway && (
                        <Text style={styles.footerCapacity}>
                          {item.capacity} SEATS
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </Page>
      ))}
    </Document>
  );

  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `aharqr-table-stickers-${Date.now()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
