import { useTheme } from '@/src/contexts/ThemeContext';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, TouchableWithoutFeedback, Keyboard, Modal } from "react-native"
import FriendCard from "../../components/FriendCard";
import CSearch from "../../components/CSearch";
import { useCallback, useState } from "react";
import useAllFriends from "./useAllFriends";
import { useFocusEffect } from "@react-navigation/native";
import { ButtonActions } from "../../components/ActionsCard";

interface AllFriendsProps {
    handleScroll: (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => void;
}

const AllFriends = ({handleScroll}: AllFriendsProps) => {
    useTheme();
    const {filterFriends, search, setSearch, handleSearch, getAllFriends, unFriends} = useAllFriends();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
              await getAllFriends();
            }
            load();
        }, [])
    );
    
    const HandleButton = (_id: string) => {
        return ButtonActions({label: ["Hủy kết bạn"], actions: [() => {handleUnfriend(_id)}]})
    }

    const handleUnfriend = (_id: string) => {
        setSelectedId(_id)
        setModalVisible(true);
    };

    const confirmUnfriend = () => {
      if (selectedId){
        unFriends(selectedId);
        setModalVisible(false);
        setSelectedId(null);
      }
    };

    const cancelUnfriend = () => {
        setModalVisible(false);
        setSelectedId(null);
    };
    if (!filterFriends) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
            <CSearch handleSearch={() => {handleSearch(search)}} handleChange={setSearch} text={search}/>
            <View style={styles.boxTitle}>
                <Text style={styles.label}>Tất cả bạn bè</Text>
            </View>
            <FlatList onScroll={handleScroll} style={styles.listCard} data={filterFriends} renderItem={({item})=>
                <View style={styles.boxCard}>
                <FriendCard key={item._id} _id={item._id} name={item.displayName} img={item.avt} 
                    aboutMe={item.aboutMe?item.aboutMe: ""}
                    button={() => {return HandleButton(item._id)}}
                />
                </View>
            }/>
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={cancelUnfriend} // Đóng khi nhấn nút back trên Android
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Xác nhận</Text>
                  <Text style={styles.modalMessage}>
                    Bạn có chắc chắn muốn hủy kết bạn?
                  </Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={cancelUnfriend}>
                      <Text style={styles.buttonText}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirmButton} onPress={confirmUnfriend}>
                      <Text style={styles.buttonText}>Đồng ý</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
        </View>
        </TouchableWithoutFeedback>
    )
}


const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '80%'
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
    listCard: {
        paddingVertical: 10,
    },
    boxCard: {
        width: '90%',
        alignSelf: 'center'
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Nền mờ
      },
      modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
      },
      modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
      },
      modalMessage: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
      },
      buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
      },
      cancelButton: {
        flex: 1,
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
        alignItems: 'center',
      },
      confirmButton: {
        flex: 1,
        backgroundColor: '#ff4444',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
      },
      buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
      },
})


export default AllFriends;