import { useState } from "react";
import { Article, Comment, User, Group, Address, MyPhoto } from "@/src/features/newfeeds/interface/article";
import { v4 as uuidv4 } from 'uuid'; 

export const addresses: Address[] = [
    {
      _id: "address1",
      province: "Lâm Đồng",
      district: "Đà Lạt",
      ward: "Phường 10",
      street: "Nguyễn Trãi",
      placeName: "Thung Lũng Tình Yêu",
      lat: 11.923,
      long: 108.433,
    },
    {
      _id: "address2",
      province: "Hà Nội",
      district: "Hoàn Kiếm",
      ward: "Phường Tràng Tiền",
      street: "Hàng Bài",
      placeName: "Hồ Gươm",
      lat: 21.028,
      long: 105.853,
    },
  ];
  // Fake Photos
  export  const photos: MyPhoto[] = [
    {
      _id: "photo1",
      name: "Sunset in Đà Lạt",
      idAuthor: {} as User,
      type: "img",
      url: "https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/176940/Originals/avatar-phi-hanh-gia-8.jpeg",
      createdAt: Date.now(),
      updateAt: Date.now(),
    },
    {
      _id: "photo2",
      name: "Hồ Gươm Morning",
      idAuthor: {} as User,
      type: "img",
      url: "https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/176940/Originals/avatar-phi-hanh-gia-8.jpeg",
      createdAt: Date.now(),
      updateAt: Date.now(),
    },
  ];
  export const userss: User = 
  {
    _id: "user1",
    displayName: "Nguyễn Văn A",
    hashtag: "#travel",
    address: addresses[0],
    avt: [photos[0]], // Ánh xạ ảnh từ `photos`
    aboutMe: "Tôi sẽ đi du lịch khắp thế giới. Cùng tôi khám phá và vỡi nhiều điều mới mẻ.",
    createdAt: Date.now(),
    hobbies: [],
    friends: [],
    articles: [],
    follow: [],
    setting: {
      profileVisibility: true,
      allowMessagesFromStrangers: true,
    },
  }
;
