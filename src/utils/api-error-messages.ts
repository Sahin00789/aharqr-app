/**
 * Human-readable API error copy shared by both HTTP clients:
 *   - `services/api-client.ts` (fetch)
 *   - `api/client.ts` (axios)
 *
 * The backend always sends `{ error, message }` for known failures, but a
 * reverse proxy (nginx / Vite dev proxy) can answer with an HTML page when the
 * API is down. In that case there is no JSON body, so we fall back to these
 * messages instead of exposing raw text such as "Request failed (502)".
 */

export const OFFLINE_MESSAGE =
  "You appear to be offline. Check your internet connection and try again.";

export const NETWORK_MESSAGE =
  "We can't reach the AharQR server right now. Check your connection and try again in a moment.";

export function messageForStatus(status: number): string {
  switch (status) {
    case 400:
      return "The request could not be processed. Check the details and try again.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You don't have permission to do that.";
    case 404:
      return "We couldn't find what you were looking for.";
    case 409:
      return "That action conflicts with the current state. Refresh and try again.";
    case 413:
      return "That file is too large to upload.";
    case 415:
      return "That file type is not supported.";
    case 422:
      return "Some details are invalid. Check them and try again.";
    case 429:
      return "Too many attempts. Please wait a moment and try again.";
    case 502:
      return "The AharQR server is unreachable right now (502 Bad Gateway). Please try again in a moment.";
    case 503:
      return "The AharQR server is temporarily unavailable (503). Please try again in a moment.";
    case 504:
      return "The AharQR server took too long to respond (504). Please try again.";
    default:
      if (status >= 500) {
        return "Something went wrong on our side. Please try again.";
      }
      if (status === 0) return NETWORK_MESSAGE;
      return `The request failed (${status}). Please try again.`;
  }
}
