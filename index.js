var display = document.querySelector('.keyboard-display');
var canvas = document.getElementById('field');
var body = document.getElementById('body');
var ctx = canvas.getContext('2d');
var angle = 0; // угол для вращения оси координат
var rotAngle = null;
var planeAngle = 0;
var randomAngle = null;
var randomDistance = null;
var lastRandomAngle = null;
var push = false;
var animation = null;
var userInput = '000';
var start = null;
var TIMEOUT = 2000;
var advance = 0;
var width = ctx.canvas.width = window.innerWidth;
var height = ctx.canvas.height = window.innerHeight - 1;
var randomWidth = getRandomInt(600, width - 400);
var randomHeight = getRandomInt(300, height - 400);
var plane = new Image();
var overall = [];
var progressBar = {
  level: 5,
  count: 0
};
var levels = {
  1: {
    center: true,
    rotate: false,
    petals: 12
  },
  2: {
    center: true,
    rotate: false,
    petals: 4
  },
  3: {
    center: true,
    rotate: true,
    petals: 4
  },
  4: {
    center: true,
    rotate: false,
    petals: 0
  },
  5: {
    center: false,
    rotate: false,
    petals: 0
  }
};
ctx.lineWidth = 1;
ctx.font = "30px sans-serif";
ctx.textAlign = 'center';
//localStorage.setItem('eris-value:theme','gray');

if (localStorage.getItem('eris-value:theme') === 'gray') {
  body.style.background = '#303030';
  body.style.color = 'white';
  display.style.background = 'black';
  display.style.color = '#ffff00';
  ctx.strokeStyle = '#b9b9b9';
  ctx.fillStyle = 'white';
  plane.src = 'images/airplane-white.png';
  document.querySelector('.progress-bar').style.color = 'white';
} else {
  body.style.background = '#f0f5f9';
  body.style.color = 'black';
  ctx.strokeStyle = '#3d3d3d';
  ctx.fillStyle = 'black';
  display.style.background = 'linear-gradient(#c9cac4, #7c9caf)';
  display.style.color = 'black';
  plane.src = 'images/airplane-black.png';
  document.querySelector('.progress-bar').style.color = 'black';
}

init();

function init() {
  plane.onload = function () {
    animation = requestAnimationFrame(draw);
  }
}

function draw(time) {
  ctx.clearRect(0, 0, width, height);
  angle += Math.PI / 360;
  if (equalSpread(planeAngle, randomAngle, 0) && equalSpread(planeAngle, rotAngle, 0)) {
    decision('Правильно', 1, '#ff7777', time);
  } else if (equalSpread(planeAngle, randomAngle, 5)) {
    decision('Почти', 0, ctx.fillStyle, time);
  } else if (equalSpread(planeAngle, rotAngle, 0)) {
    decision('Неправильно', -1, ctx.fillStyle, time);
  }
  drawPetals(angle, levels[progressBar.level]);
  drawInvader(levels[progressBar.level]);
  drawAirplane(levels[progressBar.level], planeAngle);
  if (levels[progressBar.level].rotate || push) {
    cancelAnimationFrame(animation);
    animation = requestAnimationFrame(draw);
  }
}

