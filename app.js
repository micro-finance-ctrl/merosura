const board = document.getElementById("board");
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("playerName");
const affiliate = document.getElementById("affiliate");
const moveSound = document.getElementById("moveSound");

const rankingScreen = document.getElementById("rankingScreen");
const rankList = document.getElementById("rankList");

let size = 3;
let tiles = [];
let playing = false;
let startTime, timer;

// swipe
let sx = 0, sy = 0;

/* init */
init();

/* size select */
document.querySelectorAll(".sizes button").forEach(btn=>{
  btn.onclick=()=>{
    size = +btn.dataset.size;
    document.querySelectorAll(".sizes button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    init();
  };
});

startBtn.onclick=()=>!playing&&startGame();

function init(){
  playing=false;
  clearInterval(timer);
  timeEl.textContent="time: --:--";
  tiles=[...Array(size*size).keys()];
  board.style.gridTemplateColumns=`repeat(${size},1fr)`;
  affiliate.classList.add("hidden");
  render();
}

function startGame(){
  playing=true;
  shuffleSolvable();
  startTime=Date.now();
  timer=setInterval(updateTime,1000);
  if(size>=6) affiliate.classList.remove("hidden");
  render();
}

function updateTime(){
  const t=Math.floor((Date.now()-startTime)/1000);
  timeEl.textContent=`time: ${t}s`;
}

/* solvable shuffle */
function shuffleSolvable(){
  do{
    for(let i=tiles.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [tiles[i],tiles[j]]=[tiles[j],tiles[i]];
    }
  }while(!isSolvable());
}

function isSolvable(){
  let inv=0;
  for(let i=0;i<tiles.length;i++){
    for(let j=i+1;j<tiles.length;j++){
      if(tiles[i]&&tiles[j]&&tiles[i]>tiles[j]) inv++;
    }
  }
  if(size%2===1) return inv%2===0;
  const rowFromBottom=size-Math.floor(tiles.indexOf(0)/size);
  return rowFromBottom%2===0?inv%2===1:inv%2===0;
}

/* render */
function render(){
  board.innerHTML="";
  tiles.forEach((n,i)=>{
    const d=document.createElement("div");
    d.className=n===0?"tile empty":"tile";
    d.textContent=n||"";
    d.onclick=()=>playing&&clickMove(i);
    board.appendChild(d);
  });

  board.ontouchstart=e=>{
    const t=e.touches[0];
    sx=t.clientX; sy=t.clientY;
  };

  board.ontouchend=e=>{
    if(!playing) return;
    const t=e.changedTouches[0];
    const dx=t.clientX-sx;
    const dy=t.clientY-sy;
    if(Math.abs(dx)<30&&Math.abs(dy)<30) return;

    if(Math.abs(dx)>Math.abs(dy)){
      swipe(dx>0?"right":"left");
    }else{
      swipe(dy>0?"down":"up");
    }
  };
}

/* correct slide */
function swipe(dir){
  const empty=tiles.indexOf(0);
  const er=Math.floor(empty/size);
  const ec=empty%size;
  let moved=false;

  if(dir==="left"){
    for(let c=ec+1;c<size;c++){
      tiles[er*size+c-1]=tiles[er*size+c];
      tiles[er*size+c]=0;
      moved=true;
    }
  }
  if(dir==="right"){
    for(let c=ec-1;c>=0;c--){
      tiles[er*size+c+1]=tiles[er*size+c];
      tiles[er*size+c]=0;
      moved=true;
    }
  }
  if(dir==="up"){
    for(let r=er+1;r<size;r++){
      tiles[(r-1)*size+ec]=tiles[r*size+ec];
      tiles[r*size+ec]=0;
      moved=true;
    }
  }
  if(dir==="down"){
    for(let r=er-1;r>=0;r--){
      tiles[(r+1)*size+ec]=tiles[r*size+ec];
      tiles[r*size+ec]=0;
      moved=true;
    }
  }

  if(moved){
    moveSound.currentTime=0;
    moveSound.play();
    render();
    if(isCleared()) finish();
  }
}

function clickMove(i){
  const e=tiles.indexOf(0);
  const r1=Math.floor(i/size), c1=i%size;
  const r2=Math.floor(e/size), c2=e%size;
  if(r1===r2||c1===c2){
    swipe(r1===r2?(c1<c2?"right":"left"):(r1<r2?"down":"up"));
  }
}

function isCleared(){
  return tiles.slice(0,-1).every((v,i)=>v===i+1);
}

/* finish & ranking */
function finish(){
  playing=false;
  clearInterval(timer);
  const t=Math.floor((Date.now()-startTime)/1000);
  const name=nameInput.value||"user";
  saveBest(size,name,t);
}

function saveBest(size,name,time){
  const key=`best_${size}`;
  const arr=JSON.parse(localStorage.getItem(key)||"[]");
  arr.push({name,time});
  arr.sort((a,b)=>a.time-b.time);
  localStorage.setItem(key,JSON.stringify(arr.slice(0,10)));
}

/* ranking UI */
document.getElementById("openRanking").onclick=()=>{
  rankingScreen.classList.remove("hidden");
  showPersonal();
};

document.getElementById("closeRanking").onclick=()=>{
  rankingScreen.classList.add("hidden");
};

document.getElementById("worldBtn").onclick=()=>{
  rankList.innerHTML=`
    <li>world1 - 10s</li>
    <li>world2 - 12s</li>
    <li>world3 - 15s</li>
  `;
};

document.getElementById("personalBtn").onclick=showPersonal;

function showPersonal(){
  const arr=JSON.parse(localStorage.getItem(`best_${size}`)||[]);
  rankList.innerHTML="";
  arr.forEach(r=>{
    rankList.innerHTML+=`<li>${r.name} - ${r.time}s</li>`;
  });
}
