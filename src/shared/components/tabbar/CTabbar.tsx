import { Animated, StyleSheet, Dimensions } from "react-native"
import Tabbar from "@/src/shared/components/tabbar/Tabbar";

interface CTabbarProps {
    tabbarPosition: Animated.Value; 
    startTab?: string;
}
const CTabbar = ({tabbarPosition, startTab}: CTabbarProps) => {
     return (
        <Animated.View style={[styles.tabbar,
          {
            transform: [{ translateY: tabbarPosition }],
            position: 'absolute', bottom: 0,
          },
        ]}>
            <Tabbar startTab={startTab}/>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    tabbar: {
        width: '100%',
    }
})
export default CTabbar;