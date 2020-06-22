let ctx = document.getElementById('content').getContext('2d');

let mainloop = {
    executionID: null, // used to keep track of the AnimationFrame
    lastInstant: 0, // the last captured time in milliseconds
    tps: 0, // ticks/s
    fps: 0, // frames/s
    // the requestAnimationFrame() callback
    iterate: function(timeInstant) {
        mainloop.executionID = window.requestAnimationFrame(mainloop.iterate);

        mainloop.tick(timeInstant);
        mainloop.render();

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

        keyboard.reset();
        mainloop.tps++;
    },
    // render function
    render: function(timeInstant) {
        ctx.fillStyle = "black";

        ctx.fillRect(0, 0, dimensions.width, dimensions.height);

        ctx.fillStyle = "white";
        for (let y = 0; y < dimensions.tilesY; y++) {
            for (let x = 0; x < dimensions.tilesX; x++) {
                ctx.fillRect(x * dimensions.tileSize, y * dimensions.tileSize, dimensions.tileSize, dimensions.tileSize);
            }
        }

        mainloop.fps++;
    }
};