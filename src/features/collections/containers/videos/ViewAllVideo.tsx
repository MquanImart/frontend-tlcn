import getColor from "@/src/styles/Color"
import { FlatList, View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native"
import { useEffect } from "react";
import { generateThumbnailsInBatches } from "../../utils/Thumbnail";
import DetailsPhoto from "../../components/DetailsPhoto";
import useViewAllVideo from "./useViewAllVideo";

interface ViewAllImagesProps {
    label: string;
    handleScroll: (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => void;
}

const Color = getColor();

const ViewAllVideo = ({label, handleScroll}: ViewAllImagesProps) => {
    
    const {thumbnails, setThumbnails, selectedPhoto, handleSelectedPhoto, dataVideo,
      isModalVisible, closeModal} = useViewAllVideo();

    useEffect(() => {
        if (dataVideo !== null){
          const generateThumbnails = async () => {
            const thumbUris = await generateThumbnailsInBatches(dataVideo.map((video) => video.url), 3);
            setThumbnails(thumbUris);
          };
          generateThumbnails();
        } 
      }, [dataVideo]);
    
    if (dataVideo === null) return <ActivityIndicator/>

    return (
        <View style={styles.container}>
            <View style={styles.boxTitle}>
                <Text style={styles.label}>{label}</Text>
            </View>
            <FlatList
              data={dataVideo}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.video}
                  key={index}
                  onPress={() => {handleSelectedPhoto(item._id)}}
                >
                  {thumbnails[index] ? (
                    <Image
                      source={{ uri: thumbnails[index] }}
                      style={styles.thumbnail}
                    />
                  ) : (
                    <View style={styles.placeholder}>
                      <ActivityIndicator/>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              onScroll={handleScroll}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={styles.row}
            />
            <DetailsPhoto source={selectedPhoto} 
              isModalVisible={isModalVisible} 
              closeModal={closeModal}
            />
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '99%',
    },
    boxTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    label: {
        fontWeight: 'bold'
    },
    textViewAll: {
        color: Color.textColor3
    },
    video: {
        height: 200, width: '49%',
        margin: 2,
    },
    row: {
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: 'row',
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
})


export default ViewAllVideo;