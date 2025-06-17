import TabbarTop, { TabProps } from "@/src/shared/components/tabbar-top/TabbarTop";
import restClient from '@/src/shared/services/RestClient';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CHeader from '../../reel/components/Header';
import ProfileImages from './images/ProfileImages';
import ProfilePost from './post/ProfilePost';
import ViewAllVideo from './video/ViewAllVideo';
import { ProfileStackParamList } from "@/src/shared/routes/ProfileNavigation";

const UsersClient = restClient.apiClient.service("apis/users");
const myPhotosClient = restClient.apiClient.service("apis/myphotos");

type ProfileNavigationProp = StackNavigationProp<ProfileStackParamList, "Profile">;

const MyProfile = () => {
    useTheme();
    const navigation = useNavigation<ProfileNavigationProp>();
    const [user, setUser] = useState<any>(null);
    const [avt, setAvt] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const tabs: TabProps[] = [
        { label: 'Hình ảnh' },
        { label: 'Video' },
        { label: 'Bài viết' },
    ];

    const [currTab, setCurrTab] = useState<string>(tabs.length > 0 ? tabs[0].label : '');

    const getUserId = async () => {
        try {
            const id = await AsyncStorage.getItem("userId");
            setUserId(id);
        } catch (err) {
            console.error("Lỗi khi lấy userId từ AsyncStorage:", err);
        }
    };

    const getUser = async (userID: string) => {
        try {
            setLoading(true);
            const userData = await UsersClient.get(userID);
            if (userData.success) {
                setUser(userData.data);
                if (userData.data.avt.length > 0) {
                    const myAvt = await myPhotosClient.get(userData.data.avt[userData.data.avt.length - 1]);
                    setAvt(myAvt.data.url);
                } else {
                    setAvt(null);
                }
            }
        } catch (err) {
            setError("Có lỗi xảy ra khi tải thông tin người dùng");
            console.error("Lỗi khi lấy thông tin người dùng:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUserId();
    }, []);

    useEffect(() => {
        if (userId) {
            getUser(userId);
        }
    }, [userId]);

    useFocusEffect(
        React.useCallback(() => {
            if (userId) {
                getUser(userId);
            }
        }, [userId])
    );

    const followersCount = user?.followers?.length || 0;
    const friendsCount = user?.friends?.length || 0;
    const followingCount = user?.following?.length || 0;

    const renderHeader = () => (
        <View>
            <CHeader
                label="My Profile"
                backPress={() => navigation.goBack()}
                rightPress={() => navigation.navigate("EditProfile")}
                labelColor={Color.mainColor2}
                iconColor={Color.mainColor2}
                rightIcon="settings"
            />
            <View style={styles.profileInfo}>
                {loading ? (
                    <Text style={{ textAlign: 'center', fontSize: 16, width: '70%', marginVertical: 10, color: Color.textSecondary }}>Đang tải...</Text>
                ) : error ? (
                    <Text style={{ textAlign: 'center', fontSize: 16, width: '70%', marginVertical: 10, color: Color.error }}>{error}</Text>
                ) : (
                    <>
                        <Image
                            source={avt ? { uri: avt } : require('@/src/assets/images/default/default_user.png')}
                            style={styles.profileImage}
                        />
                        <TouchableOpacity>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10, color: Color.textPrimary }}>
                                {user?.displayName || "Không có tên"}
                            </Text>
                        </TouchableOpacity>
                        <Text style={{ textAlign: 'center', fontSize: 16, width: '70%', marginVertical: 10, color: Color.textSecondary }}>
                            {user?.aboutMe || " "}
                        </Text>
                    </>
                )}
                <View style={styles.stats}>
                    <View style={styles.statItem}>
                        <Text style={{ fontSize: 14, color: Color.textSecondary }}>Người theo dõi</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Color.textPrimary }}>{followersCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={{ fontSize: 14, color: Color.textSecondary }}>Bạn bè</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Color.textPrimary }}>{friendsCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={{ fontSize: 14, color: Color.textSecondary }}>Đang theo dõi</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Color.textPrimary }}>{followingCount}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderContent = () => (
        <View style={{ flex: 1, backgroundColor: Color.background,padding: 10 }}>
            <View style={{ width: '100%', height: "100%" }}>
                <TabbarTop tabs={tabs} startTab={currTab} setTab={setCurrTab} />
                {currTab === tabs[0].label ? (
                    <ProfileImages userId={userId || ''} />
                ) : currTab === tabs[1].label ? (
                    <ViewAllVideo userId={userId || ''} />
                ) : (
                    <ProfilePost userIdProfile={userId || ''} />
                )}
            </View>
        </View>
    );

    return (
        <FlatList
            ListHeaderComponent={renderHeader}
            data={[{}]} // Single item to render content once
            renderItem={() => renderContent()}
            keyExtractor={() => 'content'}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            contentContainerStyle={styles.flatListContainer}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    profileInfo: {
        alignItems: 'center',
        marginTop: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        alignSelf: 'center',
        marginTop: 10,
    },
    statItem: {
        alignItems: 'center',
    },
    flatListContainer: {
        backgroundColor: Color.background,
        paddingBottom: 20,
    },
});

export default MyProfile;