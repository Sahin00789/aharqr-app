import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getDeviceId } from "../../lib/device";

interface GuestProfileData {
  name: string;
  phone: string;
}

interface GuestProfileState extends GuestProfileData {
  setProfile: (profile: GuestProfileData) => void;
}

const legacyStorageKey = "aharqr-guest-profile";
const deviceStorageKey = `${legacyStorageKey}:${getDeviceId()}`;

if (!localStorage.getItem(deviceStorageKey)) {
  const legacyProfile = localStorage.getItem(legacyStorageKey);
  if (legacyProfile) localStorage.setItem(deviceStorageKey, legacyProfile);
}

export const useGuestProfileStore = create<GuestProfileState>()(
  persist(
    (set) => ({
      name: "",
      phone: "",
      setProfile: ({ name, phone }) => set({ name, phone }),
    }),
    {
      name: deviceStorageKey,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ name, phone }) => ({ name, phone }),
    },
  ),
);
