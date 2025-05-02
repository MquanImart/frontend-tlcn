import { MyPhoto } from "@/src/interface/interface_flex";
import { useEffect, useState } from "react";
import restClient from "@/src/shared/services/RestClient";

const useCollectionImages = (userId: string) => { // Thêm userId như một tham số
    const [viewAll, setViewAll] = useState<boolean>(false);
    const [currentView, setCurrentView] = useState<string>("Ảnh đại diện");
    const [selectedPhoto, setSelectedPhoto] = useState<MyPhoto | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);

    const [dataImagesAvt, setDataImagesAvt] = useState<MyPhoto[] | null>(null);
    const [dataImages, setDataImages] = useState<MyPhoto[] | null>(null);

    const [selectedData, setSelectedData] = useState<MyPhoto[] | null>(null);

    useEffect(() => {
        if (userId) { // Kiểm tra userId trước khi gọi API
            getDataImages();
            getDataImagesAvt();
        }
    }, [userId]); // Thêm userId vào dependency array để chạy lại khi userId thay đổi

    const getDataImages = async () => {
        try {
            const myPhotoAPI = restClient.apiClient.service(`apis/myphotos/${userId}/user`);
            const listImages = await myPhotoAPI.find({ type: "img" });
            setDataImages(listImages.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách ảnh tải lên:", error);
        }
    };

    const getDataImagesAvt = async () => {
        try {
            const myPhotoAPI = restClient.apiClient.service(`apis/users/${userId}/avt`);
            const listImages = await myPhotoAPI.find({ type: "img" });
            setDataImagesAvt(listImages.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách ảnh đại diện:", error);
        }
    };

    const handleViewAll = (tab: string) => {
        setViewAll(!viewAll);
        setCurrentView(tab);
        if (tab === "Ảnh đại diện") {
            setSelectedData(dataImagesAvt);
        } else if (tab === "Ảnh tải lên") {
            setSelectedData(dataImages);
        }
    };

    const handleSelectedPhoto = (_id: string) => {
        if (dataImages !== null) {
            const selected = dataImages.find(photo => photo._id === _id);
            if (selected) {
                setSelectedPhoto(selected);
                setModalVisible(true);
                return;
            }
        }
        if (dataImagesAvt !== null) {
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
        dataImages,
        dataImagesAvt,
        viewAll,
        setViewAll,
        currentView,
        setCurrentView,
        selectedPhoto,
        setSelectedPhoto,
        isModalVisible,
        setModalVisible,
        handleViewAll,
        handleSelectedPhoto,
        closeModal,
        selectedData // Thêm selectedData vào return nếu cần sử dụng
    };
};

export default useCollectionImages;