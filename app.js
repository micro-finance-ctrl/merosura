const board = document.getElementById("board");
const startBtn = document.getElementById("startBtn");
const timeEl = document.getElementById("time");
const hint = document.getElementById("hint");
const bestEl = document.getElementById("best");

const idleAd = document.getElementById("idleAd");
const clearAd = document.getElementById("clearAd");
const clearModal = document.getElementById("clearModal");
const clearText = document.getElementById("clearText");
const retryBtn = document.getElementById("retryBtn");
const okBtn = document.getElementById("okBtn");

const moveSound = document.getElementById("moveSound");

const ADS = [
`<a href="https://px.a8.net/svt/ejp?a8mat=4AVF04+87B1LM+4QYG+66OZ5" rel="nofollow"><img src="https://www20.a8.net/svt/bgt?aid=260126644496&wid=002&eno=01&mid=s00000022156001039000&mc=1"></a>`,
`<a href="https://px.a8.net/svt/ejp?a8mat=4AVF04+61B9CQ+4EKC+631SX" rel="nofollow"><img src="https://www28.a8.net/svt/bgt?aid=260126644365&wid=002&eno=01&mid=s00000020550001022000&mc=1"></a>`,
`<a href="https://px.a8.net/svt/ejp?a8mat=4AVF04+4BE6FU+5SHA+5Z6WX" rel="nofollow"><img src="https://www20.a8.net/svt/bgt?aid=260126644261&wid=002&eno=01&mid=s00000027019001004000&mc=1"></a>`,
`<a href="https://px.a8.net/svt/ejp?a8mat=4AVF04+4RGVRU+NA2+62U35" rel="nofollow"><img src="https://www29.a8.net/svt/bgt?aid=260126644288&wid=002&eno=01&mid=s00000003017001021000&mc=1"></a>`
];
const pickAd = () => ADS[Math.floor(Math.random()*ADS.length)];

const SIZES = [3,4,5,6,7,8,9,10];
let size = 3;
let tiles = [];
let state = "IDLE";
let timer = null;
let startTime = 0;
let hintTimer = null;

