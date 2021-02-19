export default {
    init(world) {
        const MAP_SIZE = 10;
        for (let x = -MAP_SIZE; x <= MAP_SIZE; x++) {
            for (let y = -MAP_SIZE; y < MAP_SIZE; y++) {
                world.tiles.push(
                    this.createTile('grass', x, y)
                );
            }
        }
    },
    isVisible(tile, camera, tw, th) {
        const px = (tile.x * tw - camera.x) * 4;
        const py = (tile.y * th - camera.y) * 4;
        if (px + tw < -window.innerWidth / 2) return false;
        if (px - tw > window.innerWidth / 2) return false;
        if (py + th < -window.innerHeight / 2) return false;
        if (py - th > window.innerHeight / 2) return false;
        return true;
    },
    createTile(id, x, y) {
        return {
            type: 'tile',
            id, x, y
        }
    },
    render(render, { tw, th, tex, tiles, cam }) {
        tiles.forEach(tile => {
            if (this.isVisible(tile, cam, tw, th))
                render.texture(tex[tile.id], tile.x * tw, tile.y * th);
        });
    }
}