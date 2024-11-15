import { ProofData } from "@noir-lang/types";

export interface InitialState {
  name: number;
  photo: string | null;
  photoData: Uint8ClampedArray | null;
  newPhotoData: Uint8ClampedArray | null;
  sign: string;
  proof: null | ProofData;
}

export interface AppState extends InitialState {
  setName: (name: number) => void;
  setPhoto: (photo: string) => void;
  setPhotoData: (photoData: Uint8ClampedArray) => void;
  setNewPhotoData: (newPhotoData: Uint8ClampedArray) => void;
  setSign: (sign: string) => void;
  setProof: (proof: ProofData) => void;
}

export const initialState: InitialState = {
  name: 1,
  photo: null,
  photoData: null,
  newPhotoData: null,
  sign: "",
  proof: null,
};
