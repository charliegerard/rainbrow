let videoEl;
let currentStripe = 3;
let emoji = document.getElementsByClassName('emoji')[0];
let stripes = document.getElementsByTagName('main')[0].children;
let star, point;
let counter = 0;
let enemy;

const enemojis = ['💩', '🍔', '🦄', '🐼', '🤖', '🥁', '💾', '🧹', '🧬'];

let currentExpression, previousExpression;

previousExpression = "?";

window.onload = async() => {
    // load face detection and face expression recognition models
    await changeFaceDetector(TINY_FACE_DETECTOR)
    await faceapi.loadFaceExpressionModel('/')
    changeInputSize(224)

    const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
    videoEl = document.getElementById('inputVideo');
    videoEl.srcObject = stream
}

document.body.onclick = async () => {
    animateText();
    detectFacialExpression();
    startGame();
}

const animateText = () => {
    const title = document.getElementsByTagName('h1')[0];
    const subtitle = document.getElementsByTagName('p')[1];
    point = document.getElementsByClassName('point')[0];

    title.style.display = 'none';
    subtitle.style.display = 'none';
    point.style.display = 'block';
}

const moveEmojiUp = () => {
    emoji.innerHTML = '😲';

    if(currentStripe > 0){
        currentStripe -= 1;
        stripes[currentStripe].append(emoji);
    }    
    if(collisionWithStar()){
        addPoint();
    }

    if(collisionWithEnemy()){
        removePoint();
    } 
}

const moveEmojiDown = () => {
    emoji.innerHTML = '😠';

    if(currentStripe < 6){
        currentStripe += 1;
        stripes[currentStripe].append(emoji);
    }   
    if(collisionWithStar()){
        addPoint();
    } 

    if(collisionWithEnemy()){
        removePoint();
    } 
}

const generateStar = () => {
    star = document.createElement('p');
    star.classList.add('star');
    star.innerHTML = '⭐';

    positionStar();
}

const getRandomIndex = (items) => {
    return Math.floor(Math.random() * Math.floor(items.length - 1));
}

const generateEnemies = () => {
    // place 1 emoji and animate
    enemy = document.createElement('p');
    enemy.classList.add('enemy');
    enemy.innerHTML = enemojis[getRandomIndex(enemojis)];

    const enemyAnimation = enemy.animate([
        {transform: `translate(-${window.innerWidth / 2 + 50}px, 0)`},
        {transform: `translate(${window.innerWidth + 50}px, 0)`}
    ], 10000);

    enemyAnimation.onfinish = () => {
        removeEnemy();
        generateEnemies();
    };

    positionEnemy();
}

const positionEnemy = () => {
    let randomIndex = getRandomIndex(stripes);

    if(stripes[randomIndex].children.length === 0){
        stripes[randomIndex].append(enemy);   
    } else {
        positionEnemy();
    }
}

const removeStar = () => {
    let starElement = document.getElementsByClassName('star')[0];
    if(starElement){
        starElement.parentNode.removeChild(starElement);
    }
}

const removeEnemy = () => {
    let enemy = document.getElementsByClassName('enemy')[0];
    if(enemy){
        enemy.parentNode.removeChild(enemy);
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

    if(parent.children.length > 1 && parent.children[0] === enemy){     
        if(collisionFromLeft || collisionFromRight){
            removeEnemy();
            return true;
        }
    }

    return false;
}

const startGame = () => {
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
        point.innerHTML = "GAME OVER";
        gameOver();
    }
}

const gameOver = () => {

}

const detectFacialExpression = async () => {
    if(videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded()){
        window.requestAnimationFrame(detectFacialExpression)
    }

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

    if(currentExpression !== previousExpression){
        switch(currentExpression){
            case 'surprised':
                moveEmojiUp();
                break;
            case 'frowning':
                moveEmojiDown();
                break;
            default:
                break;
        }
    }
    previousExpression = currentExpression;

    window.requestAnimationFrame(detectFacialExpression)
}