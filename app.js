const board = document.getElementById("board");
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("playerName");
const affiliate = document.getElementById("affiliate");
const moveSound = document.getElementById("moveSound");

let size = 3;
let tiles = [];
let playing = false;
let startTime, timer;
let sx=0, sy=0, startIndex=null;

init();

/* ===== 初期化 ===== */
function init(){
  playing=false;
  clearInterval(timer);
  timeEl.textContent="time: --";
  tiles=[...Array(size*size).keys()];
  board.style.gridTemplateColumns=`repeat(${size},1fr)`;
  affiliate.classList.add("hidden");
  affiliate.classList.remove("show");
  render();
}

/* ===== サイズ ===== */
document.querySelectorAll(".sizes button").forEach(btn=>{
  btn.onclick=()=>{
    size=+btn.dataset.size;
    document.querySelectorAll(".sizes button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    init();
  };
});

startBtn.onclick=()=>!playing&&startGame();

/* ===== スタート ===== */
function startGame(){
  playing=true;
  shuffleSolvable();
  startTime=Date.now();
  timer=setInterval(()=>{
    timeEl.textContent=`time: ${Math.floor((Date.now()-startTime)/1000)}s`;
  },1000);

  if(size>=4){
    affiliate.classList.remove("hidden");
    setTimeout(()=>affiliate.classList.add("show"),800);
  }
  render();
}

/* ===== シャッフル ===== */
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

/* ===== 描画 ===== */
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
    const el=document.elementFromPoint(sx,sy);
    startIndex=el&&el.classList.contains("tile")?[...board.children].indexOf(el):null;
  };

  board.ontouchend=e=>{
    if(!playing||startIndex===null) return;
    const t=e.changedTouches[0];
    const dx=t.clientX-sx, dy=t.clientY-sy;
    if(Math.abs(dx)<30&&Math.abs(dy)<30) return;
    handleSlide(startIndex,Math.abs(dx)>Math.abs(dy)?(dx>0?"right":"left"):(dy>0?"down":"up"));
    startIndex=null;
  };
}

/* ===== 正しいスライド ===== */
function handleSlide(from,dir){
  const empty=tiles.indexOf(0);
  const fr=Math.floor(from/size), fc=from%size;
  const er=Math.floor(empty/size), ec=empty%size;
  let path=[];

  if(fr===er){
    if(fc>ec&&dir==="left") for(let c=ec+1;c<=fc;c++) path.push(er*size+c);
    if(fc<ec&&dir==="right") for(let c=ec-1;c>=fc;c--) path.push(er*size+c);
  }
  if(fc===ec){
    if(fr>er&&dir==="up") for(let r=er+1;r<=fr;r++) path.push(r*size+ec);
    if(fr<er&&dir==="down") for(let r=er-1;r>=fr;r--) path.push(r*size+ec);
  }
  if(!path.length) return;

  path.forEach(idx=>{
    const e=tiles.indexOf(0);
    [tiles[e],tiles[idx]]=[tiles[idx],tiles[e]];
  });

  moveSound.currentTime=0;
  moveSound.play();
  render();
  if(isCleared()) finish();
}

function clickMove(i){
  const e=tiles.indexOf(0);
  const fr=Math.floor(i/size), fc=i%size;
  const er=Math.floor(e/size), ec=e%size;
  if(fr===er) handleSlide(i,fc<ec?"right":"left");
  else if(fc===ec) handleSlide(i,fr<er?"down":"up");
}

function isCleared(){
  return tiles.slice(0,-1).every((v,i)=>v===i+1);
}

/* ===== クリア ===== */
function finish(){
  playing=false;
  clearInterval(timer);
  const t=Math.floor((Date.now()-startTime)/1000);
  const name=nameInput.value||"user";
  showClear(name,t);
  launchConfetti();
}

function showClear(name,time){
  document.getElementById("resultText").textContent=`${name} - ${time}s`;
  document.getElementById("clearModal").classList.remove("hidden");
}

function closeModal(){
  document.getElementById("clearModal").classList.add("hidden");
}

document.getElementById("retryBtn").onclick=()=>{
  closeModal();
  startGame();
};

/* ===== Share ===== */
document.getElementById("shareBtn").onclick=async()=>{
  const text=`Merosura ${size}×${size} をクリア！`;
  if(navigator.share){
    await navigator.share({title:"Merosura",text,url:location.href});
  }else{
    await navigator.clipboard.writeText(location.href);
    alert("URLをコピーしました");
  }
};

/* ===== 紙吹雪 ===== */
function launchConfetti(){
  const wrap=document.getElementById("confetti");
  wrap.innerHTML="";
  for(let i=0;i<80;i++){
    const p=document.createElement("div");
    p.className="confetti-piece";
    p.style.left=Math.random()*100+"vw";
    p.style.animationDelay=Math.random()*0.4+"s";
    p.style.setProperty("--hue",Math.random()*360);
    wrap.appendChild(p);
  }
  setTimeout(()=>wrap.innerHTML="",2000);
}
