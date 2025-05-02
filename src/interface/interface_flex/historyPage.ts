import { MyPhoto } from "../interface_reference";

export interface HistoryPage {
    _id: string;
    idUser: string;
    idPage: {
        _id: string;
        name: string;
        avt: MyPhoto;
    };
    viewDate: number;
    createdAt: number;
}