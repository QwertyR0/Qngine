// Version: 1.0
// Note that, This plugin is quite unstable.
// It's here to demonstrate the Qngine's plugin system, but I don't recommend using it for collisions since it's pretty limited.
// You might want to check out other libraries or create your own collision system for your game.

let PhysicsObjects = [];

function areColliding(ob1, ob2) {
    const minX1 = ob1.x;
    const minY1 = ob1.y;
    const maxX1 = ob1.x + ob1.width;
    const maxY1 = ob1.y + ob1.height;
  
    const minX2 = ob2.x;
    const minY2 = ob2.y;
    const maxX2 = ob2.x + ob2.width;
    const maxY2 = ob2.y + ob2.height;
  
    if (minX1 <= maxX2 && maxX1 >= minX2 && minY1 <= maxY2 && maxY1 >= minY2) {
      return true;
    } else {
      return false;
    }
}

const plugin = {
    name: "Physics",
    description: "Adds Physics to GameObjects",
    gravity: 0,
    friction: 0,
    collisions: true,

    init: function(w, kit){
    },
    
    loop: function(w, dt, kit){
        PhysicsObjects.forEach((object) => {
            if(object.physics){
                const previousPosition = { x: object.x, y: object.y };

                object.x += object.velx * dt;
                object.y += object.vely * dt;

                if(!object.gravityDisabled) {
                    object.vely = object.vely + this.gravity * dt;
                }

                if(object.velx > 0){
                    if(object.velx - this.friction * dt > 0){
                        object.velx -= this.friction * dt;
                    } else {
                        object.velx = 0;
                    }
                } else if(object.velx < 0){
                    if(object.velx + this.friction * dt < 0){
                        object.velx += this.friction * dt;
                    } else {
                        object.velx = 0;
                    }
                }

                if(!object.disableYFriction){
                    if(object.vely > 0){
                        if(object.vely - this.friction * dt > 0){
                            object.vely -= this.friction * dt
                        } else {
                            object.vely = 0;
                        }
                    } else if(object.vely < 0){
                        if(object.vely + this.friction * dt < 0){
                            object.vely += this.friction * dt
                        } else {
                            object.vely = 0;
                        }
                    }
                }

                const outofBoundsDetect = object.x < 0 || object.x + object.width > w.width || object.y < 0 || object.y + object.height > w.height;

                PhysicsObjects.forEach((otherObject) => {
                    if (object !== otherObject) {
                        if ((areColliding(object, otherObject) && object.collision) || (outofBoundsDetect && object.wallCollision)) {

                            if(object.onWallCollide && areColliding(object, otherObject)) object.onCollide(w, otherObject);
                            
                            if(object.onWallCollide && outofBoundsDetect)  object.onWallCollide(w); //TODO: pass argument of which border it bounced from
                            
                            if(object.borderBounce && outofBoundsDetect){
                            
                                if (object.x < 0 || object.x + object.width > w.width) {
                                    object.velx = -object.velx;
                                }
                            
                                if (object.y < 0 || object.y + object.height > w.height) {
                                  object.vely = -object.vely;
                                }
                            
                                //MARK:
                                //EXPERIMENTAL:
/*      
                                if (object.x - object.width / 2 < 0) {
                                  object.x = object.width / 2;
                                  object.velx = -object.velx;
                                } else if (object.x + object.width / 2 > w.width) {
                                  object.x = w.width - object.width / 2;
                                  object.velx = -object.velx;
                                }
                            
                                if (object.y - objct.height / 2 < 0) {
                                  object.y = object.height / 2;
                                  object.vely = -object.vely;
                                } else if (object.y + object.height / 2 > w.height) {
                                  object.y = w.heighte - object.height / 2;
                                  object.vely = -object.vely;
                                }
*/      
                            } else if(object.defaultCollisionEvents){
                                object.x = previousPosition.x;
                                object.y = previousPosition.y;
                                object.velx = 0;
                                object.vely = 0;
                            }
                        }
                    }
                });
            }
        });
    },
    
    interface: {
        addGameObject: function(object, accel, maxspeed, options){
            object.velx = 0;
            object.vely = 0;
            object.accel = accel;
            object.maxspeed = maxspeed;

            if(options){
                object.disableYFriction = options.disableYFriction ? options.disableYFriction : false;
                object.gravityDisabled = options.gravityDisabled ? options.gravityDisabled : false;
                object.collision = options.collision ? options.collision : true;
                object.wallCollision = options.wallCollision ? options.wallCollision : false;
                object.onCollide = options.onCollide ? options.onCollide : () => {};
                object.onWallCollide = options.onWallCollide ? options.onWallCollide : () => {};
                object.defaultCollisionEvents = options.defaultCollisionEvents
                object.borderBounce = options.borderBounce ? options.borderBounce : false;
                object.friction = options.friction ? options.friction : this.friction;
            }

            object.physics = true;

            object.physicsEnable = function(){
                this.physics = true;
            }

            object.physicsDisble = function(){
                this.physics = false;
            }

            object.accelerate = (axis, dir, dt) => {
                if(axis === "x"){
                    if(dir === "positive"){
                        if (object.velx < object.maxspeed){
                            if (object.velx + object.accel * dt < object.maxspeed){
                                object.velx = object.velx + object.accel * dt
                            } else {
                                object.velx = object.maxspeed;
                            }    
                        }
                    } else if(dir === "negative"){
                        if (object.velx < object.maxspeed){
                            if (object.velx - object.accel * dt > -object.maxspeed){
                                object.velx = object.velx - object.accel * dt
                            } else {
                                object.velx = -object.maxspeed;
                            }    
                        }
                    }
                } else if(axis === "y"){
                    if(dir === "positive"){
                        if (object.vely < object.maxspeed){
                            if (object.vely + object.accel * dt < object.maxspeed){
                                object.vely = object.vely + object.accel * dt
                            } else {
                                object.vely = object.maxspeed;
                            }    
                        }
                    } else if(dir === "negative"){
                        if (object.vely < object.maxspeed){
                            if (object.vely - object.accel * dt > -object.maxspeed){
                                object.vely = object.vely - object.accel * dt
                            } else {
                                object.vely = -object.maxspeed;
                            }    
                        }
                    }
                }

            };

            object.addForce = (axis, val) => {
                if(axis === "x"){
                    if (object.velx < object.maxspeed){
                        if (object.velx + val < object.maxspeed){
                            object.velx += val
                        } else {
                            object.velx = object.maxspeed;
                        }    
                    }
                } else if(axis === "y") {
                    if (object.vely < object.maxspeed){
                        if (object.vely + val < object.maxspeed){
                            object.vely += val
                        } else {
                            object.vely = object.maxspeed;
                        }    
                    }
                }
            };

            PhysicsObjects.push(object);
        },

        setGravity: function(g){
            this.gravity = g;
        }
    }
}

export default plugin;

// NOTE: This version physics plugin is kinda broken(collisions).
// I would really appreciate if you made a pull request to fix them.
// I will try making this more stable and more functional later.
