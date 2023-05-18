import { Database } from "./data/database.js"
import { DatabaseEvents } from "./data/database-events.js";
import { PlayerStatus } from "./data/player-status.js";
import { Player } from "./data/player.js";
import { PlayerTable } from "./views/player-table.js";
import { PlaytimeTable } from "./views/playtime-table.js";


export class IndexApp {
    static UPDATE_TIME = 1000; // milliseconds

    database = new Database();
    serverId = null;
    player = null;

    isNavigationValid = false;
    isHeaderValid = false;
    isPlayerListValid = false;
    isPlayerSheetValid = false;

    nameFilters = null;

    // server element
    serverList = document.getElementById("server-list");
    serverName = document.getElementById("server-name");
    serverPopulation = document.getElementById("server-population");

    // player list elements
    playerList = document.getElementById("player-table");
    playerListSearchBar = document.getElementById("search-bar");
    optionOnlineOnlyCheckbox = document.getElementById("online-only-checkbox");
    optionSearchAliasesCheckbox = document.getElementById("search-aliases-checkbox");

    // player sheet elements
    playerName = document.getElementById("player-name");
    playerStatus = document.getElementById("player-status");
    playerAliases = document.getElementById("player-aliases");
    playtimeTable = document.getElementById("playtime-table");

    // --[ init ]---------------------------------------------------------------
    constructor() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        this.serverId = urlParams.get("serverId");

        // Database events
        this.database.addEventListener(
            DatabaseEvents.UPDATE_SERVERS, 
            this.onDatabaseUpdateServers.bind(this)
        );
        this.database.addEventListener(
            DatabaseEvents.UPDATE_PLAYERS, 
            this.onDatabaseUpdatePlayers.bind(this)
        );
        this.database.addEventListener(
            DatabaseEvents.UPDATE_SCHEDULE, 
            this.onDatabaseUpdateSchedule.bind(this)
        );

        // DOM events
        this.optionOnlineOnlyCheckbox
            .addEventListener(
                "change", 
                this.onOnlineOnlyCheckboxChange.bind(this)
            );

        this.optionSearchAliasesCheckbox
            .addEventListener(
                "change", 
                this.onSearchAliasesCheckboxChange.bind(this)
            );

        this.playerListSearchBar
            .addEventListener(
                "input", 
                this.onPlayerListSearchBarChange.bind(this)
            );

