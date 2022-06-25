import { Status } from "./database.js";
import { PlayerRow } from "./player-row.js";

export class ServerRow extends HTMLElement {
    header = null;
    playersDiv = null;
    playersHeaderDiv = null;
    playerRows = {};
    statusFilter = null;

    constructor() {
        super();
        this.header = this.appendChild(document.createElement("h3"));
        this.playersDiv = this.appendChild(document.createElement("div"));
        this.playersDiv.className = "server-players";
        this.playersHeaderDiv = this.playersDiv.appendChild(document.createElement("div"));
        this.playersHeaderDiv.className = "players-header";
        this.playersHeaderDiv.innerHTML = "<div>Name</div><div>Status</div><div>Aliases</div>";
    }

    populate(database, serverId) {
        // Name
        const name = database.getServerName(serverId);
        const playerCount = database.getPlayerCount(serverId, Status.online);
        this.header.innerHTML = name + " (" + playerCount + " online)";

        // Players
        const players = database.schedule[serverId];        
        let alternateColor = false;
        Object.keys(players).forEach((playerId) => {
            const playerRow = this.getOrCreatePlayerRow(playerId);
            playerRow.populate(database, serverId, playerId);
            playerRow.toggleVisible(this.statusFilter == null || database.getPlayerStatus(serverId, playerId) == this.statusFilter);
            if (playerRow.isVisible()) {
                playerRow.toggleAlternateColor(alternateColor = !alternateColor);
            }
        });
    }

    setStatusFilter(status) {
        this.statusFilter = status;
    }

    getOrCreatePlayerRow(playerId) {
        let row = this.playerRows[playerId];
        if (row == null) {
            row = new PlayerRow();
            this.playersDiv.appendChild(row);
            this.playerRows[playerId] = row;
        }
        return row;
    }
}

customElements.define("server-row", ServerRow);