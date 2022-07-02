import { Database, DatabaseEvents, Status } from "./database.js"
import { ServerRow } from "./server-row.js"

export class App {
    database = new Database();

    serverList = document.getElementById("server-list");
    serversContainer = document.getElementById("servers-container");
    serverRows = {};
    shouldRebuild = true;

    constructor() {
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
    }    

    start() {
        requestAnimationFrame(this.loop.bind(this));
    }   
    
    loop() {
        if (this.shouldRebuild) {
            this.rebuild();
            this.shouldRebuild = false;
        }
        setTimeout(function() {
            requestAnimationFrame(this.loop.bind(this));
        }.bind(this), 250);
    }

    rebuild() {
        let rebuildTime = new Date().getTime();
        Object.entries(this.database.schedule).forEach(([serverId, players]) => {
            const serverRow = this.getOrCreateServerRow(serverId);
            serverRow.setStatusFilter(this.isShowingOnlineOnly() ? Status.ONLINE : null);
            serverRow.populate();
        });        
        rebuildTime = Math.round(new Date().getTime() - rebuildTime);
        console.log("App.rebuild():", rebuildTime);
    }

    // --[ events ]-------------------------------------------------------------
    onDatabaseUpdate(type, database) {
        this.shouldRebuild = true;
    }

    onOnlineOnlyCheckboxChange() {
        console.log("onOnlineOnlyCheckboxChange");
        this.rebuild();
    }

    // --[ helpers ]------------------------------------------------------------
    getOrCreateServerRow(serverId) {
        let row = this.serverRows[serverId];        
        if (row == null) {
            // Create the row
            row = new ServerRow(this.database, serverId);
            this.serversContainer.appendChild(row);
            this.serverRows[serverId] = row;

            // Add to the server list
            this.addToServerList(this.database.getServerName(serverId), row.id);
        }
        return row;
    }

    isShowingOnlineOnly() {
        const checkbox = document.getElementById("online-only-checkbox");
        return checkbox.checked;
    }

    addToServerList(serverName, rowId) {
        const div = this.serverList.appendChild(document.createElement("div"));
        div.innerHTML = "-&nbsp;";

        const link = div.appendChild(document.createElement("a"));
        link.href = "#"+rowId;
        link.innerHTML = serverName;
    }

}


