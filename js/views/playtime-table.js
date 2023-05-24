import { PlayerStatus } from "../data/player-status.js";
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
        this.removeAllChildren();

        // Categorize all of the timestamps by day.
        let statusesPerDay = {};
        for (let i = 0; i < schedule.length; i++) {
            const day = this.getDate(schedule[i].timestamp);
            if (!statusesPerDay.hasOwnProperty(day)) {
                statusesPerDay[day] = [];
            }
            statusesPerDay[day].push(schedule[i]);
        }

        // Go through each day, generating a full schedule for that day.
        const date1 = this.getDate(schedule[0].timestamp);
        const date2 = new Date(); 
        let schedulePerDay = {};
        let currentStatus = PlayerStatus.UNKNOWN;

        for (let day = date1; day <= date2; day.setDate(day.getDate()+1)) {
            const startTimestamp = this.dateToSeconds(this.getStartOfDay(day));
            const endTimestamp = this.dateToSeconds(
                this.isSameDay(day, new Date()) 
                    ? new Date()
                    : this.getEndOfDay(day)
            );
            const statuses = statusesPerDay[day];

            let daySchedule = [];

            if (statuses == null) {
                daySchedule.push({
                    timestamp1: startTimestamp,
                    timestamp2: endTimestamp,
                    status: currentStatus
                });

            } else {
                daySchedule.push({
                    timestamp1: startTimestamp,
                    timestamp2: statuses[0].timestamp,
                    status: PlayerStatus.opposite(statuses[0].status)
                });
                for (let i = 1; i < statuses.length; i++) {
                    daySchedule.push({
                        timestamp1: statuses[i-1].timestamp,
                        timestamp2: statuses[i].timestamp,
                        status: statuses[i-1].status
                    });                    
                }
                daySchedule.push({
                    timestamp1: statuses[statuses.length-1].timestamp,
                    timestamp2: endTimestamp,
                    status: statuses[statuses.length-1].status
                });

                currentStatus = statuses[statuses.length-1].status;
            }

            schedulePerDay[day] = daySchedule;
        }

        // Generate the rows for each date from the first to today
        for (let day of Object.keys(schedulePerDay).reverse()) {
            day = new Date(day);
            this.addRow(day, schedulePerDay[day]);
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

            if (status == PlayerStatus.ONLINE) {
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

    // Returns just the date, without taking into account the time.
    getDate(seconds) {
        let temp = this.getDateTime(seconds);
        return new Date(temp.getFullYear(), temp.getMonth(), temp.getDate());
    }

    // Returns the date at a given time.
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
    

}

customElements.define("playtime-table", PlaytimeTable);