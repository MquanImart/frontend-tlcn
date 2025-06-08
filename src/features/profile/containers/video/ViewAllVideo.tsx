import getColor from "@/src/styles/Color";
import { Image } from 'expo-image';
import { useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import DetailsPhoto from "../../components/DetailsPhoto";
import { generateThumbnailsInBatches } from "../../utils/Thumbnail";
import useViewAllVideo from "./useViewAllVideo";

const Color = getColor();

interface ViewAllVideoProps {
  userId: string; // Thêm userId như một prop
}

const ViewAllVideo: React.FC<ViewAllVideoProps> = ({ userId }) => {
  const {
    thumbnails,
    setThumbnails,
    selectedPhoto,
    handleSelectedPhoto,
    dataVideo,
    isModalVisible,
    closeModal
  } = useViewAllVideo(userId); // Truyền userId vào hook

  useEffect(() => {
    if (dataVideo !== null) {
      const generateThumbnails = async () => {
        const thumbUris = await generateThumbnailsInBatches(dataVideo.map((video) => video.url), 3);
        setThumbnails(thumbUris);
      };
      generateThumbnails();
    }
  }, [dataVideo]);

  if (dataVideo === null) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {dataVideo.map((item, index) => (
          <TouchableOpacity
            style={styles.video}
            key={item._id}
            onPress={() => {
              handleSelectedPhoto(item._id);
            }}
          >
            {thumbnails[index] ? (
              <Image
                source={{ uri: thumbnails[index] }}
                style={styles.thumbnail}
              />
            ) : (
              <View style={styles.placeholder}>
                <ActivityIndicator />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    color: Color.textColor3,
  },
  scrollViewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  video: {
    height: 200,
    width: '33%', // Chia thành 3 cột
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
    backgroundColor: '#ccc',
  },
});

export default ViewAllVideo;