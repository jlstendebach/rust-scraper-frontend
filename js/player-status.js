export class PlayerStatus {    
    static ONLINE = "online";
    static OFFLINE = "offline";
    static UNKNOWN = "unknown";

    static opposite(status) {
        switch (status) {
            case Status.ONLINE: return Status.OFFLINE;
            case Status.OFFLINE: return Status.ONLINE;
            default: Status.UNKNOWN;
        }
    }
}
