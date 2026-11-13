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
import { imageUrlToDataUrl } from "./image-data.util";

/** App mark shown in each sticker's bottom branding strip. */
const APP_LOGO_URL = "/aharqr-logo-tight.png";

export interface TableQrData {
  qrUrl: string;
  tableNumber: string;
  tableName?: string;
  /** Restaurant identity printed at the top of every sticker. */
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  /** Remote restaurant logo URL (Cloudinary); embedded as a data URL. */
  restaurantLogo?: string | null;
  capacity?: number;
  isTakeaway?: boolean;
}

const ACCENT = "#d97736";
const INK = "#142238";
const MUTED = "#64748b";
const RULE = "#edf0f4";

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
    color: INK,
  },
  pageSubtitle: {
    marginTop: 3,
    fontSize: 8,
    color: MUTED,
  },
  pageMeta: {
    fontSize: 8,
    fontWeight: "bold",
    color: ACCENT,
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
    backgroundColor: ACCENT,
  },
  stickerContent: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },

  /* ---- 1. Restaurant identity (logo + name + address + phone) ---- */
  restaurantRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  restaurantLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 8,
    objectFit: "contain",
  },
  restaurantText: {
    alignItems: "center",
  },
  restaurantName: {
    fontSize: 12,
    fontWeight: "bold",
    color: INK,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  restaurantMeta: {
    marginTop: 2,
    fontSize: 6.8,
    color: MUTED,
    textAlign: "center",
  },

  /* ---- 2. Table identity ---- */
  divider: {
    width: "100%",
    height: 1,
    marginTop: 7,
    backgroundColor: RULE,
  },
  tableName: {
    marginTop: 7,
    fontSize: 16,
    fontWeight: "bold",
    color: INK,
    textAlign: "center",
  },
  tableMeta: {
    marginTop: 3,
    fontSize: 8,
    fontWeight: "bold",
    color: "#9a552b",
    letterSpacing: 1.1,
    textAlign: "center",
  },

  /* ---- 3. Big QR ---- */
  qrFrame: {
    marginTop: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: "#e5eaf0",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  qrImage: {
    width: 180,
    height: 180,
  },

  /* ---- 4. AharQR branding ---- */
  footer: {
    width: "100%",
    marginTop: "auto",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: RULE,
    alignItems: "center",
    justifyContent: "center",
  },
  footerLogo: {
    width: 30,
    height: 12.4,
  },
  footerFallback: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#9a552b",
    letterSpacing: 1.2,
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

  const restaurantLogoUrl =
    tablesList.find((item) => item.restaurantLogo)?.restaurantLogo ?? null;

  const [pagesWithQr, appLogo, restaurantLogo] = await Promise.all([
    Promise.all(
      pagesData.map(async (pageTables) =>
        Promise.all(
          pageTables.map(async (item) => ({
            ...item,
            qrDataUrl: await QRCode.toDataURL(item.qrUrl, {
              margin: 2,
              width: 260,
              errorCorrectionLevel: "H",
              color: { dark: "#111827", light: "#ffffff" },
            }),
          })),
        ),
      ),
    ),
    // Embed the app + restaurant logos as data URLs so the PDF renders
    // without any network/CORS access; both degrade to text if unavailable.
    imageUrlToDataUrl(APP_LOGO_URL),
    restaurantLogoUrl ? imageUrlToDataUrl(restaurantLogoUrl) : null,
  ]);

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
              const address = item.restaurantAddress?.trim();
              const phone = item.restaurantPhone?.trim();
              const tableMeta = isTakeaway
                ? "SCAN TO ORDER"
                : [
                    `TABLE ${item.tableNumber}`,
                    item.capacity != null ? `${item.capacity} SEATS` : null,
                  ]
                    .filter(Boolean)
                    .join("  ·  ");

              return (
                <View key={item.qrUrl} style={styles.stickerCell}>
                  <View style={styles.accent} />
                  <View style={styles.stickerContent}>
                    {/* Restaurant identity */}
                    <View style={styles.restaurantRow}>
                      {restaurantLogo && (
                        <Image
                          src={restaurantLogo}
                          style={styles.restaurantLogo}
                        />
                      )}
                      <View
                        style={[
                          styles.restaurantText,
                          restaurantLogo ? { maxWidth: 190 } : {},
                        ]}
                      >
                        <Text style={styles.restaurantName}>{restaurantName}</Text>
                        {address ? (
                          <Text style={styles.restaurantMeta}>{address}</Text>
                        ) : null}
                        {phone ? (
                          <Text style={styles.restaurantMeta}>{phone}</Text>
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Table identity */}
                    <Text style={styles.tableName}>{tableName}</Text>
                    <Text style={styles.tableMeta}>{tableMeta}</Text>

                    {/* Big scannable QR */}
                    <View style={styles.qrFrame}>
                      <Image src={item.qrDataUrl} style={styles.qrImage} />
                    </View>

                    {/* AharQR branding */}
                    <View style={styles.footer}>
                      {appLogo ? (
                        <Image src={appLogo} style={styles.footerLogo} />
                      ) : (
                        <Text style={styles.footerFallback}>AHARQR</Text>
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
