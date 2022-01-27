class Goal {
    constructor(touchPlayer, touchTeam, teamGoal, time, camPosX, camPosY) {
        this.touchPlayer = touchPlayer;
        this.touchTeam = touchTeam;
        this.teamGoal = teamGoal;
        this.time = time;
        this.camPosX = camPosX;
        this.camPosY = camPosY;
    }

    render() {
        // const {x,y} = camPos();
        add([
            sprite("goal"),
            pos(this.camPosX - SCALE_GOAL*434/2, this.camPosY - SCALE_GOAL*149/2),
            scale(SCALE_GOAL),
            "goal",
        ])
        
        add([
            pos(this.camPosX - SCALE_GOAL*434/2 + 40, this.camPosY + SCALE_GOAL*149/2),
            text(`${this.touchPlayer}  ${this.touchTeam !== this.teamGoal ? "(OG)" : ""} ${this.time}`, {
                size: GAME_HEIGHT / 30,
            }),
            "goalplayer"
        ])
    }

    destroy() {
        destroyAll("goal");
        destroyAll("goalplayer");
    }

}