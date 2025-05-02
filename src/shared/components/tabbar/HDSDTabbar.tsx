import { Animated, ScrollView, View, StyleSheet, Dimensions } from "react-native"
import Tabbar from "@/src/shared/components/tabbar/Tabbar";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";

const screenHeight = Dimensions.get("window").height; // Chiều rộng màn hình

const HDSSTabbar = () => {
    const { tabbarPosition,handleScroll} = useScrollTabbar();
     return (
        <View style={{flex: 1}}>
            <ScrollView style={{width: '100%', height: "100%"}}  onScroll={handleScroll} scrollEventThrottle={16}>
                <View style={{width: '100%', height: screenHeight, backgroundColor: '#fff'}}>
                    {/* Code màn hình ở đây*/}
                </View>
            </ScrollView>
            <Animated.View style={[styles.tabbar,
              {
                transform: [{ translateY: tabbarPosition }],
                position: 'absolute', bottom: 0,
              },
            ]}>
                <Tabbar/>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    tabbar: {
        width: '100%',
    }
})
export default HDSSTabbar;