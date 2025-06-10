import env from "@/env";
import { WeatherStackParamList } from "@/src/shared/routes/WeatherNavigation";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from '@/src/contexts/ThemeContext'; // Import useTheme
import { colors as Color } from '@/src/styles/DynamicColors'; // Import colors

type WeatherNavigationProp = StackNavigationProp<WeatherStackParamList, "WeatherDetail">;

interface Location {
  code: number;
  name: string;
  type: "province" | "district" | "ward";
  provinceCode?: number;
  districtCode?: number;
  fullName: string;
}

const cleanName = (name: string) =>
  name
    .replace(/^(Tỉnh|Thành phố|Huyện|Xã|Quận|Phường)\s+/i, "")
    .trim();

// Hàm loại bỏ dấu tiếng Việt
const removeAccents = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

// Hàm chuẩn hóa chuỗi
const normalizeText = (text: string) =>
  removeAccents(
    text
      .replace(/[,]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  ).toLowerCase();

// Hàm lấy tọa độ từ Google Maps Geocoding API
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
      return { lat, lon: lng };
    }
    throw new Error(response.data.error_message || "Không tìm thấy kết quả");
  } catch (error) {
    console.error("Lỗi khi định vị địa chỉ:", error);
    return null;
  }
};

const SearchBar: React.FC<{ placeholder: string }> = ({ placeholder }) => {
  useTheme(); // Kích hoạt theme context để có thể sử dụng `Color`
  const [query, setQuery] = useState("");
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const navigationWeather = useNavigation<WeatherNavigationProp>();

  useFocusEffect(
    React.useCallback(() => {
      setQuery("");
      fetchAllLocations();
    }, [])
  );

  const fetchAllLocations = async () => {
    try {
      const response = await axios.get("https://provinces.open-api.vn/api/?depth=3");
      const provinces = response.data || [];
      const flatLocations: Location[] = [];

      provinces.forEach((province: any) => {
        const provinceName = cleanName(province.name);
        flatLocations.push({
          code: province.code,
          name: province.name,
          type: "province",
          fullName: provinceName,
        });

        province.districts?.forEach((district: any) => {
          const districtName = cleanName(district.name);
          flatLocations.push({
            code: district.code,
            name: district.name,
            type: "district",
            provinceCode: province.code,
            fullName: `${districtName}, ${provinceName}`,
          });

          district.wards?.forEach((ward: any) => {
            const wardName = cleanName(ward.name);
            flatLocations.push({
              code: ward.code,
              name: ward.name,
              type: "ward",
              provinceCode: province.code,
              districtCode: district.code,
              fullName: `${wardName}, ${districtName}, ${provinceName}`,
            });
          });
        });
      });

      setAllLocations(flatLocations);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách địa phương:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách địa phương. Vui lòng thử lại.");
    }
  };

  // Lọc danh sách hỗ trợ tìm kiếm ở mọi cấp
  useEffect(() => {
    if (query) {
      const searchText = normalizeText(query);
      const filtered = allLocations
        .filter((location) => normalizeText(location.fullName).includes(searchText))
        .sort((a, b) => {
          const order = { province: 0, district: 1, ward: 2 };
          return order[a.type] - order[b.type];
        })
        .slice(0, 20);
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  }, [query, allLocations]);

  const handleLocationSelect = async (location: Location) => {
    try {
      let fullAddress = `${location.fullName}, Vietnam`;
      if (location.type === "ward") {
        fullAddress = `${location.name}, ${allLocations.find(loc => loc.code === location.districtCode)?.name}, ${allLocations.find(loc => loc.code === location.provinceCode)?.name}, Vietnam`;
      } else if (location.type === "district") {
        fullAddress = `${location.name}, ${allLocations.find(loc => loc.code === location.provinceCode)?.name}, Vietnam`;
      }

      const coordinates = await geocodeAddress(fullAddress);
      if (coordinates) {
        navigationWeather.navigate("WeatherDetail", {
          lat: coordinates.lat,
          lon: coordinates.lon,
        });
      } else {
        Alert.alert("Lỗi", `Không tìm thấy tọa độ cho ${location.fullName}. Vui lòng thử lại.`);
      }
    } catch (error) {
      console.error("Lỗi khi lấy tọa độ:", error);
      Alert.alert("Lỗi", "Không thể lấy tọa độ. Vui lòng thử lại sau.");
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { backgroundColor: Color.backgroundSecondary }]}>
        <Icon name="search" size={25} color={Color.textTertiary} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: Color.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={Color.textTertiary}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {filteredLocations.length > 0 && (
        <FlatList
          data={filteredLocations}
          keyExtractor={(item) => `${item.type}-${item.code}`}
          style={[styles.suggestionList, { backgroundColor: Color.background }]}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.suggestionItem, { borderBottomColor: Color.border }]}
              onPress={() => handleLocationSelect(item)}
            >
              <Text style={[styles.suggestionText, { color: Color.textPrimary }]}>{item.fullName}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    zIndex: 10,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  suggestionList: {
    maxHeight: 200,
    borderRadius: 8,
    position: "absolute",
    top: 50,
    width: "100%",
    shadowColor: "#000", // Giữ màu đen cho shadow để đảm bảo độ tương phản
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 16,
  },
});

export default SearchBar;