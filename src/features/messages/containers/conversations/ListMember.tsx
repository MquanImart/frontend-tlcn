import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet,Image } from "react-native";
import CHeader from "@/src/shared/components/header/CHeader";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

type ChatNavigationProp = StackNavigationProp<ChatStackParamList, "ListMember">;

const ListMember = () => {
    const route = useRoute<RouteProp<ChatStackParamList, "ListMember">>();
    const { listUser } = route.params || {};
    const navigation = useNavigation<ChatNavigationProp>();

    const handlePressUser = (userId: string) => {
        // Bạn có thể điều hướng đến trang chi tiết user tại đây
        // navigation.navigate("UserDetail", { userId });
    };

    return (
        <View style={styles.container}>
            <CHeader label="Thành viên" showBackButton={true} backPress={() => navigation.goBack()} />
            
            <FlatList
                data={listUser}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.userItem} onPress={() => handlePressUser(item._id)}>
                        <View style={styles.mainContent}>
                            <Image source={{uri: item.avt.length > 0 ? item.avt[item.avt.length - 1] :  "https://picsum.photos/200"}} style={styles.images}/>
                            <View style={styles.content}>
                                <Text style={styles.name}>{item.displayName}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    userItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
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
});

export default ListMember;
