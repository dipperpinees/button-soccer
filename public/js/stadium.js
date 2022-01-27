class Stadium {
    constructor () {
    }

    loadStadiumSprite() {
        loadSprite("circle", "/img/circlecenter.png");
        loadSprite('corn', '/img/corn.png');
        loadSprite('pencircle', '/img/circlepenalty.png');
        loadSprite('net', '/img/goal.png');
        loadSprite('goal', '/img/goal_text.png');
    }

    render () {
        this.loadStadiumSprite();

        for(let i = 0; i < 13; i++) {
            add([
                pos(PITCH_X * i , 0),
                rect(PITCH_X / 2, GAME_HEIGHT),
                color(46, 204, 113)
            ]) 
        }
        //center circle
        add([
            pos(GAME_WIDTH / 2- 500*SCALE_CENTER_CIRCLE / 2, GAME_HEIGHT / 2 - 500*SCALE_CENTER_CIRCLE / 2),
            // circle(100),
            sprite('circle'),
            scale(SCALE_CENTER_CIRCLE),
            "linecircle"
        ])

        add([
            pos(PITCH_X, GAME_HEIGHT - PITCH_Y - SCALE_CORN * 250),
            sprite('corn'),
            scale(SCALE_CORN),
            "bottomleftcorn"
        ])
    
        add([
            pos(PITCH_X + SCALE_CORN * 250, PITCH_Y),
            sprite('corn'),
            scale(SCALE_CORN),
            rotate(90),
            "topleftcorn"
        ])
    
        add([
            pos(GAME_WIDTH - PITCH_X , PITCH_Y + SCALE_CORN * 250),
            sprite('corn'),
            scale(SCALE_CORN),
            rotate(180),
            "toprightcorn"
        ])
    
        add([
            pos(GAME_WIDTH - PITCH_X - SCALE_CORN * 250 , GAME_HEIGHT - PITCH_Y),
            sprite('corn'),
            scale(SCALE_CORN),
            rotate(270),
            "bottomrightcorn"
        ])
    
        add([
            pos(GAME_WIDTH / 2 - 2, PITCH_Y),
            rect(4, STADIUM_HEIGHT),
            "linecenter"
        ])

        add([
            pos(GAME_WIDTH / 2, GAME_HEIGHT / 2),
            circle(8),
            "centerdot"
        ])
    
        add([
            pos(PITCH_X, PITCH_Y + 1/4 * (STADIUM_HEIGHT)),
            rect( 1/8 * (STADIUM_WIDTH), 4),
            "penlefttop"
        ])
    
        add([
            pos(PITCH_X, PITCH_Y + 3/4 * (STADIUM_HEIGHT)),
            rect( 1/8 * (STADIUM_WIDTH), 4),
            "penleftbottom"
        ])
    
        add([
            pos(PITCH_X + 1/8 * (STADIUM_WIDTH), PITCH_Y + 1/4 * (STADIUM_HEIGHT)),
            rect( 4, 1/2 * (STADIUM_HEIGHT) + 4),
            "penleftright"
        ])
    
        add([
            sprite('pencircle'),
            pos(PITCH_X + 1/8 * (STADIUM_WIDTH) + 4, PITCH_Y + 1/3 * STADIUM_HEIGHT ),
            scale(1/3 * (STADIUM_HEIGHT) / 472),
            'penleftcirle'
        ])
    
        add([
            pos(GAME_WIDTH - PITCH_X - 1/8 * (STADIUM_WIDTH), PITCH_Y + 1/4 * STADIUM_HEIGHT),
            rect( 1/8 * (STADIUM_WIDTH), 4),
            "penrighttop"
        ])
    
        add([
            pos(GAME_WIDTH - PITCH_X - 1/8 * (STADIUM_WIDTH), PITCH_Y + 1/4 * STADIUM_HEIGHT),
            rect( 4, 1/2 * (STADIUM_HEIGHT) + 4),
            "penrightleft"
        ])
    
        add([
            pos(GAME_WIDTH - PITCH_X - 1/8 * (STADIUM_WIDTH), PITCH_Y + 3/4 * STADIUM_HEIGHT),
            rect( 1/8 * (STADIUM_WIDTH), 4),
            "penrightbottom"
        ])
    
        add([
            sprite('pencircle'),
            pos(GAME_WIDTH - PITCH_X - 1/8 * (STADIUM_WIDTH) + 4, PITCH_Y + 2/3 * STADIUM_HEIGHT),
            scale(1/3 * (STADIUM_HEIGHT) / 472),
            rotate(180),
            'penleftcirle'
        ])
    
        add([
            pos(PITCH_X, PITCH_Y),
            rect(4, 1/3*(STADIUM_HEIGHT)),
            // outline(0.6),
            area(),
            "wallleft",
        ])
        
        add([
            pos(PITCH_X, PITCH_Y + 2/3*(STADIUM_HEIGHT) ),
            rect(4, 1/3*(STADIUM_HEIGHT)),
            // outline(0.6),
            area(),
            "wallleft"
        ])
        
        add([
            pos(PITCH_X - 1/6*(STADIUM_HEIGHT), PITCH_Y + 2/3*(STADIUM_HEIGHT) ),
            rect(1/6*(STADIUM_HEIGHT), 4),
            // outline(0.6),
            area(),
            "wallbottom"
        ])
        
        add([
            pos(PITCH_X - 1/6*(STADIUM_HEIGHT), PITCH_Y + 1/3*(STADIUM_HEIGHT) - 4 ),
            rect(1/6*(STADIUM_HEIGHT), 4),
            // outline(0.6),
            area(),
            "walltop"
        ])
        
        add([
            pos(PITCH_X - 1/6*(STADIUM_HEIGHT), PITCH_Y + 1/3*(STADIUM_HEIGHT) ),
            rect(4, 1/3*(STADIUM_HEIGHT)),
            // outline(0.6),
            area(),
            "wallleft"
        ])
    
        add([
            sprite('net'),
            pos(PITCH_X - 1/6*(STADIUM_HEIGHT) + 4, PITCH_Y + 1/3*(STADIUM_HEIGHT) ),
            scale(1/3*(STADIUM_HEIGHT)/168),
            "leftnet",
        ])
        
        add([
            pos(PITCH_X, PITCH_Y),
            rect(STADIUM_WIDTH, 4),
            // outline(0.6),
            area(),
            "walltop"
        ])
        
        add([
            pos(GAME_WIDTH - 4 - PITCH_X, PITCH_Y),
            rect(4, 1/3*(STADIUM_HEIGHT)),
            // outline(0.6),
            area(),
            "wallright"
        ])
        
        add([
            pos(GAME_WIDTH - 4 - PITCH_X, PITCH_Y + 2/3*(STADIUM_HEIGHT)),
            rect(4, 1/3*(STADIUM_HEIGHT)),
            // outline(0.6),
            area(),
            "wallright"
        ])
        
        add([
            pos(GAME_WIDTH - 4 - PITCH_X, PITCH_Y + 1/3*(STADIUM_HEIGHT) - 4),
            rect(1/6*(STADIUM_HEIGHT), 4),
            // outline(0.6),
            area(),
            "walltop"
        ])
        
        add([
            pos(GAME_WIDTH - PITCH_X - 4 + 1/6*(STADIUM_HEIGHT), PITCH_Y + 1/3*(STADIUM_HEIGHT) - 4 ),
            rect(4, 1/3*(STADIUM_HEIGHT) + 4),
            // outline(0.6),
            area(),
            "wallright"
        ])
        
        add([
            pos(GAME_WIDTH - PITCH_X, PITCH_Y + 2/3*(STADIUM_HEIGHT) ),
            rect(1/6*(STADIUM_HEIGHT), 4),
            // outline(0.6),
            area(),
            "wallbottom"
        ])
        
        add([
            sprite('net'),
            pos(GAME_WIDTH - 4 - PITCH_X, PITCH_Y + 1/3*(STADIUM_HEIGHT)),
            scale(1/3*(STADIUM_HEIGHT)/168),
            "rightnet"
        ])
    
        add([
            pos(PITCH_X, GAME_HEIGHT - 4 - PITCH_Y),
            rect(STADIUM_WIDTH, 4),
            // outline(0.6),
            area(),
            "wallbottom"
        ])
    }
}