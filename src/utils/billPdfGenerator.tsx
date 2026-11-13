/* eslint-disable react-refresh/only-export-components -- PDF module exports shared styles/data types next to the document component. */
import {
  Document,
  Image,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

export interface BillItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/** Structured restaurant address (Indian address fields from the profile). */
export interface BillRestaurantAddress {
  premisesName?: string | null;
  street?: string | null;
  locality?: string | null;
  villageWard?: string | null;
  blockMunicipality?: string | null;
  townCity?: string | null;
  district?: string | null;
  state?: string | null;
  postalCode?: string | null;
}

/** Header identity printed on the bill (restaurant side). */
export interface BillRestaurant {
  name?: string | null;
  logo?: string | null;
  address?: string | null;
  addressParts?: BillRestaurantAddress | null;
  phone?: string | null;
  email?: string | null;
}

export interface BillData {
  orderNumber: string;
  tableNumber?: string;
  customerName?: string;
  orderType: 'DINE_IN' | 'TAKEAWAY';
  items: BillItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  gstRate?: number;
  showTaxBreakdown?: boolean;
  taxMode?: 'INCLUSIVE' | 'EXCLUSIVE';
  paymentStatus?: string;
  status?: string;
  createdAt: string;
  restaurant?: BillRestaurant;
}

/** Helvetica has no rupee glyph, so bills use `Rs.` to avoid broken output. */
const formatINR = (amount: number): string => {
  return `Rs. ${Number(amount).toFixed(2)}`;
};

export const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#334155',
    backgroundColor: '#ffffff',
  },
  band: {
    height: 4,
    backgroundColor: '#2563eb',
  },
  body: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '72%',
    flexShrink: 1,
    paddingRight: 8,
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 6,
    objectFit: 'contain',
    borderRadius: 6,
  },
  brandText: {
    flexShrink: 1,
  },
  brandName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 0.4,
  },
  brandSub: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  addressLine: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 9,
  },
  contactLine: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 2,
  },
  docBlock: {
    alignItems: 'flex-end',
  },
  docInvoice: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  docMeta: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 1,
    lineHeight: 10,
  },
  hairline: {
    height: 0.5,
    backgroundColor: '#e2e8f0',
    marginVertical: 9,
  },
  billedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billedCol: {
    flexShrink: 1,
    paddingRight: 8,
  },
  payCol: {
    alignItems: 'flex-end',
    paddingRight: 0,
  },
  blockLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 0.6,
  },
  blockValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 2,
  },
  blockSub: {
    fontSize: 8.5,
    color: '#64748b',
    marginTop: 1,
  },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 4,
    marginTop: 10,
  },
  thItem: {
    flex: 1,
    fontSize: 7,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 0.4,
  },
  thQty: {
    width: 26,
    fontSize: 7,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 0.4,
    textAlign: 'right',
  },
  thRate: {
    width: 46,
    fontSize: 7,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 0.4,
    textAlign: 'right',
  },
  thAmt: {
    width: 56,
    fontSize: 7,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 0.4,
    textAlign: 'right',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  itemName: {
    flex: 1,
    fontSize: 8.5,
    color: '#1e293b',
  },
  itemQty: {
    width: 26,
    fontSize: 8.5,
    color: '#475569',
    textAlign: 'right',
  },
  itemRate: {
    width: 46,
    fontSize: 8.5,
    color: '#475569',
    textAlign: 'right',
  },
  itemAmt: {
    width: 56,
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'right',
  },
  totalsWrap: {
    marginTop: 10,
    alignSelf: 'flex-end',
    width: 180,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2.5,
  },
  totalsLabel: {
    fontSize: 8.5,
    color: '#64748b',
  },
  totalsValue: {
    fontSize: 8.5,
    color: '#0f172a',
  },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  grandLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  grandValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  footer: {
    marginTop: 18,
    alignItems: 'center',
  },
  thankYou: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  footerRule: {
    width: 90,
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 8,
  },
  poweredBrand: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#2563eb',
    letterSpacing: 0.6,
  },
});

