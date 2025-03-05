import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
gsap.registerPlugin(Draggable);

export class Card {
  content: any;
  id: number;
  color: string;
  value: string;
  cardHTML: HTMLLIElement;
  cardValueHTML: HTMLElement;
  inHandIndex: number | null = null;
  isPlayable: boolean = false;
  constructor(
    card: any,
    cardHTML: HTMLLIElement,
    cardValueHTML: HTMLElement,
    inHandIndex?: number,
  ) {
    this.content = card;
    this.id = card.id;
    this.color = card.color;
    this.value = String(card.value);
    this.cardHTML = cardHTML;
    this.cardValueHTML = cardValueHTML;
    if (inHandIndex) {
      this.inHandIndex = inHandIndex;
    }

    this.stylizeCard();
  }

  stylizeCard = () => {
    this.cardHTML.innerHTML = "";
    this.cardValueHTML.removeAttribute('id')


    let color = "bg-gray-900";
    if (this.content.color !== "wild") {
      color = `bg-${this.content.color}-500`;
    }

    let cardValueHTMLTop = this.cardValueHTML.cloneNode(true) as HTMLElement;
    cardValueHTMLTop.innerText = this.value;
    let cardValueHTMLBottom = cardValueHTMLTop.cloneNode(true) as HTMLElement;
    let cardValueHTMLCenter = cardValueHTMLTop.cloneNode(true) as HTMLElement;
    


    // Set top number style
    cardValueHTMLTop.classList.add("top-2");
    cardValueHTMLTop.classList.add("left-2");

    // Set bottom number style
    cardValueHTMLBottom.classList.add("rotate-180");
    cardValueHTMLBottom.classList.add("bottom-2");
    cardValueHTMLBottom.classList.add("right-2");

    // Set center number style
    cardValueHTMLCenter.classList.remove("absolute");
    cardValueHTMLCenter.classList.remove("text-4xl");
    cardValueHTMLCenter.classList.add("flex");
    cardValueHTMLCenter.classList.add("h-full");
    cardValueHTMLCenter.classList.add("w-full");
    cardValueHTMLCenter.classList.add("justify-center");
    cardValueHTMLCenter.classList.add("items-center");
    cardValueHTMLCenter.classList.add("text-6xl");

    this.cardHTML.classList.add(color);

    this.cardHTML.appendChild(cardValueHTMLTop);
    this.cardHTML.appendChild(cardValueHTMLBottom);
    this.cardHTML.appendChild(cardValueHTMLCenter);


    if (this.inHandIndex) {
      this.isPlayable = true;
      this.inHandIndex = this.inHandIndex;
      this.cardHTML.style.zIndex = String(this.inHandIndex + 1);
      this.cardHTML.addEventListener("click", this.clickCard);
    } else {
      this.cardHTML.style.zIndex = "1";
      this.removeCardHoverEffect();
    }
  };

  removeCardHoverEffect = () => {
    this.cardHTML.classList.remove("hover:-translate-y-16");
    this.cardHTML.classList.remove("hover:shadow-xl");
    this.cardHTML.classList.remove("hover:scale-105");
    this.cardHTML.classList.remove("cursor-pointer");
  };

  clickCard = () => {
    console.log("card clicked");
    const cardClickedEvent = new CustomEvent("cardClicked", {
      detail: this.content,
    });
    this.cardHTML.dispatchEvent(cardClickedEvent);
  };
}
