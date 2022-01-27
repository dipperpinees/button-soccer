class Player {
    constructor(player, posX, posY) {
        this.defaultPos = {x: posX, y:posY}; 
        this.addPlayer(player, posX, posY);
        this.name = player.name;
        this.socketId = player.socketId;
        this.team = player.team;
        this.direction = "top";
        this.x = 0;
        this.y = 0;
    }

    resetPos () {
        const {x, y} = this.defaultPos;
        this.player.moveTo(x, y);
    }

    handleMove (moveX, moveY, direction) {
        this.x = moveX;
        this.y = moveY;
        this.direction = direction;
    }

    handleAvatar (avatar, team) {
        if(team === "blue") {
            return avatar.replace(",r_max/", `,r_max,bo_6px_solid_royalblue/`);
        } else {
            return avatar.replace(",r_max/", `,r_max,bo_6px_solid_indianred/`);
        }
    }

    addPlayer (player, posX, posY) {
        loadSprite(`${player.team}_${player.socketId}`, this.handleAvatar(player.avatar, player.team));
        this.player = add([
            sprite(`${player.team}_${player.socketId}`),
            pos(posX, posY),
            area(),
            scale(SCALE_PLAYER),
            {value: {startX: posX, startY: posY}},
            "player",
        ])
        this.handleCollides();
    }

    handleCollides () {
        this.player.collides("player", (t) => {
            this.player.move(6*(this.player.pos.x-t.pos.x), 6*(this.player.pos.y-t.pos.y));
        })
        this.player.collides("wallleft",  () => {
            this.player.move(STRAIGHT_PLAYER_SPEED*2.5, 0);
        })
        this.player.collides("wallright",  () => {
            this.player.move(-STRAIGHT_PLAYER_SPEED*2.5, 0);
        })
        this.player.collides("walltop",  () => {
            this.player.move(0, STRAIGHT_PLAYER_SPEED*2.5);
        })
        this.player.collides("wallbottom",  () => {
            this.player.move(0, -STRAIGHT_PLAYER_SPEED*2.5);
        })
    }

    update () {
        onUpdate("player", () => {
            if(Math.abs(this.x) < 1 && Math.abs(this.y) < 1) return;
            this.x  = this.x / 1.08;
            this.y  = this.y / 1.08;
            this.player.move(this.x, this.y);
        })   
    }
}