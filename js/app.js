import { Database, Status } from "./database.js"
import { ServerRow } from "./server-row.js"

class App {
    database = new Database();
    frequency = 10*1000; // update every 10 seconds
    interval = null; 
    serverRows = {};

    constructor() {
        document
            .getElementById("online-only-checkbox")
            .addEventListener(
                "change", 
                this.onOnlineOnlyCheckboxChange.bind(this)
            );
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

    rebuild() {
        Object.entries(this.database.schedule).forEach(([serverId, players]) => {
            const serverRow = this.getOrCreateServerRow(serverId);
            serverRow.setStatusFilter(this.isShowingOnlineOnly() ? Status.online : null);
            serverRow.populate();
        });        
    }

    // --[ events ]-------------------------------------------------------------
    onDatabaseUpdate(database) {
        this.rebuild();
    }

    onOnlineOnlyCheckboxChange() {
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


// --[ on load ]----------------------------------------------------------------
window.addEventListener("load", function() {
    window.removeEventListener("load", this)
    let app = new App();
    app.start();
})