import { Game } from "./Game";
import { Lobby } from "./Lobby";
import { Socket } from "socket.io-client";

export class Manager {
  socket: Socket;
  lobby: Lobby;
  game: Game | null = null
  constructor(socket: Socket) {
    this.socket = socket;
    this.lobby = new Lobby(this.socket);

    // Listen for game start
    this.socket.on("gameStart", this.handleGameStart);
  }

  handleGameStart = (back: any) => {
    this.lobby.destroy()
    this.game = new Game(back, this.socket);
  };
}
