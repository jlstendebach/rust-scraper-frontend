import { Player } from "./player.js"

export class StatusIndicator extends HTMLElement {
    statusDot = null;
    statusText = null;

    constructor(status = Player.Status.UNKNOWN) {
        super();
        this.className = "status-indicator";
        this.statusDot = this.appendChild(document.createElement("span"));
        this.statusText = this.appendChild(document.createElement("span"));
        this.setStatus(status);
    }

    setStatus(status) {
        switch (status) {
            case Player.Status.ONLINE:
                this.statusDot.className = "status-indicator-dot status-indicator-online";
                this.statusText.innerHTML = "Online";
                break;

            case Player.Status.OFFLINE:
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