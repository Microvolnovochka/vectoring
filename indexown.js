var display = document.querySelector('.keyboard-display');
var canvas = document.getElementById('field');
var body = document.getElementById('body');
var ctx = canvas.getContext('2d');
var width = ctx.canvas.width = window.innerWidth;
var height = ctx.canvas.height = window.innerHeight - 1;
var userInputInt = null;
var userInput = "000";
var sucess = false;
var km = 300/50;//количество пикселей в одном километре
var coefx = (width-300*2)/(300)*5;
var coefy = height/(300)*5;
var randomAngle = null;
var count = 0;//счетчик для отрисовки пути
var veloc = 100;//скорость в км/ч
var randomDistance = null;
var lastRandomAngle = null;
var plane = new Image();
var airports = [];
var pathpoints = [];
var airplane = {
  x: width/2,
  y: height/2,
  mmx: null,
  mmy: null,
  v: null,
  anglev: null,
  angle: null,
};
var miniMap ={
  xb: width-300,
  yb: height-310,
  xviszf: null,
  xviszs: null,
  yviszf: null,
  yviszs: null,
  color: "#302d2d",
};
var cren = {
  15:{
    1500: 0.3620,
    1450: 0.3734,
    1400: 0.3876,
    1350: 0.4016,
    1300: 0.4172,
    1250: 0.4340,
    1200: 0.4522,
    1150: 0.4721,
    1100: 0.4938,
    1050: 0.5175,
    1000: 0.5437,
    950: 0.5726,
    900: 0.6024,
    850: 0.6381,
    800: 0.6784,
    750: 0.7241,
    700: 0.7763,
    650: 0.8367,
    600: 0.9018,
    550: 0.9843,
    500: 1.0835,
    450: 1.2049,
    400: 1.3568,
    350: 1.5527,
    300: 1.8146,
    250: 2.1827,
    200: 2.7384,
    150: 3.6374,
    100: 5.5782,
  },
};
var progressBar = {
  level: 1,
  count: 0,
};
var levels = {
  1: {
    petals: 12,
    airpotrN: 2,
    difficulty: 0,
  },
  2: {
    petals: 4,
    airpotrN: 2,
    difficulty: 0,
  },
  3: {
    petals: 4,
    airpotrN: 2,
    difficulty: 1,
  },
  4: {
    petals: 4,
    airpotrN: 2,
    difficulty: 2,
  },
  5: {
    petals: 0,
    airpotrN: 2,
    difficulty: 2,
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
 // document.querySelector('.progress-bar').style.color = 'white';
} else {
  body.style.background = '#f0f5f9';
  body.style.color = 'black';
  ctx.strokeStyle = '#3d3d3d';
  ctx.fillStyle = 'black';
  display.style.background = 'linear-gradient(#c9cac4, #7c9caf)';
  display.style.color = 'black';
  plane.src = 'images/airplane-black.png';
 // document.querySelector('.progress-bar').style.color = 'black';
}

init();

function init() {
  plane.onload = function () {
    animation = requestAnimationFrame(draw);
  }
}

function draw(time) {
  ctx.clearRect(0, 0, width, height);
  drawVisualBox();
  drawMiniMap(miniMap);
  drawPetals(levels[progressBar.level]);
  outOfMap(airplane);
  drawPath(pathpoints);
  drawAp(airports);
  drawAirplane(airplane);
  progressCheck(progressBar);
  upgradeInfo();
  requestAnimationFrame(draw);
}

function drawVisualBox(){
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = "#4f4b4b";
  ctx.fillRect(0,0,300,height-0);
  ctx.fillRect(width-301,0,301,height-0);
  ctx.restore();
}

function drawMiniMap(miniMap){
  ctx.save();
  ctx.lineWidth = 2;
  ctx.fillStyle = miniMap.color;
  ctx.moveTo(miniMap.xb,height-10);
  ctx.lineTo(miniMap.xb,miniMap.yb);
  ctx.lineTo(width,miniMap.yb);
  ctx.lineTo(width,height-10);
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

function drawAp(airports){
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 1;
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
      ctx.fillStyle = '#ffbe00';
      if (airports[i].collision)
      {
        ctx.fillStyle = "#00ff00";
      }
      ctx.beginPath();
      ctx.arc(airports[i].mmx,airports[i].mmy, 3, 0, Math.PI * 2, true);
      if (airports[i].angle!==null)
      {
        ctx.save();
        ctx.strokeStyle = "#ffffff";
        ctx.translate(airports[i].mmx,airports[i].mmy);
        ctx.rotate(airports[i].angle*Math.PI/180);
        ctx.moveTo(0,10);
        ctx.lineTo(0,-10);
        if (levels[progressBar.level].difficulty==2)
        {
          ctx.moveTo(5,5);
          ctx.lineTo(-5,5);
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.fill();
      if (airports[i].mmx<=miniMap.xviszs&&airports[i].mmx>=miniMap.xviszf&&airports[i].mmy>=miniMap.yviszf&&airports[i].mmy<=miniMap.yviszs)
      {
        ctx.strokeStyle = "#000000";
        ctx.save();
        ctx.beginPath();
        ctx.translate(airplane.x,airplane.y);
        airports[i].x = (airports[i].mmx-airplane.mmx)*((width-2*(width-miniMap.xb))/(width-miniMap.xb))*5;
        airports[i].y = (airports[i].mmy-airplane.mmy)*(height/(height-miniMap.yb))*5;
        ctx.arc(airports[i].x,airports[i].y,15,0,2*Math.PI,true);
        if (airports[i].angle!==null)
        {
          ctx.save();
          ctx.lineWidth = 5;
          ctx.translate(airports[i].x,airports[i].y);
          ctx.rotate(airports[i].angle*Math.PI/180);
          ctx.moveTo(0,50);
          ctx.lineTo(0,-50);
          if (levels[progressBar.level].difficulty==2)
          {
            ctx.moveTo(15,30);
            ctx.lineTo(-15,30);
          }
          ctx.stroke();
          ctx.restore();
        }
        collision(airports[i]);
        ctx.fill();
        ctx.restore();
      }
      else
      {
        airports[i].x = null;
        airports[i].y = null;
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
  if (veloc!==null)
  {
    //v = prompt("Введите скорость в км/ч",0);
    //airplane.v = (v*km)/(3600*60);
    airplane.v = (veloc*km)/3600/60;
  }
  if(airplane.angle>=360)
  {
    airplane.angle-=360;
  } 
  else if (airplane.angle<0)
  {
    airplane.angle+=360;
  } 
  if(Math.abs(airplane.angle-userInputInt)>1)
  {
    if (((airplane.angle+180)>=userInputInt&&userInputInt>airplane.angle)||((airplane.angle-180)>=userInputInt&&userInputInt>(airplane.angle-360)))
    {
      airplane.angle+=cren["15"][veloc.toString()]/60;
    }
    else
    {
      airplane.angle-=cren["15"][veloc.toString()]/60;
    }
  }
  else
  {
    airplane.angle=userInputInt;
  }
  if (airplane.mmx===null||airplane.mmy===null)
  {
    airplane.mmx = (width-miniMap.xb)/2+miniMap.xb;
    airplane.mmy = height - 10 -((height-miniMap.yb)/10);
  }
  if (airplane.angle!==null&&airplane.v!==null)
  {
    newCoordinate = getCoordsByAngleRadius({x: airplane.mmx,y:airplane.mmy},airplane.angle,airplane.v);
    airplane.mmx = newCoordinate.x;
    airplane.mmy = newCoordinate.y;
  }
  miniMap.xviszf = airplane.mmx - (width-miniMap.xb)/10;
  miniMap.xviszs = airplane.mmx + (width-miniMap.xb)/10;
  miniMap.yviszf = airplane.mmy - (height-miniMap.yb)/10;
  miniMap.yviszs = airplane.mmy + (height-miniMap.yb)/10;
  if (miniMap.xviszf<=miniMap.xb)
  {
    miniMap.xviszf=miniMap.xb;
  }
  if (miniMap.yviszf<=miniMap.yb)
  {
    miniMap.yviszf=miniMap.yb;
  }
  if (miniMap.yviszs>=height-10)
  {
    miniMap.yviszs=height-10;
  }
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

function drawPath(pathpoints){
  ctx.save();
  ctx.fillStyle = "#00ff00";
  if (!pathpoints.length)
  {
    pathpoints.push(new Point(airplane.mmx,airplane.mmy));
  }
  if (count==180)
  {
    pathpoints.push(new Point(airplane.mmx,airplane.mmy));
    count = 0;
  }
  if (pathpoints.length)
  {
    for (var i=0;i<pathpoints.length;i++)
    {
      ctx.beginPath();
      ctx.arc(pathpoints[i].mmx,pathpoints[i].mmy,1,0,Math.PI*2,true);
      ctx.fill();
      if (pathpoints[i].mmx<=miniMap.xviszs&&pathpoints[i].mmx>=miniMap.xviszf&&pathpoints[i].mmy>=miniMap.yviszf&&pathpoints[i].mmy<=miniMap.yviszs)
      {
        ctx.save();
        ctx.beginPath();
        ctx.translate(airplane.x,airplane.y);
        pathpoints[i].x = (pathpoints[i].mmx-airplane.mmx)*((width-2*(width-miniMap.xb))/(width-miniMap.xb))*5;
        pathpoints[i].y = (pathpoints[i].mmy-airplane.mmy)*(height/(height-miniMap.yb+10))*5;
        ctx.arc(pathpoints[i].x,pathpoints[i].y,5,0,2*Math.PI,true);
        ctx.fill();
        ctx.restore();
      }
      else 
      {
        pathpoints[i].x = null;
        pathpoints[i].y = null;
      }
    }
  }
  count++;
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

function collision(airport){
  if (Math.abs(airport.x-0)<=10&&Math.abs(airport.y-0)<=10)
        {
          if(airport.angle!==null)
          {
            if (levels[progressBar.level].difficulty==2)
            {
              if (Math.abs(airplane.angle-airport.angle)<=10)
              {
                airport.collision = true;
              }
            }
            else if(Math.abs(airplane.angle-airport.angle)<=10||Math.abs(airplane.angle-(airport.angle-180))<=10)
            {
              airport.collision = true;
            }
          }
          else
          {
            airport.collision = true;
          }
        }
}

function outOfMap(airplane){
  if (airplane.mmx<=miniMap.xb)
  {
      airplane.mmx = width-1;
      airplane.mmy = airplane.mmy;
      airports.splice(0,airports.length);
      pathpoints.splice(0,pathpoints.length);
  }
  else if (airplane.mmx>=width)
  {
      airplane.mmx = miniMap.xb+1;
      airplane.mmy = airplane.mmy;
      airports.splice(0,airports.length);
      pathpoints.splice(0,pathpoints.length);
  }
  else if (airplane.mmy<=miniMap.yb)
  {
      airplane.mmx = airplane.mmx;
      airplane.mmy = height - 10;
      airports.splice(0,airports.length);
      pathpoints.splice(0,pathpoints.length);
  }
  else if (airplane.mmy>=height-10)
  {
      airplane.mmx = airplane.mmx;
      airplane.mmy = miniMap.yb+1;
      airports.splice(0,airports.length);
      pathpoints.splice(0,pathpoints.length);
  }
}

function progressCheck(progress){
  if (progress.count>=1)
  {
    if (progress.level==5)
    {
      drawText("It's end of your journey");
      cancelAnimationFrame(animation);
      animation = requestAnimationFrame(draw);
      progress.level = 1;
      progress.count = 0;
      return;
    }
    progress.level++;
    progress.count = 0;
    airports.splice(0,airports.length);
    pathpoints.splice(0,pathpoints.length);
    return;
  }
  for (var i=0;i<airports.length;i++)
  {
    upgradeLevelInfo(airports);
    if (!airports[i].collision)
    {
      return;
    }
  }
  progress.count++;
  airports.splice(0,airports.length);
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

function Point(x,y){
  this.mmx = x;
  this.mmy = y;
  this.x = null;
  this.y = null;
}

function Airport(){
  this.x = null;
  this.y = null;
  this.angle = null;//уровни сложнсоти и угол 
  this.collision = false;
  this.mmx = getRandomInt(miniMap.xb+20,width-20);
  this.mmy = getRandomInt(miniMap.yb+20,height-20);
  while (this.mmy==airplane.mmy&&this.mmx==irplane.mmx)
  {
    this.mmx = getRandomInt(miniMap.xb,width);
    this.mmy = getRandomInt(miniMap.yb,height);
  }
  if (levels[progressBar.level].difficulty)
  {
    this.angle = getRandomInt(0,71)*5;
  }
}

function upgradeLevelInfo(airports){
  var par = document.querySelector(".levelsinfo");
  var p = document.createElement("p");
  var level = document.querySelector(".level"+String(progressBar.level));
  if (level)
  {
    for (var i =0;i<levels[progressBar.level].airpotrN;i++)
    {
      level.querySelectorAll("span")[i].innerHTML = " Аэропорт №"+i.toString()+" - "+airports[i].collision.toString();
    }
  }
  else 
  {
    for (var i =0;i<levels[progressBar.level].airpotrN;i++)
    {
      var span = document.createElement("span");
      span.innerHTML = "Аэропорт №"+i.toString()+" - "+airports[i].collision.toString();
      p.appendChild(span);
    }
    p.className = "level"+progressBar.level.toString();
    par.appendChild(p);
  }
}

function upgradeInfo(){
  document.querySelector('.cren > span').innerHTML = "15";
  document.querySelector('.course > span').innerHTML = Math.floor(airplane.angle);
  document.querySelector('.speed > span').innerHTML = veloc;
}

function isNumPad(e) {
  if ((e.which > 47 && e.which <= 57) || (e.which > 95 && e.which <= 105)) {
    return true;
  }
  return false;
}

function drawText(text) {
  ctx.fillText(text, width / 2, 70);
}

document.querySelector('.info').addEventListener('click',function(e){
  if (e.target.id=="plusspeed")
  {
    veloc+=50;
    if (veloc>1500)
    {
      veloc = 1500;
      drawText("Скорость не должна превышать 1500 км/ч")
    }
  }
  else if (e.target.id=="minusspeed")
  {
    veloc-=50;
    if (veloc<100)
    {
      veloc = 100;
      cancelAnimationFrame(animation);
      drawText("Скорость не должна быть меньше 100 км/ч")
    }
  }
});

document.querySelector('.select-level').addEventListener('change', function (e) {
  progressBar.level = e.target.value;
  progressBar.count = 0;
  airports.splice(0,airports.length);
  //progressBar.count = e.target.value * 5;
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
    } else {
      //cancelAnimationFrame(animation);
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
  } else if (e.which==107||e.which==61) {
    veloc+=50;
    if (veloc>1500)
    {
      veloc = 1500;
      drawText("Скорость не должна превышать 1500 км/ч")
    }
  } else if (e.which==109||e.which==173) {
    veloc-=50;
    if (veloc<100)
    {
      veloc = 100;
      drawText("Скорость не должна быть меньше 100 км/ч")
    }
  }

  display.textContent = userInput;
});