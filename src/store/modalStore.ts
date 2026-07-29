import { create } from "zustand";

export type ModalType = 
  | "DISH_AVAILABILITY"
  | "ATTENDANCE_SCANNER"
  | "CHEF_MENU"
  | "ADMIN_MENU"
  | "CAPTAIN_MENU"
  | null;

interface ModalState {
  activeModal: ModalType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modalData: Record<string, any> | null;
  
  // Actions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openModal: (type: ModalType, data?: Record<string, any>) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,
  modalData: null,

  openModal: (type, data = null) => set({ activeModal: type, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}));
