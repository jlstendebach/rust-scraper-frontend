import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js'
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-database.js"
import { EventEmitter } from "https://jlstendebach.github.io/canvas-engine/src/index.js";

export class Status {    
    static online = "online";
    static offline = "offline";
    static unknown = "unknown";
}

class Node {
    static all = "/";
    static backup = "backup";
    static players = "players";
    static schedule = "schedule";
    static servers = "servers";
}


export class DatabaseEvents {
    static UPDATE = "DatabaseUpdateEvent";
}

export class Database {
    app = null;
    database = null;
    players = {};
    servers = {};
    schedule = {};
    eventEmitter = new EventEmitter();

    constructor() {
        this.app = initializeApp({
            apiKey: "AIzaSyA1m_X7UoT2f7jU5fbGsH7JtrcTYvE7DSQ",
            authDomain: "rust-player-tracker.firebaseapp.com",
            databaseURL: "https://rust-player-tracker-default-rtdb.firebaseio.com",
            projectId: "rust-player-tracker",
            storageBucket: "rust-player-tracker.appspot.com",
            messagingSenderId: "732934760915",
            appId: "1:732934760915:web:f19a11087e3a433e88a726",
            measurementId: "G-M1EF9VHR0N"
        });
        this.database = getDatabase(this.app);

        // onValue automatically updates whenever there is a change on the 
        // Firebase side.
        onValue(
            ref(this.database, Node.all), 
            function(snapshot) {
                const data = snapshot.val();
                if (data == null) {
                    return;
                }

                if (data.players != null) {
                    this.players = data.players;
                }
                if (data.servers != null) {
                    this.servers = data.servers;
                }
                if (data.schedule != null) {
                    this.schedule = data.schedule;
                }

                this.emitEvent(DatabaseEvents.UPDATE, this);
            }.bind(this)
        );        
    }

    // --[ events ]-------------------------------------------------------------
    addEventListener(type, callback, owner=null) {
        this.eventEmitter.add(type, callback, owner);
    }

    removeEventListener(type, callback, owner=null) {
        this.eventEmitter.remove(type, callback, owner);
    }

    emitEvent(type, event) {
        this.eventEmitter.emit(type, event);
    }
    
    // --[ helpers ]------------------------------------------------------------
    getServerName(serverId) {
        const server = this.servers[serverId];
        if (server == null) {
            return null;
        }

        return server["name"];
    }

    getPlayerCount(serverId, status=null) {
        // The server must exist
        const server = this.schedule[serverId];
        if (server == null) {
            return Status.unknown;
        }

        let count = 0;
        Object.keys(server).forEach((playerId) => {
            if (status == null || this.getPlayerStatus(serverId, playerId) == status) {
                count++;
            }
        });

        return count;
    }

    // --[ players ]------------------------------------------------------------
    getPlayer(playerId) {
        return this.players[playerId];
    }

    getPlayerName(playerId) {
        const player = this.players[playerId];
        if (player == null) {
            return "UNKNOWN";
        }

        return player["name"];
    }

    getPlayerStatus(serverId, playerId) {
        const player = this.players[playerId];
        if (player == null) {
            return Status.unknown;
        }
        return player["server"] == serverId ? Status.online : Status.offline;
    }

    getPlayerAliases(playerId) {
        const player = this.players[playerId];
        if (player == null) {
            return [];
        }

        const aliases = player["aliases"];
        if (aliases == null) {
            return [];
        }

        return Object.keys(player["aliases"]);
    }

    getPlayerSchedule(serverId, playerId) {
        const serverSchedule = this.schedule[serverId];
        if (serverSchedule == null) {
            return [];
        }

        const playerSchedule = serverSchedule[playerId];
        if (playerSchedule == null) {
            return [];
        }

        let schedule = [];
        Object.entries(playerSchedule).forEach(([timestamp, entry]) => {
            schedule.push({
                timestamp: timestamp,
                status: entry["status"]
            });
        });

        return schedule;
    }

}
