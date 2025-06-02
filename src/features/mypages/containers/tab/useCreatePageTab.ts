import env from "@/env";
import { Address } from "@/src/interface/interface_reference";
import { PageStackParamList } from "@/src/shared/routes/PageNavigation";
import restClient from "@/src/shared/services/RestClient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Alert } from "react-native";


// Khai báo clients
const hobbiesClient = restClient.apiClient.service("apis/hobbies");
const pagesClient = restClient.apiClient.service("apis/pages");

// Định nghĩa API Key từ biến môi trường (nên cấu hình trong .env)

export const useCreatePageTab = (userId: string) => {
  type NavigationProps = StackNavigationProp<PageStackParamList>;
  const navigation = useNavigation<NavigationProps>();
  const [pageName, setPageName] = useState("");
  const [avtUri, setAvtUri] = useState<string | null>(null);
  const [address, setAddress] = useState<Address>({
    _id: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    placeName: "",
    lat: null,
    long: null,
  });
  const [timeOpen, setTimeOpen] = useState<Date | null>(null);
  const [timeClose, setTimeClose] = useState<Date | null>(null);
  const [hobbyOpen, setHobbyOpen] = useState(false);
  const [hobbies, setHobbies] = useState<{ label: string; value: string }[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [showTimeOpenPicker, setShowTimeOpenPicker] = useState(false);
  const [showTimeClosePicker, setShowTimeClosePicker] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get("https://provinces.open-api.vn/api/p/");
        setProvinces(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch hobbies list on mount
  useEffect(() => {
    const fetchHobbies = async () => {
      try {
        const response = await hobbiesClient.find({});
        if (response.success) {
          setHobbies(
            response.data.map((hobby: { name: string; _id: string }) => ({
              label: hobby.name,
              value: hobby._id,
            }))
          );
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sở thích:", error);
      }
    };
    fetchHobbies();
  }, []);

  // Handle province change
  const handleProvinceChange = async (provinceCode: string) => {
    setAddress({
      ...address,
      _id: "",
      province: provinceCode,
      district: "",
      ward: "",
      street: "",
      lat: null,
      long: null,
    });
    setDistricts([]);
    setWards([]);
    try {
      const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      setDistricts(response.data.districts || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quận/huyện:", error);
    }
    setShowProvinceModal(false);
  };

  // Handle district change
  const handleDistrictChange = async (districtCode: string) => {
    setAddress({
      ...address,
      _id: "",
      district: districtCode,
      ward: "",
      lat: null,
      long: null,
    });
    setWards([]);
    try {
      const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      setWards(response.data.wards || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phường/xã:", error);
    }
    setShowDistrictModal(false);
  };

  // Geocoding function
  const geocodeAddress = async (addressString: string) => {
    try {
      const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
        params: {
          address: addressString,
          key: env.GOOGLE_MAPS_API_KEY,
          region: "vn",
          language: "vi",
        },
      });

      if (response.data.status === "OK" && response.data.results?.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return { lat, long: lng };
      }
      throw new Error(response.data.error_message || "Không tìm thấy kết quả");
    } catch (error) {
      console.error("Lỗi khi định vị địa chỉ:", error);
      return null;
    }
  };

  // Handle ward change with improved geocoding
  const handleWardChange = async (wardCode: string) => {
    const province = provinces.find((p) => p.code === parseInt(address.province))?.name || "";
    const district = districts.find((d) => d.code === parseInt(address.district))?.name || "";
    const ward = wards.find((w) => w.code === parseInt(wardCode))?.name || "";

    setAddress({ ...address, _id: "", ward: wardCode });
    setIsLoading(true);

    try {
      const query = `${ward}, ${district}, ${province}, Vietnam`;
      const coordinates = await geocodeAddress(query);
      if (coordinates) {
        setAddress((prev) => ({
          ...prev,
          lat: coordinates.lat,
          long: coordinates.long,
        }));
      } else {
        console.warn("Không tìm thấy tọa độ cho địa chỉ này!");
      }
    } finally {
      setIsLoading(false);
      setShowWardModal(false);
    }
  };

  // Pick image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Thông báo","Cần cấp quyền truy cập thư viện ảnh!");
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
      setTimeOpen(selectedTime);
      setShowTimeOpenPicker(false);
    } else if (event.type === "dismissed") {
      setShowTimeOpenPicker(false);
    }
  };

  const onTimeCloseChange = (event: any, selectedTime?: Date) => {
    if (event.type === "set" && selectedTime) {
      setTimeClose(selectedTime);
      setShowTimeClosePicker(false);
    } else if (event.type === "dismissed") {
      setShowTimeClosePicker(false);
    }
  };

  const formatTime = (time: Date | null) =>
    time ? time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }) : "Chọn giờ";

  // Handle page creation
  const handleCreatePage = async () => {
    if (
      !pageName ||
      !address.province ||
      !address.district ||
      !address.ward ||
      !timeOpen ||
      !timeClose
    ) {
      Alert.alert("Thông báo","Vui lòng điền đầy đủ các trường bắt buộc (được đánh dấu *)!");
      return;
    }

    // Kiểm tra tọa độ trước khi gửi
    if (!address.lat || !address.long) {
      console.error("Tọa độ không đầy đủ:", address);
      Alert.alert("Thông báo","Không thể tạo Page: Tọa độ địa chỉ không đầy đủ!");
      return;
    }

    setIsLoading(true);
    const idCreater = userId;

    const addressData = {
      province: provinces.find((p) => p.code === parseInt(address.province))?.name || "",
      district: districts.find((d) => d.code === parseInt(address.district))?.name || "",
      ward: wards.find((w) => w.code === parseInt(address.ward))?.name || "",
      street: address.street || "", // street không bắt buộc
      placeName: address.placeName || "",
      lat: address.lat,
      long: address.long,
    };


    const formData = new FormData();
    formData.append("name", pageName);
    formData.append("idCreater", idCreater);
    formData.append("address", JSON.stringify(addressData));
    formData.append("timeOpen", formatTime(timeOpen));
    formData.append("timeClose", formatTime(timeClose));
    formData.append("hobbies", selectedHobbies.join(","));

    if (avtUri) {
      const response = await fetch(avtUri);
      const blob = await response.blob();
      formData.append("avt", {
        uri: avtUri,
        name: "page.png",
        type: "image/png",
      } as any);
    }

    try {
      const response = await pagesClient.create(formData);
      if (response.success) {
        setPageName("");
        setAvtUri(null);
        setAddress({
          _id: "",
          province: "",
          district: "",
          ward: "",
          street: "",
          placeName: "",
          lat: null,
          long: null,
        });
        setTimeOpen(null);
        setTimeClose(null);
        setSelectedHobbies([]);
        setDistricts([]);
        setWards([]);

        const newPageId = response.data._id; 

        Alert.alert("Thành công", "Page đã được tạo thành công!", [
          {
            text: "OK",
            onPress: () => {
              // Kiểm tra stack navigation
              if (navigation.getState().routeNames.includes("PageScreen")) {
                navigation.navigate("PageScreen", { pageId: newPageId, currentUserId: userId });
              } else {
                console.error("PageScreen is not defined in navigation stack");
                Alert.alert("Lỗi", "Không thể điều hướng đến PageScreen. Vui lòng kiểm tra cấu hình navigation.");
              }
            },
          },
        ]);

      } else {
        throw new Error(response.messages || "Tạo page thất bại");
      }
    } catch (error: any) {
      console.error("Lỗi khi tạo page:", error);
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
    setHobbies,
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
    pickImage,
    onTimeOpenChange,
    onTimeCloseChange,
    formatTime,
    handleCreatePage,
  };
};
