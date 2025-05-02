import { CLocation } from "./locations";

export interface Trip {
  _id: string;
  name: string;
  startAddress: CLocation;
  listAddress: CLocation[];
  endAddress: CLocation;
  createAt: number;
  updatedAt?: number;
  deleteAt?: number;
}
