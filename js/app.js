'use strict';
/*
 * Enemies our player must avoid
 */
var Enemy = function () {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.x = 0;
    this.y = 65 + Math.floor(Math.random() * 3) * 82;

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    var i, step = 80 * dt;

    // Move one step
    this.x += step;

    // Kill the bug after it run out of the canvas
    if (this.x > 505) {
        i = allEnemies.indexOf(this);
        allEnemies.splice(i, 1);
    }

    //Collision Detection
    if (this.y === player.y - 10){ //enemies run 10pt above the player
        if (player.x + 15 < this.x + 99 && player.x + 85 > this.x + 1) {
            //player.left < enemy.right && player.right  > enemy.left ==> collision
            caught.play();
            score.count(-50);
            player = new Player();
        }
    }
};

/*
 * Draw the enemy on the screen, required method for game
 */
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function () {
    //x random between 0 and 400 to let the player start in a random square
    this.x = Math.floor(Math.random() * 5) * 100;
    //Top row height is 75, 82 for the remaining 4
    this.y = 75 + (4 * 82);
};
Player.prototype.update = function () {
    //Has the player made it to the beach?
    if (this.y < 0) {

        //avoid rendering atop of canvas
        this.y = 0;

        //reset score
        score.count(+100);

        //play noise
        splash.play();

        //give some time to enjoy the splash
        setTimeout(function () {
            player = new Player();
        }, 400);
    }
};
Player.prototype.render = function () {
    if (this.y === 0) { //player is though
        //mark the event
        this.sprite = 'images/Star.png';
    } else {
        //or adjust the sprite
        this.sprite = playerPersonality;
    }
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
Player.prototype.handleInput = function (direction) {
    //player input only if "Playing"
    if (run) {
        var ypix = 82;  //up & down
        var xpix = 100; //left & right
        swoosh.play();
        switch (direction) {
            case 'left':
                if (this.x > 0) this.x -= xpix;
                break;
            case 'right':
                if (this.x < 400) this.x += xpix;
                break;
            case 'up':
                if (this.y > 0) this.y -= ypix;
                break;
            case 'down':
                if (this.y < 75 + 4 * 82) this.y += ypix;
                break;
        }
    }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
allEnemies.push(new Enemy());

var playerPersonality = 'images/char-boy.png'; //initial value
var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});

//change the players personality (i.e. sprite)
var images, i;
images = document.getElementsByTagName("img");
for (i=0; i <  images.length; i++) {
    images[i].addEventListener("click", function () {
        document.getElementsByClassName('selected')[0].className = '';
        this.className = 'selected';
        playerPersonality = this.getAttribute("src");
   });
}

// used Sounds
var swoosh = new Audio('sounds/Arrow.mp3');
var splash = new Audio('sounds/Wave_short.mp3');
var caught = new Audio('sounds/Kiss.mp3');

//Score
var score = {
    value   : 0, //initial value
    display : document.getElementsByTagName('em')[0],
    reset : function () {
        this.value = 0;
        this.count(0);
    },
    count : function (score) {
        var s;
        this.value += score;
        if (this.value < 0) {
            this.display.className = "minus";
            score = -this.value;
            s = '00000' + score;
            s = s.substr(s.length - 5);
            s = '-' + s;
        } else {
            this.display.className = "plus";
            s = '000000' + this.value;
            s = s.substr(s.length - 6);
        }
        this.display.innerHTML = s;
    }
};

//crating new enemies
var createEnemy = {
    delay : 1.3,
    gameTime : 0,
    createTime  : 2,
    check : function(dt) {
        this.gameTime += dt;
        if (this.gameTime > this.createTime) {
            this.createTime += this.delay;
            if (Math.random() > 0.3) allEnemies.push(new Enemy());
        }
    },
    reset : function () {
        this.gameTime = 0;
        this.createTime = 2;
    }
};

/* Start / Stop
 * This option was implemented to be able to log the positions of player and enemies
 * at any given time. This helped tremendously with the collision detection.
 */
var run = false; //initial value
document.getElementById('play').addEventListener("click", function (){
    run = true;
    document.getElementById("status").className = 'playing';
    document.getElementById("status").innerHTML = 'Playing';
});
document.getElementById('pause').addEventListener("click", function (){
    run = false;
    document.getElementById("status").className = 'paused';
    document.getElementById("status").innerHTML = 'Paused';
    //detectCollision(); //for debugging
});
document.getElementById('stop').addEventListener("click", function (){
    score.reset();
    createEnemy.reset();
    allEnemies = [];
    allEnemies.push(new Enemy());
    player = new Player();
    run = false;
    document.getElementById("status").className = 'ready';
    document.getElementById("status").innerHTML = 'Press Play to Start';
});

/* Collision Detection
 * Though the actual collision detection was moved into the Enemy.update() method I keep this routine for
 * easy debugging. A call from the Pause button would log the positions of player and all enemies.
 */
function detectCollision(){
    var i, px, pl, pr, py, ex, el, er, ey, result;
    result = false;
    px = player.x;
    pl = px + 16;
    pr = px + 84;
    py = player.y -10; //Enemies run 10pt higher
    for (i in allEnemies) {
        ex = allEnemies[i].x;
        el = ex + 1;
        er = ex + 99;
        ey = allEnemies[i].y;
        if (py === ey && pl < er && pr > el) {
            console.log('true: ' +py+'='+ey+' && '+pl+' < '+er+' && '+pr+' > '+el);
            result = result || true;
        } else {
            console.log('false: ' +py+'='+ey+' && '+pl+' < '+er+' && '+pr+' > '+el);
            result = result || false;
        }
    }
    console.log(result);
    return result;
}