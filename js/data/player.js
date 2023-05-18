import { PlayerStatus } from "./player-status.js";

export class Player {
    id = 0;
    name = "";
    aliases = [];
    status = PlayerStatus.UNKNOWN;

    constructor(id, name, aliases, status) {
        this.id = id;
        this.name = name;
        this.aliases = aliases;
        this.status = status;
    }
}