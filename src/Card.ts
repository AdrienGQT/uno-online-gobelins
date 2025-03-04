export class Card {
  defaultCard: object;
  color: string;
  value: string;
  html: HTMLElement;
  cardIndex: number;
  constructor(
    defaultCard: object,
    color: string,
    value: string,
    html: HTMLElement,
    cardIndex?: number
  ) {
    this.defaultCard = defaultCard;
    this.color = color;
    this.value = value;
    this.html = html;
    if (cardIndex) {
      this.cardIndex = cardIndex;
    } else {
      this.cardIndex = 1;
      this.removeCardHoverEffect();
    }
    this.setZIndex();
    this.html.addEventListener("click", this.clickCard);
  }

  setZIndex = () => {
    this.html.style.zIndex = String(this.cardIndex + 1);
  };

  removeCardHoverEffect = () => {
    this.html.classList.remove("hover:-translate-y-16");
  };

  clickCard = () => {
    console.log('card clicked')
    const cardClickedEvent = new CustomEvent("cardClicked", {
      detail: this.defaultCard,
    });
    this.html.dispatchEvent(cardClickedEvent);
  };
}
