let gamepad = {
    data: null,
    index: -1,
    timestamp: 0,
    start: function() {
        window.addEventListener("gamepadconnected", (event) => {
            if (gamepad.index == -1) {
                gamepad.index = event.gamepad.index;
                gamepad.data = { axes: event.gamepad.axes, buttons: event.gamepad.buttons };
                console.log("Gamepad -> Accepted (" + event.gamepad.id + ")");
            } else {
                if(confirm("You already have a Gamepad connected, but another has connected, do you want to use the new gamepad?")) {
                    gamepad.index = event.gamepad.index;
                    gamepad.data = { axes: event.gamepad.axes, buttons: event.gamepad.buttons };
                    console.log("Gamepad -> Switched to (" + event.gamepad.id + ")");
                }
            }
        });
          
        window.addEventListener("gamepaddisconnected", (event) => {
            if (event.gamepad.index == gamepad.index) {
                gamepad.data = null;
                gamepad.index = -1;
                console.log("Gamepad -> Disconnected");
            }
        });
    },
    update: function() {
        if (gamepad.index != -1) {
            let gpad = navigator.getGamepads()[gamepad.index];
            if (gpad) {
                if (gpad.timestamp != gamepad.timestamp) {
                    gamepad.data = { axes: gpad.axes, buttons: gpad.buttons };
                    gamepad.timestamp = gpad.timestamp;
                }
            }
        }
    }
};