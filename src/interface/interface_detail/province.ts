import { Page } from "./page";

export interface Province {
  _id: string;
  name: string;
  avt: string;
  listPage?: Page[];
}
