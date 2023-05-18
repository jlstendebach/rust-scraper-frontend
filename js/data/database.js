import { EventEmitter } from "https://jlstendebach.github.io/canvas-engine/release/1.0.0/events/EventEmitter.js";
import { DatabaseEvents } from './database-events.js';
import { PlayerStatus } from "./player-status.js";

export class Database {
    worker = null;

    players = {};
    servers = {};
    schedule = {};

    eventEmitter = new EventEmitter();

    constructor() {
        this.worker = new Worker("js/data/database-worker.js", {type: "module"});
        this.worker.addEventListener("message", this.onWorkerMessage.bind(this));
    }


    // -------------------------------------------------------------------------
    fetchPlayers() {
        this.worker.postMessage({type: DatabaseEvents.UPDATE_PLAYERS});
    }
    fetchSchedule(serverId) {
        this.worker.postMessage({
            type: DatabaseEvents.UPDATE_SCHEDULE,
            serverId: serverId
        });
    }
    fetchServers() {
        this.worker.postMessage({type: DatabaseEvents.UPDATE_SERVERS});        
    }

    // --[ events ]-------------------------------------------------------------
    onWorkerMessage(message) {
        const type = message.data.type;

        switch (type) {
            case DatabaseEvents.UPDATE_PLAYERS:
                // console.log("onWorkerMessage: UPDATE_PLAYERS");
                this.players = message.data.response;
                this.emitEvent(type, this);
                break;
            
            case DatabaseEvents.UPDATE_SCHEDULE:
                // console.log("onWorkerMessage: UPDATE_SCHEDULE");
                this.schedule = message.data.response;                
                this.emitEvent(type, this);
                break;

            case DatabaseEvents.UPDATE_SERVERS:
                // console.log("onWorkerMessage: UPDATE_SERVERS");
                this.servers = message.data.response;
                this.emitEvent(type, this);
                break;
            
            default:
                // console.log("onWorkerMessage: UNKNOWN")
                break;
        }

        this.emitEvent(DatabaseEvents.UPDATE, this);
    }

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
        if (this.schedule == null) {
            return 0;
        }

        let count = 0;
        Object.keys(this.schedule).forEach((playerId) => {
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
            return PlayerStatus.UNKNOWN;
        }
        return player["server"] == serverId ? PlayerStatus.ONLINE : PlayerStatus.OFFLINE;
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

    getPlayerSchedule(playerId) {
        const playerSchedule = this.schedule[playerId];
        if (playerSchedule == null) {
            return [];
        }

        let schedule = [];
        Object.entries(playerSchedule).forEach(([timestamp, status]) => {
            schedule.push({
                timestamp: timestamp,
                status: status
            });
        });

        return schedule;
    }

}
