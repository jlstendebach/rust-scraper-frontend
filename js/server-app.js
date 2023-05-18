import { Database } from "./database.js"
import { DatabaseEvents } from "./database-events.js";
import { PlayerRow } from "./player-row.js";
import { PlayerStatus } from "./data/player-status.js";

export class ServerApp {
    static UPDATE_TIME = 250;

    database = new Database();
    serverId = null;

    header = document.getElementById("server-header");
    searchBar = document.getElementById("search-bar");
    playersDiv = document.getElementById("players-div");
    playersHeaderDiv = document.getElementById("players-header-div");
    playerRows = {};

    statusFilter = null;
    nameFilter = null;
    shouldRebuild = true;


    constructor() {
        // Initialize the serverRow
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        this.serverId = urlParams.get("id");

        // Add event listeners
        document
            .getElementById("online-only-checkbox")
            .addEventListener(
                "change", 
                this.onOnlineOnlyCheckboxChange.bind(this)
            );
        
        this.database.addEventListener(
            DatabaseEvents.UPDATE, 
            this.onDatabaseUpdate, 
            this
        );        

        this.searchBar.addEventListener("input", this.onSearchBarChange.bind(this));

    }    

    start() {
        this.database.fetchPlayers();
        this.database.fetchSchedule(this.serverId);
        this.database.fetchServers();
        requestAnimationFrame(this.loop.bind(this));
    }

    loop() {
        console.log("loop");
        if (this.shouldRebuild) {
            console.log("rebuilding");
            this.rebuild();
            this.shouldRebuild = false;
        }
        setTimeout(function() {
            requestAnimationFrame(this.loop.bind(this));
        }.bind(this), ServerApp.UPDATE_TIME);
    }

    rebuild() {
        let rebuildTime = new Date().getTime();

        this.setStatusFilter(this.isShowingOnlineOnly() ? PlayerStatus.ONLINE : null);
        this.populate();
        
        rebuildTime = Math.round(new Date().getTime() - rebuildTime);
        console.log("App.rebuild():", rebuildTime);
    }

    // -------------------------------------------------------------------------
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
        const playerCount = this.database.getPlayerCount(this.serverId, PlayerStatus.ONLINE);
        this.header.innerHTML = name + " (" + playerCount + " online)";

        // Players
        const players = this.database.schedule;   
        if (players != null) {
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
                        playerRow.populate();
                        playerRow.toggleAlternateColor(alternateColor = !alternateColor);
                        this.playersDiv.appendChild(playerRow);
                    }    
                }.bind(this));
        }

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
        this.nameFilter = name.toUpperCase().trim();
        if (this.nameFilter.length == 0) {
            this.nameFilter = null;
        }
    }

    getOrCreatePlayerRow(playerId) {
        let row = this.playerRows[playerId];
        if (row == null) {
            row = new PlayerRow(this.database, this.serverId, playerId);
            this.playerRows[playerId] = row;
        }
        return row;
    }

    // --[ events ]-------------------------------------------------------------
    onDatabaseUpdate(type, event) {
        console.log("onDatabaseUpdate");
        this.shouldRebuild = true;
    }

    onOnlineOnlyCheckboxChange(type, event) {
        console.log("onOnlineOnlyCheckboxChange");
        this.shouldRebuild = true;
    }

    onSearchBarChange() {
        console.log("onSearchBarChange")
        this.setNameFilter(this.searchBar.value);
        this.shouldRebuild = true;
    }


    // --[ helpers ]------------------------------------------------------------
    isShowingOnlineOnly() {
        const checkbox = document.getElementById("online-only-checkbox");
        return checkbox.checked;
    }

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

        const nameFilters = this.nameFilter.split(",");
        for (let i = 0; i < aliases.length; i++) {
            for (let j = 0; j < nameFilters.length; j++) {
                const nameFilter = nameFilters[j].toUpperCase().trim();
                if (nameFilter.length <= 0) {
                    continue;
                }
                if (aliases[i].toUpperCase().includes(nameFilter)) {
                    return true;
                }
            }            
        }

        return false;
    }    

}