import { StatusIndicator } from "./status-indicator.js";
import { Status } from "./database.js"
import { PlaytimeTable } from "./playtime-table.js";

export class PlayerRow extends HTMLElement {
    nameDiv = null;
    statusIndicator = null;
    aliasesDiv = null;
    scheduleDiv = null;
    playtimeTable = new PlaytimeTable();

    constructor(parent) {
        super();

        // Content row        
        this.className = "player-row";
        this.addEventListener("click", function() {
            this.onRowClicked();
        }.bind(this));

        // Name
        this.nameDiv = this.appendChild(document.createElement("div"));
        this.nameDiv.className = "player-data";
        
        // Status
        this.statusIndicator = this.appendChild(new StatusIndicator());
        this.statusIndicator.className = "player-data";
        
        // Aliases
        this.aliasesDiv = this.appendChild(document.createElement("div"));
        this.aliasesDiv.className = "player-data";
        
        // Schedule
        this.scheduleDiv = this.appendChild(document.createElement("div"));
        this.scheduleDiv.className = "player-schedule";
        this.scheduleDiv.appendChild(this.playtimeTable);
    }

    populate(database, serverId, playerId) {
        // Name
        const name = database.getPlayerName(playerId);
        this.nameDiv.innerHTML = name;

        // Status
        const status = database.getPlayerStatus(serverId, playerId);
        this.statusIndicator.setStatus(status);

        // Aliases
        const aliases = database.getPlayerAliases(playerId);
        this.aliasesDiv.innerHTML = "";
        for (let i = 0; i < aliases.length; i++) {
            if (i > 0) {
                this.aliasesDiv.innerHTML += ", ";
            }
            this.aliasesDiv.innerHTML += aliases[i];
        }

        // Schedule
        const schedule = database.getPlayerSchedule(serverId, playerId);
        this.playtimeTable.loadFromSchedule(schedule);
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
        this.toggleScheduleVisibile();
    }

    // --[ helpers ]------------------------------------------------------------
    isScheduleVisible() {
        const style = window.getComputedStyle(this.scheduleDiv);
        const display = style.getPropertyValue("display");
        return display != "none";
    }

    toggleScheduleVisibile(visible=null) {
        if (visible == null) {
            this.scheduleDiv.style.display = (this.isScheduleVisible() ? "none" : "block");

        } else {
            this.scheduleDiv.style.display = (visible ? "block" : "none");            
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