const sizesEl = document.getElementById("sizes");
SIZES.forEach(s=>{
  const b = document.createElement("button");
  b.textContent = `${s}×${s}`;
  if (s === size) b.classList.add("active");
  b.onclick = ()=>{
    size = s;
    document.querySelectorAll("#sizes button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    reset();
  };
  sizesEl.appendChild(b);
});

function reset({autoStart=false} = {}){
  state = "IDLE";
  clearInterval(timer); timer = null;
  clearModal.classList.add("hidden");
  document.body.classList.remove("lock");

  startBtn.classList.add("pulse");
  board.classList.add("locked");
  timeEl.textContent = "⏱ --";

  tiles = [...Array(size*size).keys()];
  board.style.gridTemplateColumns = `repeat(${size},1fr)`;
  shuffle();
  render();
  updateBest();
  showIdleAd();

  if (autoStart) startGame();
}

startBtn.classList.add("pulse");
startBtn.onclick = ()=>{
  if (state !== "PLAYING") startGame();
};

function startGame(){
  state = "PLAYING";
  startBtn.classList.remove("pulse");
  board.classList.remove("locked");
  hideIdleAd();

  startTime = Date.now();
  timeEl.textContent = "⏱ 0s";

  moveSound.play().catch(()=>{});
  moveSound.pause();
  moveSound.currentTime = 0;

  timer = setInterval(()=>{
    timeEl.textContent = `⏱ ${Math.floor((Date.now()-startTime)/1000)}s`;
  },1000);
}

function shuffle(){
  do {
    tiles.sort(()=>Math.random()-0.5);
  } while (!isSolvable() || isSolved());
}

function isSolvable(){
  let inv = 0;
  for(let i=0;i<tiles.length;i++)
    for(let j=i+1;j<tiles.length;j++)
      if(tiles[i] && tiles[j] && tiles[i]>tiles[j]) inv++;
  if(size%2===1) return inv%2===0;
  const row = size - Math.floor(tiles.indexOf(0)/size);
  return row%2===0 ? inv%2===1 : inv%2===0;
}

function isSolved(){
  return tiles.slice(0,-1).every((v,i)=>v===i+1);
}

function render(){
  board.innerHTML="";
  tiles.forEach((n,i)=>{
    const d=document.createElement("div");
    d.className="tile"+(n===0?" empty":"");
    d.textContent=n||"";
    if(n!==0){
      d.onclick=()=>{
        if(state==="PLAYING") slideFromIndex(i);
        else if(state==="IDLE") showHint();
      };
    }
    board.appendChild(d);
  });
}

function slideFromIndex(i){
  if(state!=="PLAYING") return;
  const e=tiles.indexOf(0);
  const er=Math.floor(e/size), ec=e%size;
  const tr=Math.floor(i/size), tc=i%size;
  if(er!==tr && ec!==tc) return;

  const path=[];
  if(er===tr){
    const step=tc>ec?1:-1;
    for(let c=ec+step;c!==tc+step;c+=step) path.push(er*size+c);
  } else {
    const step=tr>er?1:-1;
    for(let r=er+step;r!==tr+step;r+=step) path.push(r*size+ec);
  }

  let pos=e;
  path.forEach(p=>{
    tiles[pos]=tiles[p];
    tiles[p]=0;
    pos=p;
  });

  moveSound.currentTime=0;
  moveSound.play();
  render();
  checkClear();
}

function checkClear(){
  if(isSolved()){
    clearInterval(timer);
    state="CLEAR";
    document.body.classList.add("lock");
    const t=Math.floor((Date.now()-startTime)/1000);
    saveBest(t);
    clearText.textContent=`${t}s`;
    showClearAd();
    clearModal.classList.remove("hidden");
  }
}

retryBtn.onclick=()=>{
  clearModal.classList.add("hidden");
  reset({autoStart:true});
};
okBtn.onclick=()=>{
  clearModal.classList.add("hidden");
  reset();
};

function showHint(){
  if(state!=="IDLE") return;
  clearTimeout(hintTimer);
  hint.classList.remove("hidden");
  hintTimer=setTimeout(()=>hint.classList.add("hidden"),1000);
}

function saveBest(t){
  const key=`best_${size}`;
  const prev=localStorage.getItem(key);
  if(!prev || t<+prev) localStorage.setItem(key,t);
}

function updateBest(){
  const b=localStorage.getItem(`best_${size}`);
  bestEl.textContent=`🍫 BEST (${size}×${size}) : ${b?b+"s":"--"}`;
}

function showIdleAd(){
  idleAd.classList.add("hidden");
  idleAd.innerHTML="";
  if(size>=4){
    idleAd.innerHTML=pickAd();
    idleAd.classList.remove("hidden");
  }
}

function hideIdleAd(){
  idleAd.classList.add("hidden");
  idleAd.innerHTML="";
}

function showClearAd(){
  clearAd.innerHTML="";
  if(size>=4) clearAd.innerHTML=pickAd();
}

let sx=0, sy=0;
board.addEventListener("touchstart",e=>{
  if(state!=="PLAYING") return;
  const t=e.touches[0];
  sx=t.clientX; sy=t.clientY;
},{passive:false});

board.addEventListener("touchmove",e=>{
  if(state==="PLAYING") e.preventDefault();
},{passive:false});

board.addEventListener("touchend",e=>{
  if(state!=="PLAYING") return;
  const t=e.changedTouches[0];
  const dx=t.clientX-sx, dy=t.clientY-sy;
  if(Math.abs(dx)<30 && Math.abs(dy)<30) return;

  const eidx=tiles.indexOf(0);
  const er=Math.floor(eidx/size), ec=eidx%size;
  const cell=board.clientWidth/size;

  if(Math.abs(dx)>Math.abs(dy)){
    const steps=Math.round(dx/cell);
    const tc=ec+steps;
    if(tc>=0 && tc<size) slideFromIndex(er*size+tc);
  } else {
    const steps=Math.round(dy/cell);
    const tr=er+steps;
    if(tr>=0 && tr<size) slideFromIndex(tr*size+ec);
  }
});

reset();
