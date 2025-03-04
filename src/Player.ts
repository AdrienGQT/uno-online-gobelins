import { Card } from "./Card";

export class Player {
  id: string;
  username: string;
  hand: Array<any>;
  cards: Array<Card> = [];
  isLocalPlayer: boolean;
  rank: number;
  constructor(
    id: string,
    username: string,
    hand: Array<any>,
    isLocalPlayer: boolean,
    rank: number
  ) {
    this.id = id;
    this.username = username;
    this.hand = hand;
    this.isLocalPlayer = isLocalPlayer;
    this.rank = rank;
  }
}
