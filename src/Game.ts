import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
gsap.registerPlugin(Draggable);

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
    let currentPlayerClass = this.getCurrentPlayerClass()
    this.displayDiscardCard();
    this.displayLocalPlayerHand(currentPlayerClass);
    this.displayCurrentPlayerName(currentPlayerClass);
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

  initCard = (card: any, inHandIndex?: number) => {
    let cardHTMLClone = this.cardHTML.cloneNode(true) as HTMLElement;
    cardHTMLClone.innerHTML = "";

    let color = "bg-gray-900";
    console.log(card.color);
    if (card.color !== "wild") {
      color = `bg-${card.color}-500`;
    }

    let cardValueHTMLTop = this.cardValueHTML.cloneNode(true) as HTMLElement;
    cardValueHTMLTop.innerText = card.value;
    let cardValueHTMLBottom = cardValueHTMLTop.cloneNode(true) as HTMLElement
    let cardValueHTMLCenter = cardValueHTMLTop.cloneNode(true) as HTMLElement

    // Set top number style
    cardValueHTMLTop.classList.add('top-2')
    cardValueHTMLTop.classList.add('left-2')

    // Set bottom number style
    cardValueHTMLBottom.classList.add("rotate-180")
    cardValueHTMLBottom.classList.add('bottom-2')
    cardValueHTMLBottom.classList.add('right-2')

    // Set center number style
    cardValueHTMLCenter.classList.remove('absolute')
    cardValueHTMLCenter.classList.remove('text-4xl')
    cardValueHTMLCenter.classList.add('flex')
    cardValueHTMLCenter.classList.add('h-full')
    cardValueHTMLCenter.classList.add('w-full')
    cardValueHTMLCenter.classList.add('justify-center')
    cardValueHTMLCenter.classList.add('items-center')
    cardValueHTMLCenter.classList.add('text-6xl')

    cardHTMLClone.classList.add(color)

    cardHTMLClone.appendChild(cardValueHTMLTop);
    cardHTMLClone.appendChild(cardValueHTMLBottom);
    cardHTMLClone.appendChild(cardValueHTMLCenter);

    cardHTMLClone.addEventListener(
      "cardClicked",
      this.onCardClicked as EventListener
    );

    return new Card(card.id, card, card.color, String(card.value), cardHTMLClone, inHandIndex);
  };

  displayLocalPlayerHand = (currentPlayer: Player) => {
    this.localPlayerHandHTML.innerHTML = "";
    let cardIndex = 1;
    for (let card of this.localPlayer!.hand) {
      let initializedCard = this.initCard(card, cardIndex);
      this.localPlayer?.cards.push(initializedCard);
      this.localPlayerHandHTML.appendChild(initializedCard.html);
      cardIndex++;
    }
    if(currentPlayer.isLocalPlayer){
      this.localPlayerHandHTML.classList.remove('translate-y-32')
    }else{
      this.localPlayerHandHTML.classList.add('translate-y-32')

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
