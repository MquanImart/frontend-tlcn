import { MyPhoto } from "@/src/interface/interface_flex";
import { ResizeMode, Video } from "expo-av";
import { Image } from 'expo-image';
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DetailsPhotoProps {
    source: MyPhoto | null;
    isModalVisible: boolean;
    closeModal: () => void;
}

const DetailsPhoto = ({source, isModalVisible, closeModal}: DetailsPhotoProps) => {  
    const [isOptionModalVisible, setOptionModalVisible] = useState(false);
    const videoRef = React.useRef(null);
    const closeOptionModal = () => {
      setOptionModalVisible(false);
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
              </View>
            )}
          </View>
        </View>
        <Modal visible={isOptionModalVisible} animationType="fade" transparent={true} onRequestClose={closeOptionModal}>
      </Modal>
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
      padding: 0,
      borderRadius: 10,
      alignItems: 'center',
    },
    boxClose: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    textClose: {
        color: "#fff",
        paddingRight: 10
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
        marginVertical: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
    },
    video: {
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
    },
})

export default DetailsPhoto;