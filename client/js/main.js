import utils from './utils.js'
import dimensions from './dimensions.js';
import RenderModule from './render.js';
import resources from './resources.js';
const render = new RenderModule();
import tiles from './tiles.js';
import gamepad from './gamepad.js';
import input from './input.js';

const VERSION = "v0.1.13";

const world = {
    tiles: [],
    players: [],
    entities: []
}
const camera = {
    x: 0,
    y: 0,
    _x: 0,
    _y: 0
}
window.camera = camera;

const canvas = document.getElementById('content');
dimensions.init(canvas);
tiles.init(world);
const inputGamepad = gamepad.init();
const inputAll = input.init(inputGamepad);

render.init(canvas, (ctx) => {
    tick();

    const PIXELS_PER_ROW = canvas.width / dimensions.TILE_W * 4;
    const PIXELS_PER_COLUMN = canvas.height / dimensions.TILE_H * 4;

    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(canvas.width / PIXELS_PER_ROW, canvas.height / PIXELS_PER_COLUMN);

    ctx.translate(-camera._x, -camera._y);
    ctx.translate(PIXELS_PER_ROW / 2, PIXELS_PER_COLUMN / 2);

    tiles.render(render, {
        tw: dimensions.TILE_W,
        th: dimensions.TILE_H,
        tex: resources.textures,
        tiles: world.tiles,
        cam: camera
    });

    ctx.translate(camera._x, camera._y);
    ctx.scale(1, 1)
    render.texture(resources.textures.player_wh, 0, 0);

    ctx.translate(inputAll.motion_axis[0] * 16, inputAll.motion_axis[1] * 16);
    ctx.fillStyle = 'red';
    ctx.fillRect(-2, -2, 4, 4);
    
    ctx.restore();
});

function tick() {
    camera._x = dimensions.lerp(camera._x, camera.x, 0.5);
    camera._y = dimensions.lerp(camera._y, camera.y, 0.5);

    inputGamepad.poll();
    inputAll.update(true);

    if (inputGamepad.gamepads.length > 0) {
        document.getElementById('gamepad-icon').hidden = false;
    } else {
        document.getElementById('gamepad-icon').hidden = true;
    }
}