export default {
    init: (canvas) => {
        window.onresize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.onresize();
    },
    TILE_W: 16,
    TILE_H: 16,
    lerp(a, b, k) {
        return (1 - k) * a + k * b;
    },
    serp(a, b, k) {
        if (a < b) {
            return Math.min(a + k, b);
        } else if (a > b) {
            return Math.max(a - k, b);
        }
        return b;
    }
}