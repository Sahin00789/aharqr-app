/**
 * Device identity: a UUID generated once per browser and kept in
 * localStorage. Sent as x-device-id on auth calls so the backend can
 * bind refresh sessions to this device.
 */
const STORAGE_KEY = "aharqr.deviceId";

export function getDeviceId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
            .toString(36)
            .slice(2)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
