import { Trip } from "@/src/interface/interface_detail"
import CIconButton from "@/src/shared/components/button/CIconButton"
import { MapStackParamList } from "@/src/shared/routes/MapNavigation"
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { View, StyleSheet, Text, TouchableOpacity, Modal } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons";
import Svg, { Line, Circle } from "react-native-svg";
import { useState } from "react";

type MapNavigationProp = StackNavigationProp<MapStackParamList, "CustomMap">;

interface CardTripProps {
    trip: Trip;
    deleteTrip: (id: string) => void;
}
const CardTrip = ({ trip, deleteTrip }: CardTripProps) => {
    const navigation = useNavigation<MapNavigationProp>();
    const [visible, setVisible] = useState<boolean>(false);
    useTheme();
    const onConfirm = () => {
        deleteTrip(trip._id);
        setVisible(false);
    }

    return (
        <View style={[styles.container, { borderColor: Color.border }]}>
            <TouchableOpacity style={styles.title} onPress={() => {navigation.navigate("Trip", {tripId: trip._id})}}>
                <Text style={[styles.namePlace, { color: Color.textPrimary }]}>{trip.name}</Text>
                <View style={styles.locationsContainer}>
                  <Svg height={22 * trip.listAddress.length + 50} width="20">
                    <Line
                      key={0}
                      x1="10"
                      y1={14}
                      x2="10"
                      y2={1 * 22 + 14}
                      stroke={Color.textPrimary}
                      strokeWidth="2"
                    />
                    {trip.listAddress.map((_, index) => (
                      index < trip.listAddress.length && (
                        <Line
                          key={index + 1}
                          x1="10"
                          y1={(index + 1) * 22 + 14}
                          x2="10"
                          y2={(index + 2) * 22 + 14}
                          stroke={Color.textPrimary}
                          strokeWidth="2"
                        />
                      )
                    ))}
                    <Circle
                        key={`circle-start`}
                        cx="10"
                        cy={14}
                        r="4"
                        fill={Color.textPrimary}
                      />
                    {trip.listAddress.map((_, index) => (
                      <Circle
                        key={`circle-${index + 1}`}
                        cx="10"
                        cy={(index + 1) * 22 + 14}
                        r="4"
                        fill={Color.textPrimary}
                      />
                    ))}
                    <Circle
                        key={`circle-end`}
                        cx="10"
                        cy={(trip.listAddress.length + 1) * 22 + 14}
                        r="4"
                        fill={Color.textPrimary}
                      />
                  </Svg>
                  <View style={styles.locationTexts}>
                    <Text key={'start'} style={[styles.location, { color: Color.textPrimary }]}>
                        {trip.startAddress?trip.startAddress.displayName:"Không xác định"}
                    </Text>
                    {trip.listAddress.map((loc, index) => (
                      <Text key={index} style={[styles.location, { color: Color.textPrimary }]}>
                        {loc.displayName}
                      </Text>
                    ))}
                    <Text key={'end'} style={[styles.location, { color: Color.textPrimary }]}>
                        {trip.endAddress?trip.endAddress.displayName:"Không xác định"}
                    </Text>
                  </View>
                </View>
            </TouchableOpacity>
            <CIconButton icon={<Icon name={"delete"} size={10} color={Color.textPrimary}/>}
                onSubmit={() => {setVisible(true)}}
                style={{
                width: 30,
                height: 30,
                radius: 50,
                shadow: true,
                backColor: 'transparent',
                textColor: 'transparent'
            }}/>
            <Modal visible={visible} transparent animationType="fade">
              <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: Color.background }]}>
                  <Text style={[styles.titleModal, { color: Color.textPrimary }]}>Xác nhận xóa chuyến đi?</Text>
                  <Text style={[styles.message, { color: Color.textSecondary }]}>Bạn có chắc muốn xóa chuyến đi này? Hành động này không thể hoàn tác.</Text>

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.cancelButton, { borderColor: Color.border }]} onPress={() => {setVisible(false)}}>
                      <Text style={[styles.cancelText, { color: Color.textPrimary }]}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.confirmButton, { backgroundColor: Color.error }]} onPress={onConfirm}>
                      <Text style={[styles.confirmText, { color: Color.textOnMain1 }]}>Xác nhận</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        width: '90%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    title: {
        padding: 10,
        maxWidth: '90%'
    },
    namePlace: {
        fontSize: 20,
        fontWeight: '600'
    },
    address: {
        fontSize: 10,
        maxHeight: '80%'
    },
    locationsContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    locationTexts: {
        paddingLeft: 10,
    },
    location: {
        fontSize: 14,
        marginTop: 5,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
      },
      modalContainer: {
        width: "80%",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
      },
    titleModal: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    message: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    cancelButton: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        alignItems: "center",
        marginRight: 5,
    },
    cancelText: {
        fontSize: 16,
    },
    confirmButton: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginLeft: 5,
    },
    confirmText: {
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default CardTrip;