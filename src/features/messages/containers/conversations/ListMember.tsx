import { Conversation } from "@/src/interface/interface_flex";
import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import restClient from "@/src/shared/services/RestClient";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ChatNavigationProp = StackNavigationProp<ChatStackParamList, "ListMember">;

const ListMember = () => {
    useTheme();
    const route = useRoute<RouteProp<ChatStackParamList, "ListMember">>();
    const { conversation } = route.params || {};
    const [userId, setUserId] = useState<string|null>(null);
    const [conversationdf, setConversationdf] = useState<Conversation>(conversation);
    const navigation = useNavigation<ChatNavigationProp>();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        getUserId();
    },[]);

    const handlePressUser = (userId: string) => {
        // navigation.navigate("UserDetail", { userId });
    };

    const getUserId = async () => {
        const id = await AsyncStorage.getItem('userId');
        setUserId(id);
    };

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
    };

    const updateUser = async (kickId: string) => {
        try {
            const conversationAPI = restClient.apiClient.service(`apis/conversations/${conversation._id}/setting`);
            const result = await conversationAPI.patch("", {
                setting: {
                    userId: kickId,
                    active: false
                }
            });
            if (result.success){
                setConversationdf({
                    ...conversationdf,
                    settings: conversationdf.settings.map((setting) => {
                        return {
                            ...setting,
                            active: setting.userId === kickId? false: setting.active
                        };
                    })
                });
                Alert.alert("Thông báo", `Xóa người dùng khỏi nhóm thành công`);
            }
            else Alert.alert("Thông báo", `Không thể xóa người dùng khỏi nhóm`);
        } catch (error) {
          Alert.alert("Thông báo", `Không thể xóa người dùng khỏi nhóm`);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: Color.background, }]}>
            <View style={[styles.header, { backgroundColor: Color.background }]}>
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
                    <TouchableOpacity style={[styles.userItem, styles.shadow, { backgroundColor: Color.backgroundSecondary, shadowColor: Color.shadow }]} onPress={() => handlePressUser(item._id)}>
                        <View style={styles.mainContent}>
                            <Image source={item.avt.length > 0 ? {uri: item.avt[item.avt.length - 1].url} : require('@/src/assets/images/default/default_user.png')} style={styles.images}/>
                            <View style={styles.content}>
                                <Text style={[styles.name, { color: Color.textPrimary }]}>{item.displayName}</Text>
                            </View>
                        </View>
                        {conversation.creatorId === userId && item._id !== userId && (
                          <TouchableOpacity onPress={() => handleKickUser(item._id)}>
                            <Feather name="user-minus" size={20} color={Color.error} />
                          </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                )}
            />
            ):(
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Color.background }}>
                    <ActivityIndicator size="large" color={Color.mainColor2}/>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header:{
        marginBottom: 10
    },
    userItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 10,
        padding : 7,
        marginVertical: 2,
        marginHorizontal: 5
    },
    shadow: {
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,

        elevation: 8,
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