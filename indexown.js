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
var km = 100;
var randomAngle = null;
var randomDistance = null;
var lastRandomAngle = null;
var plane = new Image();
var airplane = {
  x: null,
  y: null,
  v: null,
  angle: null,
};
var vpp = {
  x: width - 200,
  y: height/2,
  xtkm: width - 200- 2*km,
  xekm: width - 200- 8*km,
  length: 8.5*km,
  width: 1.5*km,
}
var progressBar = {
  level: 1,
  count: 0
};
var levels = {
  1: {
    center: true,
    petals: 12
  },
  2: {
    center: true,
    petals: 4
  },
  3: {
    center: true,
    petals: 4
  },
  4: {
    center: true,
    petals: 0
  },
  5: {
    center: false,
    petals: 0
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
  drawPetals(levels[progressBar.level]);
  drawVpp(vpp);
  drawAirplane(airplane);
  if (((airplane.x>vpp.xekm&&airplane.x<vpp.xtkm)||(airplane.x<vpp.xekm&&airplane.x>vpp.xtkm))&&airplane.y<vpp.y+vpp.width&&airplane.y>vpp.y-vpp.width)
  {
    sucess = checkAngle();
  }
  if (sucess)
  {
    //drawText("Nice");
    //cancelAnimationFrame(animation);
  }
  requestAnimationFrame(draw);
}

function checkAngle(){
  var trueairplanex = airplane.x;
  var trueairplaney = airplane.y;
  var newCoordinate = null;
  var step = 0.01;
  var maxcount = Math.sqrt(36*km*km+vpp.width*4*vpp.width)/step;
  var count = null;
  var a = null;
  var b = null;
  var c = null;
  var angle = null;

  while((Math.abs(airplane.y-vpp.y)>1)&&(count<maxcount))
  {
    newCoordinate = getCoordsByAngleRadius({x: airplane.x,y:airplane.y},airplane.angle,step);
    airplane.x = newCoordinate.x;
    airplane.y = newCoordinate.y;
    count++;
  }
  if (count<maxcount-1)
  {
    a = Math.sqrt(Math.pow(trueairplanex-vpp.x,2));
    b = Math.sqrt(Math.pow(vpp.x-vpp.x,2)+Math.pow(trueairplaney-airplane.y,2));
    c = Math.sqrt(Math.pow(trueairplanex-vpp.x,2)+Math.pow(trueairplaney-airplane.y,2));
    angle = Math.acos((b*b+c*c-a*a)/(2*b*c));
    angle = angle*180/Math.PI;
  }
  console.log(angle);
  airplane.x = trueairplanex;
  airplane.y = trueairplaney;
  if (angle<90&&angle>30)
  {
    return true;
  }
  else return false;
}

function drawVpp(vpp){
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.fillStyle = '#ffbe00';
    var newCoordinate = null;
    /*if (vpp.x===null||vpp.y===null)
    {
      coin = getRandomInt(0,3);
      if( coin>=2)
      {
        vpp.x = getRandomInt(airplane.x,width);
        vpp.xtkm = vpp.x-160;
        vpp.xekm = vpp.x-640;
      }
      else
      {
        vpp.x = getRandomInt(0,airplane.x);
        vpp.xtkm = vpp.x+160;
        vpp.xekm = vpp.x+640;
      }
      vpp.x = getRandomInt(airplane.x,width);
      vpp.xtkm = vpp.x-160;
      vpp.xekm = vpp.x-640;
      vpp.y = getRandomInt(200,airplane.y-400);
    }*/
    ctx.arc(vpp.x,vpp.y, 5, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.beginPath();
    ctx.lineWidth =2;
    ctx.moveTo(vpp.x+vpp.length,vpp.y-vpp.width);
    ctx.lineTo(vpp.x-vpp.length,vpp.y-vpp.width);
    ctx.moveTo(vpp.x+vpp.length,vpp.y+vpp.width);
    ctx.lineTo(vpp.x-vpp.length,vpp.y+vpp.width);
    ctx.moveTo(vpp.xtkm,vpp.y-vpp.width);
    ctx.lineTo(vpp.xtkm,vpp.y+vpp.width);
    ctx.moveTo(vpp.xekm,vpp.y-vpp.width);
    ctx.lineTo(vpp.xekm,vpp.y+vpp.width);
    ctx.stroke();
    ctx.restore();
}

function drawAirplane(airplane)
{
  var v = null;
  ctx.save();
  ctx.beginPath();
  var newCoordinate = null;
  if (airplane.v===null)
  {
    //v = prompt("Введите скорость в км/ч",0);
    //airplane.v = (v*km)/(3600*60);
    airplane.v = 300*km/3600/60;
    airplane.x = vpp.xekm;
    airplane.y = vpp.y+vpp.width;
  }
  airplane.angle = userInputInt;
  if (airplane.angle!==null)
  {
    newCoordinate = getCoordsByAngleRadius({x: airplane.x,y:airplane.y},airplane.angle,airplane.v)
    airplane.x = newCoordinate.x;
    airplane.y = newCoordinate.y;
  }
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