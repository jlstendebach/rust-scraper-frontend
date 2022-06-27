import { Database, DatabaseEvents, Status } from "./database.js"
import { ServerRow } from "./server-row.js"

export class App {
    database = new Database();
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
        }.bind(this), 1000);
    }

    rebuild() {
        let rebuildTime = new Date().getTime();
        Object.entries(this.database.schedule).forEach(([serverId, players]) => {
            const serverRow = this.getOrCreateServerRow(serverId);
            serverRow.setStatusFilter(this.isShowingOnlineOnly() ? Status.online : null);
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
            const container = document.getElementById("container");
            row = new ServerRow(this.database, serverId);
            container.appendChild(row);
            this.serverRows[serverId] = row;
        }
        return row;
    }

    isShowingOnlineOnly() {
        const checkbox = document.getElementById("online-only-checkbox");
        return checkbox.checked;
    }

}


