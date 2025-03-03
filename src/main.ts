import { Manager } from "./Manager";
import { io, Socket } from "socket.io-client";

const onLoad = () => {
  const socket: Socket = io("http://localhost:3000/");
  new Manager(socket);
};

window.addEventListener("DOMContentLoaded", onLoad);
