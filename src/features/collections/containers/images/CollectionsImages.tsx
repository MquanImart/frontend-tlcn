import { Animated, ScrollView, View, StyleSheet, ActivityIndicator } from "react-native"
import PreviewImages from "./PreviewImages";
import { useEffect } from "react";
import ViewAllImages from "./ViewAllImages";
import DetailsPhoto from "../../components/DetailsPhoto";
import useCollectionImages from "./useCollectionImages";

interface CollectionsImagesProps {
  handleScroll: (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => void;
}

const CollectionsImages = ({handleScroll}: CollectionsImagesProps) => {

    const fadeAnimAll = new Animated.Value(0);
    const fadeAnim = new Animated.Value(1);
    
    const {dataImages, dataImagesAvt, viewAll, handleViewAll, handleSelectedPhoto, 
      currentView, selectedPhoto, isModalVisible, closeModal, selectedData} = useCollectionImages();

    useEffect(() => {
        Animated.timing(fadeAnim, {
          toValue: viewAll ? 0 : 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
        Animated.timing(fadeAnimAll, {
            toValue: viewAll ? 1 : 0,
            duration: 1000,
            useNativeDriver: true,
          }).start();
      }, [viewAll]);

    if (dataImages === null || dataImagesAvt === null) return <ActivityIndicator />
    
    return (
        <View style={{flex: 1}}>
          {!viewAll ? (
            <Animated.View style={{ opacity: fadeAnim }}>
              <ScrollView style={styles.scrollView} onScroll={handleScroll}>
                  <PreviewImages label={"Ảnh đại diện"} 
                      onPressViewAll={() => {handleViewAll("Ảnh đại diện")}} 
                      src={dataImagesAvt.slice(0, 4)}
                      handleSelected={handleSelectedPhoto}
                  />
                  <PreviewImages label={"Ảnh tải lên"} 
                      onPressViewAll={() => {handleViewAll("Ảnh tải lên")}} 
                      src={dataImages.slice(0, 4)}
                      handleSelected={handleSelectedPhoto}
                  />
              </ScrollView>
            </Animated.View>
          ) : (
            <Animated.View style={{ opacity: fadeAnimAll }}>
              <ViewAllImages label={currentView} 
                  src={selectedData?selectedData:[]} 
                  onBack={() => {handleViewAll("")}} 
                  handleScroll={handleScroll}
                  handleSelected={handleSelectedPhoto}
              />
            </Animated.View>
          )}
          <DetailsPhoto source={selectedPhoto} 
                isModalVisible={isModalVisible} 
                closeModal={closeModal}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    tabbar: {
        width: '100%',
    },
    scrollView: {
        height: '100%',
    }
})
export default CollectionsImages;