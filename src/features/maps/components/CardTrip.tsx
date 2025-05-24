import { Trip } from "@/src/interface/interface_detail";
import CIconButton from "@/src/shared/components/button/CIconButton";
import { MapStackParamList } from "@/src/shared/routes/MapNavigation";
import getColor from "@/src/styles/Color";
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

    const onConfirm = () => {
        deleteTrip(trip._id);
        setVisible(false);
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.title} onPress={() => {navigation.navigate("Trip", {tripId: trip._id})}}> 
                <Text style={styles.namePlace}>{trip.name}</Text>
                <View style={styles.locationsContainer}>
                  <Svg height={22 * trip.listAddress.length + 50} width="20">
                    <Line
                      key={0}
                      x1="10"
                      y1={14}
                      x2="10"
                      y2={1 * 22 + 14}
                      stroke="black"
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
                          stroke="black"
                          strokeWidth="2"
                        />
                      )
                    ))}
                    <Circle
                        key={`circle-start`}
                        cx="10"
                        cy={14}
                        r="4"
                        fill="black"
                      />
                    {trip.listAddress.map((_, index) => (
                      <Circle
                        key={`circle-${index + 1}`}
                        cx="10"
                        cy={(index + 1) * 22 + 14}
                        r="4"
                        fill="black"
                      />
                    ))}
                    <Circle
                        key={`circle-end`}
                        cx="10"
                        cy={(trip.listAddress.length + 1) * 22 + 14}
                        r="4"
                        fill="black"
                      />
                  </Svg>
                  <View style={styles.locationTexts}>
                    <Text key={'start'} style={styles.location}>
                        {trip.startAddress.displayName}
                    </Text>
                    {trip.listAddress.map((loc, index) => (
                      <Text key={index} style={styles.location}>
                        {loc.displayName}
                      </Text>
                    ))}
                    <Text key={'end'} style={styles.location}>
                        {trip.endAddress.displayName}
                    </Text>
                  </View>
                </View>
            </TouchableOpacity>
            <CIconButton icon={<Icon name={"delete"} size={10} color={Color.white_contrast}/>} 
                onSubmit={() => {setVisible(true)}} 
                style={{
                width: 30,
                height: 30,
                radius: 50,
                shadow: true
            }}/>
            <Modal visible={visible} transparent animationType="fade">
              <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.titleModal}>Xác nhận xóa chuyến đi?</Text>
                  <Text style={styles.message}>Bạn có chắc muốn xóa chuyến đi này? Hành động này không thể hoàn tác.</Text>

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => {setVisible(false)}}>
                      <Text style={styles.cancelText}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                      <Text style={styles.confirmText}>Xác nhận</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
        </View>
    )
}

const Color = getColor();
const styles = StyleSheet.create({
    container: {
        width: '90%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: Color.textColor3
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
        backgroundColor: "white",
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
        color: "#555",
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
        borderColor: "#888",
        alignItems: "center",
        marginRight: 5,
    },
    cancelText: {
        fontSize: 16,
        color: "#333",
    },
    confirmButton: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        backgroundColor: "red",
        alignItems: "center",
        marginLeft: 5,
    },
    confirmText: {
        fontSize: 16,
        color: "white",
        fontWeight: "bold",
    },
});

export default CardTrip;