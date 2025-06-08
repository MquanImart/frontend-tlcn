
import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    bannerContainer: {
        marginBottom: 30,
    },
    bannerImage: {
        width: 250,
        height: 250,
        resizeMode: "contain",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 0,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 50,
      },
      buttonContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        marginBottom: 30,
        gap: 15,
      },
      footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
      },
    subText: {
        fontSize: 10,
        color: "#888",
        textAlign: "center",
        marginBottom: 10,
    },
    imageButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: 250,
        height: 50,
        backgroundColor: "#4B164C",
        borderRadius: 25,
        marginBottom: 20,
    },
    imageButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginRight: 10,
    },
    loginText: {
        marginTop: 20,
        fontSize: 14,
        color: "#000",
    },
    loginLink: {
        color: "#ff6ec7",
        fontWeight: "bold",
    },
});
export default styles