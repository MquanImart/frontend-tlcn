import React, { useEffect, useState } from "react";
import { View, TextInput, StyleSheet, FlatList, TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { WeatherStackParamList } from "@/src/shared/routes/WeatherNavigation";

type WeatherNavigationProp = StackNavigationProp<WeatherStackParamList, "WeatherDetail">;

interface Location {
  code: number;
  name: string;
  type: "province" | "district" | "ward";
  provinceCode?: number;
  districtCode?: number;
  fullName: string;
  lat?: number | null;
  lon?: number | null;
}

const API_KEY = "93ec152097fc00b3380bffe41fd8be2c";

const cleanName = (name: string) =>
  name
    .replace(/^(Tỉnh|Thành phố|Huyện|Xã|Quận|Phường)\s+/i, "")
    .trim();

// Hàm loại bỏ dấu tiếng Việt
const removeAccents = (str: string) => {
  return str
    .normalize("NFD") // Phân tách ký tự và dấu
    .replace(/[\u0300-\u036f]/g, "") // Xóa các dấu
    .replace(/đ/g, "d") // Thay đ thành d
    .replace(/Đ/g, "D"); // Thay Đ thành D
};

// Hàm chuẩn hóa chuỗi: bỏ dấu phẩy, khoảng trắng thừa, dấu tiếng Việt, không phân biệt hoa/thường
const normalizeText = (text: string) =>
  removeAccents(
    text
      .replace(/[,]/g, " ") // Thay dấu phẩy bằng khoảng trắng
      .replace(/\s+/g, " ") // Thay nhiều khoảng trắng bằng một khoảng trắng
      .trim()
  ).toLowerCase();

const SearchBar: React.FC<{ placeholder: string }> = ({ placeholder }) => {
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
            fullName: `${provinceName}, ${districtName}`,
          });

          district.wards?.forEach((ward: any) => {
            const wardName = cleanName(ward.name);
            flatLocations.push({
              code: ward.code,
              name: ward.name,
              type: "ward",
              provinceCode: province.code,
              districtCode: district.code,
              fullName: `${provinceName}, ${districtName}, ${wardName}`,
            });
          });
        });
      });

      setAllLocations(flatLocations);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách địa phương:", error);
    }
  };

  // Lọc danh sách không phân biệt hoa/thường và dấu
  useEffect(() => {
    if (query) {
      const searchText = normalizeText(query);
      const filtered = allLocations
        .filter((location) => normalizeText(location.fullName).startsWith(searchText))
        .sort((a, b) => {
          const order = { province: 0, district: 1, ward: 2 };
          return order[a.type] - order[b.type];
        });
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  }, [query, allLocations]);

  const handleLocationSelect = async (location: Location) => {
    try {
      const fullAddress = `${location.fullName}, Vietnam`;
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`
      );

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        navigationWeather.navigate("WeatherDetail", {
          lat: parseFloat(lat),
          lon: parseFloat(lon),
        });
      } else {
        console.warn("Không tìm thấy tọa độ cho địa chỉ này!");
      }
    } catch (error) {
      console.error("Lỗi khi lấy tọa độ:", error);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Icon name="search" size={25} color="#A0A0A0" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {filteredLocations.length > 0 && (
        <FlatList
          data={filteredLocations}
          keyExtractor={(item) => `${item.type}-${item.code}`}
          style={styles.suggestionList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleLocationSelect(item)}
            >
              <Text style={styles.suggestionText}>{item.fullName}</Text>
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
    backgroundColor: "#F0F0F0",
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
    color: "#333",
  },
  suggestionList: {
    backgroundColor: "white",
    maxHeight: 200,
    borderRadius: 8,
    position: "absolute",
    top: 50,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
  },
});

export default SearchBar;