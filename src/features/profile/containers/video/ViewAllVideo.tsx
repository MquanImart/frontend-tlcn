import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Image } from 'expo-image';
import { useEffect } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DetailsPhoto from "../../components/DetailsPhoto";
import { generateThumbnailsInBatches } from "../../utils/Thumbnail";
import useViewAllVideo from "./useViewAllVideo";

interface ViewAllVideoProps {
  userId: string;
}

const ViewAllVideo: React.FC<ViewAllVideoProps> = ({ userId }) => {
  useTheme();
  const {
    thumbnails,
    setThumbnails,
    selectedPhoto,
    handleSelectedPhoto,
    dataVideo,
    isModalVisible,
    closeModal
  } = useViewAllVideo(userId);

  useEffect(() => {
    if (dataVideo !== null) {
      const generateThumbnails = async () => {
        const thumbUris = await generateThumbnailsInBatches(dataVideo.map((video) => video.url), 3);
        setThumbnails(thumbUris);
      };
      generateThumbnails();
    }
  }, [dataVideo]);

  if (dataVideo === null) return <ActivityIndicator color={Color.mainColor2} />;

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={styles.video}
      onPress={() => handleSelectedPhoto(item._id)}
    >
      {thumbnails[index] ? (
        <Image
          source={{ uri: thumbnails[index] }}
          style={styles.thumbnail}
        />
      ) : (
        <View style={[styles.placeholder, { backgroundColor: Color.backgroundTertiary }]}>
          <ActivityIndicator color={Color.textPrimary} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dataVideo}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={3}
        contentContainerStyle={styles.flatListContainer}
      />
      <DetailsPhoto
        source={selectedPhoto}
        isModalVisible={isModalVisible}
        closeModal={closeModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '99%',
  },
  boxTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textViewAll: {
  },
  flatListContainer: {
    paddingBottom: 2,
  },
  video: {
    height: 200,
    width: '33%',
    marginBottom: 2,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ViewAllVideo;