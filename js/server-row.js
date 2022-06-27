import { DatabaseEvents, Status } from "./database.js";
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
        let populateTime = new Date().getTime();

        // The playersDiv can have a large number of elements. Removing it and 
        // doing operations on it drastically increases performance.
        const parentNode = this.playersDiv.parentNode;
        const nextSibling = this.playersDiv.nextSibling;
        parentNode.removeChild(this.playersDiv);
        this.removeAllPlayerRows();

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
                if (this.shouldShowPlayer(playerId)) {
                    playerRow.populate(this.database, this.serverId, playerId);
                    playerRow.toggleAlternateColor(alternateColor = !alternateColor);
                    this.playersDiv.appendChild(playerRow);
                }    
            }.bind(this));

        // Reinsert the playersDiv
        if (nextSibling) {
            parentNode.insertBefore(this.playersDiv, nextSibling);
        } else {
            parentNode.appendChild(this.playersDiv);
        }     

        // Log the time passed
        populateTime = Math.round(new Date().getTime() - populateTime);
        console.log("ServerRow.populate():", populateTime);
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
            this.playerRows[playerId] = row;
        }
        return row;
    }

    // --[ events ]-------------------------------------------------------------
    onSearchBarChange() {
        this.setNameFilter(this.searchBar.value);
        this.populate();
    }

    // --[ helpers ]------------------------------------------------------------
    removeAllPlayerRows() {
        while (this.playersDiv.firstChild) {
            this.playersDiv.removeChild(this.playersDiv.firstChild);
        }
        this.playersDiv.appendChild(this.playersHeaderDiv);
    }

    shouldShowPlayer(playerId) {
        const status = this.database.getPlayerStatus(this.serverId, playerId);
        if (this.statusFilter != null && status != this.statusFilter) {
            return false;
        }

        const aliases = this.database.getPlayerAliases(playerId);
        if (this.nameFilter == null) {
            return true;
        }

        for (let i = 0; i < aliases.length; i++) {
            if (aliases[i].toUpperCase().includes(this.nameFilter.toUpperCase())) {
                return true;
            }
        }

        return false;
    }

}

customElements.define("server-row", ServerRow);