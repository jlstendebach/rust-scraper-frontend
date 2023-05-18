import { PlayerStatus } from "./data/player-status.js"

export class StatusIndicator extends HTMLElement {
    statusDot = null;
    statusText = null;

    constructor(status = PlayerStatus.UNKNOWN) {
        super();
        this.className = "status-indicator";
        this.statusDot = this.appendChild(document.createElement("span"));
        this.statusText = this.appendChild(document.createElement("span"));
        this.setStatus(status);
    }

    setStatus(status) {
        switch (status) {
            case PlayerStatus.ONLINE:
                this.statusDot.className = "status-indicator-dot status-indicator-online";
                this.statusText.innerHTML = "Online";
                break;

            case PlayerStatus.OFFLINE:
                this.statusDot.className = "status-indicator-dot status-indicator-offline";
                this.statusText.innerHTML = "Offline";
                break;

            default:
                this.statusDot.className = "status-indicator-dot";
                this.statusText.innerHTML = "Unknown";
                break;
        }
    }
}

customElements.define("status-indicator", StatusIndicator);