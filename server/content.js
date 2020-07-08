// TEMORAK Copyright (c) 2020 JanCraft888

let world = {}; // The world that gets sent to every player
{
    world = JSON.parse(fs.readFileSync("worlds/world.json") + "");
    if (world.version != "TDR-1") {
        console.error("World version incompatible, please, use the updator tool");
        world = {
            version: "INVALID"
        };
    }
}

/**
 * Linear interpolation algorithm
 * 
 * @param {Number} a 
 * @param {Number} b 
 * @param {Number} k 
 */
function lerp(a, b, k) {
    return (a * (1.0 - k)) + (b * k);
}

/**
 * 2D Vector normalization
 * 
 * @param {Number} x 
 * @param {Number} y 
 */
function normalize(x, y) {
    let len = Math.sqrt(x * x + y * y);
    if (len <= 0) {
        return { x: x, y: y };
    } 
    return { x: x / len, y: y / len };
}

events = { // The events the game runs
    onVersionRequest: function() { // when the Game Version is requested
        return "TDR-1 PTDR-4";
    },
    onPlayerJoined: function(ws) { // When someone joins
        ws.userData.height = 0;
        ws.userData.vVel = 0;
        save(ws);
        ws.send("[AUTH-OK] " + playerNames());
        sendAll("[USER-JOINED] " + ws.userData.username);
        sendAll("[CHAT] §e" + ws.userData.username + " joined!");
        sendAll("[STATE] " + ws.userData.username + " " + ws.userData.x + " " + ws.userData.y + " " + ws.userData.height);
        sendAll("[WORLD] " + JSON.stringify(world));
    },
    onPlayerLeft: function(ws) { // When someone leaves
        sendAll("[USER-LEFT] " + ws.userData.username);
        sendAll("[CHAT] §e" + ws.userData.username + " left!");
    },
    onPlayerChat: function(ws, message) { // When someone chats
        if (message.trim().startsWith("/Kick ") && ws.userData.operator) {
            let user = message.trim().substr(6);
            let found = false;
            clients.forEach(ws => {
                if (ws.userData.username == user) {
                    save(ws);
                    ws.close(3002, "You got kicked/banned from this server");
                    found = true;
                }
            });
        } else {
            if (!message.trim().startsWith("/")) {
                sendAll("[CHAT] " + ws.userData.username + ": " + message);
            } else {
                ws.send("[CHAT] §cUnknown command/permissions not satisfied");
            }
        }
    },
    onPlayerState: function(ws, message) { // When someone sends it's state
        let split = message.split(" ");
        let x = normalize(parseFloat(split[1]), parseFloat(split[2])).x + ws.userData.x;
        let y = normalize(parseFloat(split[1]), parseFloat(split[2])).y + ws.userData.y;
        let height = ws.userData.height;
        if (Math.abs(ws.userData.height) < 0.25) {
            ws.userData.vVel += parseFloat(split[3]);
        }
        
        let dir = (parseFloat(split[1]) < 0 ? "l" : parseFloat(split[1]) > 0 ? "r" : "-") + (parseFloat(split[2]) < 0 ? "u" : parseFloat(split[2]) > 0 ? "d" : "-");
        ws.userData.x = x;
        ws.userData.y = y;
        ws.userData.height = height;
        save(ws);
        if (ws.userData.joined) {
            sendAll("[STATE] " + ws.userData.username + " " + x + " " + y + " " + dir + " " + height);
        }
    },
    onServerTick: function() {
        clients.forEach(user => {
            if (user.userData.joined) {
                user.userData.height += user.userData.vVel;
                user.userData.vVel = lerp(user.userData.vVel, 0, 0.01);
                if (user.userData.height > 0.01) {
                    user.userData.height = lerp(user.userData.height, 0, 0.02 + (1.0 / user.userData.height));
                    sendAll("[STATE] " + user.userData.username + " " + user.userData.x + " " + user.userData.y + " -- " + user.userData.height);
                }
            } 
        });
    }
};