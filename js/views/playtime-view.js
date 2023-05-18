import { PlayerStatus } from "../data/player-status.js";

export class PlaytimeView extends HTMLElement {
    static SECONDS_PER_DAY = 60*60*24;
    tooltip = document.createElement("span");
    line = document.createElement("div");

    constructor() {
	    super();
  		this.className = "playtime-view";
        
        this.tooltip.className = "playtime-view-tooltip";
        this.appendChild(this.tooltip);
        
        this.line.className = "playtime-view-line";
        this.appendChild(this.line);
        
        this.addEventListener("mouseenter", this.onMouseEnter.bind(this));
        this.addEventListener("mouseleave", this.onMouseLeave.bind(this));
        this.addEventListener("mousemove", this.onMouseMove.bind(this));        
  	}
    
    // -------------------------------------------------------------------------
    addPlaytime(status, seconds) {
        const div = this.appendChild(document.createElement("div"));
        div.style.width = (100 * seconds / PlaytimeView.SECONDS_PER_DAY)+"%";
        if (status == PlayerStatus.ONLINE) {
            div.className = "playtime-view-online";  
        } else {
            div.className = "playtime-view-offline";  
        }
    }


    // --[ events ]-------------------------------------------------------------
    onMouseEnter(event) {
        this.tooltip.style.display = "block";
        this.line.style.display = "block";
    }
    
    onMouseLeave(event) {
        this.tooltip.style.display = "none";
        this.line.style.display = "none";
    }
    
    onMouseMove(event) {
        let style = getComputedStyle(this);
        let borderLeft = parseInt(style.getPropertyValue("border-left-width").replace("px", ""));
        let borderRight = parseInt(style.getPropertyValue("border-right-width").replace("px", ""));
        let rect = this.getBoundingClientRect();
        let width = rect.width-borderLeft-borderRight;
        let x = Math.max(0, Math.min(width, event.clientX - rect.left - borderLeft));

		// Line
        this.line.style.left = x+"px";

		// Tooltip
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const time = PlaytimeView.SECONDS_PER_DAY*(x/width);
        const hour = Math.floor(time/(60*60));
        const minute = Math.floor((time - hour*60*60)/60);
        const text = minute >= 10 ? hour+":"+minute : hour+":0"+minute;

        const scrollTop = this.parentElement.parentElement.scrollTop;
        
        this.tooltip.style.top = this.offsetTop - tooltipRect.height - 4 -scrollTop + 'px';
        this.tooltip.style.left = Math.round(event.x-tooltipRect.width/2 - 1) + 'px';
        this.tooltip.innerHTML = text;    
    }
}

customElements.define("playtime-view", PlaytimeView);
