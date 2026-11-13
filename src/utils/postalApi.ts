export interface PostOffice {
  Name: string;
  Block: string | null;
  Description: string | null;
  BranchType: string;
  DeliveryStatus: string;
  Circle: string;
  District: string;
  Division: string;
  Region: string;
  State: string;
  Country: string;
  Pincode: string;
}

export interface PostalApiResponse {
  Message: string;
  Status: "Success" | "Error";
  PostOffice: PostOffice[] | null;
}

export interface PostalLookupResult {
  success: boolean;
  state?: string;
  district?: string;
  block?: string;
  blocks?: string[];
  villages?: string[];
  offices?: PostOffice[];
  message?: string;
}

function normalizeValue(value: string | null | undefined): string | null {
  const cleaned = value?.trim();
  return cleaned && cleaned.toLowerCase() !== "na" ? cleaned : null;
}

/**
 * Fetches Indian Postal Code address options using the free Post PinCode API
 * Endpoint: https://api.postalpincode.in/pincode/{pincode}
 * On success returns the full post-office list so the UI can offer a
 * Village/Town + Area dropdown and auto-fill District, State and Block.
 */
export async function lookupPostalCode(
  pincode: string
): Promise<PostalLookupResult> {
  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    return { success: false, message: "Pincode must be 6 digits" };
  }

  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`
    );
    if (!response.ok) {
      return {
        success: false,
        message: `Postal API responded with ${response.status}`,
      };
    }

    const data: PostalApiResponse[] = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return { success: false, message: "Invalid Pincode" };
    }

    const payload = data[0];
    if (
      payload.Status !== "Success" ||
      !Array.isArray(payload.PostOffice) ||
      payload.PostOffice.length === 0
    ) {
      return { success: false, message: payload.Message || "Invalid Pincode" };
    }

    const offices = payload.PostOffice.filter((po) => po?.Name);
    const firstPo =
      offices.find((po) => po.State || po.District || po.Block) ?? offices[0];
    const state = normalizeValue(firstPo?.State) ?? "";
    const district = normalizeValue(firstPo?.District) ?? "";
    const block = normalizeValue(firstPo?.Block) ?? "";

    const villages = Array.from(
      new Set(
        offices
          .map((po) => normalizeValue(po.Name))
          .filter((value): value is string => Boolean(value))
      )
    );

    const blocks = Array.from(
      new Set(
        offices
          .map((po) => normalizeValue(po.Block))
          .filter((value): value is string => Boolean(value))
      )
    );

    return {
      success: true,
      state: state || undefined,
      district: district || undefined,
      block: block || undefined,
      blocks: blocks.length ? blocks : undefined,
      villages: villages.length ? villages : undefined,
      offices,
    };
  } catch (error) {
    console.error("Postal API lookup error:", error);
    return { success: false, message: "Failed to connect to Postal API" };
  }
}
