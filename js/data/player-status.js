export class PlayerStatus {
    static ONLINE = "online"
    static OFFLINE = "offline"
    static UNKNOWN = "unknown"
    
    static opposite(status) {
        switch (status) {
            case PlayerStatus.ONLINE: return PlayerStatus.OFFLINE;
            case PlayerStatus.OFFLINE: return PlayerStatus.ONLINE;
            default: PlayerStatus.UNKNOWN;
        }
    }    
}