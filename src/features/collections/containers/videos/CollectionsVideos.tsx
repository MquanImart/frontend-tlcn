import { Animated, View, } from "react-native"
import { useEffect } from "react";
import ViewAllVideo from "./ViewAllVideo";

interface CollectionsVideosProps {
  handleScroll: (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => void;
}

const CollectionsVideos = ({handleScroll}: CollectionsVideosProps) => {
    const fadeAnimAll = new Animated.Value(0);
    
    useEffect(()=> {
      Animated.timing(fadeAnimAll, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
        <View style={{flex: 1}}>
          <Animated.View style={{ opacity: fadeAnimAll }}>
            <ViewAllVideo label={"Tất cả Video"} 
                handleScroll={handleScroll}
            />
          </Animated.View>
        </View>
    )
}
export default CollectionsVideos;