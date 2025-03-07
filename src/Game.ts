import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
// import { InertiaPlugin } from "gsap/InertiaPlugin"
gsap.registerPlugin(Draggable);
// gsap.registerPlugin(InertiaPlugin)

import { Socket } from "socket.io-client";
import { Player } from "./Player";
import { Card } from "./Card";

export class Game {
  socket: Socket;

  gameHTML: HTMLElement;
  discardCardHTML: HTMLElement;
  cardStackHTML: HTMLLIElement;
  localPlayerHandHTML: HTMLElement;
  colorSwitchHTML: HTMLElement;
  cardHTML: HTMLLIElement;
  cardValueHTML: HTMLElement;

  socketId: string;
  localPlayer: Player | null = null;
  currentPlayer: number;
  discardCard: Card;
  playersList: Array<Player> = [];
  currentPlayerIndicatorHTML: HTMLElement;
  currentTurn: number = 0;

  constructor(gameStartData: any, socket: Socket) {
    this.socket = socket;

    this.gameHTML = document.querySelector("#gameHTML") as HTMLElement;
    this.discardCardHTML = this.gameHTML.querySelector(
      "#discardCardHTML",
    ) as HTMLElement;
    this.cardStackHTML = this.gameHTML.querySelector(
      "#cardStackHTML",
    ) as HTMLLIElement;
    this.localPlayerHandHTML = this.gameHTML.querySelector(
      "#localPlayerHandHTML",
    ) as HTMLElement;
    this.colorSwitchHTML = this.gameHTML.querySelector(
      "#colorSwitchHTML",
    ) as HTMLElement;
    this.cardHTML = this.localPlayerHandHTML.querySelector(
      "#cardHTML",
    ) as HTMLLIElement;
    this.cardValueHTML = this.localPlayerHandHTML.querySelector(
      "#cardValueHTML",
    ) as HTMLElement;
    this.currentPlayerIndicatorHTML = this.gameHTML.querySelector(
      "#currentPlayerIndicatorHTML",
    ) as HTMLElement;

    this.socketId = socket.id!;
    this.currentPlayer = gameStartData.currentPlayer;
    this.discardCard = new Card(
      gameStartData.discardPile[0],
      this.cardHTML.cloneNode(true) as HTMLLIElement,
      this.cardValueHTML.cloneNode(true) as HTMLElement,
    );
    this.initializePlayers(gameStartData.players);
    this.initializeColorChangeButtons();

    this.updateGame();

    this.cardStackHTML.addEventListener("click", this.onDrawCard);
    socket.on("cardPlayed", this.handleCardPlayed);
    socket.on("cardDrawn", this.handleCardPlayed);
    socket.on("updatePlayers", this.handleUpdatePlayers);
    socket.on("askForColorSwitch", this.handleAskForColorSwitch);
    socket.on("colorSwitched", this.handleColorSwitched);

    this.displayGame();
  }

  /* Tools */

  displayGame = () => {
    this.gameHTML.classList.remove("hidden");
  };

  updateGame = () => {
    let currentPlayerClass = this.getCurrentPlayerClass();
    this.displayDiscardCard();
    this.displayLocalPlayerHand(currentPlayerClass);
    this.displayCurrentPlayerName(currentPlayerClass);
  };

  /* Initialize color change buttons*/

  initializeColorChangeButtons = () => {
    const colorSwitchButtons =
      this.gameHTML.querySelectorAll(".colorSwitchButton");
    for (let button of colorSwitchButtons) {
      button.addEventListener("click", this.switchColor);
    }
  };

  switchColor = (e: any) => {
    console.log(e);
    if (e.target) {
      let color = e.target.id;
      this.socket.emit("colorSwitch", color);
    }
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
        i,
      );
      this.playersList.push(playerClass);

      if (isLocalPlayer) {
        this.localPlayer = playerClass;
      }
    }
  };

  displayLocalPlayerHand = (currentPlayer: Player) => {
    this.localPlayerHandHTML.innerHTML = "";
    let cardIndex = 1;
    // console.log(this.localPlayer!.hand);
    for (let card of this.localPlayer!.hand) {
      console.log(card);
      let initializedCard = new Card(
        card,
        this.cardHTML.cloneNode(true) as HTMLLIElement,
        this.cardValueHTML.cloneNode(true) as HTMLElement,
        cardIndex,
      );
      this.localPlayer?.cards.push(initializedCard);
      initializedCard.cardHTML.addEventListener(
        "cardClicked",
        this.onCardClicked as EventListener,
      );
      this.localPlayerHandHTML.appendChild(initializedCard.cardHTML);
      cardIndex++;

      if (currentPlayer.isLocalPlayer) {
        this.localPlayerHandHTML.classList.remove("translate-y-32");
        initializedCard.cardHTML.classList.remove("hover:-translate-y-16");


        
        Draggable.create(initializedCard.cardHTML, {
          onDragStart: function () {
            this.startX = this.x;
            this.startY = this.y;
            this.target.classList.remove("transition-all");
          },
          onDrag: function () {
            if (this.y < -300) {
              this.target.classList.remove("rounded-xl");
            } else {
              this.target.classList.add("rounded-xl");
            }
          },
          onDragEnd: function () {
            this.deltaX = this.x - this.startX;
            this.deltaY = this.y - this.startY;

            if (this.deltaY < -300) {
              gsap.set(this.target, {
                x: this.startX,
                y: this.startY,
              });
              initializedCard.clickCard();
            } else {
              gsap.to(this.target, {
                duration: 0.3,
                x: this.startX,
                y: this.startY,
                ease: "back.out(1.7)",
                onComplete: () => {
                  this.target.classList.add("transition-all");
                  this.target.classList.add("rounded-xl");
                },
              });
            }
          },
        });


      } else {
        this.localPlayerHandHTML.classList.add("translate-y-32");
        initializedCard.cardHTML.classList.add("hover:-translate-y-16");
      }
    }
  };

  displayDiscardCard = () => {
    this.discardCardHTML.innerHTML = "";
    this.discardCardHTML.appendChild(this.discardCard.cardHTML);
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
    this.discardCard = new Card(
      args.card,
      this.cardHTML.cloneNode(true) as HTMLLIElement,
      this.cardValueHTML.cloneNode(true) as HTMLElement,
    );
    this.updateGame();
  };

  handleCardDraw = (args: any) => {
    this.currentPlayer = args.currentPlayer;
    this.updateGame();
  };

  handleUpdatePlayers = (args: any) => {
    for (let user of args) {
      for (let player of this.playersList)
        if (user.id === player.id) {
          player.hand = user.hand;
        }
    }
    this.updateGame();
  };

  handleAskForColorSwitch = () => {
    this.colorSwitchHTML.classList.add('flex')
    this.colorSwitchHTML.classList.remove('hidden')
  };

  handleColorSwitched = (card: any) => {
    let newDiscardCard = new Card(card, this.cardHTML, this.cardValueHTML);
    this.discardCard = newDiscardCard;
    this.displayDiscardCard();
    this.colorSwitchHTML.classList.remove('flex')
    this.colorSwitchHTML.classList.add('hidden')
  };

  onCardClicked = (event: CustomEvent<any>) => {
    const card = event.detail;
    console.log("clicked card", card);
    this.socket.emit("playCard", { card });
    console.log("Socket emitted playCard");
  };

  onDrawCard = () => {
    this.socket.emit("drawCard");
  };
}
