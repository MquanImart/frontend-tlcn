import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient"; 
import { useNavigation } from "@react-navigation/native";

const API_KEY = "93ec152097fc00b3380bffe41fd8be2c";  
const LATITUDE = 46.5714; 
const LONGITUDE = 0.306; 

const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${LATITUDE}&lon=${LONGITUDE}&units=metric&appid=${API_KEY}&lang=vi`;

const WeatherScreen: React.FC = () => {
  const navigation = useNavigation();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState<string>("");

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const response = await fetch(WEATHER_API_URL);
      const data = await response.json();

      if (data.cod !== "200") {
        console.error("❌ Lỗi API:", data.message);
        return;
      }

      setCityName(data.city.name);
      if (data.list) {
        setWeatherData(data.list);
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu thời tiết:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNextDays = () => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const today = new Date().getDay();
    let nextDays = [];

    for (let i = 1; i <= 5; i++) {
      const nextDay = new Date();
      nextDay.setDate(new Date().getDate() + i);
      nextDays.push({
        dayOfWeek: days[(today + i) % 7], 
        fullDate: nextDay, 
      });
    }

    return nextDays;
  };

  // Hàm lấy thời tiết cho một ngày
  const getWeatherForDay = (dayIndex: number) => {
    const dayData = [];
    const nextDay = getNextDays()[dayIndex];

    for (let i = 0; i < weatherData.length; i++) {
      const item = weatherData[i];
      const itemDate = new Date(item.dt * 1000);

      if (itemDate.toLocaleDateString("vi-VN") === nextDay.fullDate.toLocaleDateString("vi-VN")) {
        dayData.push(item);
      }
    }

    return dayData;
  };

  const handleDayPress = (dayData: any) => {
    const weather = dayData.weather?.[0];
    const main = dayData.main;
  
    if (weather && main) {
      const weatherDescription = weather.description;
      const temperature = Math.round(main.temp);
      const humidity = main.humidity;
      const pressure = main.pressure;
  
      Alert.alert(
        "Chi tiết thời tiết",
        `Ngày: ${new Date(dayData.dt * 1000).toLocaleDateString("vi-VN")}\n` +
        `Nhiệt độ: ${temperature}°C\n` +
        `Mô tả: ${weatherDescription}\n` +
        `Độ ẩm: ${humidity}%\n` +
        `Áp suất: ${pressure} hPa`
      );
    } else {
      Alert.alert("Lỗi", "Không thể lấy thông tin chi tiết thời tiết.");
    }
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
        <ActivityIndicator size="large" color="white" />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Hôm nay</Text>
          <FlatList
            horizontal
            data={weatherData.slice(0, 8)}
            showsVerticalScrollIndicator = {false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              const weather = item.weather?.[0];
              const main = item.main;

              if (weather && main) {
                const { icon, color } = getWeatherIcon(weather.main, weather.description);
                return (
                  <View style={styles.weatherCard}>
                    <Text style={styles.temp}>{Math.round(main.temp)}°C</Text>
                    <Icon name={icon} size={40} color={color} />
                    <Text style={styles.time}>
                      {new Date(item.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                    {/* Thêm mô tả thời tiết vào cuối cột */}
                    <View style={styles.weatherDescriptionContainer}>
                      <Text style={styles.weatherDescription}>{weather.description}</Text>
                    </View>
                  </View>
                );
              } else {
                return <Text style={styles.error}>Lỗi dữ liệu thời tiết</Text>;
              }
            }}
            showsHorizontalScrollIndicator={false}
          />



          <Text style={styles.sectionTitle}>Các ngày tiếp theo</Text>
          <FlatList
            data={getNextDays()}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => {
              const weatherForDay = getWeatherForDay(index); // Lấy thời tiết cho ngày thứ "index"

              const weather = weatherForDay?.[0]?.weather?.[0]; // Lấy thông tin thời tiết từ mốc thời gian đầu tiên trong ngày
              const main = weatherForDay?.[0]?.main;

              if (weather && main) {
                const { icon, color } = getWeatherIcon(weather.main, weather.description);
                return (
                  <TouchableOpacity style={styles.weeklyItem} onPress={() => handleDayPress(weatherForDay[0])}>
                    <Text style={styles.weeklyDate}>
                      {item.dayOfWeek}, {item.fullDate.toLocaleDateString("vi-VN")} {/* Hiển thị ngày tháng năm */}
                    </Text>
                    <Icon name={icon} size={30} color={color} />
                    <Text style={styles.weeklyTemp}>{Math.round(main.temp)}°C</Text>
                  </TouchableOpacity>
                );
              } else {
                return <Text style={styles.error}>Lỗi dữ liệu thời tiết cho ngày tiếp theo</Text>;
              }
            }}
          />
        </>
      )}

      <TouchableOpacity style={styles.weatherButton} onPress={fetchWeather}>
        <Icon name="refresh" size={20} color="white" />
        <Text style={styles.weatherButtonText}>Làm mới</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};


const getWeatherIcon = (condition: string, description: string) => {
  condition = condition.toLowerCase();
  description = description.toLowerCase();

  if (condition === "clear") {
    return { icon: "wb-sunny", color: "#FFD700" }; 
  }
  if (condition === "clouds") {
    return { icon: "cloud", color: "#FFFFFF" };
  }
  if (condition === "rain" && description.includes("thunderstorm")) {
    return { icon: "cloud-off", color: "#757575" };
  }
  if (condition === "rain") {
    return { icon: "cloud", color: "#C0C0C0" }; 
  }
  if (condition === "thunderstorm") {
    return { icon: "storm", color: "#9C27B0" };
  }
  if (condition === "snow") {
    return { icon: "ac-unit", color: "#80DEEA" }; // Tuyết
  }

  return { icon: "cloud", color: "#B0BEC5" }; // Mây mặc định
};



export default WeatherScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  title: {
    fontSize: 22,
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
  weatherCard: {
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "space-between", 
    flex: 1, 
    height: 180, 
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
  },
  weatherDescriptionContainer: {
    marginTop: 10, 
    alignItems: "center",
    justifyContent: "flex-end",
  },
});
