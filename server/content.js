// TEMORAK Copyright (c) 2020 JanCraft888

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
 * Returns the height of the specified tile
 * 
 * @param {String} id 
 */
function getTileHeight(id) {
    switch(id) {
        case('grass'):
            return 0;
        case('sand'):
            return 0;
        case('gravel'):
            return 0;
        case('dirt'):
            return 0;
        default:
            return -1;
    }
}

/**
 * Returns a structure containing:
 * - highest -- the highest tile in that column
 * - tiles -- all the tiles in that column
 * 
 * @param {Number} x Tile X, in pixels
 * @param {Number} y Tile Y, in pixels
 */
function tilesAt(x, y) {
    if (!world.tiles) {
        return undefined;
    }
    let struct = {
        highest: -20,
        tiles: []
    };
    let tx = ((x - 16) / 32).toFixed(0);
    let ty = ((y - 16) / 32).toFixed(0);

    world.tiles.forEach(tile => {
        if (tx == tile.x && ty == tile.y) {
            if (getTileHeight(tile.id) > struct.highest) {
                struct.highest = getTileHeight(tile.id);
            }
            struct.tiles.push(tile);
        }
    });

    return struct;
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
        let ts = tilesAt(x, y);
        if (ts && ts.highest < 0) {
            return;
        }
        if (Math.abs(ws.userData.height - ts.highest) < 0.5) {
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
                let ts = tilesAt(user.userData.x, user.userData.y);
                if (ts) {
                    if (user.userData.height > ts.highest) {
                        user.userData.height = lerp(user.userData.height, ts.highest, 0.02 + (1.0 / user.userData.height));
                        sendAll("[STATE] " + user.userData.username + " " + user.userData.x + " " + user.userData.y + " -- " + user.userData.height);
                    }   
                }
            } 
        });
    }
};