// TEMORAK Copyright (c) 2020 JanCraft888

let ctx = document.getElementById('content').getContext('2d'); // The canvas context

// The camera object
let camera = {
    x: 0,
    y: 0,
    speed: 0.005
};

let mainloop = {
    executionID: null, // used to keep track of the AnimationFrame
    lastInstant: 0, // the last captured time in milliseconds
    tps: 0, // ticks/s
    fps: 0, // frames/s
    // the requestAnimationFrame() callback
    iterate: function(timeInstant) {
        mainloop.executionID = window.requestAnimationFrame(mainloop.iterate);

        mainloop.tick(timeInstant);
        mainloop.render(timeInstant);

        if (timeInstant - mainloop.lastInstant > 999) {
            mainloop.lastInstant = timeInstant;
            document.getElementById('fps-tps-counter').innerText = "TPS: " + mainloop.tps + " FPS: " + mainloop.fps;
            mainloop.tps = 0;
            mainloop.fps = 0;
        }
    },
    // stop the game from updating and rendering
    stop: function() {
        cancelAnimationFrame(mainloop.executionID);
    },
    // update function
    tick: function(timeInstant) {
        gamepad.update();

        document.getElementById('gamepad-icon').hidden = gamepad.index == -1;

        let state = {
            x: 0,
            y: 0,
            height: 0
        };
        if (communication.socket && communication.socket.readyState == 1) { // RUN THE GAME
            if (keyboard.keyDown('a')) {
                state.x -= 1;
            }
            if (keyboard.keyDown('d')) {
                state.x += 1;
            }
            if (keyboard.keyDown('w')) {
                state.y -= 1;
            }
            if (keyboard.keyDown('s')) {
                state.y += 1;
            }
            if (keyboard.keyDown(' ')) {
                state.height += 1;
            }

            if ((state.x != 0 || state.y != 0 || state.height != 0) || communication.resendState) { // Sending the state
                communication.socket.send("[STATE] " + state.x + " " + state.y + " " + state.height);
                communication.resendState = false;
            }
        }

        if (communication.localUsername != null) { // Camera lerping
            communication.onlineUsers.forEach(user => {
                if (user.username == communication.localUsername) {
                    camera.x = lerp(camera.x, user.x, camera.speed);
                    camera.y = lerp(camera.y, user.y, camera.speed);
                }
            });
        }

        //keyboard.reset();
        mainloop.tps++;
    },
    // render function
    render: function(timeInstant) {
        ctx.fillStyle = "skyblue";
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);

        if (communication.socket && communication.socket.readyState == 1) { // RENDER THE GAME
            if (world && world.tiles && world.tiles.length > 0) { // render each tile
                world.tiles.forEach(tile => {
                    let x = (dimensions.width / 2 + tile.x * dimensions.tileSize) - camera.x;
                    let y = (dimensions.height / 2 + tile.y * dimensions.tileSize) - camera.y;
                    ctx.drawImage(textures[tile.texture], x, y);
                });
            }

            communication.onlineUsers.sort((a, b) => {
                return a.height - b.height;
            });
            communication.onlineUsers.forEach(user => { // render each player
                let x = (dimensions.width / 2 + user.x) - camera.x;
                let y = (dimensions.height / 2 + user.y) - camera.y;
                let shadowX = x + user.height;
                let shadowY = y + user.height;
                let size = 20 + user.height;
                let dir = user.dir;

                if (user.height > 0) {
                    ctx.fillStyle = "#00000055";
                    ctx.fillRect(shadowX - size / 2, shadowY - size / 2, size, size);
                }

                ctx.fillStyle = "red";
                ctx.fillRect(x - size / 2, y - size / 2, size, size);

                if (dir) {
                    ctx.fillStyle = "green";
                    switch(dir.charAt(0)) {
                        case('l'):
                            ctx.fillRect(x - 8, y - 8, 4, 16);
                            break;
                        case('r'):
                            ctx.fillRect(x + 4, y - 8, 4, 16);
                            break;
                    }
                    switch(dir.charAt(1)) {
                        case('u'):
                            ctx.fillRect(x - 8, y - 8, 16, 4);
                            break;
                        case('d'):
                            ctx.fillRect(x - 8, y + 4, 16, 4);
                            break;
                    }
                }
            });
        }

        mainloop.fps++;
    }
};