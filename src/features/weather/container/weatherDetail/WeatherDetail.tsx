import { WeatherStackParamList } from "@/src/shared/routes/WeatherNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Image } from 'expo-image';
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
type WeatherDetailRouteProp = RouteProp<WeatherStackParamList, "WeatherDetail">;

const WeatherDetail: React.FC = () => {
  useTheme()
  const navigation = useNavigation();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<any>(null);
  const route = useRoute<WeatherDetailRouteProp>();
  const { lat, lon } = route.params;

  const WEATHER_API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,pressure_msl&hourly=temperature_2m,weather_code`;

  useEffect(() => {
    fetchWeather();
    fetchLocationName(lat, lon); // Gọi hàm lấy tên vị trí
  }, [lat, lon]);

  const fetchWeather = async () => {
    try {
      const response = await fetch(WEATHER_API_URL);
      const data = await response.json();

      if (!data.latitude || !data.longitude) {
        console.error("❌ Lỗi API thời tiết:", data);
        return;
      }

      setWeatherData(data);
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu thời tiết:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationName = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
      );
      const data = await response.json();

      if (data.display_name) {
        // Lấy tên thành phố hoặc địa chỉ đầy đủ
        const locationName = data.address.city || data.address.town || data.address.village || data.display_name;
        setCityName(locationName);
      } else {
        setCityName(`Lat: ${lat}, Lon: ${lon}`); // Dự phòng nếu không tìm thấy
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy tên vị trí:", error);
      setCityName(`Lat: ${lat}, Lon: ${lon}`);
    }
  };

  const getNextDays = () => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const today = new Date().getDay();
    let nextDays = [];

    for (let i = 1; i <= 6; i++) {
      const nextDay = new Date();
      nextDay.setDate(new Date().getDate() + i);
      nextDays.push({
        dayOfWeek: days[(today + i) % 7],
        fullDate: nextDay,
      });
    }
    return nextDays;
  };

  const getWeatherForDay = (dayIndex: number) => {
    if (!weatherData || !weatherData.hourly || !weatherData.hourly.time) return [];
    const dayData = [];
    const nextDay = getNextDays()[dayIndex];

    for (let i = 0; i < weatherData.hourly.time.length; i++) {
      const itemDate = new Date(weatherData.hourly.time[i]);
      if (itemDate.toLocaleDateString("vi-VN") === nextDay.fullDate.toLocaleDateString("vi-VN")) {
        dayData.push({
          dt: Date.parse(weatherData.hourly.time[i]) / 1000,
          main: { temp: weatherData.hourly.temperature_2m[i] },
          weather: [
            {
              description: getWeatherDescription(weatherData.hourly.weather_code[i]),
              icon: getWeatherIcon(weatherData.hourly.weather_code[i]),
            },
          ],
        });
      }
    }
    return dayData;
  };

  const getTodayWeather = () => {
    if (!weatherData || !weatherData.hourly || !weatherData.hourly.time) return [];
    const todayData = [];
    const today = new Date();

    for (let i = 0; i < weatherData.hourly.time.length; i++) {
      const itemDate = new Date(weatherData.hourly.time[i]);
      if (itemDate.toLocaleDateString("vi-VN") === today.toLocaleDateString("vi-VN")) {
        todayData.push({
          dt: Date.parse(weatherData.hourly.time[i]) / 1000,
          main: { temp: weatherData.hourly.temperature_2m[i] },
          weather: [
            {
              description: getWeatherDescription(weatherData.hourly.weather_code[i]),
              icon: getWeatherIcon(weatherData.hourly.weather_code[i]),
            },
          ],
        });
      }
    }
    return todayData;
  };

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

  const getWeatherIcon = (code: number) => {
    const iconMap: { [key: number]: string } = {
      0: "01d",
      1: "02d",
      2: "03d",
      3: "04d",
      45: "50d",
      51: "09d",
      61: "10d",
      63: "10d",
      80: "09d",
      95: "11d",
    };
    return iconMap[code] || "01d";
  };

  const handleDayPress = (dayData: any) => {
    setSelectedDayData(dayData);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDayData(null);
  };

  return (
    <LinearGradient colors={["#36A2EB", "#009FFD"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{cityName || "Dự báo thời tiết"}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="white" style={styles.loading} />
      ) : weatherData && weatherData.hourly && weatherData.current ? (
        <>
          <Text style={styles.sectionTitle}>Hôm nay</Text>
          <View style={styles.todayWeatherContainer}>
            <FlatList
              horizontal
              data={getTodayWeather()}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.weatherCard}>
                  <Text style={styles.temp}>{Math.round(item.main.temp)}°C</Text>
                  <Image
                    source={{ uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png` }}
                    style={{ width: 70, height: 70 }}
                  />
                  <Text style={styles.time}>
                    {new Date(item.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                  <Text style={styles.weatherDescription}>{item.weather[0].description}</Text>
                </View>
              )}
            />
          </View>

          <Text style={styles.sectionTitle}>Các ngày tiếp theo</Text>
          <FlatList
            data={getNextDays()}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => {
              const weatherForDay = getWeatherForDay(index);
              const weather = weatherForDay?.[0];
              return weather ? (
                <TouchableOpacity style={styles.weeklyItem} onPress={() => handleDayPress(weather)}>
                  <Text style={styles.weeklyDate}>
                    {item.dayOfWeek}, {item.fullDate.toLocaleDateString("vi-VN")}
                  </Text>
                  <Image
                    source={{ uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png` }}
                    style={{ width: 50, height: 50 }}
                  />
                  <Text style={styles.weeklyTemp}>{Math.round(weather.main.temp)}°C</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.error}>Không có dữ liệu</Text>
              );
            }}
          />
        </>
      ) : (
        <Text style={styles.error}>Không có dữ liệu thời tiết</Text>
      )}

      <TouchableOpacity style={styles.weatherButton} onPress={fetchWeather}>
        <Icon name="refresh" size={20} color="white" />
        <Text style={styles.weatherButtonText}>Làm mới</Text>
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={["#36A2EB", "#009FFD"]} style={styles.modalContainer}>
            {selectedDayData && weatherData.current ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chi tiết thời tiết</Text>
                  <TouchableOpacity onPress={closeModal}>
                    <Icon name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalContent}>
                  <Image
                    source={{ uri: `https://openweathermap.org/img/wn/${selectedDayData.weather[0].icon}@2x.png` }}
                    style={{ width: 100, height: 100 }}
                  />
                  <Text style={styles.modalTemp}>{Math.round(selectedDayData.main.temp)}°C</Text>
                  <Text style={styles.modalDescription}>{selectedDayData.weather[0].description}</Text>
                  <Text style={styles.modalDate}>
                    {new Date(selectedDayData.dt * 1000).toLocaleDateString("vi-VN")}
                  </Text>
                  <View style={styles.modalDetails}>
                    <View style={styles.detailItem}>
                      <Icon name="water-drop" size={20} color="white" />
                      <Text style={styles.detailText}>Độ ẩm: {weatherData.current.relative_humidity_2m}%</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Icon name="speed" size={20} color="white" />
                      <Text style={styles.detailText}>Áp suất: {weatherData.current.pressure_msl} hPa</Text>
                    </View>
                  </View>
                </View>
              </>
            ) : null}
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default WeatherDetail;

// Styles giữ nguyên như mã gốc
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  title: {
    fontSize: 25,
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    marginTop: 10,
  },
  todayWeatherContainer: {
    marginHorizontal: -20,
  },
  weatherCard: {
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginRight: 5,
    marginLeft: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "space-between",
    height: 180,
    width: 120,
  },
  temp: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  time: {
    fontSize: 14,
    color: "white",
  },
  weeklyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.3)",
  },
  weeklyDate: {
    fontSize: 16,
    color: "white",
    flex: 1,
  },
  weeklyTemp: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  weatherButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingVertical: 10,
    borderRadius: 20,
  },
  weatherButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
  error: {
    fontSize: 14,
    color: "white",
    fontStyle: "italic",
  },
  weatherDescription: {
    fontSize: 14,
    color: "white",
    fontStyle: "italic",
    marginTop: 5,
    textAlign: "center",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "85%",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  modalContent: {
    alignItems: "center",
  },
  modalTemp: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 18,
    color: "white",
    fontStyle: "italic",
    marginBottom: 20,
  },
  modalDate: {
    fontSize: 16,
    color: "white",
    marginBottom: 5,
  },
  modalDetails: {
    width: "100%",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: "white",
    marginLeft: 10,
  },
});