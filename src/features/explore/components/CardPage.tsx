import ConvertDimension from "@/src/shared/utils/ConvertDimension";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Image } from 'expo-image';
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CardExploreProps {
  images: string | null; // Giữ prop này để tương thích, nhưng không sử dụng
  name: string;
  country: string;
  size: {
    width: number | string;
    height: number | string;
  };
  onPress: () => void;
}

const CardPage = ({
  images, // Không sử dụng nhưng giữ để tránh lỗi props
  name,
  country,
  size,
  onPress,
}: CardExploreProps) => {
  useTheme(); 
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: ConvertDimension(size.width),
          height: ConvertDimension(size.height),
        },
      ]}
      onPress={onPress}
    >
      <Image
        style={styles.images}
        source={images?{uri: images}:require('@/src/assets/images/default/default_page.jpg')}
        resizeMode="cover" // Đảm bảo ảnh hiển thị đúng tỷ lệ
      />
      <LinearGradient
        colors={["rgba(75, 22, 76, 0)", "rgba(75, 22, 76, 1)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.boxContent}>
        <Text
          style={styles.textName}
          numberOfLines={1} // Chỉ hiển thị 1 dòng
          ellipsizeMode="tail" // Thêm dấu ba chấm (...) nếu quá dài
        >
          {name}
        </Text>
        <Text style={styles.textCountry}>{country}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red", // Có thể bỏ nếu không cần màu nền đỏ
    borderRadius: 20,
    overflow: "hidden",
    marginVertical: 2,
  },
  images: {
    width: "100%",
    height: "100%",
  },
  boxContent: {
    width: "100%",
    paddingHorizontal: 10, // Thêm padding để nội dung không sát mép
    position: "absolute",
    bottom: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  boxDistance: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1,
    borderRadius: 20,
  },
  textDistance: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 10,
  },
  textName: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 15,
    fontWeight: "bold",
    width: "100%", 
    textAlign: "center", 
  },
  textCountry: {
    color: "rgba(255, 255, 255, 0.8)",
    textTransform: "uppercase",
    letterSpacing: 2,
    fontWeight: "500",
    textAlign: "center",
    fontSize: 10,
  },
});

export default CardPage;