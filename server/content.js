// TEMORAK Copyright (c) 2021 jDev

let world = {}; // The world that gets sent to every player
{
    if (fs.existsSync("worlds/world.json")) {
        world = JSON.parse(fs.readFileSync("worlds/world.json") + "");
        if (world.version != "TDR-1") {
            console.error("World version incompatible, please, use the updator tool");
            world = {
                version: "INVALID"
            };
        }
    } else {
        console.warn("[>>] World non existent, generating random world...");

        world = {
            version: "TDR-1",
            tiles: [],
            entities: [],
            metadata: {}
        };

        for (let x = -3; x < 3; x++) {
            for (let y = -3; y < 3; y++) {
                world.tiles.push({ id: "dirt", texture: "dirt", x: x, y: y, metadata: {} });
                if (Math.random() < 0.05) {
                    if (Math.random() < 0.5) {
                        world.tiles.push({ id: "sand", texture: "sand", x: x, y: y, metadata: {} });
                    } else {
                        world.tiles.push({ id: "gravel", texture: "gravel", x: x, y: y, metadata: {} });
                    }
                } else {
                    world.tiles.push({ id: "grass", texture: "grass", x: x, y: y, metadata: {} });
                }
            }
        }
        console.log("[>>] Generated simple platform, decorating...");

        // TODO Decoration

        console.log("[>>] World generation finished! Saving...");
        fs.writeFileSync("worlds/world.json", JSON.stringify(world));
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
 * A NaN secure division
 * **A / B**
 * 
 * @param {Number} a A
 * @param {Number} b B
 */
function divNotNaN(a, b) {
    return b == 0 ? 0 : a / b;
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
        return "TDR-1 PTDR-5";
    },
    onPlayerJoined: function(ws) { // When someone joins
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
        if (message.trim().startsWith("/kick ") && ws.userData.operator) {
            let user = message.trim().substr(6);
            let found = false;
            clients.forEach(ws => {
                if (ws.userData.username == user) {
                    save(ws);
                    ws.close(3002, "You got kicked/banned from this server");
                    found = true;
                }
            });
        } else if (message.trim() == "/checklag"
                || message.trim() == "/lagcheck"
                || message.trim() == "/lag") {
            ws.send("[LAGCHECK] " + Date.now());
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
        
        let dir = (parseFloat(split[1]) < 0 ? "l" : parseFloat(split[1]) > 0 ? "r" : "-") + (parseFloat(split[2]) < 0 ? "u" : parseFloat(split[2]) > 0 ? "d" : "-");
        ws.userData.x = x;
        ws.userData.y = y;
        save(ws);
        if (ws.userData.joined) {
            sendAll("[STATE] " + ws.userData.username + " " + x + " " + y + " " + dir);
        }
    },
    onServerTick: function() {
        return;
        clients.forEach(user => {
            if (user.userData.joined) {
            } 
        });
    }
};