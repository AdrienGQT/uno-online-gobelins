import { Socket } from "socket.io-client";
import { Player } from "./Player";
import { Card } from "./Card";

export class Game {
  socket: Socket;

  gameHTML: HTMLElement;
  discardCardHTML: HTMLElement;
  cardStackHTML: HTMLLIElement;
  localPlayerHandHTML: HTMLElement;
  cardHTML: HTMLLIElement;
  cardValueHTML: HTMLElement;
  currentPlayerIndicatorHTML: HTMLElement;

  socketId: string;
  localPlayer: Player | null = null;
  currentPlayer: number;
  discardCard: Card;
  playersList: Array<Player> = [];
  currentTurn: number = 0;

  constructor(gameStartData: any, socket: Socket) {
    this.socket = socket;

    this.gameHTML = document.querySelector("#gameHTML") as HTMLElement;
    this.discardCardHTML = this.gameHTML.querySelector(
      "#discardCardHTML"
    ) as HTMLElement;
    this.cardStackHTML = this.gameHTML.querySelector(
      "#cardStackHTML"
    ) as HTMLLIElement;
    this.localPlayerHandHTML = this.gameHTML.querySelector(
      "#localPlayerHandHTML"
    ) as HTMLElement;
    this.cardHTML = this.localPlayerHandHTML.querySelector(
      "#cardHTML"
    ) as HTMLLIElement;
    this.cardValueHTML = this.localPlayerHandHTML.querySelector(
      "#cardValueHTML"
    ) as HTMLElement;
    this.currentPlayerIndicatorHTML = this.gameHTML.querySelector(
      "#currentPlayerIndicatorHTML"
    ) as HTMLElement;

    this.socketId = socket.id!;
    this.currentPlayer = gameStartData.currentPlayer;
    this.discardCard = this.initCard(gameStartData.discardPile[0]);
    console.log(this.discardCard);
    this.initializePlayers(gameStartData.players);

    this.updateGame();

    this.cardStackHTML.addEventListener('click', this.onDrawCard)
    socket.on("cardPlayed", this.handleCardPlayed);
    socket.on("cardDrawn", this.handleCardPlayed);
    socket.on("updatePlayers", this.handleUpdatePlayers);

    this.displayGame();
  }

  /* Tools */

  displayGame = () => {
    this.gameHTML.classList.remove("hidden");
  };

  updateGame = () => {
    this.displayDiscardCard();
    this.displayLocalPlayerHand();
    this.displayCurrentPlayerName(this.getCurrentPlayerClass());
  };

  /* Initialize players */

  initializePlayers = (players: any) => {
    console.log(players.length);
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      let isLocalPlayer = false;
      if (player.id === this.socketId) {
        isLocalPlayer = true;
      }
      const playerClass = new Player(
        player.id,
        player.name,
        player.hand,
        isLocalPlayer,
        i
      );
      this.playersList.push(playerClass);

      if (isLocalPlayer) {
        this.localPlayer = playerClass;
      }
    }
  };

  /* Init card */

  initCard = (card: any, index?: number) => {
    let cardHTMLClone = this.cardHTML.cloneNode(true) as HTMLElement;
    cardHTMLClone.innerHTML = "";

    let color = "black";
    console.log(card.color);
    if (card.color !== "wild") {
      color = card.color;
    }
    cardHTMLClone.style.backgroundColor = `${color}`;

    let cardValueHTMLClone = this.cardValueHTML.cloneNode(true) as HTMLElement;
    cardValueHTMLClone.innerText = card.value;
    cardHTMLClone.appendChild(cardValueHTMLClone);

    cardHTMLClone.addEventListener(
      "cardClicked",
      this.onCardClicked as EventListener
    );

    return new Card(card, card.color, String(card.value), cardHTMLClone, index);
  };

  displayLocalPlayerHand = () => {
    this.localPlayerHandHTML.innerHTML = "";
    let cardIndex = 1;
    for (let card of this.localPlayer!.hand) {
      let initializedCard = this.initCard(card, cardIndex);
      this.localPlayer?.cards.push(initializedCard);
      this.localPlayerHandHTML.appendChild(initializedCard.html);
      cardIndex++;
    }
  };

  displayDiscardCard = () => {
    this.discardCardHTML.innerHTML = "";
    this.discardCardHTML.appendChild(this.discardCard.html);
  };

  getCurrentPlayerClass = () => {
    return this.playersList[this.currentPlayer];
  };

  displayCurrentPlayerName = (currentPlayer: Player) => {
    this.currentPlayerIndicatorHTML.innerText = "";
    let message: string;
    if (currentPlayer.isLocalPlayer) {
      message = `It is ${currentPlayer.username}'s (your) turn`;
    } else {
      message = `It is ${currentPlayer.username}'s turn`;
    }
    this.currentPlayerIndicatorHTML.innerText = message;
  };

  /* Callback functions */

  handleCardPlayed = (args: any) => {
    this.currentPlayer = args.currentPlayer;
    this.discardCard = this.initCard(args.card);
    this.updateGame();
  };

  handleCardDraw = (args: any) => {
    this.currentPlayer = args.currentPlayer
    this.updateGame()
  }

  handleUpdatePlayers = (args: any) => {
    for (let user of args) {
      for (let player of this.playersList)
        if (user.id === player.id) {
          player.hand = user.hand;
        }
    }
    this.updateGame();
  };

  onCardClicked = (event: CustomEvent<any>) => {
    const card = event.detail;
    console.log("clicked card", card);
    this.socket.emit("playCard", { card });
    console.log("Socket emitted playCard");
  };

  onDrawCard = () => {
    this.socket.emit('drawCard')
  }
}
