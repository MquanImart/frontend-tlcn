    // src/features/group/components/InvitedAdminItem.tsx
    import { useTheme } from '@/src/contexts/ThemeContext';
    import { colors as Color } from '@/src/styles/DynamicColors';
    import { Image } from 'expo-image';
    import React from "react";
    import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

    const DEFAULT_AVATAR = "https://storage.googleapis.com/kltn-hcmute/public/default/default_user.png";

    interface InvitedAdminItemProps {
    name: string;
    avatar: string;
    inviteDate: string; 
    onRevoke: () => void;
    showRevokeButton?: boolean;
    }

    const InvitedAdminItem: React.FC<InvitedAdminItemProps> = ({
    name,
    avatar,
    inviteDate,
    onRevoke,
    showRevokeButton = true,
    }) => {
    useTheme(); 
    
    const avatarSource = avatar && avatar.trim() !== "" ? { uri: avatar } : { uri: DEFAULT_AVATAR };

    return (
        <View style={[
        styles.container,
        { backgroundColor: Color.backgroundSecondary, borderColor: Color.border }, 
        styles.shadowEffect
        ]}>
        <View style={styles.header}>
            <Image 
            source={avatarSource} 
            style={[styles.avatar, { borderColor: Color.mainColor2 }]}
            />
            <View style={styles.infoContainer}>
            <View style={styles.row}>
                <Text style={[styles.name, { color: Color.textPrimary }]}>{name}</Text>
                {/* Nút Thu hồi */}
                {showRevokeButton && (
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: Color.error }]} 
                    onPress={onRevoke}
                >
                    <Text style={[styles.buttonText, { color: Color.textOnMain2 }]}>Thu hồi</Text> 
                </TouchableOpacity>
                )}
            </View>
            <Text style={[styles.date, { color: Color.textSecondary }]}>Ngày gửi: {inviteDate}</Text>
            </View>
        </View>
        </View>
    );
    };

    export default InvitedAdminItem;

    const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 15,
    },
    shadowEffect: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 4,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
        borderWidth: 2,
    },
    infoContainer: {
        flex: 1,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 5,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        flexShrink: 1, // Đảm bảo tên không tràn
        marginRight: 10, // Khoảng cách với nút
    },
    date: {
        fontSize: 14,
    },
    button: {
        width: 80,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        marginLeft: 'auto', 
    },
    buttonText: {
        fontWeight: "600",
        fontSize: 14,
    },
    });