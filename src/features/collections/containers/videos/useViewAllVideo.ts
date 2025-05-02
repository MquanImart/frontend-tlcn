import { MyPhoto } from "@/src/interface/interface_flex";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const useViewAllVideo = () => {
    const [thumbnails, setThumbnails] = useState<(string | null)[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<MyPhoto | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);

    const [dataVideo, setDataVideo] = useState<MyPhoto[] | null>(null);

    useEffect(() => {
        getVideo();
    },[]);

    const getVideo = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        const myPhotoAPI = restClient.apiClient.service(`apis/myphotos/${userId}/user`);
        const listImages = await myPhotoAPI.find({type: "video"})
        setDataVideo(listImages.data);
    }
    const closeModal = () => {
        setModalVisible(false);
        setSelectedPhoto(null);
    };

    const handleSelectedPhoto = (_id: string) => {
        if (dataVideo !== null){
            const selected = dataVideo.find(photo => photo._id === _id);
            if (selected) {
              setSelectedPhoto(selected);
              setModalVisible(true);
            }
        }
    };

    return {
        thumbnails, setThumbnails,
        handleSelectedPhoto,
        selectedPhoto, isModalVisible,
        closeModal, dataVideo
    }
}

export default useViewAllVideo;