export function BillPdfDocument({ bill }: { bill: BillData }) {
  const showTax =
    Boolean(bill.showTaxBreakdown) &&
    Number(bill.gstRate ?? 0) > 0 &&
    Number(bill.taxAmount) > 0;
  const inclusive =
    Math.abs(Number(bill.totalAmount) - Number(bill.subtotal)) < 0.005;
  const gstRate = bill.gstRate ?? 5;
  const paid = (bill.paymentStatus ?? '').toUpperCase() === 'PAID';

  const created = new Date(bill.createdAt);
  const restaurantName = bill.restaurant?.name?.trim() || 'AharQR';

  const parts = bill.restaurant?.addressParts;
  const shortAddress =
    (parts &&
      ([parts.villageWard, parts.blockMunicipality, parts.district, parts.state]
        .filter(Boolean)
        .join(', ') ||
        [parts.townCity, parts.locality, parts.district, parts.state]
          .filter(Boolean)
          .join(', '))) ||
    (bill.restaurant?.address ?? '').trim();

  const contact =
    [bill.restaurant?.phone ? `Ph: ${bill.restaurant.phone}` : null, bill.restaurant?.email ?? null]
      .filter(Boolean)
      .join('  |  ') || null;

  return (
    <Document
      title={`Bill ${bill.orderNumber}`}
      author={restaurantName}
      subject={`Bill ${bill.orderNumber}`}
    >
      <Page size="A5" style={styles.page}>
        <View style={styles.band} />
        <View style={styles.body}>
          {/* Letterhead */}
          <View style={styles.headerRow}>
            <View style={styles.brand}>
              {bill.restaurant?.logo ? (
                <Image src={bill.restaurant.logo} style={styles.logo} />
              ) : null}
              <View style={styles.brandText}>
                <Text style={styles.brandName}>{restaurantName}</Text>
                <Text style={styles.brandSub}>TAX INVOICE</Text>
                {shortAddress ? (
                  <Text style={styles.addressLine}>{shortAddress}</Text>
                ) : null}
                {contact ? <Text style={styles.contactLine}>{contact}</Text> : null}
              </View>
            </View>

            <View style={styles.docBlock}>
              <Text style={styles.docInvoice}>#{bill.orderNumber}</Text>
              <Text style={styles.docMeta}>{created.toLocaleDateString()}</Text>
              <Text style={styles.docMeta}>
                {created.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          <View style={styles.hairline} />

          {/* Billed to / Payment */}
          <View style={styles.billedRow}>
            <View style={styles.billedCol}>
              <Text style={styles.blockLabel}>BILLED TO</Text>
              <Text style={styles.blockValue}>
                {bill.customerName || 'Walk-in guest'}
              </Text>
              {bill.tableNumber ? (
                <Text style={styles.blockSub}>Table {bill.tableNumber}</Text>
              ) : null}
            </View>
            <View style={[styles.billedCol, styles.payCol]}>
              <Text style={styles.blockLabel}>PAYMENT</Text>
              <Text style={[styles.blockValue, { color: paid ? '#16a34a' : '#ea580c' }]}>
                {bill.paymentStatus ? bill.paymentStatus.replace(/_/g, ' ') : '—'}
              </Text>
              <Text style={styles.blockSub}>
                {bill.orderType === 'DINE_IN' ? 'Dine-in' : 'Takeaway'}
              </Text>
            </View>
          </View>

          {/* Items */}
          <View style={styles.itemsHeader}>
            <Text style={styles.thItem}>Item</Text>
            <Text style={styles.thQty}>Qty</Text>
            <Text style={styles.thRate}>Rate</Text>
            <Text style={styles.thAmt}>Amt</Text>
          </View>
          {bill.items.map((item, i) => (
            <View key={i} style={styles.itemRow} wrap={false}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQty}>{item.quantity}</Text>
              <Text style={styles.itemRate}>{formatINR(item.unitPrice)}</Text>
              <Text style={styles.itemAmt}>{formatINR(item.totalPrice)}</Text>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.totalsWrap}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatINR(bill.subtotal)}</Text>
            </View>
            {showTax ? (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>
                  GST ({gstRate}%{inclusive ? ' inc.' : ''})
                </Text>
                <Text style={styles.totalsValue}>{formatINR(bill.taxAmount)}</Text>
              </View>
            ) : null}
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>TOTAL</Text>
              <Text style={styles.grandValue}>{formatINR(bill.totalAmount)}</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.thankYou}>Thank you for dining with us!</Text>
            <View style={styles.footerRule} />
            <Text style={styles.poweredBrand}>AharQR</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

/**
 * Fetch a remote logo (e.g. Cloudinary) and convert it to a data URL so
 * @react-pdf can embed it into the PDF without relying on network/CORS at
 * render time. Returns null if the image can't be fetched cleanly.
 */
export async function logoToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok || !res.headers.get('content-type')?.startsWith('image/')) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
    return dataUrl;
  } catch {
    return null;
  }
}

/** File name used for downloads/shares, e.g. `Bill_ORD-102.pdf`. */
export function billFileName(bill: BillData): string {
  return `Bill_${bill.orderNumber}.pdf`;
}

/** Render the bill to a PDF Blob entirely client-side (no backend needed). */
export async function generateBillBlob(bill: BillData): Promise<Blob> {
  return pdf(<BillPdfDocument bill={bill} />).toBlob();
}

/** Trigger a browser download for an already-generated PDF blob. */
export function downloadBillBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Open the browser print dialog for the bill PDF using a hidden iframe —
 * works without a popup being blocked and without leaving the app.
 *
 * The iframe is laid out at full A5 size (off-screen) and the print call is
 * deferred so the PDF viewer has time to render the first page before the
 * dialog opens (printing a PDF in a 0x0 iframe produces a blank sheet).
 */
export function printBillBlob(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.left = '-10000px';
  iframe.style.top = '0';
  iframe.style.width = '148mm';
  iframe.style.height = '210mm';
  iframe.style.border = '0';
  iframe.style.background = '#ffffff';
  iframe.src = url;
  iframe.onload = () => {
    const fire = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        /* viewer not ready yet */
      }
    };
    setTimeout(fire, 250);
    setTimeout(fire, 1200);
  };
  document.body.appendChild(iframe);
  setTimeout(() => {
    iframe.remove();
    URL.revokeObjectURL(url);
  }, 60_000);
}
