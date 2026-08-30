import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import QRCode from "qrcode";

// pdfmake's browser build needs the virtual file system (vfs) populated with
// embedded fonts. In v0.3.x `vfs_fonts` default-exports the vfs map directly.
(pdfMake as any).vfs = pdfFonts;

export interface TableQrData {
  tableNumber: string;
  tableName?: string;
  description?: string;
  capacity?: number;
  qrUrl: string;
}

export interface RestaurantPdfInfo {
  name: string;
  address: string;
  logoUrl?: string | null;
  slug?: string;
}

/** Sanitize text for the standard embedded PDF font. */
function sanitizeText(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/\s*\([^)]*(?:branch|post\s+office|b\.?o\.?|p\.?o\.?)[^)]*\)/gi, "")
    .replace(/\b(branch\s+post\s+office|post\s+office|b\.?o\.?|p\.?o\.?)\b/gi, "")
    .replace(/\(\s*\)|\[\s*\]|\{\s*\}/g, "")
    .replace(/[()\[\]{}]/g, "")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/\s+,\s+/g, ", ")
    .replace(/,\s*,/g, ",")
    .replace(/^\s*[,.\-\s]+|[,.\-\s]+$/g, "")
    .trim();
}

/**
 * Render printable A4 QR stickers (2x2 grid) entirely in the browser and
 * trigger a download. Mirrors the old backend pdfmake layout.
 */
export async function downloadQrStickersPdf(
  restaurant: RestaurantPdfInfo,
  tablesList: TableQrData[]
): Promise<void> {
  const pagesCount = Math.max(1, Math.ceil(tablesList.length / 4));
  const content: any[] = [];

  const cleanName = sanitizeText(restaurant.name) || "RESTAURANT";
  const cleanAddress = sanitizeText(restaurant.address) || "DINE-IN ORDER & MENU";

  for (let pageIdx = 0; pageIdx < pagesCount; pageIdx++) {
    const pageTables = tablesList.slice(pageIdx * 4, (pageIdx + 1) * 4);

    const stickerCells: any[] = [];
    for (let i = 0; i < 4; i++) {
      const item = pageTables[i];
      if (item) {
        const qrDataUrl = await QRCode.toDataURL(item.qrUrl, {
          margin: 1,
          width: 360,
          color: { dark: "#0f172a", light: "#ffffff" },
        });

        const cleanTableNum = sanitizeText(item.tableNumber) || item.tableNumber;
        const cleanTableName = sanitizeText(item.tableName);

        stickerCells.push({
          margin: [5, 5, 5, 5],
          table: {
            widths: ["*"],
            body: [
              [
                {
                  fillColor: "#0f172a",
                  margin: [10, 14, 10, 12],
                  alignment: "center",
                  stack: [
                    {
                      text: cleanName.toUpperCase(),
                      fontSize: 14,
                      bold: true,
                      color: "#ffffff",
                      characterSpacing: 1.5,
                      margin: [0, 0, 0, 4],
                    },
                    {
                      text: cleanAddress.toUpperCase(),
                      fontSize: 8.5,
                      bold: true,
                      color: "#94a3b8",
                      characterSpacing: 0.5,
                    },
                  ],
                },
              ],
              [
                {
                  fillColor: "#ffffff",
                  margin: [12, 14, 12, 12],
                  alignment: "center",
                  stack: [
                    {
                      image: qrDataUrl,
                      width: 175,
                      alignment: "center",
                      margin: [0, 4, 0, 8],
                    },
                    {
                      text: "SCAN CAMERA TO ORDER & PAY",
                      fontSize: 8.5,
                      bold: true,
                      color: "#2563eb",
                      characterSpacing: 1,
                      margin: [0, 2, 0, 4],
                    },
                  ],
                },
              ],
              [
                {
                  fillColor: "#f1f5f9",
                  margin: [10, 12, 10, 12],
                  alignment: "center",
                  stack: [
                    {
                      text: `TABLE ${cleanTableNum}`,
                      fontSize: 20,
                      bold: true,
                      color: "#0f172a",
                      characterSpacing: 2,
                      margin: [0, 0, 0, 3],
                    },
                    cleanTableName
                      ? {
                          text: cleanTableName,
                          fontSize: 9.5,
                          bold: true,
                          color: "#475569",
                          margin: [0, 0, 0, 3],
                        }
                      : { text: "", margin: [0, 0, 0, 0] },
                    {
                      text: `SEATING CAPACITY: ${item.capacity || 4} GUESTS`,
                      fontSize: 8.5,
                      bold: true,
                      color: "#64748b",
                      characterSpacing: 0.5,
                    },
                  ],
                },
              ],
              [
                {
                  fillColor: "#0f172a",
                  margin: [8, 8, 8, 8],
                  alignment: "center",
                  stack: [
                    {
                      text: "POWERED BY AHARQR SMART DINING OS",
                      fontSize: 8,
                      bold: true,
                      color: "#38bdf8",
                      characterSpacing: 0.8,
                    },
                  ],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: (lineIndex: number, node: any) =>
              lineIndex === 0 || lineIndex === node.table.body.length ? 1.5 : 1,
            vLineWidth: (lineIndex: number, node: any) =>
              lineIndex === 0 || lineIndex === node.table.widths.length ? 1.5 : 1,
            hLineColor: () => "#cbd5e1",
            vLineColor: () => "#cbd5e1",
          },
        });
      } else {
        stickerCells.push({ text: "", border: [false, false, false, false] });
      }
    }

    content.push({
      table: {
        widths: ["50%", "50%"],
        heights: [410, 410],
        body: [
          [stickerCells[0], stickerCells[1]],
          [stickerCells[2], stickerCells[3]],
        ],
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => "#94a3b8",
        vLineColor: () => "#94a3b8",
        hLineStyle: () => ({ dash: { length: 4, space: 4 } }),
        vLineStyle: () => ({ dash: { length: 4, space: 4 } }),
      },
      pageBreak: pageIdx < pagesCount - 1 ? "after" : undefined,
    });
  }

  const docDefinition: any = {
    pageSize: "A4",
    pageOrientation: "portrait",
    pageMargins: [8, 8, 8, 8],
    defaultStyle: { font: "Roboto" },
    content,
  };

  const filename = `${restaurant.slug ?? "aharqr"}_A4_QR_Stickers.pdf`;
  (pdfMake as any).createPdf(docDefinition).download(filename);
}
