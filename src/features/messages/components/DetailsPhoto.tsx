import { MyPhoto } from "@/src/interface/interface_reference";
import { ResizeMode, Video } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Image } from 'expo-image';
import * as MediaLibrary from "expo-media-library";
import React, { useState } from "react";
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface DetailsPhotoProps {
    source: MyPhoto | null;
    isModalVisible: boolean;
    closeModal: () => void;
}

const DetailsPhoto = ({source, isModalVisible, closeModal}: DetailsPhotoProps) => {  
    const [isOptionModalVisible, setOptionModalVisible] = useState(false);
    const videoRef = React.useRef(null);
    
    const downloadImage = async (imageUrl: string) => {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Quyền truy cập bị từ chối", "Vui lòng cấp quyền lưu ảnh.");
          return;
        }
    
        const fileUri = `${FileSystem.documentDirectory}downloaded_image.jpg`;
        const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);
    
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Thành công", "Ảnh đã được lưu vào thư viện!");
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải ảnh về máy.");
        console.error(error);
      }
    };

    const handleOpenOption = (imageUrl: string) => {
      Alert.alert("Tải ảnh", "Bạn muốn tải ảnh về máy?", [
        { text: "Tải về", onPress: () => downloadImage(imageUrl) },
        { text: "Đóng", style: "cancel" },
      ]);
    };
  
    return (
        <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {source && (
              <View style={styles.container}>
                <View style={styles.boxClose}>
                    <TouchableOpacity onPress={closeModal}>
                        <Text style={styles.textClose}>Đóng</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.boxImages}>
                {source.type === 'img' ? (
                    <Image
                        source={{uri: source.url}} 
                        style={styles.image} 
                        resizeMode="contain"
                    />
                ) : source.type === 'video'? (
                  <Video
                    ref={videoRef}
                    style={styles.video}
                    source={{uri: source.url}} 
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping
                    shouldPlay={true}
                  />
                ): (<View></View>)}
                </View>
                <View>
                    <View style={styles.boxRow}>
                        <Text style={styles.textClose}>{source.name}</Text>
                        <TouchableOpacity onPress={() =>{handleOpenOption(source.url)}}>
                            <Icon name="download" size={25} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 1)',
    },
    modalContent: {
      width: '100%',
      height: '100%',
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    boxClose: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    textClose: {
        color: "#fff",
    },
    container: {
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    boxImages: {
        width: '100%',
        height: 600,
        marginVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
    },
    boxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionModalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        paddingBottom: 100,
        paddingRight: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    optionModalContent: {
        borderColor: "#ccc",
        borderWidth: 1,
        backgroundColor: 'white',
        borderRadius: 20,
        alignItems: 'center',
        width: '50%',
    },
    optionButton: {
        width: '100%',
        padding: 10,
    },
    borderBottom: {
        borderColor: "#ccc",
        borderBottomWidth: 1,
    },
    optionText: {
        fontSize: 18,
        color: 'black',
    },
    video: {
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
    },
})

export default DetailsPhoto;