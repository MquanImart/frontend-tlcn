export interface Trip {
    _id: string;
    name: string;
    startAddress: string;
    listAddress: string[];
    endAddress: string;
    createAt: number;
    updatedAt?: number;
    deleteAt?: number;
  }
  