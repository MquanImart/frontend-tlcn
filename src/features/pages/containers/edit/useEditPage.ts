import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { Platform } from "react-native";
import { Address, Page, MyPhoto, Hobbies } from "@/src/interface/interface_reference";
import restClient from "@/src/shared/services/RestClient";
import { NavigationProp } from "@react-navigation/native";
import { PageStackParamList } from "@/src/shared/routes/PageNavigation";

const hobbiesClient = restClient.apiClient.service("apis/hobbies");
const pagesClient = restClient.apiClient.service("apis/pages");
const myPhotosClient = restClient.apiClient.service("apis/myphotos");
const addressesClient = restClient.apiClient.service("apis/addresses");

export const useEditPage = (page: Page, navigation: NavigationProp<PageStackParamList>) => {
  const [pageName, setPageName] = useState(page.name || "");
  const [avtUri, setAvtUri] = useState<string | null>(null);
  const [address, setAddress] = useState<Address>(
    page.address
      ? { _id: page.address, province: "", district: "", ward: "", street: "", placeName: "", lat: null, long: null }
      : { _id: "", province: "", district: "", ward: "", street: "", placeName: "", lat: null, long: null }
  );
  const [timeOpen, setTimeOpen] = useState<Date | null>(
    page.timeOpen
      ? (() => {
          const [hours, minutes] = page.timeOpen.split(":").map(Number);
          const date = new Date();
          date.setHours(hours);
          date.setMinutes(minutes);
          date.setSeconds(0);
          date.setMilliseconds(0);
          return date;
        })()
      : null
  );
  const [timeClose, setTimeClose] = useState<Date | null>(
    page.timeClose
      ? (() => {
          const [hours, minutes] = page.timeClose.split(":").map(Number);
          const date = new Date();
          date.setHours(hours);
          date.setMinutes(minutes);
          date.setSeconds(0);
          date.setMilliseconds(0);
          return date;
        })()
      : null
  );
  const [hobbyOpen, setHobbyOpen] = useState(false);
  const [hobbies, setHobbies] = useState<{ label: string; value: string }[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(page.hobbies || []);
  const [showTimeOpenPicker, setShowTimeOpenPicker] = useState(false);
  const [showTimeClosePicker, setShowTimeClosePicker] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get("https://provinces.open-api.vn/api/p/");
        setProvinces(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tỉnh:", error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (page.avt) {
          const photoResponse = await myPhotosClient.get(page.avt);
          if (photoResponse.success && photoResponse.data) {
            setAvtUri((photoResponse.data as MyPhoto).url);
          }
        }

        const hobbyResponse = await hobbiesClient.find({});
        if (hobbyResponse.success) {
          setHobbies(
            hobbyResponse.data.map((hobby: Hobbies) => ({
              label: hobby.name,
              value: hobby._id,
            }))
          );
        }

        if (page.address) {
          const addressResponse = await addressesClient.get(page.address);
          if (addressResponse.success && addressResponse.data) {
            const fetchedAddress = addressResponse.data as Address;
            setAddress(fetchedAddress);
            await fetchCoordinates(fetchedAddress);

            const provinceName = fetchedAddress.province;
            const province = provinces.find((p) => p.name === provinceName);
            if (province) {
              const districtResponse = await axios.get(
                `https://provinces.open-api.vn/api/p/${province.code}?depth=2`
              );
              const fetchedDistricts = districtResponse.data.districts || [];
              setDistricts(fetchedDistricts);

              const districtName = fetchedAddress.district;
              const district = fetchedDistricts.find((d: any) => d.name === districtName);
              if (district) {
                const wardResponse = await axios.get(
                  `https://provinces.open-api.vn/api/d/${district.code}?depth=2`
                );
                setWards(wardResponse.data.wards || []);
              }
            }
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu ban đầu:", error);
      }
    };
    fetchInitialData();
  }, [page._id, page.address, page.avt, provinces]);

  const fetchCoordinates = async (updatedAddress: Address) => {
    const { province, district, ward, street } = updatedAddress;
    if (province && district && ward) {
      try {
        const query = street
          ? `${street}, ${ward}, ${district}, ${province}, Vietnam`
          : `${ward}, ${district}, ${province}, Vietnam`;
        const apiKey = "AIzaSyCpFSD5ZJ7Ic8LDp0LKmwS70l9PzRtaMKY";
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`
        );

        if (response.data.results.length > 0) {
          const { lat, lng } = response.data.results[0].geometry.location;
          setAddress((prev) => ({
            ...prev,
            lat: parseFloat(lat),
            long: parseFloat(lng),
          }));
        } else {
          console.warn("Không tìm thấy tọa độ cho địa chỉ:", query);
        }
      } catch (error) {
        console.error("Lỗi khi lấy tọa độ từ Google Maps API:", error);
      }
    }
  };

  const handleProvinceChange = async (provinceCode: string) => {
    const provinceName = provinces.find((p) => p.code === parseInt(provinceCode))?.name || "";
    const updatedAddress = {
      ...address,
      province: provinceName,
      district: "",
      ward: "",
      street: "",
      lat: null,
      long: null,
    };
    setAddress(updatedAddress);
    setDistricts([]);
    setWards([]);
    if (provinceCode) {
      try {
        const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        setDistricts(response.data.districts || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách huyện:", error);
      }
    }
    setShowProvinceModal(false);
  };

  const handleDistrictChange = async (districtCode: string) => {
    const districtName = districts.find((d) => d.code === parseInt(districtCode))?.name || "";
    const updatedAddress = {
      ...address,
      district: districtName,
      ward: "",
      lat: null,
      long: null,
    };
    setAddress(updatedAddress);
    setWards([]);
    if (districtCode) {
      try {
        const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        setWards(response.data.wards || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách xã:", error);
      }
    }
    setShowDistrictModal(false);
  };

  const handleWardChange = async (wardCode: string) => {
    const wardName = wards.find((w) => w.code === parseInt(wardCode))?.name || "";
    const updatedAddress = { ...address, ward: wardName };
    setAddress(updatedAddress);
    await fetchCoordinates(updatedAddress);
    setShowWardModal(false);
  };

  const handleStreetChange = (street: string) => {
    const updatedAddress = { ...address, street, lat: null, long: null };
    setAddress(updatedAddress);
    fetchCoordinates(updatedAddress);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Cần cấp quyền để truy cập thư viện ảnh!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets) {
      setAvtUri(result.assets[0].uri);
    }
  };

  const onTimeOpenChange = (event: any, selectedTime?: Date) => {
    if (event.type === "set" && selectedTime) {
      const adjustedTime = new Date();
      adjustedTime.setHours(selectedTime.getHours());
      adjustedTime.setMinutes(selectedTime.getMinutes());
      adjustedTime.setSeconds(0);
      adjustedTime.setMilliseconds(0);
      setTimeOpen(adjustedTime);
      setShowTimeOpenPicker(false);
    } else if (event.type === "dismissed") {
      setShowTimeOpenPicker(false);
    }
  };
  
  const onTimeCloseChange = (event: any, selectedTime?: Date) => {
    if (event.type === "set" && selectedTime) {
      const adjustedTime = new Date();
      adjustedTime.setHours(selectedTime.getHours());
      adjustedTime.setMinutes(selectedTime.getMinutes());
      adjustedTime.setSeconds(0);
      adjustedTime.setMilliseconds(0);
      setTimeClose(adjustedTime);
      setShowTimeClosePicker(false);
    } else if (event.type === "dismissed") {
      setShowTimeClosePicker(false);
    }
  };

  const formatTime = (time: Date | null) => {
    if (!time) return "Chọn giờ";
    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleUpdatePage = async () => {
    if (
      !pageName ||
      !address.province ||
      !address.district ||
      !address.ward ||
      !address.street ||
      !timeOpen ||
      !timeClose
    ) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc!");
      return;
    }

    setIsLoading(true);

    try {
      let addressId = address._id;
      let avtId = page.avt;

      const addressData: Address = {
        _id: addressId,
        province: address.province,
        district: address.district,
        ward: address.ward,
        street: address.street,
        placeName: address.placeName || "",
        lat: address.lat,
        long: address.long,
      };

      if (addressId) {
        const addressResponse = await addressesClient.patch(addressId, addressData);
        if (!addressResponse.success) throw new Error("Cập nhật địa chỉ thất bại");
      } else {
        const addressResponse = await addressesClient.create(addressData);
        if (addressResponse.success) addressId = addressResponse.data._id;
        else throw new Error("Tạo địa chỉ thất bại");
      }

      if (avtUri && avtUri !== (page.avt ? (await myPhotosClient.get(page.avt)).data.url : null)) {
        const formData = new FormData();
        formData.append("type", "img");
        formData.append("idAuthor", page.idCreater);
        formData.append("photo", {
          uri: avtUri,
          name: "avatar.png",
          type: "image/png",
        } as any);

        const photoResponse = avtId
          ? await myPhotosClient.patch(avtId, formData)
          : await myPhotosClient.create(formData);
        if (photoResponse.success) avtId = photoResponse.data._id;
        else throw new Error("Cập nhật ảnh đại diện thất bại");
      }

      const pageData = {
        name: pageName,
        address: addressId,
        timeOpen: formatTime(timeOpen),
        timeClose: formatTime(timeClose),
        hobbies: selectedHobbies,
        avt: avtId,
      };

      const pageResponse = await pagesClient.patch(page._id, pageData);
      if (pageResponse.success) {
        alert("Cập nhật Page thành công!");
        navigation.goBack();
      } else {
        throw new Error("Cập nhật Page thất bại: " + pageResponse.messages);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert("Có lỗi xảy ra khi cập nhật: " + (error instanceof Error ? error.message : "Không xác định"));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pageName,
    setPageName,
    avtUri,
    address,
    setAddress,
    timeOpen,
    timeClose,
    hobbyOpen,
    setHobbyOpen,
    hobbies,
    selectedHobbies,
    setSelectedHobbies,
    showTimeOpenPicker,
    setShowTimeOpenPicker,
    showTimeClosePicker,
    setShowTimeClosePicker,
    showProvinceModal,
    setShowProvinceModal,
    showDistrictModal,
    setShowDistrictModal,
    showWardModal,
    setShowWardModal,
    provinces,
    districts,
    wards,
    isLoading,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
    handleStreetChange,
    pickImage,
    onTimeOpenChange,
    onTimeCloseChange,
    formatTime,
    handleUpdatePage,
  };
};