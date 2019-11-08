
var display = document.querySelector('.keyboard-display');
var canvas = document.getElementById('field');
var body = document.getElementById('body');
var endwindow = document.querySelector(".level_end_window");
var savewindow = document.querySelector(".save_window");
savewindow.style.display = "none";
var yes = document.querySelector(".yesbt");
var no = document.querySelector(".nobt");
var saveyes = document.querySelector(".save_yesbt");
var saveno = document.querySelector(".save_nobt");
var save = true //для работы диалога о сохранениях
var ctx = canvas.getContext('2d');
var width = ctx.canvas.width = window.innerWidth;
var longscreen = window.innerHeight<window.innerWidth?false:true;
var height = ctx.canvas.height = window.innerHeight<window.innerWidth?window.innerHeight:window.innerHeight*0.8;
var MAX = height>width?height:width;
var MIN = height<width?height:width;
var pause = false;
var coeffAccel = 1;//коэффициент ускорения воспроизведенеия
var nextLevel = false;
var povorotn = null;//
var timecoeff = null;
var prevAngle = 0;//для подчсета поворотов
var userInput = "000";
var userInputInt = 0;
var km = 300/50;//количество пикселей в одном километре
var coefx = (width-300*2)/(300)*5;
var coefy = height/(300)*5;
var pathcount = 0;//счетчик для отрисовки пути по времени
var veloccount = 0;//счетчик для скорости
var veloc = 100;//скорость в км/ч
var inputVeloc = 100;
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
var cursor = {
  x: null,
  y: null,
  is: false,
};
var miniMap ={
  xb: width-300,
  yb: height-310,
  xe: width,
  ye: height-10,
  xviszf: null,
  xviszs: null,
  yviszf: null,
  yviszs: null,
  color: "#dbdbdb",
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
var colors ={
  airportcol1: null,
  airportcol2: null,
};
var savefile={
  plane: null,
  planevel: null,
  aimangle: null,
  userangle: null,
  aimveloc: null,
  npovorot: null,
  airports: null,
  pathpoints: null,
  level: null,
};
ctx.lineWidth = 1;
ctx.font = "30px sans-serif";
ctx.textAlign = 'center';

if (localStorage.getItem('eris-value:theme') === 'gray') {
  body.style.background = '#303030';
  body.style.color = 'white';
  //display.style.background = 'black';
  //display.style.color = '#ffff00';
  ctx.strokeStyle = '#b9b9b9';
  ctx.fillStyle = 'white';
  plane.src = 'images/airplane-white.png';
} else {
  body.style.background = '#f0f5f9';
  body.style.color = 'black';
  ctx.strokeStyle = '#3d3d3d';
  ctx.fillStyle = 'black';
  colors.airportcol1 = "#FA9A14";
  colors.airportcol2 = "#4443ea";
  //display.style.background = 'linear-gradient(#c9cac4, #7c9caf)';
  //display.style.color = 'black';
  plane.src = 'images/airplane-black.png';
}

init();

function init() {
  plane.onload = function () {
    animation = requestAnimationFrame(draw);
  }
}

function draw(time) {
  if (progressBar.level!=6)
  {
    if(localStorage.getItem("vectoring_save")&&save)
    {
      pause = true;
      savewindow.style.display = "inline";
    }
    if (!pause)
    {
      save = false;
      document.querySelector(".right_sidebar").style.zIndex = 0;
      requestAnimationFrame(draw);
      ctx.clearRect(0, 0, width, height);
      if (!cursor.is)
      {
        drawPetals(levels[progressBar.level]);
      }
      outOfMap(airplane);
      drawPath(pathpoints);
      drawAp(airports);
      if (!longscreen)
      {
        drawScale(MIN/10,width/2,height-30);
      }
      else
      {
        drawScale(MIN/10,30,height/2,longscreen);
      }
      drawAirplane(airplane);
      drawMiniMap(miniMap);
      upgradeLevelInfo(airports);
      progressCheck(progressBar);
      timecoeff++;
      if (timecoeff>=200)
      {
        timecoeff = 0;
        savefile.plane = airplane;
        savefile.planevel = veloc;
        savefile.aimangle = prevAngle;
        savefile.userangle = userInputInt;
        savefile.aimveloc = inputVeloc;
        savefile.npovorot = povorotn;
        savefile.airports = airports;
        savefile.pathpoints = pathpoints;
        savefile.level = progressBar.level;
        localStorage.removeItem("vectoring_save");
        savefile = JSON.stringify(savefile);
        localStorage.setItem("vectoring_save",savefile);
        savefile = JSON.parse(savefile);
        console.log(savefile);
      }
      upgradeInfo();
    }
    else
    {
      pauseEffect();
    }
    //progressBar.count++;
  }
  else
  {
    ctx.clearRect(0, 0, width, height);
    pauseEffect();
    drawText("Вы прошли финальный уровень. Желаете начать сначала? (y/n)");
    pause = true;
    nextLevel = true;
    yes.style.display = "block";
    yes.innerHTML = "Начать с первого уровня";
    no.style.display = "block";
    no.innerHTML = "Закончить упражнение";
  }
}

function drawScale(km,xb,yb,vertical){
  var x = xb;
  var y = yb;
  var width = 4;
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "20px sans-serif";
  ctx.beginPath();
  ctx.translate(x,y);
  if (vertical)
  {
    ctx.rotate(Math.PI/2);
  }
  x = 0+km/2;
  ctx.moveTo(0,width);
  ctx.lineTo(x,width);
  ctx.moveTo(0,-width);
  ctx.lineTo(x,-width);  
  for (var i=0;i<2;i++)
  {
    ctx.moveTo(x,-width);
    ctx.lineTo(x,+width);
    ctx.moveTo(x,-width);
    ctx.lineTo(x+km,-width);
    ctx.moveTo(x,+width);
    ctx.lineTo(x+km,+width);
    x+=km;
  }
  ctx.moveTo(x,-width);
  ctx.lineTo(x,+width);
  x = 0-km/2;
  ctx.moveTo(0,width);
  ctx.lineTo(x,width);
  ctx.moveTo(0,-width);
  ctx.lineTo(x,-width);  
  for (i=0;i<2;i++)
  {
    ctx.moveTo(x,-width);
    ctx.lineTo(x,+width);
    ctx.moveTo(x,-width);
    ctx.lineTo(x-km,-width);
    ctx.moveTo(x,+width);
    ctx.lineTo(x-km,+width);
    x-=km;
  }
  ctx.moveTo(x,-width);
  ctx.lineTo(x,+width);
  ctx.fillText("км",x-20,+5);
  ctx.fillText("0",x,-6);
  x+=km/10;
  for (i=0;i<9;i++)
  {
    ctx.moveTo(x,-width);
    ctx.lineTo(x,+width);
    if (i%2==0)
    {
      ctx.moveTo(x,0);
      ctx.lineTo(x+km/10,0);
    }
    x+=km/10;
  }
  for (var i=1;i<5;i++)
  {
    ctx.fillText((i).toString(),x,-6);
    if(i%2==0)
    {
      ctx.moveTo(x,0);
      ctx.lineTo(x+km,0);
    }
    x+=km;
  }
  ctx.fillText("5",x,-6);
  ctx.stroke();
  ctx.restore();
}

function pauseEffect(){
  ctx.save();
  ctx.fillStyle = "rgba(148, 149, 147, 0.5)";
  ctx.fillRect(0,0,width,height);
  drawMiniMap(miniMap);
  document.querySelector(".right_sidebar").style.zIndex = 2;
  ctx.restore();
}

function drawMiniMap(miniMap){
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#c0c1be";
  ctx.fillStyle = miniMap.color;
  ctx.moveTo(miniMap.xb,miniMap.ye);
  ctx.lineTo(miniMap.xb,miniMap.yb);
  ctx.lineTo(miniMap.xe,miniMap.yb);
  ctx.lineTo(miniMap.xe,miniMap.ye);
  ctx.lineTo(miniMap.xb,miniMap.ye);
  ctx.stroke();
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = "#000000";
  for (var i=0;i<airports.length;i++)
  {
    ctx.fillStyle = colors.airportcol1;
      if (airports[i].collision)
      {
        ctx.fillStyle = colors.airportcol2;
      }
      ctx.beginPath();
      ctx.arc(airports[i].mmx,airports[i].mmy, 3, 0, Math.PI * 2, true);
      if (airports[i].angle!==null)
      {
        ctx.save();
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
  }
  ctx.restore();
  ctx.save();
  ctx.fillStyle = colors.airportcol2;
  for (i=0;i<pathpoints.length;i++)
  {
    ctx.beginPath();
    ctx.arc(pathpoints[i].mmx,pathpoints[i].mmy,1,0,Math.PI*2,true);
    ctx.fill();
  }
  ctx.restore();
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#ff0000';
  ctx.fillStyle = '#ff0000';
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
      ctx.fillStyle = colors.airportcol1;
      if (airports[i].collision)
      {
        ctx.fillStyle = colors.airportcol2;
      }
      if (airports[i].mmx<=miniMap.xviszs&&airports[i].mmx>=miniMap.xviszf&&airports[i].mmy>=miniMap.yviszf&&airports[i].mmy<=miniMap.yviszs)
      {
        collision(airports[i]);
      }
      if (!cursor.is)
      {
        if (airports[i].mmx<=miniMap.xviszs&&airports[i].mmx>=miniMap.xviszf&&airports[i].mmy>=miniMap.yviszf&&airports[i].mmy<=miniMap.yviszs)
        {
          ctx.save();
          ctx.beginPath();
          ctx.translate(airplane.x,airplane.y);
          airports[i].x = (airports[i].mmx-airplane.mmx)*(MIN/300)*(width/MIN)*(300/(miniMap.xviszs-miniMap.xviszf));
          airports[i].y = (airports[i].mmy-airplane.mmy)*(MIN/300)*(height/MIN)*(300/(miniMap.yviszs-miniMap.yviszf));
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
          ctx.fill();
          ctx.restore();
        }
        else
        {
          airports[i].x = null;
          airports[i].y = null;
        }
      }
      else 
      {
        if (airports[i].mmx<=(cursor.x+(miniMap.xviszs-miniMap.xviszf)/2)&&airports[i].mmx>=(cursor.x-(miniMap.xviszs-miniMap.xviszf)/2)&&airports[i].mmy>=(cursor.y-(miniMap.yviszs-miniMap.yviszf)/2)&&airports[i].mmy<=(cursor.y+(miniMap.yviszs-miniMap.yviszf)/2))
        {
          ctx.save();
          ctx.beginPath();
          ctx.translate(airplane.x,airplane.y);
          airports[i].x = (airports[i].mmx-cursor.x)*(MIN/300)*(width/MIN)*(300/(miniMap.xviszs-miniMap.xviszf));
          airports[i].y = (airports[i].mmy-cursor.y)*(MIN/300)*(height/MIN)*(300/(miniMap.yviszs-miniMap.yviszf));
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
          ctx.fill();
          ctx.restore();
        }
        else
        {
          airports[i].x = null;
          airports[i].y = null;
        }
      }
    }
    ctx.restore();
}

function drawAirplane(airplane)
{
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#ff0000';
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  var newCoordinate = null;
  if (userInputInt!==prevAngle)
  {
    povorotn++;
  }
  prevAngle = userInputInt;
  if (veloc!==null)
  {
    if (Math.abs(veloc-inputVeloc)>1&&veloccount>=(60/coeffAccel))
    {
      veloccount = 0;
      veloc+=inputVeloc>veloc?50:-50;
    }
    else if (Math.abs(veloc-inputVeloc)>1)
    {
      veloccount++;
    }
    airplane.v = (veloc*km)/3600/(60/coeffAccel);
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
      airplane.angle+=cren["15"][veloc.toString()]/(60/coeffAccel);
    }
    else
    {
      airplane.angle-=cren["15"][veloc.toString()]/(60/coeffAccel);
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
  miniMap.xviszf = airplane.mmx - (width/MIN)*(width-miniMap.xb)/10;
  miniMap.xviszs = airplane.mmx + (width/MIN)*(width-miniMap.xb)/10;
  miniMap.yviszf = airplane.mmy - (height/MIN)*(height-miniMap.yb)/10;
  miniMap.yviszs = airplane.mmy + (height/MIN)*(height-miniMap.yb)/10;
  if (miniMap.xviszf<=miniMap.xb)
  {
    miniMap.xviszf=miniMap.xb;
    ctx.beginPath();
    ctx.moveTo(((miniMap.xb-airplane.mmx)*(MIN/300)*(width/MIN)*(300/(miniMap.xviszs-miniMap.xviszf)))+airplane.x,0);
    ctx.lineTo(((miniMap.xb-airplane.mmx)*(MIN/300)*(width/MIN)*(300/(miniMap.xviszs-miniMap.xviszf)))+airplane.x,height);
    ctx.stroke();
  }
  if (miniMap.yviszf<=miniMap.yb)
  {
    miniMap.yviszf=miniMap.yb;
    ctx.beginPath();
    ctx.moveTo(0,((miniMap.yb-airplane.mmy)*(MIN/300)*(height/MIN)*(300/(miniMap.yviszs-miniMap.yviszf)))+airplane.y);
    ctx.lineTo(width,((miniMap.yb-airplane.mmy)*(MIN/300)*(height/MIN)*(300/(miniMap.yviszs-miniMap.yviszf)))+airplane.y);
    ctx.stroke();
  }
  if (miniMap.yviszs>=height-10)
  {
    miniMap.yviszs=height-10;
    ctx.beginPath();
    ctx.moveTo(0,((height-10-airplane.mmy)*(MIN/300)*(height/MIN)*(300/(miniMap.yviszs-miniMap.yviszf)))+airplane.y);
    ctx.lineTo(width,((height-10-airplane.mmy)*(MIN/300)*(height/MIN)*(300/(miniMap.yviszs-miniMap.yviszf)))+airplane.y);
    ctx.stroke();
  }
  if (miniMap.xviszs>=width)
  {
    miniMap.xviszs=width;
    ctx.beginPath();
    ctx.moveTo(((width-airplane.mmx)*(MIN/300)*(width/MIN)*(300/(miniMap.xviszs-miniMap.xviszf)))+airplane.x,0);
    ctx.lineTo(((width-airplane.mmx)*(MIN/300)*(width/MIN)*(300/(miniMap.xviszs-miniMap.xviszf)))+airplane.x,height);
    ctx.stroke();
  }
  ctx.beginPath();
  if (!cursor.is)
  {
    ctx.translate(airplane.x,airplane.y);
    ctx.rotate(airplane.angle*Math.PI/180);
    ctx.drawImage(plane,-20,-20,40,40);
  }
  else if (airplane.mmx<=(cursor.x+(miniMap.xviszs-miniMap.xviszf)/2)&&airplane.mmx>=(cursor.x-(miniMap.xviszs-miniMap.xviszf)/2)&&airplane.mmy>=(cursor.y-(miniMap.yviszs-miniMap.yviszf)/2)&&airplane.mmy<=(cursor.y+(miniMap.yviszs-miniMap.yviszf)/2))
  {
    var airplanex,airplaney;
    ctx.save();
    ctx.beginPath();
    ctx.translate(airplane.x,airplane.y);
    airplanex = (airplane.mmx-cursor.x)*(MIN/300)*(width/MIN)*(300/(miniMap.xviszs-miniMap.xviszf));
    airplaney = (airplane.mmy-cursor.y)*(MIN/300)*(height/MIN)*(300/(miniMap.yviszs-miniMap.yviszf));
    ctx.translate(airplanex,airplaney);
    ctx.rotate(airplane.angle*Math.PI/180);
    ctx.drawImage(plane,-20,-20,40,40);
    ctx.restore();
  }
  ctx.restore();
}

function drawPath(pathpoints){
  ctx.save();
  ctx.fillStyle = colors.airportcol2;
  if (!pathpoints.length)
  {
    pathpoints.push(new Point(airplane.mmx,airplane.mmy));
  }
  if (pathcount>=(180/coeffAccel))
  {
    pathpoints.push(new Point(airplane.mmx,airplane.mmy));
    pathcount = 0;
  }
  if (pathpoints.length)
  {
    for (var i=0;i<pathpoints.length;i++)
    {
      ctx.beginPath();
      if (!cursor.is)
      {
        if (pathpoints[i].mmx<=miniMap.xviszs&&pathpoints[i].mmx>=miniMap.xviszf&&pathpoints[i].mmy>=miniMap.yviszf&&pathpoints[i].mmy<=miniMap.yviszs)
        {
          ctx.save();
          ctx.beginPath();
          ctx.translate(airplane.x,airplane.y);
          pathpoints[i].x = (pathpoints[i].mmx-airplane.mmx)*(MIN/300)*(width/MIN)*(300/(miniMap.xviszs-miniMap.xviszf));
          pathpoints[i].y = (pathpoints[i].mmy-airplane.mmy)*(MIN/300)*(height/MIN)*(300/(miniMap.yviszs-miniMap.yviszf));
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
      else if (pathpoints[i].mmx<=(cursor.x+(miniMap.xviszs-miniMap.xviszf)/2)&&pathpoints[i].mmx>=(cursor.x-(miniMap.xviszs-miniMap.xviszf)/2)&&pathpoints[i].mmy>=(cursor.y-(miniMap.yviszs-miniMap.yviszf)/2)&&pathpoints[i].mmy<=(cursor.y+(miniMap.yviszs-miniMap.yviszf)/2))
      {
        ctx.save();
        ctx.beginPath();
        ctx.translate(airplane.x,airplane.y);
        pathpoints[i].x = (pathpoints[i].mmx-cursor.x)*(MIN/300)*(width/MIN)*(300/(miniMap.xviszs-miniMap.xviszf));
        pathpoints[i].y = (pathpoints[i].mmy-cursor.y)*(MIN/300)*(height/MIN)*(300/(miniMap.yviszs-miniMap.yviszf));
        ctx.arc(pathpoints[i].x,pathpoints[i].y,5,0,2*Math.PI,true);
        ctx.fill();
        ctx.restore();
      }
    }
  }
  pathcount++;
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
      if (!longscreen)
      {
        ctx.lineTo(400<width-2*300?200:(width-600)/2, 0);
      }
      else 
      {
        ctx.lineTo(200, 0);
      }
      ctx.stroke();
    }
  }
ctx.restore();
}

function drawText(text) {
  ctx.fillText(text, width / 2, 70);
}

function collision(airport){
  if (!airport.collision)
  {
    if (Math.abs(airport.mmx-airplane.mmx)<=1&&Math.abs(airport.mmy-airplane.mmy)<=1)
        {
          if(airport.angle!==null)
          {
            if (levels[progressBar.level].difficulty==2)
            {
              if (Math.abs(airplane.angle-airport.angle)<=10)
              {
                airport.collision = true;
                airport.povorotn = povorotn;
                povorotn = 0;
              }
            }
            else if(Math.abs(airplane.angle-airport.angle)<=10||Math.abs(airplane.angle-(airport.angle-180))<=10)
            {
              airport.collision = true;
              airport.povorotn = povorotn;
              povorotn = 0;
            }
          }
          else
          {
            airport.collision = true;
            airport.povorotn = povorotn;
            povorotn = 0;
          }
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
      prevAngle = userInputInt;
      povorotn = 0;
  }
  else if (airplane.mmx>=width)
  {
      airplane.mmx = miniMap.xb+1;
      airplane.mmy = airplane.mmy;
      airports.splice(0,airports.length);
      pathpoints.splice(0,pathpoints.length);
      prevAngle = userInputInt;
      povorotn = 0;
  }
  else if (airplane.mmy<=miniMap.yb)
  {
      airplane.mmx = airplane.mmx;
      airplane.mmy = height - 10;
      airports.splice(0,airports.length);
      pathpoints.splice(0,pathpoints.length);
      prevAngle = userInputInt;
      povorotn = 0;
  }
  else if (airplane.mmy>=height-10)
  {
      airplane.mmx = airplane.mmx;
      airplane.mmy = miniMap.yb+1;
      airports.splice(0,airports.length);
      pathpoints.splice(0,pathpoints.length);
      prevAngle = userInputInt;
      povorotn = 0;
  }
}

function progressCheck(progress){
  if (progress.count>=1)
  {
    cancelAnimationFrame(animation);
    pause = true;
    nextLevel = true;
    endwindow.style.display = "block";
    return;
  }
  for (var i=0;i<airports.length;i++)
  {
    if (!airports[i].collision)
    {
      return;
    }
  }
  progress.count++;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
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
  this.povorotn = null;
  this.mmx = getRandomInt(miniMap.xb+20,width-20);
  this.mmy = getRandomInt(miniMap.yb+20,height-20);
  while (this.mmy==airplane.mmy&&this.mmx==airplane.mmx)
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
  var level = par.querySelector(".level > span");
  var str = "НЕ ПРОЙДЕН";
  if (level.innerHTML==progressBar.level.toString()&&airports.length)
  {
    for (var i =0;i<levels[progressBar.level].airpotrN;i++)
    {
      if (airports[i].collision)
      {
        par.querySelectorAll(".povorots")[i].style.color = colors.airportcol2;
        par.querySelectorAll(".povorots")[i].innerHTML = "Поворотов: "+airports[i].povorotn.toString();
      }
      else
      {
        par.querySelectorAll(".povorots")[i].style.color = colors.airportcol1;
        par.querySelectorAll(".povorots")[i].innerHTML = str;
      }
      par.querySelectorAll(".airport > span")[i].innerHTML = (i+1).toString();
    }
  }
  else 
  {
    par.querySelector(".level > span").innerHTML = progressBar.level.toString();
    for (var i =0;i<levels[progressBar.level].airpotrN;i++)
    {
      par.querySelectorAll(".povorots")[i].innerHTML = str;
    }
    
  }
}

function upgradeInfo(){
  document.querySelector('.cren > span').innerHTML = "15";
  document.querySelector('.course > span').innerHTML = Math.floor(airplane.angle);
  document.querySelector('.speed > span').innerHTML = veloc;
  document.querySelector('.info_ff_koef > span').innerHTML = coeffAccel;
}

function isNumPad(e) {
  if ((e.which > 47 && e.which <= 57) || (e.which > 95 && e.which <= 105)) {
    return true;
  }
  return false;
}

function throttle(func, ms) {
  var isThrottled = false,
    savedArgs,
    savedThis;
  function wrapper() {
    if (isThrottled) { // (2)
      savedArgs = arguments;
      savedThis = this;
      return;
    }
    func.apply(this, arguments); // (1)
    isThrottled = true;
    setTimeout(function() {
      isThrottled = false; // (3)
      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs);
        savedArgs = savedThis = null;
      }
    }, ms);
  }
  return wrapper;
}

document.querySelector(".select-level").addEventListener("change",function(e){
  cancelAnimationFrame(animation);
  progressBar.level = Number(e.target.value);
  progressBar.count = 0;
  airports.splice(0,airports.length);
  pathpoints.splice(0,pathpoints.length);
  airplane.mmx = (width-miniMap.xb)/2+miniMap.xb;
  airplane.mmy = height - 10 -((height-miniMap.yb)/10);
  povorotn = 0;
  userInputInt = null;
  veloc = 100;
  airplane.angle = 0;
  pause = false;
  nextLevel = false;
  animation = requestAnimationFrame(draw);
});

document.querySelector('.info_control').addEventListener('click',function(e){
  var target =e.target;
  if (target.className=="info_pause"||target.className=="info_pause_button"&&!pause)
  {
    cancelAnimationFrame(animation);
    pause = true;
    document.querySelector(".info_pause").style.display = "none";
    document.querySelector(".info_play").style.display = "inline-block";
  }
  else if (document.querySelector(".info_pause").style.display=="none"&&target.className=="info_play"||target.className=="info_play_button")
  {
    pause = false;
    document.querySelector(".info_play").style.display = "none";
    document.querySelector(".info_pause").style.display = "inline-block";
    animation = requestAnimationFrame(draw);
  }
});

document.querySelector(".info_speed").addEventListener("input",function(e){
  if (!pause)
  {
    document.querySelector('.info_speed_text').innerHTML = e.target.value;
    document.querySelector(".info_speed").addEventListener("change",function(e){
    inputVeloc = e.target.value;
    });
  }
});

document.querySelector(".info_ff").addEventListener("click",function(e){
  if (!pause)
  {
    coeffAccel++;
    if (coeffAccel>3.5)
    {
      coeffAccel=1;
    }
  }
});

document.querySelector('.keyboard-container').addEventListener('click', function (e) {
  if (document.querySelector(".info_pause").style.display!="none"&&savewindow.style.display=="none")
  {
    if (e.target.value === 'reset') {
      userInput = '000';
    } else if (e.target.value === 'enter') {
      if (userInput >= 0 && userInput < 361) {
        userInputInt=parseInt(userInput);
        userInput = "000";
        if (pause)
        {
          pause = false;
          animation = requestAnimationFrame(draw);
        }
      } else {
        if (!pause)
        {
          drawText('Значение угла должно быть не больше 360°');
          cancelAnimationFrame(animation);
          pause = true;
        }
      }
    } else if (typeof e.target.value === 'string' && userInput.toString().length >= 3) {
      userInput = '' + userInput.toString().slice(1) + e.target.value;
    }
    display.textContent = userInput;
  }
});

/*window.matchMedia("(min-height:1080px)").addListener((event)=>{
  if (event.matches){
    longscreen = true;
    height = ctx.canvas.height = 1080;
  }
  else 
  {
    longscreen = false;
    height = ctx.canvas.height = window.innerHeight;
  }
})*/

window.addEventListener('resize',throttle(function(e){
  if (document.documentElement.clientHeight>1080)
  {
    longscreen = true;
    height = ctx.canvas.height;
  }
  else
  {
    longscreen = false;
    height = ctx.canvas.height;
  }
},500));

yes.addEventListener("click", function(e){
  if (pause==true&&nextLevel==true)
  {
    endwindow.style.display = "none";
    if (progressBar.level==6)
    {
      progressBar.level = 1;
      levelChange(true);
      animation = requestAnimationFrame(draw);
      return;
    }
    levelChange(true);
    animation = requestAnimationFrame(draw);
  }
});

no.addEventListener("click",function(e){
  if (pause==true&&nextLevel==true)
  {
    endwindow.style.display = "none";
    if (progressBar.level==6)
    {
      nextLevel = false;
      ctx.clearRect(0,0,width,height);
      drawText("42");
      return;
    }
    levelChange(false);
    animation = requestAnimationFrame(draw);
  }
});

saveyes.addEventListener("click", function(e){
  save = false;
  pause = false;
  savefile = JSON.parse(localStorage.getItem("vectoring_save"));
  airplane = savefile.plane;
  veloc = savefile.planevel ;
  prevAngle = savefile.aimangle;
  userInputInt = savefile.userangle;
  inputVeloc = savefile.aimveloc;
  povorotn = savefile.npovorot;
  airports = savefile.airports;
  pathpoints = savefile.pathpoints;
  progressBar.level = savefile.level;
  savewindow.style.display = "none";
  localStorage.removeItem("vectoring_save");
  animation = requestAnimationFrame(draw);
});

saveno.addEventListener("click", function(e){
  save = false;
  pause = false;
  savewindow.style.display = "none";
  localStorage.removeItem("vectoring_save");
  animation = requestAnimationFrame(draw);
});

canvas.addEventListener("mousedown",function(e){
  if (e.clientX>miniMap.xb&&e.clientX<miniMap.xe&&e.clientY>miniMap.yb&&e.clientY<miniMap.ye)
  {
    cursor.x = e.clientX;
    cursor.y = e.clientY;
    cursor.is = true;
  }
  else 
  {
    cursor.is = false;
    cursor.x = null;
    cursor.y = null;
  }
});

canvas.addEventListener("mouseup",function(e){
  cursor.is = false;
  cursor.x = null;
  cursor.y = null;
});

function levelChange(same){
  if (!same)
  {
    progressBar.level++;
  }
  else
  {
    airplane.mmx = (width-miniMap.xb)/2+miniMap.xb;
    airplane.mmy = height - 10 -((height-miniMap.yb)/10);
    userInputInt = 0;
    veloc = 100;
    airplane.angle = 0;
  }
  pause = false;
  nextLevel = false;
  timecoeff = 510;
  progressBar.count = 0; 
  airports.splice(0,airports.length);
  pathpoints.splice(0,pathpoints.length);
  prevAngle = userInputInt;
}

document.addEventListener('keydown', function(e) {
  if (document.querySelector(".info_pause").style.display!="none"&&savewindow.style.display=="none")
  {
    if (e.which === 13) {
      if (userInput >= 0 && userInput < 361) {
        userInputInt=parseInt(userInput);
        userInput = "000";
        if (pause)
        {
          pause = false;
          animation = requestAnimationFrame(draw);
        }
      } else {
        if (!pause)
        {
          drawText('Значение угла должно быть не больше 360°');
          cancelAnimationFrame(animation);
          pause = true;
        }
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
    } else if(e.which==89&&pause==true&&nextLevel==true){
      if (progressBar.level==6)
      {
        progressBar.count = 0;
        progressBar.level = 1;
        airports.splice(0,airports.length);
        pathpoints.splice(0,pathpoints.length);
        airplane.mmx = (width-miniMap.xb)/2+miniMap.xb;
        airplane.mmy = height - 10 -((height-miniMap.yb)/10);
        userInputInt = null;
        veloc = 100;
        airplane.angle = 0;
        pause = false;
        nextLevel = false;
        animation = requestAnimationFrame(draw);
      }
      progressBar.count = 0;
      airports.splice(0,airports.length);
      pathpoints.splice(0,pathpoints.length);
      airplane.mmx = (width-miniMap.xb)/2+miniMap.xb;
      airplane.mmy = height - 10 -((height-miniMap.yb)/10);
      userInputInt = null;
      veloc = 100;
      airplane.angle = 0;
      pause = false;
      nextLevel = false;
      animation = requestAnimationFrame(draw);
    } else if (e.which==78&&pause==true&&nextLevel==true){
      if (progressBar.level==6)
      {
        nextLevel = false;
        ctx.clearRect(0,0,width,height);
        drawText("42");
        return;
      }
      pause = false;
      nextLevel = false;
      progressBar.level++;
      progressBar.count = 0; 
      airports.splice(0,airports.length);
      pathpoints.splice(0,pathpoints.length);
      animation = requestAnimationFrame(draw);
    }
    display.textContent = userInput;
  }
});