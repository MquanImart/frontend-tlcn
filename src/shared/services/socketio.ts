import env from "@/env";
import { io } from "socket.io-client";

const SOCKET_URL = env.URL_BACKEND;

const socket = io(SOCKET_URL);

export default socket;
