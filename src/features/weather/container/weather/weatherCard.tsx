import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
// import { useTheme } from '@/src/contexts/ThemeContext'; // Không cần thiết vì không dùng biến theme
// import { colors as Color } from '@/src/styles/DynamicColors'; // Không cần vì màu chữ là cố định (trắng)

interface WeatherCardProps {
  city: string;
  temperature: number;
  description: string;
  high: number;
  low: number;
}

const getBackgroundImage = (description: string) => {
  if (description.toLowerCase().includes("mưa")) {
    return require("../../../../assets/images/Weather/backgourdRain.jpg");
  } else if (description.toLowerCase().includes("mây")) {
    return require("../../../../assets/images/Weather/backgroudCloud.jpg");
  } else if (description.toLowerCase().includes("nắng")) {
    return require("../../../../assets/images/Weather/backgroudSun.jpg");
  }
  // Thêm một ảnh mặc định nếu không khớp với bất kỳ mô tả nào
  return require("../../../../assets/images/Weather/backgroudCloud.jpg");
};

const WeatherCard: React.FC<WeatherCardProps> = ({ city, temperature, description, high, low }) => {
  // useTheme() // Không cần thiết ở đây vì màu chữ là cố định để phù hợp với ImageBackground
  return (
    <ImageBackground source={getBackgroundImage(description)} style={styles.card} imageStyle={{ borderRadius: 12 }}>
      <View style={styles.overlay}>
        <View style={styles.leftColumn}>
          <Text style={styles.city}>{city}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={styles.rightColumn}>
          <Text style={styles.temperature}>{temperature}°</Text>
          <Text style={styles.range}>H:{high}° L:{low}°</Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 10,
    height: 120,
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftColumn: {
    flex: 1,
    gap: 15,
    justifyContent: "center",
  },
  rightColumn: {
    alignItems: "flex-end",
    gap: 15,
    justifyContent: "center",
  },
  city: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF", // Màu trắng để nổi bật trên ảnh nền
  },
  description: {
    fontSize: 17,
    color: "#FFFFFF", // Màu trắng
    marginTop: 8,
  },
  temperature: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF", // Màu trắng
  },
  range: {
    fontSize: 16,
    color: "#FFFFFF", // Màu trắng
    marginTop: 8,
  },
});

export default WeatherCard;