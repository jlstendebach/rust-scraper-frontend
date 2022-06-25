import { Status } from "./database.js"

export class StatusIndicator extends HTMLElement {
    statusDot = null;
    statusText = null;

    constructor() {
        super();
        this.statusDot = this.appendChild(document.createElement("span"));
        this.statusText = this.appendChild(document.createElement("span"));
        this.setStatus(Status.unknown);
    }

    setStatus(status) {
        switch (status) {
            case Status.online:
                this.statusDot.className = "dot online";
                this.statusText.innerHTML = "Online";
                break;

            case Status.offline:
                this.statusDot.className = "dot offline";
                this.statusText.innerHTML = "Offline";
                break;

            default:
                this.statusDot.className = "dot";
                this.statusText.innerHTML = "Unknown";
                break;
        }
    }
}

customElements.define("status-indicator", StatusIndicator);