export class Player {
    static Status = {
        ONLINE: "online",
        OFFLINE: "offline",
        UNKNOWN: "unknown",
        opposite: function(status) {
            switch (status) {
                case Status.ONLINE: return Status.OFFLINE;
                case Status.OFFLINE: return Status.ONLINE;
                default: Status.UNKNOWN;
            }
        }    
    }

    id = 0;
    name = "";
    aliases = [];
    status = Player.Status.UNKNOWN;

    constructor(id, name, aliases, status) {
        this.id = id;
        this.name = name;
        this.aliases = aliases;
        this.status = status;
    }
}