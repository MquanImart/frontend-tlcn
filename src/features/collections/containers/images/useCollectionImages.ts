import { MyPhoto } from "@/src/interface/interface_flex";
import { useEffect, useState } from "react";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useCollectionImages = () => {
    const [viewAll, setviewAll] = useState<boolean>(false);
    const [currentView, setCurrentView] = useState<string>("Ảnh đại diện");
    const [selectedPhoto, setSelectedPhoto] = useState<MyPhoto | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);

    const [dataImagesAvt, setdataImagesAvt] = useState<MyPhoto[] | null>(null);
    const [dataImages, setdataImages] = useState<MyPhoto[] | null>(null);

    const [selectedData, setSelectedData] = useState<MyPhoto[] | null>(null);

    useEffect(() => {
        getDataImages();
        getDataImagesAvt();
    }, []);

    const getDataImages = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        const myPhotoAPI = restClient.apiClient.service(`apis/myphotos/${userId}/user`);
        const listImages = await myPhotoAPI.find({type: "img"})
        setdataImages(listImages.data);
    }

    const getDataImagesAvt = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        const myPhotoAPI = restClient.apiClient.service(`apis/users/${userId}/avt`);
        const listImages = await myPhotoAPI.find({type: "img"})
        setdataImagesAvt(listImages.data);
    }

    const handleViewAll = (tab: string) => {
        setviewAll(!viewAll);
        setCurrentView(tab);
        if (tab === "Ảnh đại diện"){
            setSelectedData(dataImagesAvt);
        }
        else if (tab === "Ảnh tải lên"){
            setSelectedData(dataImages);
        }
    }

    const handleSelectedPhoto = (_id: string) => {
        if (dataImages !== null){
            const selected = dataImages.find(photo => photo._id === _id);
            if (selected) {
              setSelectedPhoto(selected);
              setModalVisible(true);
            }
        }
        if (dataImagesAvt !== null){
            const selected = dataImagesAvt.find(photo => photo._id === _id);
            if (selected) {
              setSelectedPhoto(selected);
              setModalVisible(true);
            }
        }
    };

    const closeModal = () => {
      setModalVisible(false);
      setSelectedPhoto(null);
    };
    return {
        dataImages, dataImagesAvt,
        viewAll, setviewAll,
        currentView, setCurrentView,
        selectedPhoto, setSelectedPhoto,
        isModalVisible, setModalVisible,
        handleViewAll,
        handleSelectedPhoto,
        closeModal, selectedData
    }
}

export default useCollectionImages;