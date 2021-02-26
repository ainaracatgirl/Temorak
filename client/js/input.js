export default {
    init(gpadInput) {
        const struct = {
            motion_axis: [0, 0],
            interact: false,
            place: false,
            break: false,
            openChat: false,

            update(round=false) {
                this.place = keys.indexOf('p') != -1;
                this.break = keys.indexOf('Backspace') != -1;
                this.interact = keys.indexOf(' ') != -1;
                this.openChat = keys.indexOf('enter') != -1;
                if (this.openChat) keys.remove('enter');
                
                this.motion_axis = [ 0, 0 ];
                const nokeys = keys.length == 0;
                if (keys.indexOf('w') != -1) this.motion_axis[1] += -1;
                if (keys.indexOf('s') != -1) this.motion_axis[1] += 1;
                if (keys.indexOf('a') != -1) this.motion_axis[0] += -1;
                if (keys.indexOf('d') != -1) this.motion_axis[0] += 1;

                if (keys.indexOf('arrowup') != -1) this.motion_axis[1] += -1;
                if (keys.indexOf('arrowdown') != -1) this.motion_axis[1] += 1;
                if (keys.indexOf('arrowleft') != -1) this.motion_axis[0] += -1;
                if (keys.indexOf('arrowright') != -1) this.motion_axis[0] += 1;

                if (gpadInput.gamepads.length > 0) {
                    const gpad = gpadInput.gamepads[0];
                    if (nokeys) {
                        this.motion_axis[0] = gpad.axes[0];
                        this.motion_axis[1] = gpad.axes[1];
                        this.gpadTimestamp = gpad.timestamp;
                    }
                }

                if (round) {
                    this.motion_axis[0] = Math.round(this.motion_axis[0]);
                    this.motion_axis[1] = Math.round(this.motion_axis[1]);
                }
            },
            normalizeMotionAxis(removeDiagonals=true) {
                if (this.motion_axis[0] != 0 && this.motion_axis[1] != 0 && removeDiagonals) {
                    this.motion_axis[0] = 0;
                    this.motion_axis[1] = 0;
                    return;
                }
                const len = Math.sqrt(this.motion_axis[0] * this.motion_axis[0] + this.motion_axis[1] * this.motion_axis[1]);
                if (len == 0) return;
                this.motion_axis[0] /= len;
                this.motion_axis[1] /= len;
            }
        };

        let keys = [];
        window.addEventListener('keydown', (e) => {
            if (e.target != document.body) return;
            if (e.shiftKey || e.ctrlKey) return;
            if (!e.repeat)
                keys.push(e.key.toLowerCase());
        });
        window.addEventListener('keyup', (e) => {
            if (e.target != document.body) return;
            if (e.shiftKey || e.ctrlKey) return;
            keys.remove(e.key.toLowerCase());
        });

        return struct;
    }
}