import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js'
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-database.js"

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


export class Database {
    app = null;
    database = null;
    players = {};
    servers = {};
    schedule = {};

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
    }

    get(callback) {
        const path = Node.all;
        onValue(
            ref(this.database, path), 
            function(snapshot) {
                const all = snapshot.val();
                this.players = all.players;
                this.servers = all.servers;
                this.schedule = all.schedule;
                if (callback != null) {
                    callback(this);
                }
            }.bind(this)
        );
    }

    // --[ helpers ]------------------------------------------------------------
    getPlayerStatus(serverId, playerId) {
        // The server must exist
        const server = this.schedule[serverId];
        if (server == null) {
            return Status.unknown;
        }

        // The player must exist
        const player = server[playerId];
        if (player == null) {
            return Status.unknown;
        }

        // Find the status
        let maxTimestamp = 0;
        let status = Node.unknown;
        Object.entries(player).forEach(([timestamp, value]) => {
            if (timestamp > maxTimestamp) {
                maxTimestamp = timestamp;
                status = value["status"];
            }
        });

        return status;
    }

    getServerName(serverId) {
        const server = this.servers[serverId];
        if (server == null) {
            return "UNKNOWN";
        }

        return server["name"];
    }

    getPlayer(playerId) {
        return this.players[playerId];
    }

}
