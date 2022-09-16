import { Database } from "./database.js"
import { DatabaseEvents } from "./database-events.js";
import { Timer } from "https://jlstendebach.github.io/canvas-engine/release/1.0.0/utils/Timer.js";

export class IndexApp {
    database = new Database();
    serverListContent = document.getElementById("server-list-content");
    data = {};

    constructor() {
        this.database.addEventListener(
            DatabaseEvents.UPDATE, 
            this.onDatabaseUpdate.bind(this)
        );
    }    

    start() {
        this.database.fetchServers();
    }   

    // --[ events ]-------------------------------------------------------------
    onDatabaseUpdate(type, database) {
        let timer = new Timer();
        
        this.clearServerList();
        for (const serverId of Object.keys(database.servers)) {
            const serverName = database.getServerName(serverId);
            console.log(serverId, serverName);
            this.addToServerList(serverName, serverId);
        }

        console.log("onDatabaseUpdate:", Math.round(timer.getTime()));
    }

    // --[ helpers ]------------------------------------------------------------
    clearServerList() {
        while (this.serverListContent.firstChild) {
            this.serverListContent.removeChild(this.serverListContent.firstChild);
        }        
    }

    addToServerList(serverName, serverId) {
        const div = this.serverListContent.appendChild(document.createElement("div"));
        div.innerHTML = "-&nbsp;";

        const link = div.appendChild(document.createElement("a"));
        link.href = "./server?id="+serverId;
        link.innerHTML = serverName;
    }

}


