import { StatusIndicator } from "./status-indicator.js";
import { Status } from "./database.js"
import { PlaytimeTable } from "./playtime-table.js";

export class PlayerRow extends HTMLElement {
    database = null;
    serverId = null;
    playerId = null;

    nameDiv = document.createElement("div");
    statusIndicator = new StatusIndicator();
    aliasesDiv = document.createElement("div");
    scheduleDiv = document.createElement("div");
    playtimeTable = new PlaytimeTable();

    constructor(database, serverId, playerId) {
        super();
        this.database = database;
        this.serverId = serverId;
        this.playerId = playerId;

        // Content row        
        this.className = "player-row";
        this.addEventListener("click", function() {
            this.onRowClicked();
        }.bind(this));

        // Name
        this.nameDiv.className = "player-data";
        this.appendChild(this.nameDiv);
        
        // Status
        this.statusIndicator.className = "player-data";
        this.appendChild(this.statusIndicator);
        
        // Aliases
        this.aliasesDiv.className = "player-data";
        this.appendChild(this.aliasesDiv);
        
        // Schedule
        this.scheduleDiv.className = "player-schedule";
        this.scheduleDiv.appendChild(this.playtimeTable);
    }

    populate() {
        // Name
        const name = this.database.getPlayerName(this.playerId);
        this.nameDiv.innerHTML = name;

        // Status
        const status = this.database.getPlayerStatus(this.serverId, this.playerId);
        this.statusIndicator.setStatus(status);

        // Aliases
        const aliases = this.database.getPlayerAliases(this.playerId);
        this.aliasesDiv.innerHTML = "";
        for (let i = 0; i < aliases.length; i++) {
            if (i > 0) {
                this.aliasesDiv.innerHTML += ", ";
            }
            this.aliasesDiv.innerHTML += aliases[i];
        }

        // Schedule
        if (this.isScheduleVisible()) {
            const schedule = this.database.getPlayerSchedule(this.serverId, this.playerId);
            this.playtimeTable.loadFromSchedule(schedule);        
        }

        /*
        let timestamp1 = 0;
        let status1 = Status.OFFLINE;

        this.scheduleDiv.innerHTML = "";

        for (let i = 0; i < schedule.length; i++) {
            let timestamp2 = schedule[i].timestamp;
            let status2 = schedule[i].status;

            if (status2 != status1 && status2 == Status.OFFLINE) {
                this.addTime(timestamp1, timestamp2);
            }

            timestamp1 = timestamp2;
            status1 = status2;
        }
        if (timestamp1 > 0 && status1 == Status.ONLINE) {    
            this.addTime(timestamp1, Math.round((new Date()).getTime() / 1000));
        }        
        */
    }

    // --[ events ]-------------------------------------------------------------
    onRowClicked() {
        this.toggleScheduleVisible();
    }

    // --[ helpers ]------------------------------------------------------------
    isScheduleVisible() {
        return this.scheduleDiv.parentNode == this
    }

    toggleScheduleVisible(visible=null) {
        if (visible == null) {
            this.toggleScheduleVisible(!this.isScheduleVisible());

        } else if (visible == true) {
            if (!this.isScheduleVisible()) {                                
                this.appendChild(this.scheduleDiv);
                this.populate();
            }

        } else {
            if (this.isScheduleVisible()) {
                this.removeChild(this.scheduleDiv);
            }
        }
    }

    toggleAlternateColor(on) {        
        const alternateClass = "player-row-alternate";
        if (on) {
            this.classList.add(alternateClass);
        } else {
            this.classList.remove(alternateClass);
        }
    }

    addTime(timestamp1, timestamp2) {
        const div = this.scheduleDiv.appendChild(document.createElement("div"));
        const date1 = this.formatTimestamp(timestamp1);
        const date2 = this.formatTimestamp(timestamp2);
        const hours = (timestamp2 - timestamp1) / (3600); 
        div.innerHTML = date1 + " -> " + date2 + " (" + hours.toFixed(2) + " hours)";
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp*1000);

        const pad2 = function(n) {
            return (n < 10 ? "0" : "") + String(n);
        };
    
        return pad2(date.getMonth()+1) + "/"
            + pad2(date.getDate()) + " "
            + pad2(date.getHours()) + ":"
            + pad2(date.getMinutes());
    }

}

customElements.define("player-row", PlayerRow);