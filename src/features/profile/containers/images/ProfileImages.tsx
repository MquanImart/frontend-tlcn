import { Animated, FlatList, View, StyleSheet, ActivityIndicator } from "react-native";
import PreviewImages from "./PreviewImages";
import { useEffect } from "react";
import DetailsPhoto from "../../components/DetailsPhoto";
import useCollectionImages from "./useCollectionImages";

interface ProfileImagesProps {
  userId: string;
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
  } = useCollectionImages(userId);

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

  const renderItem = () => (
    <PreviewImages
      src={dataImages}
      handleSelected={handleSelectedPhoto}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <FlatList
          data={[{}]} // Single item to render PreviewImages once
          renderItem={renderItem}
          keyExtractor={() => 'preview-images'}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContainer}
        />
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
  flatListContainer: {
    flexGrow: 1, // Ensure content takes available space
  },
});

export default ProfileImages;