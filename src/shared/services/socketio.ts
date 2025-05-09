import { io } from "socket.io-client";

const SOCKET_URL = "http://192.168.1.8:3000";

const socket = io(SOCKET_URL);

export default socket;
