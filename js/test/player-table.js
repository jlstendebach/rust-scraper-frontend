export class PlayerTable extends HTMLElement {
    content = document.createElement("div");
    rowHeight = 0;
    players = [];

    constructor(rowHeight = 32) {
        super();
        this.rowHeight = rowHeight;

        // Style self
        this.style.display = "block";
        this.style.maxHeight = "100%";
        this.style.overflow = "hidden scroll";

        // Style content
        this.content.style.display = "flex";
        this.content.style.flexDirection = "column";
        this.appendChild(this.content);

        for (let i = 0; i < 500000; i++) {
            this.players.push(i);
        }


        // Add listeners
        this.addEventListener("scroll", this.onScrollEvent.bind(this));

        // Build
        this.rebuild();
    }

    // -------------------------------------------------------------------------
    rebuild() {
        this.content.style.height = (this.rowHeight*this.players.length)+"px";

        const top = this.scrollTop;
        const bottom = top + this.clientHeight;
        const index1 = Math.floor(top / this.rowHeight);
        const index2 = Math.floor(bottom / this.rowHeight);

        this.removeAllRows();

        if (index1 > 0) {
            let div = document.createElement("div");
            div.style.height = (index1*this.rowHeight)+"px";
            this.content.appendChild(div);
        }

        for (let i = index1; i <= index2; i++) {
            if (i >= this.players.length) {
                break;
            }
            let div = document.createElement("div");
            div.innerHTML = this.players[i];
            div.style.height = this.rowHeight+"px";
            div.style.backgroundColor = (i % 2 == 0) ? "#333" : "#444";
            this.content.appendChild(div);
        }
    }

    removeAllRows() {
        while (this.content.firstChild != null) {
            this.content.removeChild(this.content.firstChild);
        }
        this.content.innerHTML = "";
    }

    // --[ events ]-------------------------------------------------------------
    onScrollEvent(event) {
        this.rebuild();
    }

}

customElements.define("player-table", PlayerTable);