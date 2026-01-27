const board = document.getElementById("board");
const startBtn = document.getElementById("startBtn");
const timeEl = document.getElementById("time");
const hint = document.getElementById("tapHint");
const bestEl = document.getElementById("best");
const move = document.getElementById("move");

let size = 3;
let tiles = [];
let state = "IDLE";
let timer, startTime;

startBtn.classList.add("pulse");

document.querySelectorAll(".sizes button").forEach(b=>{
  b.onclick=()=>{
    size=+b.dataset.size;
    document.querySelectorAll(".sizes button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    reset();
  }
});

startBtn.onclick=()=>start();

function reset(){
  state="IDLE";
  startBtn.classList.add("pulse");
  board.classList.add("locked");
  clearInterval(timer);
  timeEl.textContent="⏱ --";
  tiles=[...Array(size*size).keys()];
  board.style.gridTemplateColumns=`repeat(${size},1fr)`;
  shuffle();
  render();
  updateBest();
}

function start(){
  state="PLAYING";
  startBtn.classList.remove("pulse");
  board.classList.remove("locked");
  startTime=Date.now();
  timer=setInterval(()=>{
    timeEl.textContent=`⏱ ${Math.floor((Date.now()-startTime)/1000)}s`;
  },1000);
}

function shuffle(){
  do{ tiles.sort(()=>Math.random()-.5); }while(!solvable());
}

function solvable(){
  let inv=0;
  for(let i=0;i<tiles.length;i++)
    for(let j=i+1;j<tiles.length;j++)
      if(tiles[i]&&tiles[j]&&tiles[i]>tiles[j]) inv++;
  return size%2?inv%2===0:true;
}

function render(){
  board.innerHTML="";
  tiles.forEach(n=>{
    const d=document.createElement("div");
    d.className="tile"+(n===0?" empty":"");
    d.textContent=n||"";
    board.appendChild(d);
  });
}

board.addEventListener("click",e=>{
  if(state!=="PLAYING"){ showHint(); return; }
});

let sx,sy;
board.addEventListener("touchstart",e=>{
  const t=e.touches[0];
  sx=t.clientX; sy=t.clientY;
});

board.addEventListener("touchend",e=>{
  if(state!=="PLAYING"){ showHint(); return; }
  const t=e.changedTouches[0];
  const dx=t.clientX-sx, dy=t.clientY-sy;
  if(Math.abs(dx)<30&&Math.abs(dy)<30)return;
  slide(dx,dy);
});

function slide(dx,dy){
  const e=tiles.indexOf(0);
  const er=Math.floor(e/size), ec=e%size;
  let target;
  if(Math.abs(dx)>Math.abs(dy))
    target=dx>0?er*size+size-1:er*size;
  else
    target=dy>0?(size-1)*size+ec:ec;
  moveTo(target);
}

function moveTo(t){
  let e=tiles.indexOf(0);
  const er=Math.floor(e/size), ec=e%size;
  const tr=Math.floor(t/size), tc=t%size;
  if(er!==tr&&ec!==tc)return;
  while(e!==t){
    const next=e+(tr===er?(tc>ec?1:-1):size*(tr>er?1:-1));
    tiles[e]=tiles[next];
    tiles[next]=0;
    e=next;
  }
  move.currentTime=0; move.play();
  render();
  check();
}

function check(){
  if(tiles.slice(0,-1).every((v,i)=>v===i+1)){
    clearInterval(timer);
    state="CLEAR";
    alert("🍫 SWEET CLEAR!");
    reset();
  }
}

function showHint(){
  hint.classList.remove("hidden");
  setTimeout(()=>hint.classList.add("hidden"),1000);
}

function updateBest(){
  bestEl.textContent=`🍫 BEST (${size}×${size}) : --`;
}

reset();
