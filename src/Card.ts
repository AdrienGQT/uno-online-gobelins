export class Card{
    color: string;
    value: string;
    html: HTMLElement;
    cardIndex: number
    constructor(color: string, value: string, html: HTMLElement, cardIndex?: number){
        this.color = color;
        this.value = value;
        this.html = html
        if(cardIndex){
            this.cardIndex = cardIndex
        }else{
            this.cardIndex = 1
            this.removeCardHoverEffect()
        }

        this.setZIndex()
    }

    setZIndex = () => {
        this.html.style.zIndex = String(this.cardIndex + 1)
    }

    removeCardHoverEffect = () => {
        this.html.classList.remove("hover:-translate-y-16")
    }
}