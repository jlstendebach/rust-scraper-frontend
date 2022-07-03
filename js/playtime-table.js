import { Status } from "./database.js";
import { PlaytimeView } from "./playtime-view.js";

export class PlaytimeTable extends HTMLElement {
    constructor() {
        super();
        this.className = "playtime-table";
    }

    removeAllChildren() {
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }        
        this.innerHTML = "";
    }

    loadFromSchedule(schedule) {
        const date1 = this.getDate(schedule[0].timestamp);
        const date2 = this.getDate(schedule[schedule.length-1].timestamp);

        this.removeAllChildren();

        for (let date = date1; date <= date2; date.setDate(date.getDate()+1)) {
            this.addRow(date, this.getScheduleForDate(schedule, date));
        }
    }


    addRow(date, playtime) {
        const dayDiv = this.appendChild(document.createElement("div"));
        const playtimeDiv = this.appendChild(document.createElement("div"));
        const hoursDiv = this.appendChild(document.createElement("div"));

        // Create the PlaytimeView and calculate the total seconds online.
        let playtimeView = new PlaytimeView();
        let totalSeconds = 0;
        for (let i = 0; i < playtime.length; i++) {
            let seconds = playtime[i].timestamp2-playtime[i].timestamp1;
            let status = playtime[i].status;

            if (status == Status.ONLINE) {
                totalSeconds += seconds
            }

            playtimeView.addPlaytime(status, seconds);
        }
    
        // Day
        dayDiv.innerHTML = this.formatDate(date);

        // Playtime
        playtimeDiv.appendChild(playtimeView);

        // Hours
        hoursDiv.innerHTML = this.formatHours(totalSeconds/3600);
    }

    // --[ helpers ]------------------------------------------------------------
    formatDate(date) {
        const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        const pad2 = function(n) {
            return (n < 10 ? "0" : "") + String(n);
        };
        return weekday[date.getDay()]+" "+pad2(date.getMonth()+1)+"/"+pad2(date.getDate())+"/"+date.getFullYear();    
    }

    formatHours(hours) {
        return "("+hours.toFixed(1)+" hours)";
    }

    isSameDay(date1, date2) {
        return (
            date1.getFullYear() == date2.getFullYear() &&
            date1.getMonth() == date2.getMonth() &&
            date1.getDate() == date2.getDate()
        );
    }

    getDate(seconds) {
        let temp = this.getDateTime(seconds);
        return new Date(temp.getFullYear(), temp.getMonth(), temp.getDate());
    }

    getDateTime(seconds) {
        return new Date(seconds*1000);
    }

    getStartOfDay(date) {
        return new Date(
            date.getFullYear(),
            date.getMonth(), 
            date.getDate(),
            0, // hours
            0, // minutes
            0, // seconds
        );
    }

    getEndOfDay(date) {
        return new Date(
            date.getFullYear(),
            date.getMonth(), 
            date.getDate(),
            23, // hours
            59, // minutes
            59, // seconds
        );
    }

    dateToSeconds(date) {
        return Math.round(date.getTime()/1000);
    }
    
    getScheduleForDate(schedule, date) {
        const startOfDay = this.getStartOfDay(date);
        const endOfDay = this.getEndOfDay(date);
        let entries = [];
        
        let lastTimestamp = 0;
        let lastStatus = Status.UNKNOWN;
        
        for (let i = 0; i < schedule.length; i++) {
            const isLast = (i == schedule.length-1);
            const isFirstEntry = (entries.length == 0);
            const isToday = this.isSameDay(date, new Date());
            let timestamp = schedule[i].timestamp;
            let status = schedule[i].status;
            let scheduleDate = this.getDateTime(timestamp);
            
            if (scheduleDate < startOfDay) {
                if (isLast) {
                    entries.push({
                        status: Status.UNKNOWN,
                        timestamp1: this.dateToSeconds(startOfDay),
                        timestamp2: this.dateToSeconds(endOfDay),
                    });
                }        
            
                lastTimestamp = timestamp;
                lastStatus = status;
            
            } else if (scheduleDate > endOfDay) {
                entries.push({
                    timestamp1: isFirstEntry
                    ? this.dateToSeconds(startOfDay) 
                    : lastTimestamp,
                    timestamp2: this.dateToSeconds(endOfDay),
                    status: lastStatus
                });
            
                break;
            
            } else {
                entries.push({
                    timestamp1: isFirstEntry 
                        ? this.dateToSeconds(startOfDay)
                        : lastTimestamp,
                    timestamp2: timestamp,
                    status: lastStatus
                });            	

                if (isLast) {
                    entries.push({
                        timestamp1: timestamp,
                        timestamp2: isToday 
                            ? this.dateToSeconds(new Date())
                            : this.dateToSeconds(endOfDay),
                        status: status
                    });            	
                }
    
                lastTimestamp = timestamp;
                lastStatus = status;            
            }
        }
        
        if (entries.length == 0) {
            entries.push({
                status: Status.UNKNOWN,
                timestamp1: this.dateToSeconds(startOfDay),
                timestamp2: this.dateToSeconds(endOfDay),
            });    
        }
        
        return entries;
    }
}

customElements.define("playtime-table", PlaytimeTable);