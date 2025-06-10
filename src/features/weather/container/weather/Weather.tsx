import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import SearchBar from "./SearchBar";
import WeatherCard from "./weatherCard";
import CHeader from "@/src/shared/components/header/CHeader";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MenuStackParamList } from "@/src/shared/routes/MenuNavigation";
import { WeatherStackParamList } from "@/src/shared/routes/WeatherNavigation";
import axios from "axios";

type MenuNavigationProp = StackNavigationProp<MenuStackParamList, "Menu">;
type WeatherNavigationProp = StackNavigationProp<WeatherStackParamList, "WeatherDetail">;

const Weather: React.FC = () => {
  useTheme()
  const navigationMenu = useNavigation<MenuNavigationProp>();
  const navigationWeather = useNavigation<WeatherNavigationProp>();

  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [locationList] = useState<string[]>(["Biên Hòa", "Hồ Chí Minh", "Hà Nội"]);
  const [loading, setLoading] = useState<boolean>(true);
  const apiKey = "93ec152097fc00b3380bffe41fd8be2c"; // API key cho OpenWeatherMap Geocoding

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    setLoading(true);
    const fetchedData: any[] = [];

    try {
      // Bước 1: Lấy tọa độ từ OpenWeatherMap Geocoding API
      const locationRequests = locationList.map(city =>
        axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${city},VN&limit=1&appid=${apiKey}`)
      );

      const locationResponses = await Promise.all(locationRequests);

      // Bước 2: Lấy dữ liệu thời tiết từ Open-Meteo API
      const weatherRequests = locationResponses.map(response => {
        if (response.data.length > 0) {
          const { lat, lon } = response.data[0];
          return axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&forecast_days=1`
          );
        }
      }).filter(Boolean);

      const weatherResponses = await Promise.all(weatherRequests);

      weatherResponses.forEach((response, index) => {
        if (response) {
          const data = response.data;
          const lat = locationResponses[index].data[0].lat;
          const lon = locationResponses[index].data[0].lon;
          const city = locationResponses[index].data[0].name;

          // Lấy nhiệt độ hiện tại từ 'current'
          const currentTemp = data.current.temperature_2m;
          const weatherCode = data.current.weather_code;

          // Tính nhiệt độ cao/thấp từ dữ liệu hourly trong ngày hiện tại
          const todayTemps = data.hourly.temperature_2m.slice(0, 24); // 24 giờ đầu tiên
          const high = Math.max(...todayTemps);
          const low = Math.min(...todayTemps);

          fetchedData.push({
            city: city,
            temperature: currentTemp,
            description: getWeatherDescription(weatherCode),
            high: high,
            low: low,
            lat,
            lon,
          });
        }
      });

      setWeatherData(fetchedData);
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu thời tiết:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm chuyển mã thời tiết Open-Meteo thành mô tả tiếng Việt
  const getWeatherDescription = (code: number) => {
    const weatherCodes: { [key: number]: string } = {
      0: "Trời quang đãng",
      1: "Trời ít mây",
      2: "Mây rải rác",
      3: "Mây dày",
      45: "Sương mù",
      51: "Mưa phùn nhẹ",
      61: "Mưa nhẹ",
      63: "Mưa vừa",
      80: "Mưa rào",
      95: "Giông bão",
    };
    return weatherCodes[code] || "Không xác định";
  };

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      <CHeader label="Thời tiết" backPress={() => navigationMenu.goBack()} />
      <SearchBar placeholder="Tìm tên thành phố" />
      {loading ? (
        <Text style={[styles.loadingText, { color: Color.textPrimary }]}>Đang tải dữ liệu...</Text>
      ) : (
        <FlatList
          data={weatherData}
          keyExtractor={(item) => item.city}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigationWeather.navigate("WeatherDetail", {
                  lat: item.lat,
                  lon: item.lon,
                })
              }
            >
              <WeatherCard
                city={item.city}
                temperature={item.temperature}
                description={item.description}
                high={item.high}
                low={item.low}
              />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default Weather;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    // backgroundColor được áp dụng inline
  },
  loadingText: {
    textAlign: "center",
    fontSize: 18,
    // color được áp dụng inline
    marginTop: 20,
  },
});