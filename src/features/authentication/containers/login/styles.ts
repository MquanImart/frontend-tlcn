import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        color: "#3d3d3d",
        marginBottom: 5,
    },
    logoContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    logo: {
        width: 180,
        height: 180,
        borderRadius: 50,
    },
    loginTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#3d3d3d",
        marginBottom: 10,
    },
    orText: {
        fontSize: 14,
        color: "#999",
        marginVertical: 5,
        textAlign: "center",
    },
    togglepass:{
        position: "absolute",
        right: 10,
        top: 10,
    },
    btnForgot:{
        width: "100%", 
        alignItems: "flex-start", 
        marginTop: 10
    },
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        width: 250,
        justifyContent: "center",
        marginVertical: 5,
    },
    googleIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    googleButtonText: {
        fontSize: 14,
        color: "#3d3d3d",
    },
    registerText: {
        fontSize: 14,
        color: "#999",
        marginTop: 10,
    },
    registerLink: {
        fontSize: 14,
        color: "#d1a6e6",
        fontWeight: "bold",
    },
    forgotLink:{
        fontSize: 14,
        color: "#d1a6e6",
        fontWeight: "bold",
    },
});

export default styles