        this.playerList.onRowClicked = this.onPlayerSelected.bind(this);

        
        // Trigger events to start default values
        this.onOnlineOnlyCheckboxChange();
        this.onPlayerListSearchBarChange();
    }    

    // --[ lifecycle ]----------------------------------------------------------
    start() {
        this.database.fetchServers();
        this.database.fetchPlayers();
        if (this.serverId != null) {
            this.database.fetchSchedule(this.serverId);
        }
        requestAnimationFrame(this.loop.bind(this));
    }

    loop() {
        if (!this.isNavigationValid) {
            this.time("IndexApp.updateNavigation()", () => {
                this.updateNavigation();
            })
        }
        if (!this.isHeaderValid) {
            this.time("IndexApp.updateHeader()", () => {
                this.updateHeader();
            })
        }
        if (!this.isPlayerListValid) {
            this.time("IndexApp.updatePlayerList()", () => {
                this.updatePlayerList();
            })
        }
        if (!this.isPlayerSheetValid) {
            this.time("IndexApp.updatePlayerSheet()", () => {
                this.updatePlayerSheet();
            })
        }

        setTimeout(function() {
            requestAnimationFrame(this.loop.bind(this));
        }.bind(this), IndexApp.UPDATE_TIME);
    }

    rebuild() {

    }

    // --[ update navigation ]--------------------------------------------------
    updateNavigation() {
        this.clearServerList();
        for (const serverId of Object.keys(this.database.servers)) {
            const serverName = this.database.getServerName(serverId);
            this.addToServerList(serverName, serverId);
        }
        this.isNavigationValid = true;    
    }

    // --[ update header ]------------------------------------------------------
    updateHeaderServerName() {
        // Server name
        if (this.serverId == null) {
            this.serverName.innerHTML = "Select Server ^^^";
            return;
        }

        const serverName = this.database.getServerName(this.serverId);
        if (serverName == null) {
            this.serverName.innerHTML = "Loading...";
            return;
        }

        this.serverName.innerHTML = serverName;
    }

    updateHeaderServerPop() {
        const playerCount = this.database.getPlayerCount(this.serverId, PlayerStatus.ONLINE);

        if (playerCount == 0) {
            this.serverPopulation.innerHTML = "0 (probably still loading)";

        } else {
            this.serverPopulation.innerHTML = playerCount;
        }
    }

    updateHeader() {
        this.updateHeaderServerName();
        this.updateHeaderServerPop();
        this.isHeaderValid = true;    
    }

    // --[ player list ]--------------------------------------------------------
    updatePlayerList() {
        this.playerList.players = [];

        const schedule = this.database.schedule;   
        if (schedule != null) {
            let players = Object.keys(schedule);

            this.time("filtering players", () => {
                players = players.flatMap((playerId) => {
                    const playerData = this.database.getPlayer(playerId);
                    if (playerData == null) {
                        return []; // remove from the list
                    }

                    const playerStatus = this.database.getPlayerStatus(this.serverId, playerId);
                    if (playerStatus == null) {
                        return []; // remove from the list
                    }

                    const player = new Player(playerId, playerData.name, playerData.aliases, playerStatus);
                    if (!this.isShowingPlayer(player)) {
                        return []; // remove from the list
                    }

                    return player;
                })
            });

            this.time("sorting players", () => {
                players = players.sort((a, b) => {
                    const nameA = a.name.toUpperCase(); 
                    const nameB = b.name.toUpperCase();
                    return nameA.localeCompare(nameB);
                });
            });

            this.playerList.players = players;
        }

        this.playerList.rebuild();

        this.isPlayerListValid = true;
    }

    isShowingPlayer(player) {   
        if (this.optionOnlineOnlyCheckbox.checked && player.status != PlayerStatus.ONLINE) {
            return false;
        }

        if (this.nameFilters == null) {
            return true;
        }

        let names = [player.name];
        if (this.optionSearchAliasesCheckbox.checked) {
            names = Object.keys(player.aliases)            
        }

        for (let name of names) {
            for (let filter of this.nameFilters) {
                if (name.toUpperCase().includes(filter)) {
                    return true;
                }
            }            
        }    

        return false;        
    }

    // --[ player sheet ]-------------------------------------------------------
    updatePlayerSheet() {
        if (this.player == null) {
            this.playerName.innerHTML = "Select a player..."; 
            this.playerStatus.setStatus(PlayerStatus.UNKNOWN);
            this.playerAliases.innerHTML = "Aliases will appear here...";

        } else {
            // Name
            this.playerName.innerHTML = this.player.name; 

            // Status
            this.playerStatus.setStatus(this.player.status);
            
            // Aliases
            while (this.playerAliases.firstChild != null) {
                this.playerAliases.removeChild(this.playerAliases.firstChild);
            }
            this.playerAliases.innerHTML = "";
            for (let alias of Object.keys(this.player.aliases)) {
                const div = this.playerAliases.appendChild(document.createElement("div"));
                div.innerHTML = alias;
            }

            // Schedule
            const schedule = this.database.getPlayerSchedule(this.player.id);
            if (schedule == null) {
                return;
            }
            this.playtimeTable.loadFromSchedule(schedule);
        }

        this.isPlayerSheetValid = true;
    }

    // --[ server list ]--------------------------------------------------------
    clearServerList() {
        while (this.serverList.firstChild) {
            this.serverList.removeChild(this.serverList.firstChild);
        }        
        this.serverList.innerHTML = "";
    }

    addToServerList(serverName, serverId) {
        const div = this.serverList.appendChild(document.createElement("div"));
        const link = div.appendChild(document.createElement("a"));
        link.href = "./?serverId="+serverId;
        link.innerHTML = serverName;
    }

    // --[ network events ]-----------------------------------------------------
    onDatabaseUpdateServers(type, database) {
        console.log("onDatabaseUpdateServers");
        this.isNavigationValid = false;
        this.isHeaderValid = false;
    }

    onDatabaseUpdatePlayers(type, database) {
        console.log("onDatabaseUpdatePlayers");
        this.isHeaderValid = false;
        this.isPlayerListValid = false;
        this.isPlayerSheetValid = false;
    }
 
    onDatabaseUpdateSchedule(type, database) {
        console.log("onDatabaseUpdateSchedule");
        this.isHeaderValid = false;
        this.isPlayerListValid = false;
        this.isPlayerSheetValid = false;
    }

    // --[ dom events ]---------------------------------------------------------
    onOnlineOnlyCheckboxChange() {
        this.statusFilter = this.optionOnlineOnlyCheckbox.checked ? PlayerStatus.ONLINE : null;
        this.isPlayerListValid = false;
    }

    onSearchAliasesCheckboxChange() {
        this.isPlayerListValid = false;
    }

    onPlayerListSearchBarChange() {
        const searchBarValue = this.playerListSearchBar.value.toUpperCase().trim();

        if (searchBarValue.length == 0) {
            this.nameFilters = null;

        } else {
            this.nameFilters = searchBarValue
                .split(",")
                .map((name) => {
                    return name.toUpperCase().trim();
                });
        }

        this.isPlayerListValid = false;
    }

    onPlayerSelected(player) {
        this.player = player;
        this.isPlayerSheetValid = false;
    }

    // --[ helpers ]------------------------------------------------------------
    time(name, callback) {
        let time = new Date().getTime();
        callback();
        time = Math.round(new Date().getTime() - time);
        console.log(name+":", time);
    }


}


