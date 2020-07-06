events = {
    onVersionRequest: function() {
        return "TDR-1 PTDR-3";
    },
    onPlayerJoined: function(ws) {
        ws.send("[AUTH-OK] " + playerNames());
        sendAll("[USER-JOINED] " + ws.userData.username);
        sendAll("[CHAT] §e" + ws.userData.username + " joined!");
        sendAll("[STATE] " + ws.userData.username + " " + ws.userData.x + " " + ws.userData.y);
    },
    onPlayerLeft: function(ws) {
        sendAll("[USER-LEFT] " + ws.userData.username);
        sendAll("[CHAT] §e" + ws.userData.username + " left!");
    },
    onPlayerChat: function(ws, message) {
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
            sendAll("[CHAT] " + ws.userData.username + ": " + message);
        }
    },
    onPlayerState: function(ws, message) {
        let split = message.split(" ");
        let x = parseFloat(split[1]) + ws.userData.x;
        let y = parseFloat(split[2]) + ws.userData.y;
        let dir = (parseFloat(split[1]) < 0 ? "l" : parseFloat(split[1]) > 0 ? "r" : "-") + (parseFloat(split[2]) < 0 ? "u" : parseFloat(split[2]) > 0 ? "d" : "-");
        ws.userData.x = x;
        ws.userData.y = y;
        save(ws);
        if (ws.userData.joined) {
            sendAll("[STATE] " + ws.userData.username + " " + x + " " + y + " " + dir);
        }
    }
};