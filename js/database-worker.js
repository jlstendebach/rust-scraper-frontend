import * as FirebaseApp from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js'
import * as FirebaseDatabase from "https://www.gstatic.com/firebasejs/9.8.3/firebase-database.js"
import { DatabaseEvents } from './database-events.js';

// --[ variables ]--------------------------------------------------------------
const worker = self;
const app = FirebaseApp.initializeApp({
    apiKey: "AIzaSyA1m_X7UoT2f7jU5fbGsH7JtrcTYvE7DSQ",
    authDomain: "rust-player-tracker.firebaseapp.com",
    databaseURL: "https://rust-player-tracker-default-rtdb.firebaseio.com",
    projectId: "rust-player-tracker",
    storageBucket: "rust-player-tracker.appspot.com",
    messagingSenderId: "732934760915",
    appId: "1:732934760915:web:f19a11087e3a433e88a726",
    measurementId: "G-M1EF9VHR0N"
});
const database = FirebaseDatabase.getDatabase(app);

// --[ types ]------------------------------------------------------------------
class Node {
    static ALL = "/";
    static BACKUP = "/backup";
    static PLAYERS = "/players";
    static SCHEDULE = "/schedule";
    static SERVERS = "/servers";
}

// --[ methods ]----------------------------------------------------------------
function postSuccess(response, type) {
    postMessage({response: response, type: type});
}

function postError(message) {
    postMessage({error: message});
}


function onValue(path, type) {
    FirebaseDatabase.onValue(
        FirebaseDatabase.ref(database, path),
        (snapshot) => {
            const data = snapshot.val();
            if (data == null) {
                postError("No data for path '"+path+"'");
                return;
            }
            postSuccess(data, type);
        }
    );             
}


function onMessage(message) {
    if (message.data == null) {
        postError("Received null message");
        return;
    }

    if (message.data.type == null) {
        postError("No 'type' found.");
        return;
    }

    switch (message.data.type) {
        case DatabaseEvents.UPDATE_PLAYERS:
            onValue(Node.PLAYERS, message.data.type);
            break;

        case DatabaseEvents.UPDATE_SCHEDULE:
            onValue(Node.SCHEDULE+"/"+message.data.serverId, message.data.type);
            break;

        case DatabaseEvents.UPDATE_SERVERS:
            onValue(Node.SERVERS, message.data.type);
            break;

        default:
            postError("Unknown type: '"+message.data.type+"'");
            return;
    }
}

// -----------------------------------------------------------------------------
worker.addEventListener("message", onMessage);
