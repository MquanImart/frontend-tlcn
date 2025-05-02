import { MyPhoto } from "@/src/interface/interface_flex";
import restClient from "@/src/shared/services/RestClient";
import { useEffect, useState } from "react";

const useViewAllVideo = (userId: string) => { // Thêm userId như một tham số
    const [thumbnails, setThumbnails] = useState<(string | null)[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<MyPhoto | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [dataVideo, setDataVideo] = useState<MyPhoto[] | null>(null);

    useEffect(() => {
        if (userId) { // Kiểm tra userId trước khi gọi API
            getVideo();
        }
    }, [userId]); // Thêm userId vào dependency array để useEffect chạy lại khi userId thay đổi

    const getVideo = async () => {
        try {
            const myPhotoAPI = restClient.apiClient.service(`apis/myphotos/${userId}/user`);
            const listImages = await myPhotoAPI.find({ type: "video" });
            setDataVideo(listImages.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách video:", error);
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedPhoto(null);
    };

    const handleSelectedPhoto = (_id: string) => {
        if (dataVideo !== null) {
            const selected = dataVideo.find(photo => photo._id === _id);
            if (selected) {
                setSelectedPhoto(selected);
                setModalVisible(true);
            }
        }
    };

    return {
        thumbnails,
        setThumbnails,
        handleSelectedPhoto,
        selectedPhoto,
        isModalVisible,
        closeModal,
        dataVideo
    };
};

export default useViewAllVideo;