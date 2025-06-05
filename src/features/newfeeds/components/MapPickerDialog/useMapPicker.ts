import { Address } from "@/src/interface/interface_reference";
import { MapStackParamList } from "@/src/shared/routes/MapNavigation";
import { callGetGoogleApi, callPostGoogleApi } from "@/src/shared/services/API_Google";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import MapView, { MapPressEvent } from "react-native-maps";

type MapNavigationProp = StackNavigationProp<MapStackParamList, "CustomMap">;

export interface LocationProps {
  latitude: number;
  longitude: number;
}

interface PlaceData {
  id: string;
  displayName: { text: string };
  location: LocationProps;
}

interface PlaceSuggestion {
  placePrediction: {
    placeId: string;
    text: { text: string };
  };
}

const useMapPicker = (
  onConfirm: (coords: { latitude: number; longitude: number }, address: Address) => void,
  onClose: () => void
) => {
  const navigation = useNavigation<MapNavigationProp>();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const mapRef = useRef<MapView>(null);
  const [selectedMarker, setSelectedMarker] = useState<LocationProps | null>(null);
  const [details, setDetails] = useState<PlaceData | null>(null);
  const [listSearch, setListSearch] = useState<PlaceSuggestion[]>([]);
  const [search, setSearch] = useState<string>("");
  const [isSearch, setIsSearch] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === "denied") {
        Alert.alert(
          "Quyền vị trí bị từ chối",
          "Bạn đã từ chối quyền vị trí. Hãy vào cài đặt để cấp lại quyền.",
          [
            { text: "Hủy", style: "cancel" },
            { text: "Mở cài đặt", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      if (status !== "granted") {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== "granted") {
          Alert.alert(
            "Không thể truy cập vị trí",
            "Bạn cần cấp quyền vị trí trong cài đặt để sử dụng tính năng này.",
            [
              { text: "Hủy", style: "cancel" },
              { text: "Mở cài đặt", onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location]);

  useEffect(() => {
    const offset = 0.004;
    if (selectedMarker && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: selectedMarker.latitude - offset,
        longitude: selectedMarker.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [selectedMarker]);

  const handleMapPress = (event: MapPressEvent) => {
    const location = event.nativeEvent.coordinate;
    setSelectedMarker(location);
    fetchPlaceDetailsFromCoords(location.latitude, location.longitude);
  };

  const fetchPlaceDetailsFromCoords = async (latitude: number, longitude: number) => {
    const baseUrl = "https://places.googleapis.com/v1/places:searchNearby";
    const data = {
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius: 50.0,
        },
      },
    };
    const headers = { "X-Goog-FieldMask": "*" };

    try {
      const result = await callPostGoogleApi<{ places: PlaceData[] }>(baseUrl, data, headers);
      if (result && result.places && result.places.length > 0) {
        setDetails(result.places[0]);
        setSearch(result.places[0].displayName.text); // Cập nhật ô tìm kiếm với tên địa điểm
      } else {
        setDetails(null);
        setSearch(""); // Xóa ô tìm kiếm nếu không tìm thấy địa điểm
        console.log("Không tìm thấy địa điểm gần đây.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy địa điểm gần đây:", error);
      Alert.alert("Lỗi", "Không thể lấy thông tin địa điểm. Vui lòng thử lại!");
    }
  };

  const fetchPlaces = async (input: string) => {
    setSearch(input);
    const url = "https://places.googleapis.com/v1/places:autocomplete";
    const body = {
      input,
      languageCode: "vi",
      locationBias: {
        rectangle: {
          low: { latitude: 8.1790665, longitude: 102.14441 },
          high: { latitude: 23.393395, longitude: 109.469077 },
        },
      },
    };

    try {
      const result = await callPostGoogleApi<{ suggestions: PlaceSuggestion[] }>(url, body);
      if (result) {
        setListSearch(result.suggestions);
      } else {
        setListSearch([]);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm địa điểm:", error);
      setListSearch([]);
    }
  };

  const getLatLngFromPlaceId = async (placeId: string) => {
    const baseUrl = `https://places.googleapis.com/v1/places/${placeId}`;
    try {
      const result = await callGetGoogleApi<PlaceData>(baseUrl, {}, { "X-Goog-FieldMask": "*" });
      if (result) {
        setDetails(result);
        setSelectedMarker(result.location);
        // Cập nhật ô tìm kiếm với nội dung của gợi ý được chọn
        const selectedSuggestion = listSearch.find(
          (item) => item.placePrediction.placeId === placeId
        );
        if (selectedSuggestion) {
          setSearch(selectedSuggestion.placePrediction.text.text);
        }
        // Không gọi setIsSearch(false) để giữ danh sách gợi ý hiển thị
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết địa điểm:", error);
      Alert.alert("Lỗi", "Không thể lấy chi tiết địa điểm. Vui lòng thử lại!");
    }
  };

  const confirmLocation = async () => {
    if (selectedMarker && details) {
      try {
        const addressResponse = await Location.reverseGeocodeAsync(selectedMarker);
        let address: Address = {
          province: "",
          district: "",
          ward: "",
          street: "",
          placeName: details.displayName.text || "",
          lat: selectedMarker.latitude,
          long: selectedMarker.longitude,
        };

        if (addressResponse.length > 0) {
          const firstAddress = addressResponse[0];
          address = {
            province: firstAddress.region || "",
            district: firstAddress.district || "",
            ward: firstAddress.subregion || "",
            street: firstAddress.street || "",
            placeName: details.displayName.text || [
              firstAddress.name,
              firstAddress.street,
              firstAddress.city,
              firstAddress.region,
            ].filter(Boolean).join(", "),
            lat: selectedMarker.latitude,
            long: selectedMarker.longitude,
          };
        }

        onConfirm(selectedMarker, address);
        onClose();
      } catch (error) {
        console.error("Lỗi khi xác nhận vị trí:", error);
        Alert.alert("Lỗi", "Không thể xác nhận vị trí. Vui lòng thử lại!");
      }
    } else {
      Alert.alert("Thông báo", "Vui lòng chọn một vị trí trước khi xác nhận!");
    }
  };

  return {
    navigation,
    location,
    mapRef,
    selectedMarker,
    details,
    listSearch,
    search,
    isSearch,
    setSearch,
    setIsSearch,
    handleMapPress,
    fetchPlaces,
    getLatLngFromPlaceId,
    confirmLocation,
  };
};

export default useMapPicker;