function drawPetals(radianAngle, level) {
  ctx.save();
  if (level.center) {
    ctx.translate(width / 2, height / 2);
  } else {
    ctx.translate(randomWidth, randomHeight)
  }
  level.rotate && ctx.rotate(radianAngle);
  if (level.petals > 0) {
    for (var i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.rotate(Math.PI / (level.petals / 2));
      ctx.moveTo(0, 0);
      if (level.center) {
        ctx.lineTo(400, 0);
      } else {
        ctx.lineTo(200, 0);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawInvader(level) {
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.fillStyle = '#ffbe00';
  var newCoordinate = null;
  if (randomAngle === null || randomDistance === null) {
    randomAngle = getRandomAngle(0, 360, lastRandomAngle);
    lastRandomAngle = randomAngle;
    if (level.center) {
      randomDistance = getRandomInt(80, 400);
    } else {
      randomDistance = getRandomInt(80, 200);
    }
  }
  if (level.center) {
    newCoordinate = getCoordsByAngleRadius({ x: width / 2, y: height / 2 }, randomAngle, randomDistance);
  } else {
    newCoordinate = getCoordsByAngleRadius({ x: randomWidth, y: randomHeight }, randomAngle, randomDistance);
  }
  ctx.arc(newCoordinate.x, newCoordinate.y, 5, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.closePath();
  ctx.restore();
}

function drawAirplane(level, rad) {
  ctx.save();
  if (level.center) {
    ctx.translate(width / 2, height / 2);
  } else {
    ctx.translate(randomWidth, randomHeight);
  }
  ctx.rotate(rad);
  if (level.center) {
    ctx.drawImage(plane, -35, -35, 70, 70);
  } else {
    ctx.drawImage(plane, -20, -20, 40, 40);
  }
  ctx.restore();
}

function equalSpread(a, b, spread) {
  return Math.round(a * 180 / Math.PI) - spread === b || Math.round(a * 180 / Math.PI) + spread === b;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomAngle(min, max, cur) {
  var rAngl = Math.floor(Math.random() * (max - min)) + min;
  rAngl = rAngl - (rAngl % 5);

  if (cur !== rAngl && cur + 5 !== rAngl && cur - 5 !== rAngl) {
    return rAngl;
  }

  return getRandomAngle(min, max, cur);
}

function getCoordsByAngleRadius(center, angle, distance) {
  var a = {};
  var i = (angle - 90) * Math.PI / 180;
  return a.x = Math.cos(i) * distance + center.x,
    a.y = Math.sin(i) * distance + center.y,
    a
}

function drawPath(radianAngle, level, color) {
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 7]);
  if (level.center) {
    ctx.translate(width / 2, height / 2);
  } else {
    ctx.translate(randomWidth, randomHeight)
  }
  ctx.rotate(radianAngle - Math.PI/2);
  ctx.moveTo(0, 0);
  if (level.center) {
    ctx.lineTo(400, 0);
  } else {
    ctx.lineTo(200, 0);
  }
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

function drawText(text) {
  ctx.fillText(text, width / 2, 70);
}

function shoot(userInput) {
  push = true;
  rotAngle = userInput;
  planeAngle = userInput * Math.PI / 180;
  cancelAnimationFrame(animation);
  animation = requestAnimationFrame(draw);
}

function decision(phrase, deviation, dcolorPath, time) {
  if (!start) start = time;
  var progress = time - start;
  push = false;
  drawPath(planeAngle, levels[progressBar.level], dcolorPath);
  drawText(phrase);
  if (progress > TIMEOUT) {
    overall.push(deviation);
    changeLevel(deviation);
    reset();
    changeInfo();
  }
  cancelAnimationFrame(animation);
  animation = requestAnimationFrame(draw);
}

function reset() {
  randomAngle = null;
  randomDistance = null;
  rotAngle = null;
  display.textContent = '000';
  userInput = '000';
  start = null;
  if (!levels[progressBar.level].center) {
    randomWidth = getRandomInt(600, width - 400);
    randomHeight = getRandomInt(300, height - 400);
  }
}

function changeLevel(num) {
  var direction = null;
  if (num > 0) {
    progressBar.count += 1;
    if (progressBar.count % 5 === 0) {
      progressBar.level += 1;
      direction = 'up';
      if (progressBar.level > 5) {
        progressBar.level = 5;
        progressBar.count -= 1;
        direction = 'end';
      }
    }
  } else if (num < 0) {
    if (progressBar.count % 5 === 0 && progressBar.level > 1) {
      progressBar.level -= 1;
      direction = 'down';
    }
    progressBar.count -= 1;
    if (progressBar.count < 0) {
      progressBar.count = 0;
    }
  }
  changeProgressBar(progressBar, direction);
}

function changeProgressBar(state, direction) {
  var selector = '.level-' + state.level;
  if (state.level >= 1 && direction === 'up') {
    var prevSelector = '.level-' + (state.level === 1 ? 1 : state.level-1);
    var prevClasses = "level-bar" + " level-" + (state.level === 1 ? 1 : state.level - 1) + " state-5";
    document.querySelector(prevSelector).setAttribute('class', prevClasses);
  }
  var classes = "level-bar" + " level-" + state.level + " state-" + (!direction || direction === 'up' ? state.count % 5 : (direction === 'end' ? 5 : 4));
  document.querySelector(selector).setAttribute('class', classes);
}

function isNumPad(e) {
  if ((e.which > 47 && e.which <= 57) || (e.which > 95 && e.which <= 105)) {
    return true;
  }
  return false;
}

function changeInfo() {
  document.querySelector('.overall > span').innerHTML = overall.length;
  document.querySelector('.percent > span').innerHTML = (overall.filter(function(el) {
    return el > 0;
  }).length / overall.length * 100).toFixed(1) + '%';
}

document.querySelector('.select-level').addEventListener('change', function (e) {
  progressBar.level = e.target.value;
  progressBar.count = e.target.value * 5;
  e.target.blur();
  cancelAnimationFrame(animation);
  animation = requestAnimationFrame(draw);
});

document.querySelector('.keyboard-container').addEventListener('click', function (e) {
  if (e.target.value === 'reset') {
    userInput = '000';
  } else if (e.target.value === 'enter') {
    if (userInput % 5 === 0 && userInput >= 0 && userInput < 361) {
      shoot(parseInt(userInput));
    } else {
      cancelAnimationFrame(animation);
      drawText('Значение угла должно быть кратно 5 и не больше 360°');
    }
  } else if (typeof e.target.value === 'string' && userInput.toString().length >= 3) {
    userInput = '' + userInput.toString().slice(1) + e.target.value;
  }
  display.textContent = userInput;
});

document.addEventListener('keydown', function(e) {
  if (e.which === 13) {
    if (userInput % 5 === 0 && userInput >= 0 && userInput < 361) {
      shoot(parseInt(userInput));
    } else {
      cancelAnimationFrame(animation);
      drawText('Значение угла должно быть кратно 5 и не больше 360°');
      requestAnimationFrame(draw);
    }
  } else if (e.which === 8) {
    userInput = '000';
  } else if (e.which === 81) {
    advance >= 4 ? advance=0 : advance+=1;
    var sel = document.querySelector('.select-level');
    if (advance === 4) {
      sel.style.display = 'block';
    } else {
      sel.style.display = 'none';
    }
  } else if (isNumPad(e)) {
    userInput = '' + userInput.toString().slice(1) + (e.key ? e.key : e.keyIdentifier.slice(-1));
  }
  display.textContent = userInput;
});