/**
 * Frontend Device Utility
 * Collects client device details, OS platform, browser, and persistent fingerprint
 */
export interface DeviceInfo {
  fingerprint: string;
  deviceName: string;
  platform: string;
  browser: string;
  userAgent: string;
}

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === "undefined") {
    return {
      fingerprint: "server-side-rendering",
      deviceName: "Server Render",
      platform: "Web",
      browser: "Node",
      userAgent: "Server",
    };
  }

  const userAgent = navigator.userAgent || "";

  // Platform Detection
  let platform = "Web";
  if (/Android/i.test(userAgent)) platform = "Android";
  else if (/iPhone|iPad|iPod/i.test(userAgent)) platform = "iOS";
  else if (/Win/i.test(userAgent)) platform = "Windows";
  else if (/Mac/i.test(userAgent)) platform = "macOS";
  else if (/Linux/i.test(userAgent)) platform = "Linux";

  // Browser Detection
  let browser = "Browser";
  if (/Edg/i.test(userAgent)) browser = "Edge";
  else if (/Chrome/i.test(userAgent)) browser = "Chrome";
  else if (/Firefox/i.test(userAgent)) browser = "Firefox";
  else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = "Safari";

  // Device Name
  const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
  const deviceName = `${browser} on ${platform} (${isMobile ? "Mobile" : "Desktop"})`;

  // Persistent Client Fingerprint in localStorage
  let fingerprint = localStorage.getItem("aharqr_device_fingerprint");
  if (!fingerprint) {
    const screenRes = typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height}` : "1024x768";
    const rawId = `${platform}-${browser}-${screenRes}-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    try {
      fingerprint = btoa(rawId).replace(/[^a-zA-Z0-9]/g, "").substring(0, 32);
    } catch {
      fingerprint = `fp_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    }
    localStorage.setItem("aharqr_device_fingerprint", fingerprint);
  }

  return {
    fingerprint,
    deviceName,
    platform,
    browser,
    userAgent,
  };
}
