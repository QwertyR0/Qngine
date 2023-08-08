// this ping pong demo is deterministic.

let platform, ball, ballDir, score, playing;
ballDir = 0;

export async function init(w, pl){
    platform = new w.GameObject(280, 420, 1, 80, 25, 0, { update: platformUpdate, render:platformRender });
    ball = new w.GameObject(280, 230, 2, 30, 30, 0, { update: ballUpdate, render: ballRender });
    pl.addGameObject(ball, 0, 350, { /*onWallCollide: bounce,*/ wallCollision: true, borderBounce: true, defaultCollisionEvents: false, onCollide: ballCollide });
    pl.addGameObject(platform, 0, 0, {});

    ball.physicsDisble();
    platform.physicsDisble();

    playing = 0;
}

function initPong(w, pl){
    ball.x = 280;
    ball.y = 230;
    ball.velx = 0;
    ball.vely = 0;
    platform.x = 280;
    platform.y = 420;

    ballDir = Math.floor(Math.random() * (5 - 1) + 1);
    
    platform.physicsEnable();
    ball.physicsEnable();

    if (ballDir === 1) {
        ball.addForce("x", -350);
        ball.addForce("y", -350);
    }
    if (ballDir === 2) {
        ball.addForce("x", 350);
        ball.addForce("y", -350);
    }
    if (ballDir === 3) {
        ball.addForce("x", -350);
        ball.addForce("y", 350);
    }
    if (ballDir === 4) {
        ball.addForce("x", 350);
        ball.addForce("y", 350);
    }

    score = 0;
    playing = 1;

}

export async function loop(w, dt, pl){
    if(playing === 1){
        w.setTitle("score: " + score);
    } else if(playing === 2){
        ball.physicsDisble();
        platform.physicsDisble();
    }
}

export function draw(w, graphics){
    if(playing === 0){
        graphics.text("press any key to start", 180, 200);
    } else if(playing === 2){
        graphics.text("You ded. your score:", 180, 200);
        graphics.text(score, 265, 250, {scale: 50});
        graphics.text("press any key to restart", 175, 430);
    }
}

function platformUpdate(w, dt, pl){
    if(playing === 1){
        const xB = platform.x;

        if(w.io.isKeyDown("a")){
            platform.x -= 5*70*dt;
        }

       if(w.io.isKeyDown("d")){
            platform.x += 5*70*dt;
        } 

        if(platform.x < 0 || platform.x + platform.width > w.width) platform.x = xB;
    }
}

function platformRender(w, graphics, pl){
    if(playing === 1){
        graphics.rectangle("fill", platform.x, platform.y, platform.width, platform.height, "white");
    }
}

function ballUpdate(w, dt, pl){
    if(ball.y + 15 > 420) {
        playing = 2;
    }
}

function ballRender(w, graphics, pl){
    if(playing === 1){
        graphics.circle("fill", ball.x+15, ball.y+15, 15, "white");
    }
}

function ballCollide(){
    ball.vely = -ball.vely;
    score++;
}

export function keyDown(){
    if(playing === 2 || playing === 0){
        initPong();
    }
}
