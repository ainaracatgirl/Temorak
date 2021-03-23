export default {
    init() {
        const struct = {
            gamepads: [],
            poll() {
                const gs = navigator.getGamepads();
                for (let i = 0; i < this.gamepads.length; i++) {
                    this.gamepads[i] = gs[this.gamepads[i].index];
                }
            }
        };
        window.addEventListener("gamepadconnected", (e) => {
            struct.gamepads.push(e.gamepad);
        });
        window.addEventListener("gamepaddisconnected", (e) => {
            struct.gamepads.remove(e.gamepad);
        });
        return struct;
    }
};