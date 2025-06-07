import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet,Image, ActivityIndicator, Alert } from "react-native";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from '@expo/vector-icons';
import getColor from "@/src/styles/Color";
import restClient from "@/src/shared/services/RestClient";
import { Conversation } from "@/src/interface/interface_flex";
import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";

type ChatNavigationProp = StackNavigationProp<ChatStackParamList, "ListMember">;

const ListMember = () => {
    const route = useRoute<RouteProp<ChatStackParamList, "ListMember">>();
    const { conversation } = route.params || {};
    const [userId, setUserId] = useState<string|null>(null);
    const [conversationdf, setConversationdf] = useState<Conversation>(conversation);
    const navigation = useNavigation<ChatNavigationProp>();

        useEffect(() => {
        getUserId();
    },[]);

    const handlePressUser = (userId: string) => {
        // Bạn có thể điều hướng đến trang chi tiết user tại đây
        // navigation.navigate("UserDetail", { userId });
    };

    const getUserId = async () => {
        const id = await AsyncStorage.getItem('userId');
        setUserId(id);
    }

    const handleKickUser = (kickId: string) => {
        Alert.alert(
          "Xác nhận",
          "Bạn có chắc muốn xóa người này khỏi nhóm?",
          [
            { text: "Hủy" },
            {
              text: "Kích",
              style: "destructive",
              onPress: async () => {updateUser(kickId)},
            },
          ]
        );
    }

    const updateUser = async (kickId: string) => {
        try {
            const conversationAPI = restClient.apiClient.service(`apis/conversations/${conversation._id}/setting`);
            const result = await conversationAPI.patch("", {
                setting: {
                    userId: kickId,
                    active: false
                }
            })
            if (result.success){
                setConversationdf({
                    ...conversationdf,
                    settings: conversationdf.settings.map((setting) => {
                        return {
                            ...setting,
                            active: setting.userId === kickId? false: setting.active
                        }
                    })
                })
                Alert.alert("Thông báo", `Xóa người dùng khỏi nhóm thành công`)
            }
            else Alert.alert("Thông báo", `Không thể xóa người dùng khỏi nhóm`)
        } catch (error) {
          Alert.alert("Thông báo", `Không thể xóa người dùng khỏi nhóm`)
        }
    }
    return (
        <View style={styles.container}>
            <View style={[styles.header]}>
                <CHeaderIcon 
                label={"Thành viên"} 
                IconLeft={"arrow-back-ios"} 
                onPressLeft={() => navigation.goBack()}
                textRight="Thêm"
                onPressRight={() => {
                  const activeParticipants = conversationdf.participants.filter((participantId) => {
                    const setting = conversationdf.settings.find(
                      (s) => s.userId?.toString() === participantId?._id.toString()
                    );
                    return setting?.active && participantId?._id.toString() !== userId?.toString();
                  });
              
                  navigation.navigate("AddMember", {
                    conversationId: conversationdf._id,
                    defaultChoose: activeParticipants,
                  });
                }}
                />
            </View>
            {userId?(
                <FlatList
                data={
                  conversationdf.participants.filter((participant) => {
                    const setting = conversationdf.settings.find(
                      (s) => s.userId === participant._id
                    );
                    return setting?.active !== false;
                  })
                }
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={[styles.userItem, styles.shadow]} onPress={() => handlePressUser(item._id)}>
                        <View style={styles.mainContent}>
                            <Image source={item.avt.length > 0 ? {uri: item.avt[item.avt.length - 1].url} : require('@/src/assets/images/default/default_user.png')} style={styles.images}/>
                            <View style={styles.content}>
                                <Text style={styles.name}>{item.displayName}</Text>
                            </View>
                        </View>
                        {conversation.creatorId === userId && item._id !== userId && (
                          <TouchableOpacity onPress={() => handleKickUser(item._id)}>
                            <Feather name="user-minus" size={20} color="red" />
                          </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                )}
            />
            ):(
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
            )}
        </View>
    );
};

const Color = getColor();

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header:{
        backgroundColor: Color.backGround,
        marginBottom: 10
    },
    userItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Color.backGround,
        borderRadius: 10,
        padding : 7,
        marginVertical: 2,
        marginHorizontal: 5
    },
        shadow: {
        shadowColor: "#000", // Màu bóng
        shadowOffset: {
          width: 0, // Đổ bóng theo chiều ngang
          height: 4, // Đổ bóng theo chiều dọc
        },
        shadowOpacity: 0.3, // Độ mờ của bóng (0 - 1)
        shadowRadius: 4.65, // Độ mờ viền của bóng
        elevation: 8, // Dùng cho Android (giá trị càng cao bóng càng đậm)
    },
    userName: {
        fontSize: 16,
    },
    mainContent: {
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    content: {
        width: '90%',
        paddingHorizontal: 10,
        justifyContent: 'space-between'
    },
    name: {
        fontSize: 17
    },
    images: {
        width: 50, height: 50,
        borderRadius: 50
    },
    kickText: {
      color: 'red',
      fontSize: 14,
      marginTop: 5
    }

});

export default ListMember;
