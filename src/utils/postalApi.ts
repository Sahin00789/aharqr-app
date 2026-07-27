export interface PostOffice {
  Name: string;
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

/**
 * Fetches Indian Postal Code address options using the free Post PinCode API
 * Endpoint: https://api.postalpincode.in/pincode/{pincode}
 */
export async function lookupPostalCode(pincode: string): Promise<{
  success: boolean;
  state?: string;
  district?: string;
  postOffices?: string[];
  message?: string;
}> {
  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    return { success: false, message: "Pincode must be 6 digits" };
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data: PostalApiResponse[] = await response.json();

    if (!data || data.length === 0 || data[0].Status !== "Success" || !data[0].PostOffice) {
      return { success: false, message: data[0]?.Message || "Invalid Pincode" };
    }

    const postOffices = data[0].PostOffice;
    const firstPo = postOffices[0];

    const officeNames = postOffices.map((po) => `${po.Name} (${po.BranchType})`);

    return {
      success: true,
      state: firstPo.State,
      district: firstPo.District,
      postOffices: officeNames,
    };
  } catch (error) {
    console.error("Postal API lookup error:", error);
    return { success: false, message: "Failed to connect to Postal API" };
  }
}
