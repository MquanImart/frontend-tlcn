import { useState } from "react";
import { Animated } from "react-native";

const useScrollTabbar = () => {
    const [tabbarPosition] = useState(new Animated.Value(0));

    const handleScroll = (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        if (currentOffset > 20) {
          // Khi cuộn xuống, animate ẩn tabbar
          Animated.timing(tabbarPosition, {
            toValue: 100, // Đưa tabbar ra ngoài màn hình
            duration: 100,
            useNativeDriver: true,
          }).start();
        } else if (currentOffset < -20) {
          // Khi cuộn lên, animate hiện lại tabbar
          Animated.timing(tabbarPosition, {
            toValue: 0, // Trả tabbar về vị trí ban đầu
            duration: 100,
            useNativeDriver: true,
          }).start();
        }
    };
    return {
        tabbarPosition,
        handleScroll
    }
}

export default useScrollTabbar;