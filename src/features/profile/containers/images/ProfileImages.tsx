import { Animated, ScrollView, View, StyleSheet, ActivityIndicator } from "react-native";
import PreviewImages from "./PreviewImages";
import { useEffect } from "react";
import DetailsPhoto from "../../components/DetailsPhoto";
import useCollectionImages from "./useCollectionImages";

interface ProfileImagesProps {
  userId: string; // Thêm userId như một prop
}

const ProfileImages: React.FC<ProfileImagesProps> = ({ userId }) => {
  const fadeAnimAll = new Animated.Value(0);
  const fadeAnim = new Animated.Value(1);

  const {
    dataImages,
    dataImagesAvt,
    viewAll,
    handleSelectedPhoto,
    selectedPhoto,
    isModalVisible,
    closeModal
  } = useCollectionImages(userId); // Truyền userId vào hook

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

  if (dataImages === null || dataImagesAvt === null) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <ScrollView style={styles.scrollView}>
          <PreviewImages
            src={dataImages} // Hiển thị tất cả ảnh ngay từ đầu
            handleSelected={handleSelectedPhoto}
          />
        </ScrollView>
      </Animated.View>
      <DetailsPhoto
        source={selectedPhoto}
        isModalVisible={isModalVisible}
        closeModal={closeModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1, // Làm cho ScrollView chiếm toàn bộ không gian có sẵn
  },
});

export default ProfileImages;