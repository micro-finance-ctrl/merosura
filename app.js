const board = document.getElementById("board");
const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("playerName");
const timeEl = document.getElementById("time");
const moveSound = document.getElementById("moveSound");
const tapHint = document.getElementById("tapHint");
const bestEl = document.getElementById("bestRecord");

const isTouch = "ontouchstart" in window;

let size = 3;
let tiles = [];
let playing = false;
let startTime, timer;

/* 名前復元 */
const savedName = localStorage.getItem("merosura_name");
if (savedName) nameInput.value = savedName;

/* サイズ変更 */
document.querySelectorAll(".sizes button").forEach(btn=>{
  btn.onclick = ()=>{
    size = +btn.dataset.size;
    document.querySelectorAll(".sizes button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    init();
  };
});

/* START */
startBtn.classList.add("pulse");
startBtn.onclick = ()=>{
  localStorage.setItem("merosura_name", nameInput.value.trim() || "user");
  if (!playing) startGame();
};

/* 初期化 */
function init(){
  playing = false;
  clearInterval(timer);
  board.classList.add("locked");
  timeEl.textContent = "time: --";
  tiles = [...Array(size*size).keys()];
  board.style.gridTemplateColumns = `repeat(${size},1fr)`;
  render();
  updateBestDisplay();
}
init();

/* START */
function startGame(){
  startBtn.classList.remove("pulse");
  board.classList.remove("locked");
  playing = true;
  shuffleSolvable();
  startTime = Date.now();
  timer = setInterval(()=>{
    timeEl.textContent = `time: ${Math.floor((Date.now()-startTime)/1000)}s`;
  },1000);
  render();
}

/* シャッフル */
function shuffleSolvable(){
  do { tiles.sort(()=>Math.random()-0.5); } while(!isSolvable());
}
function isSolvable(){
  let inv=0;
  for(let i=0;i<tiles.length;i++)
    for(let j=i+1;j<tiles.length;j++)
      if(tiles[i] && tiles[j] && tiles[i]>tiles[j]) inv++;
  if(size%2===1) return inv%2===0;
  const rowFromBottom = size - Math.floor(tiles.indexOf(0)/size);
  return rowFromBottom%2===0 ? inv%2===1 : inv%2===0;
}

/* 描画 */
function render(){
  board.innerHTML="";
  tiles.forEach((n,i)=>{
    const d=document.createElement("div");
    d.className = n===0 ? "tile empty" : "tile";
    d.textContent = n||"";

    if(n!==0){
      d.onclick = ()=>{
        if (isTouch) return;
        if (!playing) { showTapHint(); return; }
        slideByIndex(i);
      };
    }
    board.appendChild(d);
  });
}

/* START前理由表示（毎回） */
function showTapHint(){
  if (!tapHint.classList.contains("hidden")) return;
  tapHint.classList.remove("hidden");
  setTimeout(()=>tapHint.classList.add("hidden"),1000);
}

/* 距離無制限スライド */
function slideByIndex(target){
  if(!playing) return;
  let empty=tiles.indexOf(0);
  const er=Math.floor(empty/size), ec=empty%size;
  const tr=Math.floor(target/size), tc=target%size;
  if(er!==tr && ec!==tc) return;

  const path=[];
  if(er===tr){
    const step = tc>ec?1:-1;
    for(let c=ec+step;c!==tc+step;c+=step) path.push(er*size+c);
  }else{
    const step = tr>er?1:-1;
    for(let r=er+step;r!==tr+step;r+=step) path.push(r*size+ec);
  }
  for(const i of path){
    tiles[empty]=tiles[i];
    tiles[i]=0;
    empty=i;
  }
  moveSound.currentTime=0;
  moveSound.play();
  render();
  if(tiles.slice(0,-1).every((v,i)=>v===i+1)) finish();
}

/* スワイプ操作（スマホ） */
let sx=0, sy=0;
board.addEventListener("touchstart",e=>{
  const t=e.touches[0];
  sx=t.clientX; sy=t.clientY;
});
board.addEventListener("touchend",e=>{
  if(!playing) { showTapHint(); return; }
  const t=e.changedTouches[0];
  const dx=t.clientX-sx, dy=t.clientY-sy;
  if(Math.abs(dx)<30 && Math.abs(dy)<30) return;
  const empty=tiles.indexOf(0);
  const er=Math.floor(empty/size), ec=empty%size;
  let target=null;
  if(Math.abs(dx)>Math.abs(dy)){
    target = dx>0 ? er*size+(size-1) : er*size;
  }else{
    target = dy>0 ? (size-1)*size+ec : ec;
  }
  slideByIndex(target);
});

/* 自己ベスト表示 */
function updateBestDisplay(){
  const key=`rank_${size}`;
  const list=JSON.parse(localStorage.getItem(key)||"[]");
  bestEl.textContent = list.length
    ? `BEST (${size}×${size}) : ${list[0].time}s`
    : `BEST (${size}×${size}) : --`;
}

/* クリア */
function finish(){
  playing=false;
  clearInterval(timer);
  const time=Math.floor((Date.now()-startTime)/1000);
  const name=nameInput.value.trim()||"user";
  const key=`rank_${size}`;
  const list=JSON.parse(localStorage.getItem(key)||"[]");
  list.push({name,time});
  list.sort((a,b)=>a.time-b.time);
  localStorage.setItem(key,JSON.stringify(list.slice(0,20)));
  updateBestDisplay();

  document.getElementById("clearMainResult").textContent=`${name} - ${time}s`;
  document.getElementById("clearModal").classList.remove("hidden");
  launchConfetti();
}

/* クリア操作 */
document.getElementById("retryBtn").onclick=()=>{closeModal();startGame();};
document.getElementById("okBtn").onclick=closeModal;
document.getElementById("shareBtn").onclick=async()=>{
  if(navigator.share){
    await navigator.share({title:"Merosura",url:location.href});
  }else{
    await navigator.clipboard.writeText(location.href);
    alert("URLをコピーしました");
  }
};
function closeModal(){
  document.getElementById("clearModal").classList.add("hidden");
}

/* 紙吹雪 */
function launchConfetti(){
  const c=document.getElementById("confetti");
  c.innerHTML="";
  for(let i=0;i<80;i++){
    const p=document.createElement("div");
    p.className="confetti-piece";
    p.style.left=Math.random()*100+"vw";
    p.style.setProperty("--hue",Math.random()*360);
    c.appendChild(p);
  }
  setTimeout(()=>c.innerHTML="",2000);
}
