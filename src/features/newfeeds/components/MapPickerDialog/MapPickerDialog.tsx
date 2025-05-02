import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import getColor from "@/src/styles/Color";
import { Address } from "@/src/interface/interface_reference";

const colors = getColor();

interface MapPickerDialogProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (coords: { latitude: number; longitude: number }, address: Address) => void;
}

const MapPickerDialog: React.FC<MapPickerDialogProps> = ({ isVisible, onClose, onConfirm }) => {
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<MapView>(null);

  // Lấy vị trí hiện tại khi mở dialog
  useEffect(() => {
    if (isVisible) {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Quyền vị trí bị từ chối");
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setCurrentLocation(coords);
        // Di chuyển bản đồ đến vị trí hiện tại
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      })();
    }
  }, [isVisible]);

  // Xử lý khi nhấn vào bản đồ
  const handleMapPress = async (event: any) => {
    const coords = event.nativeEvent.coordinate;
    setSelectedCoords(coords);
    setIsLoading(true);

    try {
      const addressResponse = await Location.reverseGeocodeAsync(coords);
      if (addressResponse.length > 0) {
        const firstAddress = addressResponse[0];
        const newAddress: Address = {
          province: firstAddress.region || "",
          district: firstAddress.district || "",
          ward: firstAddress.subregion || "",
          street: firstAddress.street || "",
          placeName: [
            firstAddress.name,
            firstAddress.street,
            firstAddress.city,
            firstAddress.region,
          ].filter(Boolean).join(", "),
          lat: coords.latitude,
          long: coords.longitude,
        };
        setAddress(newAddress);
      }
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý tìm kiếm địa chỉ
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        const coords = { latitude, longitude };
        setSelectedCoords(coords);

        // Di chuyển bản đồ đến vị trí tìm kiếm
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }

        // Lấy địa chỉ chi tiết
        const addressResponse = await Location.reverseGeocodeAsync(coords);
        if (addressResponse.length > 0) {
          const firstAddress = addressResponse[0];
          const newAddress: Address = {
            province: firstAddress.region || "",
            district: firstAddress.district || "",
            ward: firstAddress.subregion || "",
            street: firstAddress.street || "",
            placeName: [
              firstAddress.name,
              firstAddress.street,
              firstAddress.city,
              firstAddress.region,
            ].filter(Boolean).join(", "),
            lat: coords.latitude,
            long: coords.longitude,
          };
          setAddress(newAddress);
        }
      } else {
        console.warn("Không tìm thấy địa điểm nào!");
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm địa chỉ:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xác nhận và gửi dữ liệu về
  const handleConfirm = () => {
    if (selectedCoords && address) {
      onConfirm(selectedCoords, address);
      resetState();
      onClose();
    }
  };

  // Reset state khi đóng dialog
  const resetState = () => {
    setSelectedCoords(null);
    setAddress(null);
    setSearchQuery("");
    setIsLoading(false);
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Chọn vị trí trên bản đồ</Text>
            <TouchableOpacity onPress={() => { resetState(); onClose(); }}>
              <Ionicons name="close" size={24} color={colors.textColor1} />
            </TouchableOpacity>
          </View>

          {/* Thanh tìm kiếm */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm địa điểm..."
              placeholderTextColor={colors.textColor3}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch} disabled={isLoading}>
              <Ionicons name="search" size={24} color={colors.mainColor1} />
            </TouchableOpacity>
          </View>

          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={
              currentLocation
                ? {
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }
                : {
                    latitude: 10.762622, // Mặc định TP.HCM nếu chưa có vị trí
                    longitude: 106.660172,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }
            }
            onPress={handleMapPress}
          >
            {currentLocation && (
              <Marker
                coordinate={currentLocation}
                title="Vị trí của bạn"
                pinColor="blue"
              />
            )}
            {selectedCoords && (
              <Marker coordinate={selectedCoords} title="Địa điểm đã chọn" />
            )}
          </MapView>

          {selectedCoords && (
            <View style={styles.infoContainer}>
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.mainColor1} />
              ) : (
                <Text style={styles.addressText}>
                  {address?.placeName || "Đang lấy địa chỉ..."}
                </Text>
              )}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: selectedCoords ? colors.mainColor1 : colors.borderColor1 }]}
              onPress={handleConfirm}
              disabled={!selectedCoords || isLoading}
            >
              <Text style={styles.buttonText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    width: "90%",
    height: "70%",
    backgroundColor: colors.backGround,
    borderRadius: 15,
    padding: 15,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textColor1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.borderColor1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.textColor1,
    fontSize: 16,
  },
  map: {
    flex: 1,
    borderRadius: 10,
  },
  infoContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.borderColor1,
    borderRadius: 8,
    alignItems: "center",
  },
  addressText: {
    color: colors.textColor1,
    fontSize: 14,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: colors.textColor2,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MapPickerDialog;