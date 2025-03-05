import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
gsap.registerPlugin(Draggable);

export class Card {
  defaultCard: object;
  id: number;
  color: string;
  value: string;
  html: HTMLElement;
  inHandIndex: number | null= null;
  isPlayable: boolean;
  constructor(
    id: number,
    defaultCard: object,
    color: string,
    value: string,
    html: HTMLElement,
    inHandIndex?: number
  ) {
    // card
    // card id
    // card color
    // card value
    
    this.defaultCard = defaultCard;
    this.id = id;
    this.color = color;
    this.value = value;
    this.html = html;
    if (inHandIndex) {
      this.isPlayable = true;
      this.inHandIndex = inHandIndex;
      this.html.style.zIndex = String(this.inHandIndex + 1);
      this.html.addEventListener("click", this.clickCard);
    } else {
      this.isPlayable = false;
      this.html.style.zIndex = "1";

      this.removeCardHoverEffect();
    }
  }

  // setZIndex = () => {
  //   this.html.style.zIndex = String(this.cardIndex + 1);
  // };

  removeCardHoverEffect = () => {
    this.html.classList.remove("hover:-translate-y-16");
    this.html.classList.remove("hover:shadow-xl");
    this.html.classList.remove("hover:scale-105");
    this.html.classList.remove("cursor-pointer");
  };

  clickCard = () => {
    console.log("card clicked");
    const cardClickedEvent = new CustomEvent("cardClicked", {
      detail: this.defaultCard,
    });
    this.html.dispatchEvent(cardClickedEvent);
  };
}
