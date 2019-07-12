var display = document.querySelector('.keyboard-display');
var canvas = document.getElementById('field');
var body = document.getElementById('body');
var ctx = canvas.getContext('2d');
var width = ctx.canvas.width = window.innerWidth;
var height = ctx.canvas.height = window.innerHeight - 1;
var userInputInt = null;
var userInput = "000";
//var coin = null;
var sucess = false;
var km = 50;
var randomAngle = null;
var randomDistance = null;
var lastRandomAngle = null;
var plane = new Image();
var airplane = {
  x: width/2,
  y: height/2,
  mmx: null,
  mmy: null,
  v: null,
  angle: null,
};
var miniMap ={
  xb: width-400,
  yb: height*2/3,
  xviszf: null,
  xviszs: null,
  yviszf: null,
  yviszs: null,
  color: "#302d2d",
};
var airports = [];
var progressBar = {
  level: 1,
  count: 0
};
var levels = {
  1: {
    center: true,
    petals: 12,
    airpotrN: 2,
    difficulty: 0,
  },
  2: {
    center: true,
    petals: 4,
    airpotrN: 2,
    difficulty: 0,
  },
  3: {
    center: true,
    petals: 4,
    airpotrN: 4,
    difficulty: 1,
  },
  4: {
    center: true,
    petals: 0,
    airpotrN: 4,
    difficulty: 1,
  },
  5: {
    center: false,
    petals: 0,
    airpotrN: 5,
    difficulty: 1,
  }
};
ctx.lineWidth = 1;
ctx.font = "30px sans-serif";
ctx.textAlign = 'center';

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
  drawMiniMap(miniMap);
  drawPetals(levels[progressBar.level]);
  drawAp(airports);
  drawAirplane(airplane);
  requestAnimationFrame(draw);
}

function drawMiniMap(miniMap){
  ctx.save();
  ctx.lineWidth = 2;
  ctx.fillStyle = miniMap.color;
  ctx.moveTo(miniMap.xb,height);
  ctx.lineTo(miniMap.xb,miniMap.yb);
  ctx.lineTo(width,miniMap.yb);
  ctx.lineTo(width,height);
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

function drawAp(airports){
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.fillStyle = '#ffbe00';
    var newCoordinate = null;
    if (airports.length==0)
    {
      for (var i=0;i<levels[progressBar.level].airpotrN;i++)
      {
        airports.push(new Airport());
      }
    }
    for (i=0;i<airports.length;i++)
    {
      ctx.arc(airports[i].mmx,airports[i].mmy, 3, 0, Math.PI * 2, true);
      ctx.fill();
      if (airports[i].mmx<=miniMap.xviszs&&airports[i].mmx>=miniMap.xviszf&&airports[i].mmy>=miniMap.yviszf&&airports[i].mmy<=miniMap.yviszs)
      {
        ctx.save();
        ctx.beginPath();
        ctx.translate(airplane.x,airplane.y);
        ctx.arc((airports[i].mmx-airplane.mmx)*10,(airports[i].mmy-airplane.mmy)*10,5,0,2*Math.PI,true);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
}

function drawAirplane(airplane)
{
  //var v = null;
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#ff0000';
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  var newCoordinate = null;
  if (airplane.v===null)
  {
    //v = prompt("Введите скорость в км/ч",0);
    //airplane.v = (v*km)/(3600*60);
    airplane.v = 500*km/3600/60/10;
  }
  airplane.angle = userInputInt;
  if (airplane.mmx===null||airplane.mmy===null)
  {
    airplane.mmx = (width-miniMap.xb)/2+miniMap.xb;
    airplane.mmy = miniMap.yb+(height-miniMap.yb)*0.95;
  }
  if (airplane.angle!==null)
  {
    newCoordinate = getCoordsByAngleRadius({x: airplane.mmx,y:airplane.mmy},airplane.angle,airplane.v)
    airplane.mmx = newCoordinate.x;
    airplane.mmy = newCoordinate.y;
  }
  miniMap.xviszf = airplane.mmx - (width-miniMap.xb)/10;
  miniMap.xviszs = airplane.mmx + (width-miniMap.xb)/10;
  miniMap.yviszf = airplane.mmy - (height-miniMap.yb)/10;
  miniMap.yviszs = airplane.mmy + (height-miniMap.yb)/10;
  ctx.beginPath();
  ctx.moveTo(miniMap.xviszf,miniMap.yviszf);
  ctx.lineTo(miniMap.xviszs,miniMap.yviszf);
  ctx.lineTo(miniMap.xviszs,miniMap.yviszs);
  ctx.lineTo(miniMap.xviszf,miniMap.yviszs);
  ctx.lineTo(miniMap.xviszf,miniMap.yviszf);
  ctx.stroke();
  ctx.beginPath();  
  ctx.arc(airplane.mmx,airplane.mmy,3,0,Math.PI*2,true);
  ctx.fill();
  ctx.translate(airplane.x,airplane.y);
  ctx.rotate(airplane.angle*Math.PI/180);
  ctx.drawImage(plane,-20,-20,40,40);
  ctx.restore();
}

function drawPetals(level) {
  ctx.save();
  ctx.translate(airplane.x, airplane.y );
  if (level.petals > 0) {
    for (var i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.rotate(Math.PI / (level.petals / 2));
      ctx.moveTo(0, 0);
      if (level.center) {
        ctx.lineTo(150, 0);
      } else {
        ctx.lineTo(200, 0);
      }
      ctx.stroke();
    }
  }
ctx.restore();
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

function Airport(){
  this.x = null;
  this.y = null;
  this.collision = false;
  this.mmx = getRandomInt(miniMap.xb,width);
  this.mmy = getRandomInt(miniMap.yb,height);
  while (this.mmy==airplane.mmy&&this.mmx==irplane.mmx)
  {
    this.mmx = getRandomInt(miniMap.xb,width);
    this.mmy = getRandomInt(miniMap.yb,height);
  }
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

function drawText(text) {
  ctx.fillText(text, width / 2, 70);
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
      userInputInt=parseInt(userInput);
      userInput ="000";
    } else {
      cancelAnimationFrame(animation);
      drawText('Значение угла должно быть кратно 5 и не больше 360°');
      return;
    }
  } else if (typeof e.target.value === 'string' && userInput.toString().length >= 3) {
    userInput = '' + userInput.toString().slice(1) + e.target.value;
  }
  display.textContent = userInput;
});

document.addEventListener('keydown', function(e) {
  if (e.which === 13) {
    if (userInput % 5 === 0 && userInput >= 0 && userInput < 361) {
      userInputInt=parseInt(userInput);
    } else {
      cancelAnimationFrame(animation);
      drawText('Значение угла должно быть кратно 5 и не больше 360°');
      return;
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