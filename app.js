import { Database, Status } from "./database.js"

class App {
    database = new Database();
    frequency = 10*1000; // update every 10 seconds
    interval = null; 

    constructor() {
    }    

    start() {
        this.loop();
        this.interval = window.setInterval(this.loop.bind(this), this.frequency);
    }   
    
    stop() {
        window.clearInterval(this.interval);
    }

    loop() {
        this.database.get(this.onDatabaseUpdate.bind(this));
    }

    // --[ events ]-------------------------------------------------------------
    onDatabaseUpdate(database) {
        console.log(database);
        
        const container = document.getElementById("container");
        container.innerHTML = "";

        Object.entries(database.schedule).forEach(([serverId, players]) => {
            this.addServerRow(serverId);
            Object.keys(players).forEach((playerId) => {
                this.addPlayerRow(serverId, playerId);
            });
        });
    }

    // --[ helpers ]------------------------------------------------------------
    addServerRow(serverId) {
        const container = document.getElementById("container");

        const serverRow = container.appendChild(document.createElement("div"));
        serverRow.id = this.getServerRowId(serverId);

        const serverName = serverRow.appendChild(document.createElement("h3"));
        serverName.id = this.getServerNameId(serverId);
        serverName.innerHTML = this.database.getServerName(serverId);

        const serverPlayers = serverRow.appendChild(document.createElement("div"));
        serverPlayers.id = this.getServerPlayersId(serverId);
        serverPlayers.className = "server-players";

        const playersHeader = serverPlayers.appendChild(document.createElement("div"));
        playersHeader.className = "players-header";
        playersHeader.innerHTML = "<div>Name</div><div>Status</div><div>Aliases</div>";
    }

    addPlayerRow(serverId, playerId) {
        const player = this.database.getPlayer(playerId);
        if (player == null) {
            return;
        }
        const playerName = player["name"];
        const playerStatus = this.database.getPlayerStatus(serverId, playerId);
        const playerAliases = player["aliases"];

        const serverPlayers = document.getElementById(this.getServerPlayersId(serverId));
        
        const playerRow = serverPlayers.appendChild(document.createElement("div"));
        playerRow.id = this.getPlayerRowId(serverId, playerId);
        playerRow.className = "player-row";

        const playerNameDiv = playerRow.appendChild(document.createElement("div"));
        playerNameDiv.innerHTML = playerName;

        const playerStatusDiv = this.createStatusIndicator(playerStatus);
        playerRow.appendChild(playerStatusDiv);

        const playerAliasesDiv = playerRow.appendChild(document.createElement("div"));
        let first = true;
        Object.keys(playerAliases).forEach((alias) => {
            if (!first) {
                playerAliasesDiv.innerHTML += ", ";
            } else {
                first = false;
            }
            playerAliasesDiv.innerHTML += alias;
        });
    }


    getServerRowId(serverId) { return "server-row-"+serverId; }
    getServerNameId(serverId) { return "server-name-"+serverId; }
    getServerPlayersId(serverId) { return "server-players-"+serverId; }
    getPlayerRowId(serverId, playerId) { return "player-row-"+serverId+"-"+playerId; }

    createStatusIndicator(status) {
        const div = document.createElement("div");
        const dot = div.appendChild(document.createElement("span"));
        if (status == Status.online) {
            dot.className = "dot online"
            div.innerHTML += "Online";

        } else if (status == Status.offline) {
            dot.className = "dot offline"
            div.innerHTML += "Offline";

        } else {
            dot.className = "dot"
            div.innerHTML += "Unknown";
        }
        return div;
    }

    
}


// --[ on load ]----------------------------------------------------------------
window.addEventListener("load", function() {
    window.removeEventListener("load", this)
    let app = new App();
    app.start();
})