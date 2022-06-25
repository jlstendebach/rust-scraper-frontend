import { Status } from "./database.js";
import { PlayerRow } from "./player-row.js";

export class ServerRow extends HTMLElement {
    database = null;
    serverId = null;

    headerDiv = null;
    header = null;
    searchBar = null;
    playersDiv = null;
    playersHeaderDiv = null;
    playerRows = {};

    statusFilter = null;
    nameFilter = null;

    constructor(database, serverId) {
        super();
        this.database = database;
        this.serverId = serverId;

        // Header
        this.headerDiv = this.appendChild(document.createElement("div"));
        this.headerDiv.className = "server-header";
        this.header = this.headerDiv.appendChild(document.createElement("h3"));
        this.searchBar = this.headerDiv.appendChild(document.createElement("input"));
        this.searchBar.type = "text";
        this.searchBar.placeholder = "Name search...";
        this.searchBar.addEventListener("input", this.onSearchBarChange.bind(this));

        // Players
        this.playersDiv = this.appendChild(document.createElement("div"));
        this.playersDiv.className = "server-players";
        this.playersHeaderDiv = this.playersDiv.appendChild(document.createElement("div"));
        this.playersHeaderDiv.className = "players-header";
        this.playersHeaderDiv.innerHTML = "<div>Name</div><div>Status</div><div>Aliases</div>";
    }

    populate() {
        // Name
        const name = this.database.getServerName(this.serverId);
        const playerCount = this.database.getPlayerCount(this.serverId, Status.online);
        this.header.innerHTML = name + " (" + playerCount + " online)";

        // Players
        const players = this.database.schedule[this.serverId];        
        let alternateColor = false;
        Object.keys(players)
            .sort(function(a, b) {
                const nameA = this.database.getPlayerName(a).toUpperCase(); 
                const nameB = this.database.getPlayerName(b).toUpperCase();
                return nameA.localeCompare(nameB);
            }.bind(this))
            .forEach(function(playerId) {
                const playerRow = this.getOrCreatePlayerRow(playerId);
                playerRow.populate(this.database, this.serverId, playerId);
                playerRow.toggleVisible(
                    (
                        this.statusFilter == null || 
                        this.database.getPlayerStatus(this.serverId, playerId) == this.statusFilter
                    ) &&
                    (
                        this.nameFilter == null ||
                        playerRow.hasName(this.nameFilter)
                    )
                );
                if (playerRow.isVisible()) {
                    playerRow.toggleAlternateColor(alternateColor = !alternateColor);
                }
            }.bind(this));
    }

    setStatusFilter(status) {
        this.statusFilter = status;
    }

    setNameFilter(name) {
        this.nameFilter = name;
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

    // --[ events ]-------------------------------------------------------------
    onSearchBarChange() {
        this.setNameFilter(this.searchBar.value);
        this.populate();
    }

}

customElements.define("server-row", ServerRow);