import getColor from "@/src/styles/Color";
import { useState } from "react";
import { Modal, View, StyleSheet, Text, TouchableOpacity, Dimensions, Alert } from "react-native"
import SearchPlace from "../containers/directions/SearchPlace";
import { LocationRoute } from "../containers/directions/interfaceAPIRoute";
import { CLocation } from "@/src/interface/interface_detail";
import CButton from "@/src/shared/components/button/CButton";
import { TextInput } from "react-native-gesture-handler";

const WIDTH_SCREEN = Dimensions.get('window').width;

interface ModalCreateTripProps {
    visible: boolean;
    setVisible: (value: boolean) => void;
    submitModal: (name: string, startLocation: CLocation, endLocation: CLocation) => void;
}

const ModalCreateTrip = ( { visible, setVisible, submitModal } : ModalCreateTripProps) => {
    const [visiableSearch, setVisiableSearch] = useState<'START' | 'END' | null>(null);
    const [startLocation, setStartLocation] = useState<CLocation | null>(null);
    const [endLocation, setEndLocation] = useState<CLocation | null>(null);
    const [text, setText] = useState<string>("");

    const selectedSearch = (value: LocationRoute) => {
        if (visiableSearch === 'START'){
            setStartLocation({
                displayName: value.displayName?value.displayName:"Không xác định",
                latitude: value.latitude,
                longitude: value.longitude,
                address: value.address?value.address:"Không xác định"
            })
            setVisiableSearch(null);
        } else if (visiableSearch === 'END'){
            setEndLocation({
                displayName: value.displayName?value.displayName:"Không xác định",
                latitude: value.latitude,
                longitude: value.longitude,
                address: value.address?value.address:"Không xác định"
            })
            setVisiableSearch(null);
        }
    }

    const createTrip = () => {
        if (text !== "" && startLocation && endLocation){
            submitModal(text, startLocation, endLocation);
            setVisible(false);
        } else {
            Alert.alert("Bạn phải điền đầy đủ thông tin");
        }
    }

    return (
        <Modal
          visible={visible}
          animationType="slide"
          transparent={false} // Đảm bảo modal phủ toàn bộ màn hình
          presentationStyle="fullScreen" // Chỉ có tác dụng trên iOS
        >
          <View style={styles.container}>
            <View style={styles.formContainer}>
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>Tạo chuyến đi</Text>
                    <View style={styles.boxItem}>
                        <Text style={styles.label}>Tên chuyến đi</Text>
                        <TextInput
                            style={styles.textInput}
                            value={text}
                            onChangeText={setText}
                        />
                    </View>
                    <View style={styles.boxItem}>
                        <Text style={styles.label}>Chọn điểm bắt đầu</Text>
                        <TouchableOpacity style={styles.buttonSearch} onPress={() => setVisiableSearch('START')}>
                            <Text style={(!startLocation || !startLocation.displayName) && styles.textSearch}>
                                {(startLocation && startLocation.displayName) || "Điểm bắt đầu"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.boxItem}>
                        <Text style={styles.label}>Chọn điểm kết thúc</Text>
                        <TouchableOpacity style={styles.buttonSearch} onPress={() => setVisiableSearch('END')}>
                            <Text style={(!endLocation || !endLocation.displayName) && styles.textSearch}>
                                {(endLocation && endLocation.displayName) || "Điểm kết thúc"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.boxAction}>
                        <CButton
                            label="Tạo"
                            onSubmit={() => {createTrip()}}
                            style={{
                                width: "30%",
                                height: 40,
                                backColor: Color.white_homologous,
                                borderColor: Color.mainColor1,
                                borderWidth: 1,
                                textColor: Color.mainColor1,
                                fontSize: 15,
                                radius: 25,
                            }}
                        />
                        <View style={styles.boxC}/>
                        <CButton
                            label="Đóng"
                            onSubmit={() => {setVisible(false)}}
                            style={{
                                width: "30%",
                                height: 40,
                                backColor: Color.mainColor1,
                                textColor: Color.white_homologous,
                                fontSize: 15,
                                fontWeight: 'bold',
                                radius: 25,
                            }}
                        />
                    </View>
                </View>
                {visiableSearch && <View style={styles.boxSearch}>
                    <SearchPlace 
                    onBack={() => {setVisiableSearch(null)}} 
                    selectedLocation={selectedSearch}/>
                </View>}
            </View>
          </View>
        </Modal>
    )
}

const Color = getColor();

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 40,
    },
    formContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    buttonSearch: {
        width: WIDTH_SCREEN - 80,
        height: 50,
        paddingHorizontal: 10,
        fontSize: 16,
        borderRadius: 10,
        backgroundColor: Color.backGround,
        borderColor: Color.backGround1,
        borderWidth: 1,
        justifyContent: 'center',
    },
    textSearch: {
        color: Color.textColor3
    },
    boxSearch: {
        position: 'absolute',
        top: 0,
        zIndex: 10,
        backgroundColor: Color.backGround,
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 50
    },
    boxItem: {
        paddingVertical: 10
    },
    label: {
        marginBottom: 10
    },
    boxAction: {
        width: '100%',
        marginTop: 20,
        flexDirection: 'row',
    },
    closeButton: {
        position: "absolute",
        top: 20,
        right: 20,
        padding: 10,
        backgroundColor: Color.mainColor1,
        borderRadius: 20,
    },
    contentContainer: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 10
    },
    boxC: {
        width: 50
    },
    textInput: {
        width: WIDTH_SCREEN - 80,
        height: 50,
        paddingHorizontal: 10,
        fontSize: 16,
        borderRadius: 10,
        backgroundColor: Color.backGround,
        borderColor: Color.backGround1,
        borderWidth: 1,
    }
  });

export default ModalCreateTrip;