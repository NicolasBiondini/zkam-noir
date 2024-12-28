import { create } from "zustand";
import { InitialState, AppState, initialState } from "./state";

const getInitialStorageState = (): InitialState => {
  return initialState;
};

export const useAppState = create<AppState>()((set) => ({
  ...getInitialStorageState(),
  setName: (name) => {
    set((state) => ({ ...state, name }));
  },
  setPhoto: (photo) => {
    set((state) => ({ ...state, photo }));
  },
  setPhotoData: (photoData) => {
    set((state) => ({ ...state, photoData }));
  },
  setNewPhotoData: (newPhotoData) => {
    set((state) => ({ ...state, newPhotoData }));
  },
  setSign: (sign) => {
    set((state) => ({ ...state, sign }));
  },
  setProof: (proof) => {
    set((state) => ({ ...state, proof }));
  },
}));
