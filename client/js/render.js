export default class RenderModule {
    static globalmodule;
    _callback;
    _ctx;

    init(canvas, render_routine) {
        this._callback = render_routine;
        this._ctx = canvas.getContext('2d');
        RenderModule.globalmodule = this;

        this._ctx.imageSmoothingEnabled = false;
        this._ctx.mozImageSmoothingEnabled = false;
        this._ctx.webkitImageSmoothingEnabled = false;
        window.addEventListener('resize', () => {
            this._ctx.imageSmoothingEnabled = false;
            this._ctx.mozImageSmoothingEnabled = false;
            this._ctx.webkitImageSmoothingEnabled = false;
        });

        this.onanimate();
    }
    onanimate() {
        RenderModule.globalmodule._callback(RenderModule.globalmodule._ctx);

        requestAnimationFrame(RenderModule.globalmodule.onanimate);
    }
    texture(img, x, y) {
        this._ctx.drawImage(img, x - img.width / 2, y - img.height / 2);
    }
}