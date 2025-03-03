import { Lobby } from "./Lobby";
import { Socket } from "socket.io-client";

export class Manager{
    socket: Socket
    constructor(socket: Socket){
        this.socket = socket
        new Lobby(this.socket)
    }
}