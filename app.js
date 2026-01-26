const board = document.getElementById("board");
const timeEl = document.getElementById("time");
const affiliate = document.getElementById("affiliate");
const nameInput = document.getElementById("playerName");
const startBtn = document.getElementById("startBtn");
const moveSound = document.getElementById("moveSound");

let size = 3;
let tiles = [];
let playing = false;
let startTime = null;
let timer = null;

// swipe
let sx = 0, sy = 0;

/* init */
initBoard();

/* size select */
document.querySelectorAll(".sizes button").forEach(btn=>{
  btn.onclick=()=>{
    size = Number(btn.dataset.size);
    document.querySelectorAll(".sizes button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    initBoard();
  };
});

/* start */
startBtn.onclick=()=>{
  if(!playing) startGame();
};

function initBoard(){
  playing=false;
  clearInterval(timer);
  timeEl.textContent="time: --:--";
  tiles=[...Array(size*size).keys()];
  board.style.gridTemplateColumns=`repeat(${size},1fr)`;
  render();
  affiliate.classList.add("hidden");
}

function startGame(){
  playing=true;
  shuffleSolvable();
  startTime=Date.now();
  timer=setInterval(updateTime,1000);
  if(size>=6) affiliate.classList.remove("hidden");
  render();
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
  return rowFromBottom%2===0 ? inv%2===1 : inv%2===0;
}

function updateTime(){
  const t=Math.floor((Date.now()-startTime)/1000);
  timeEl.textContent=`time: ${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`;
}

/* render */
function render(){
  board.innerHTML="";
  tiles.forEach((n,i)=>{
    const d=document.createElement("div");
    d.className=n===0?"tile empty":"tile";
    d.textContent=n||"";
    d.onclick=()=>playing&&slideByClick(i);
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
      dx>0?slide("right"):slide("left");
    }else{
      dy>0?slide("down"):slide("up");
    }
  };
}

/* slide logic */
function slide(dir){
  let moved=false;
  const e=tiles.indexOf(0);
  const r=Math.floor(e/size), c=e%size;

  if(dir==="left"){
    for(let x=c+1;x<size;x++){ tiles[r*size+x-1]=tiles[r*size+x]; tiles[r*size+x]=0; moved=true; }
  }
  if(dir==="right"){
    for(let x=c-1;x>=0;x--){ tiles[r*size+x+1]=tiles[r*size+x]; tiles[r*size+x]=0; moved=true; }
  }
  if(dir==="up"){
    for(let y=r+1;y<size;y++){ tiles[(y-1)*size+c]=tiles[y*size+c]; tiles[y*size+c]=0; moved=true; }
  }
  if(dir==="down"){
    for(let y=r-1;y>=0;y--){ tiles[(y+1)*size+c]=tiles[y*size+c]; tiles[y*size+c]=0; moved=true; }
  }

  if(moved){
    moveSound.currentTime=0;
    moveSound.play();
    render();
    if(isCleared()) finish();
  }
}

function slideByClick(i){
  const e=tiles.indexOf(0);
  const r1=Math.floor(i/size), c1=i%size;
  const r2=Math.floor(e/size), c2=e%size;
  if(r1===r2) slide(c1<c2?"right":"left");
  if(c1===c2) slide(r1<r2?"down":"up");
}

function isCleared(){
  return tiles.slice(0,-1).every((v,i)=>v===i+1);
}

function finish(){
  playing=false;
  clearInterval(timer);
  const t=Math.floor((Date.now()-startTime)/1000);
  const name=nameInput.value||"no-name";
  savePersonal(size,name,t);
  updateRanking();
  document.getElementById("resultText").textContent=
    `${name} : ${t}s (${size}×${size})`;
  document.getElementById("clearModal").classList.remove("hidden");
}

/* ranking */
function savePersonal(size,name,time){
  const key=`best_${size}`;
  const arr=JSON.parse(localStorage.getItem(key)||"[]");
  arr.push({name,time});
  arr.sort((a,b)=>a.time-b.time);
  localStorage.setItem(key,JSON.stringify(arr.slice(0,5)));
}

function updateRanking(){
  const p=document.getElementById("rank-personal");
  p.innerHTML="";
  (JSON.parse(localStorage.getItem(`best_${size}`)||[]))
    .forEach(r=>p.innerHTML+=`<li>${r.name} - ${r.time}s</li>`);
}

function closeModal(){
  document.getElementById("clearModal").classList.add("hidden");
}
