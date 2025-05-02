export interface Address {
    _id?: string;
    province: string;
    district: string;
    ward: string;
    street: string;
    placeName?: string;
    lat?: number | null;
    long?: number | null ;
  }
  