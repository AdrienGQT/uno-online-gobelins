import { Socket } from "socket.io-client";
import { Player } from "./Player";
import { Card } from "./Card";

export class Game {
  gameHTML: HTMLElement;
  discardCardHTML: HTMLElement;
  localPlayerHandHTML: HTMLElement;
  cardHTML: HTMLLIElement;
  cardValueHTML: HTMLElement;

  localPlayerId: string;
  localPlayer: Player | null = null;
  currentPlayer: number;
  discardCard: Card;
  playersList: Array<Player> = [];
  currentTurn: number = 0;

  constructor(gameStartData: any, socket: Socket) {
    this.gameHTML = document.querySelector("#gameHTML") as HTMLElement;
    this.discardCardHTML = this.gameHTML.querySelector(
      "#discardCardHTML"
    ) as HTMLElement;
    this.localPlayerHandHTML = this.gameHTML.querySelector(
      "#localPlayerHandHTML"
    ) as HTMLElement;
    this.cardHTML = this.localPlayerHandHTML.querySelector(
      "#cardHTML"
    ) as HTMLLIElement;
    this.cardValueHTML = this.localPlayerHandHTML.querySelector(
      "#cardValueHTML"
    ) as HTMLElement;

    this.localPlayerId = socket.id!;
    this.currentPlayer = gameStartData.currentPlayer;
    this.discardCard = this.initCard(gameStartData.discardPile[0]);
    console.log(this.discardCard);
    this.initializePlayers(gameStartData.players);

    this.displayLocalPlayerHand();
    this.displayDiscardCard()

    this.displayGame();
  }

  initializePlayers = (players: any) => {
    console.log(players.length);
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      let isLocalPlayer = false;
      if (player.id === this.localPlayerId) {
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
      //   console.log(player.hand);
    }
  };

  // Init card
  initCard = (card: any) => {
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

    return new Card(card.color, String(card.value), cardHTMLClone);
  };

  displayLocalPlayerHand = () => {
    this.localPlayerHandHTML.innerHTML = "";
    for (let card of this.localPlayer!.hand) {
      let initializedCard = this.initCard(card);
      this.localPlayer?.cards.push(initializedCard);
      this.localPlayerHandHTML.appendChild(initializedCard.html);
    }
  };

  displayDiscardCard = () => {
    this.discardCardHTML.innerHTML = "";
    this.discardCardHTML.appendChild(this.discardCard.html)
  };

  displayGame = () => {
    this.gameHTML.classList.remove("hidden");
  };
}
