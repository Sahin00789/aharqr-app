/* eslint-disable react-refresh/only-export-components -- PDF module exports the download helper next to its private layout primitives. */
import type { ReactElement } from "react";
import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Circle,
  Path,
  Rect,
  type DocumentProps,
} from "@react-pdf/renderer";
import QRCode from "qrcode";
import { imageUrlToDataUrl } from "./image-data.util";
import { STICKER_H, STICKER_W, stickerArt } from "./sticker-art";

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
const ACCENT_DEEP = "#9a552b";
const INK = "#142238";
const MUTED = "#64748b";
const RULE = "#efe7dd";
const CARD_BG = "#fffdfa";

/** Sticker artwork size in points (matches the 2×2 A4 cell). */
const ART_H = STICKER_H;

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
    height: ART_H,
    marginBottom: 16,
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e6ded4",
    borderRadius: 18,
    backgroundColor: CARD_BG,
  },

  /* ---- background art layer (decorative, never under the QR) ---- */
  art: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  accentStrip: {
    width: "100%",
    height: 5,
    backgroundColor: ACCENT,
  },
  stickerContent: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 9,
  },

  /* ---- 1. Restaurant identity (logo + name + address + phone) ---- */
  restaurantRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoPlate: {
    width: 38,
    height: 38,
    borderRadius: 12,
    marginRight: 10,
    padding: 3,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: RULE,
  },
  restaurantLogo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  restaurantText: {
    alignItems: "flex-start",
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: "bold",
    color: INK,
    letterSpacing: 0.2,
  },
  restaurantMeta: {
    marginTop: 2,
    fontSize: 6.6,
    color: MUTED,
    lineHeight: 1.2,
  },
  restaurantPhone: {
    marginTop: 2,
    fontSize: 7.6,
    fontWeight: "bold",
    color: ACCENT_DEEP,
    letterSpacing: 0.4,
  },

  /* ---- 2. Table identity ---- */
  tableBlock: {
    width: "100%",
    marginTop: 8,
    alignItems: "center",
  },
  tableName: {
    fontSize: 19,
    fontWeight: "bold",
    color: INK,
    letterSpacing: 0.4,
    textAlign: "center",
  },
  tableUnderline: {
    width: 26,
    height: 3,
    marginTop: 3,
    borderRadius: 2,
    backgroundColor: ACCENT,
  },
  tableMeta: {
    marginTop: 4,
    fontSize: 7.4,
    fontWeight: "bold",
    color: ACCENT_DEEP,
    letterSpacing: 1.3,
    textAlign: "center",
  },

  /* ---- 3. Big QR on a white plate ---- */
  qrPlateWrap: {
    marginTop: 8,
  },
  qrPlate: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f1e8dd",
  },
  qrImage: {
    width: 152,
    height: 152,
  },
  corner: {
    position: "absolute",
    width: 15,
    height: 15,
    borderColor: ACCENT,
    borderWidth: 0,
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 7,
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 7,
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 7,
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 7,
  },
  scanHint: {
    marginTop: 6,
    fontSize: 7,
    fontWeight: "bold",
    color: MUTED,
    letterSpacing: 1.4,
    textAlign: "center",
  },

  /* ---- 4. AharQR branding ---- */
  footer: {
    width: "100%",
    marginTop: "auto",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: RULE,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  footerLabel: {
    fontSize: 6.4,
    fontWeight: "bold",
    color: "#a8b1bd",
    letterSpacing: 1.6,
    marginBottom: 2,
  },
  footerLogo: {
    width: 46,
    height: 19.05,
  },
  footerFallback: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: ACCENT_DEEP,
    letterSpacing: 1.2,
  },
  emptyCell: {
    width: "48.5%",
    height: ART_H,
    marginBottom: 16,
  },
});

/**
 * Decorative sticker artwork: Indian block-print / rangoli motifs (corner
 * rosettes, kolam dot borders, a triangular hem and a double frame) shared
 * with the on-screen preview via `utils/sticker-art.ts`. Everything is a very
 * light tint so the QR plate and the ink text keep full contrast.
 */
/** Artwork never changes — build the shape list once. */
const STICKER_ART = stickerArt();

function StickerArt() {
  return (
    <Svg
      style={styles.art}
      width={STICKER_W}
      height={STICKER_H}
      viewBox={`0 0 ${STICKER_W} ${STICKER_H}`}
    >
      {STICKER_ART.map((shape, index) => {
        const fill = shape.fill ?? "none";
        if (shape.kind === "circle") {
          return (
            <Circle
              key={index}
              cx={shape.cx}
              cy={shape.cy}
              r={shape.r}
              fill={fill}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
          );
        }
        if (shape.kind === "rect") {
          return (
            <Rect
              key={index}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              rx={shape.rx}
              fill={fill}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
          );
        }
        return (
          <Path
            key={index}
            d={shape.d}
            fill={fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
          />
        );
      })}
    </Svg>
  );
}

/** Builds the sticker document (kept separate so it can be rendered headlessly). */
export async function buildQrStickersDocument(
  tablesList: TableQrData[],
): Promise<ReactElement<DocumentProps>> {
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
                  <StickerArt />
                  <View style={styles.accentStrip} />
                  <View style={styles.stickerContent}>
                    {/* Restaurant identity */}
                    <View style={styles.restaurantRow}>
                      {restaurantLogo && (
                        <View style={styles.logoPlate}>
                          <Image
                            src={restaurantLogo}
                            style={styles.restaurantLogo}
                          />
                        </View>
                      )}
                      <View
                        style={[
                          styles.restaurantText,
                          restaurantLogo ? { width: 180 } : {},
                        ]}
                      >
                        <Text style={styles.restaurantName}>{restaurantName}</Text>
                        {address ? (
                          <Text style={styles.restaurantMeta}>{address}</Text>
                        ) : null}
                        {phone ? (
                          <Text style={styles.restaurantPhone}>{phone}</Text>
                        ) : null}
                      </View>
                    </View>

                    {/* Table identity */}
                    <View style={styles.tableBlock}>
                      <Text style={styles.tableName}>{tableName}</Text>
                      <View style={styles.tableUnderline} />
                      <Text style={styles.tableMeta}>{tableMeta}</Text>
                    </View>

                    {/* Big scannable QR on a white plate */}
                    <View style={styles.qrPlateWrap}>
                      <View style={styles.qrPlate}>
                        <Image src={item.qrDataUrl} style={styles.qrImage} />
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />
                      </View>
                    </View>
                    <Text style={styles.scanHint}>
                      {isTakeaway ? "SCAN · ORDER · PICK UP" : "SCAN · VIEW MENU · ORDER"}
                    </Text>

                    {/* AharQR branding */}
                    <View style={styles.footer}>
                      <Text style={styles.footerLabel}>POWERED BY</Text>
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

  return doc;
}

export async function downloadQrStickersPdf(
  tablesList: TableQrData[],
): Promise<void> {
  const doc = await buildQrStickersDocument(tablesList);

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
