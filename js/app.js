// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.x = 0;
    this.y = 65 + Math.floor(Math.random() * 3) *82;
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    var i, r;



    //define the global step
    step = 80 * dt;

    //move one step
    this.x += step;

    //kill the bugs after they run out of the canvas
    if (this.x > 505) {
        i = allEnemies.indexOf(this);
        allEnemies.splice(i,1);
    }
    //collision?
    if (this.y == player.y - 10){ //enemies run 10pt above th player
        if (player.x + 15 < this.x + 99 && player.x + 85 > this.x + 1) {
            //player.left < enemy.right && player.right  > enemy.left ==> collision
            caught.play();
            score -= 50;
            setScore(score);
            player = new Player();
        }
    }
}


// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function () {
    //x random between 0 and 400
    this.x = Math.floor(Math.random() * 5) * 100;
    this.y = 75 + (4 * 82);

}
Player.prototype.update = function () {
    var i;
    if (this.y < 0) {
        this.y = 0;
        for (i=1; i <= 100; i++) {
            score += 1;
            setScore(score);
        }
        splash.play();

        setTimeout(function () {
            player = new Player();

        }, 400);
    }
}
Player.prototype.render = function () {
    if (this.y === 0) {
        this.sprite = 'images/Star.png';
    } else {
        this.sprite = playerPersonality;
    }
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Player.prototype.handleInput = function (direction) {
    if (run) {
        var ypix = 82;
        var xpix = 100;
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
        ;
    }
}

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

//change the players personality
var images, img, i;
images = document.getElementsByTagName("img");
for (i=0; i <  images.length; i++) {
    images[i].addEventListener("click", function () {
        document.getElementsByClassName('selected')[0].className = '';
        this.className = 'selected';
        playerPersonality = this.getAttribute("src");
   });
}

//Sounds
var swoosh = new Audio('sounds/Arrow.mp3');
var splash = new Audio('sounds/Wave_short.mp3');
var caught = new Audio('sounds/Kiss.mp3');

//Score
var score = 0; //initial value
setScore = function (score) {
    var elScore = document.getElementsByTagName('em')[0];
    if (score < 0) {
        elScore.className = "minus";
        score = -score;
        var s = '00000' + score;
        s = s.substr(s.length- 5);
        s = '-' + s;
    } else {
        elScore.className = "plus";
        var s = '000000' + score;
        s = s.substr(s.length- 6);
    }
    elScore.innerHTML = s;
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
}


//Start / Stop
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
});
document.getElementById('stop').addEventListener("click", function (){
    score = 0;
    setScore(score);
    createEnemy.reset();
    allEnemies = [];
    allEnemies.push(new Enemy());
    player = new Player();
    run = false;
    document.getElementById("status").className = 'ready';
    document.getElementById("status").innerHTML = 'Press Play to Start';
});

//Collision
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
            console.log('yes: ' +py+'='+ey+' && '+pl+' < '+er+' && '+pr+' > '+el);
            result = result || true;
        } else {
            console.log('no: ' +py+'='+ey+' && '+pl+' < '+er+' && '+pr+' > '+el);
            result = result || false;
        }
    }
    console.log(result);
    return result;
}