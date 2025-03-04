import { Socket } from "socket.io-client";

export class Lobby {
  socket: Socket;

  // HTML Elements
  lobbyHTML: HTMLElement;
  usernameInput: HTMLInputElement;
  joinButton: HTMLButtonElement;
  readyButton: HTMLButtonElement;
  // Players List
  playersListHTML: HTMLUListElement;
  playerHTML: HTMLLIElement;
  playerNameHTML: HTMLElement;
  playerStatusHTML: HTMLElement;

  username: string | null = null;
  playerInRoom: boolean = false;
  playerReady: boolean = false;

  constructor(socket: Socket) {
    this.socket = socket;

    this.lobbyHTML = document.querySelector("#lobby") as HTMLElement;
    this.usernameInput = this.lobbyHTML.querySelector(
      "#usernameInput"
    ) as HTMLInputElement;
    this.joinButton = this.lobbyHTML.querySelector(
      "#joinButton"
    ) as HTMLButtonElement;
    this.readyButton = this.lobbyHTML.querySelector(
      "#readyButton"
    ) as HTMLButtonElement;

    // Players List
    this.playersListHTML = document.querySelector(
      "#playersList"
    ) as HTMLUListElement;
    this.playerHTML = this.playersListHTML.querySelector(
      "#player"
    ) as HTMLLIElement;
    this.playerNameHTML = this.playerHTML.querySelector(
      "#playerName"
    ) as HTMLLIElement;
    this.playerStatusHTML = this.playerHTML.querySelector(
      "#playerStatus"
    ) as HTMLLIElement;
    this.playersListHTML.innerHTML = "";

    // Listen to HTML events
    this.joinButton.addEventListener("click", this.joinRequest);
    this.readyButton.addEventListener("click", this.readyRequest);

    // Listen to server events
    this.socket.on("joinGameStatus", this.handleJoinGameStatus);
    this.socket.on("updatePlayers", this.handleUpdatePlayers);
  }

  /* Tools */

  getUsername = () => {
    return this.usernameInput.value;
  };

  /* Lobby actions */

  joinRequest = (e: Event) => {
    console.log("Join request");
    e.preventDefault();
    this.username = this.getUsername();
    if (!this.playerInRoom) {
      this.socket.emit("joinGame", this.username);
    }
  };

  readyRequest = (e: Event) => {
    e.preventDefault();
    if (!this.playerReady) {
      this.socket.emit("playerReady");
      this.playerReady = true;
      this.readyButton.disabled = true;
    }
  };

  /* Server listeners */

  handleJoinGameStatus = (back: any) => {
    if (back) {
      console.log(back.message);
      this.playerInRoom = true;
      this.joinButton.disabled = true;
      this.readyButton.disabled = false;
    } else {
      console.log("An error occured while trying to join the room.");
    }
  };

  handleUpdatePlayers = (back: object) => {
    console.log("Players connected :");
    if (back) {
      this.displayPlayers(back);
    } else {
      console.log("An error occured while trying to get players list.");
    }
  };

  displayPlayers = (users: object) => {
    console.log(users);
    this.playersListHTML.innerHTML = "";
    for (let user of Object.values(users)) {
      const playerHTMLClone = this.playerHTML.cloneNode(true) as HTMLLIElement;
      playerHTMLClone.innerHTML = "";

      const playerNameHTMLClone = this.playerNameHTML.cloneNode(
        true
      ) as HTMLElement;
      const playerStatusHTMLClone = this.playerStatusHTML.cloneNode(
        true
      ) as HTMLElement;

      if (user.name) {
        const playerName = user.name;
        const playerStatus = user.isReady;

        playerNameHTMLClone.innerHTML = playerName;
        playerHTMLClone.appendChild(playerNameHTMLClone);

        if (playerStatus) {
          playerStatusHTMLClone.innerHTML = "Ready";
        } else {
          playerStatusHTMLClone.innerHTML = "Not ready";
        }
        playerHTMLClone.appendChild(playerStatusHTMLClone);

        this.playersListHTML.appendChild(playerHTMLClone);
      }
    }
  };

  destroy = () => {
    this.lobbyHTML.classList.add('hidden')
  }
}
