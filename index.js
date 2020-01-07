let videoEl;
let currentStripe = 3;
let emoji = document.getElementsByClassName('emoji')[0];
let stripes = document.getElementsByTagName('main')[0].children;
let star, point;
let counter = 0;
let enemy;
const enemojis = ['💩', '🍔', '🦄', '🐼', '🤖', '🥁', '💾', '🧹', '🧬'];

let currentExpression, previousExpression;

let gameOverState = false;
let gameStarted = false;
let animationFrame, enemyAnimation;
let touchEvent = 'ontouchstart' in window ? 'touchstart' : 'click';

window.onload = async() => {
    await changeFaceDetector(TINY_FACE_DETECTOR)
    await faceapi.loadFaceExpressionModel('/')
    changeInputSize(224)
}

document.body.addEventListener(touchEvent, async() => {
    if(!gameStarted && !gameOverState){
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
        videoEl = document.getElementById('inputVideo');
        videoEl.srcObject = stream;
        removeText();
        startCountdown();
        detectFacialExpression();
    } else if(gameStarted && gameOverState){
        gameOverState = false;
        gameStarted = true;
        point.classList.remove('over');
        removeText();
        detectFacialExpression();
        startGame();
        emoji.style.display = "block";
        showNeutralFace();
    }
})

const startCountdown = () => {
    let counter = 3;
    var timeinterval = setInterval(function(){
        point.innerHTML = counter;
        counter--;
        if(counter<0){
          startGame();
          gameStarted = true;
          clearInterval(timeinterval);
        }
      },1000);
}

const removeText = () => {
    const title = document.getElementsByTagName('h1')[0];
    const subtitle = document.getElementsByClassName('start')[0];
    point = document.getElementsByClassName('point')[0];
    title.style.display = "none";
    subtitle.style.display = "none";
    point.style.display = 'block';
}

const moveEmojiUp = () => {
    emoji.innerHTML = '😲';

    if(currentStripe > 0){
        currentStripe -= 1;
        stripes[currentStripe].append(emoji);
    }    
}

const moveEmojiDown = () => {
    emoji.innerHTML = '😠';

    if(currentStripe < 6){
        currentStripe += 1;
        stripes[currentStripe].append(emoji);
    }    
}

const showNeutralFace = () => emoji.innerHTML = '😐';

const generateStar = () => {
    star = document.createElement('p');
    star.classList.add('star');
    star.innerHTML = '⭐';

    positionStar();
}

const getRandomIndex = (items) => Math.floor(Math.random() * Math.floor(items.length - 1));

const isSafari = () => {
    let chromeAgent = navigator.userAgent.indexOf("Chrome") > -1; 
    let safariAgent = navigator.userAgent.indexOf("Safari") > -1; 

    if(safariAgent && !chromeAgent){
        return true
    }
    return false;
}

const generateEnemies = () => {
    enemy = document.createElement('p');
    enemy.classList.add('enemy');
    enemy.innerHTML = enemojis[getRandomIndex(enemojis)];

    if(isSafari()){
        // web animations API polyfill
        enemyAnimation = enemy.animate({
            transform: [`translate(-${window.innerWidth / 2 + 50}px, 0)`, `translate(${window.innerWidth + 50}px, 0)`],
            }, {
            duration: 8000,
        });
        enemyAnimation.onfinish = () => {
            removeEnemy();
            generateEnemies();
        };

    } else {
        enemyAnimation = enemy.animate([
            {transform: `translate(-${window.innerWidth / 2 + 50}px, 0)`},
            {transform: `translate(${window.innerWidth + 50}px, 0)`}
        ], 8000);
    
        enemyAnimation.onfinish = () => {
            removeEnemy();
            generateEnemies();
        };
    }

    positionEnemy();
}

const positionEnemy = () => {
    let randomIndex = getRandomIndex(stripes);

    !stripes[randomIndex].contains(star) ?
        stripes[randomIndex].append(enemy) : 
        positionEnemy();
}

const removeStar = () => {
    let starElement = document.getElementsByClassName('star')[0];
    if(starElement){
        starElement.parentNode.removeChild(starElement);
    }
}

const removeEnemy = () => {
    let enemies = document.getElementsByClassName('enemy');
    if(enemies){
        for(let i = 0; i < enemies.length; i++){
            enemies[i].parentElement.removeChild(enemies[i])
        }
    }
}

const positionStar = () => {
    let randomStripeIndex = getRandomIndex(stripes);

    stripes[randomStripeIndex].children.length === 0 ?
        stripes[randomStripeIndex].append(star) :
        positionStar();
}

const collisionWithStar = () => {
    const parent = emoji.parentElement;

    if(parent.children.length > 1 && parent.children[0] === star){
        removeStar();
        return true;
    }
    return false;
}

const collisionWithEnemy = () => {
    const emojiLeft = emoji.getBoundingClientRect().left;
    const emojiRight = emoji.getBoundingClientRect().right;
    const enemyLeft = enemy.getBoundingClientRect().left;
    const enemyRight = enemy.getBoundingClientRect().right;

    const collisionFromRight = (emojiLeft < enemyRight && emojiLeft > enemyLeft) ? true : false;
    const collisionFromLeft = (emojiRight > enemyLeft && emojiRight < enemyRight) ? true : false;

    const parent = emoji.parentElement;

    if(parent.contains(enemy)){     
        if(collisionFromLeft || collisionFromRight){
            removeEnemy();
            return true;
        }
    }

    return false;
}

const startGame = () => {
    point.innerHTML = '0';
    generateStar();
    generateEnemies();
}

const addPoint = () => {
    positionStar();
    counter += 1;
    point.innerHTML = counter;
}

const removePoint = () => {
    if(counter > 0){
        counter -= 1;
        point.innerHTML = counter;
        positionStar();
    } else {
        gameOver();
    }
}

const hideEmoji = () => emoji.style.display = "none";

const gameOver = () => {
    point.innerHTML = "GAME OVER";
    point.classList.add('over');
    window.cancelAnimationFrame(animationFrame);

    gameOverState = true;
    enemyAnimation.cancel();
    removeEnemy();
    removeStar();
    hideEmoji();

    document.getElementsByClassName('start')[0].style.display = 'block';
}

const detectFacialExpression = async () => {
    animationFrame = window.requestAnimationFrame(detectFacialExpression)

    const options = getFaceDetectorOptions();
    const result = await faceapi.detectSingleFace(videoEl, options).withFaceExpressions()

    if (result) {
      if(result.expressions.surprised > 0.7){
        currentExpression = 'surprised';
      } else if(result.expressions.sad > 0.7){
        currentExpression = 'frowning';
      } else {
        currentExpression = 'neutral';
      }
    }

    if(!gameOverState && gameStarted && currentExpression !== previousExpression){
        switch(currentExpression){
            case 'surprised':
                moveEmojiUp();
                break;
            case 'frowning':
                moveEmojiDown();
                break;
            default:
                showNeutralFace();
                break;
        }
    }

    if(gameStarted){
        if(collisionWithStar()){
            addPoint();
        }
    
        if(collisionWithEnemy()){
            removePoint();
        } 
    }

    previousExpression = currentExpression;
}