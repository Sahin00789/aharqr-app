/**
 * Fetch an image (same-origin app asset, Cloudinary URL, …) and convert it to a
 * data URL so `@react-pdf/renderer` can embed it into a PDF without relying on
 * network/CORS access while the document renders.
 *
 * Returns `null` when the request fails or the response isn't an image.
 */
export async function imageUrlToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) {
      return null;
    }
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
