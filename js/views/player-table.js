import { StatusIndicator } from "./status-indicator.js"

export class PlayerTable extends HTMLElement {
    content = document.createElement("div");
    #rowHeight = 0;
    players = [];
    onRowClicked = (player) => {}

    constructor(rowHeight = 32) {
        super();
        this.setRowHeight(rowHeight, false);

        // Style self
        this.classList.add("player-table");

        // Style content
        this.content.className = "player-table-content"
        this.appendChild(this.content);

        // Add listeners
        this.addEventListener("scroll", this.onScrollEvent.bind(this));
        window.addEventListener("resize", this.onResizeEvent.bind(this));

        // Build
        this.rebuild();
    }

    // -------------------------------------------------------------------------
    getRowHeight() {
        return this.#rowHeight;
    }

    setRowHeight(height, rebuild = true) {
        this.#rowHeight = height;
        if (rebuild) { this.rebuild(); }
    }

    rebuild() {
        const top = this.scrollTop;
        const bottom = top + this.clientHeight;
        const index1 = Math.floor(top / this.#rowHeight);
        const index2 = Math.min(this.players.length-1, Math.floor(bottom / this.#rowHeight));

        this.removeChild(this.content);

        // Build the new list of rows
        this.removeAllChildren();
        for (let i = index1; i <= index2; i++) {
            const playerRow = this.createPlayerRow(this.players[i]);
            if (i == index1) {
                playerRow.style.paddingTop = (i*this.#rowHeight)+"px"
            }
            if (i == index2) {
                playerRow.style.paddingBottom = ((this.players.length-1-i)*this.#rowHeight)+"px";
            }
            this.content.appendChild(playerRow);
        }

        this.appendChild(this.content);
    }

    removeAllChildren() {
        while (this.content.firstChild != null) {
            this.content.removeChild(this.content.firstChild);
        }
        this.content.innerHTML = "";
    }

    // --[ events ]-------------------------------------------------------------
    onScrollEvent(event) {
        this.rebuild();
    }

    onResizeEvent(event) {
        this.rebuild();
    }

    // --[ helpers ]------------------------------------------------------------
    createPlayerRow(player) {
        const playerRow = document.createElement("div");
        playerRow.className = "player-table-row";
        playerRow.style.height = this.#rowHeight+"px";
        playerRow.style.maxHeight = this.#rowHeight+"px";
        playerRow.onclick = () => {
            this.onRowClicked(player);
        }

        const statusIndicator = new StatusIndicator(player.status);
        statusIndicator.classList.add("player-table-cell");
        playerRow.appendChild(statusIndicator);
        
        const name = document.createElement("div");
        name.classList.add("player-table-cell");
        name.innerHTML = "<p>"+player.name+"</p>";
        playerRow.appendChild(name);

        return playerRow;
    }

}

customElements.define("player-table", PlayerTable);