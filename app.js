const board = document.getElementById("board");
const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("playerName");
const timeEl = document.getElementById("time");
const moveSound = document.getElementById("moveSound");
const tapHint = document.getElementById("tapHint");

let size = 3;
let tiles = [];
let playing = false;
let startTime, timer;

/* 名前復元 */
const savedName = localStorage.getItem("merosura_name");
if (savedName) nameInput.value = savedName;

/* スクロール防止 */
board.addEventListener("touchmove", e => e.preventDefault(), { passive:false });

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
startBtn.onclick = ()=>{
  const name = nameInput.value.trim() || "user";
  localStorage.setItem("merosura_name", name);
  if (!playing) startGame();
};

/* 初期化 */
function init(){
  playing = false;
  clearInterval(timer);
  timeEl.textContent = "time: --";
  tiles = [...Array(size*size).keys()];
  board.style.gridTemplateColumns = `repeat(${size},1fr)`;
  render();
}
init();

/* 開始 */
function startGame(){
  // START後はヒントを完全無効化
  if (tapHint) tapHint.remove();

  playing = true;
  shuffleSolvable();
  startTime = Date.now();
  timer = setInterval(()=>{
    timeEl.textContent = `time: ${Math.floor((Date.now()-startTime)/1000)}s`;
  },1000);
  render();
}

/* 必ず解けるシャッフル */
function shuffleSolvable(){
  do { tiles.sort(()=>Math.random()-0.5); } while(!isSolvable());
}
function isSolvable(){
  let inv = 0;
  for(let i=0;i<tiles.length;i++){
    for(let j=i+1;j<tiles.length;j++){
      if(tiles[i] && tiles[j] && tiles[i] > tiles[j]) inv++;
    }
  }
  if(size % 2 === 1) return inv % 2 === 0;
  const rowFromBottom = size - Math.floor(tiles.indexOf(0)/size);
  return rowFromBottom % 2 === 0 ? inv % 2 === 1 : inv % 2 === 0;
}

/* 描画（PCクリック） */
function render(){
  board.innerHTML = "";
  tiles.forEach((n,i)=>{
    const d = document.createElement("div");
    d.className = n===0 ? "tile empty" : "tile";
    d.textContent = n || "";

    if(n !== 0){
      d.onclick = ()=>{
        if (!playing) {
          showTapHint();
          return;
        }
        slideByIndex(i);
      };
    }

    board.appendChild(d);
  });
}

/* ④ 行動で理解させるヒント */
function showTapHint(){
  if (!tapHint || !tapHint.classList.contains("hidden")) return;
  tapHint.classList.remove("hidden");
  setTimeout(()=> tapHint.classList.add("hidden"), 1000);
}

/* ===== 距離無制限・ごまかしゼロ ===== */
function slideByIndex(targetIndex){
  if (!playing) return;

  let emptyIndex = tiles.indexOf(0);
  const er = Math.floor(emptyIndex / size);
  const ec = emptyIndex % size;
  const tr = Math.floor(targetIndex / size);
  const tc = targetIndex % size;

  if (er !== tr && ec !== tc) return;
  if (targetIndex === emptyIndex) return;

  const path = [];
  if (er === tr) {
    const step = tc > ec ? 1 : -1;
    for (let c = ec + step; c !== tc + step; c += step) {
      path.push(er * size + c);
    }
  } else {
    const step = tr > er ? 1 : -1;
    for (let r = er + step; r !== tr + step; r += step) {
      path.push(r * size + ec);
    }
  }

  let empty = emptyIndex;
  for (const i of path) {
    tiles[empty] = tiles[i];
    tiles[i] = 0;
    empty = i;
  }

  moveSound.currentTime = 0;
  moveSound.play();
  render();

  if (tiles.slice(0,-1).every((v,i)=>v===i+1)) finish();
}

/* スマホ：スワイプ → 端まで指定 */
let sx=0, sy=0;
board.addEventListener("touchstart", e=>{
  const t = e.touches[0];
  sx = t.clientX; sy = t.clientY;
});
board.addEventListener("touchend", e=>{
  if(!playing) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - sx;
  const dy = t.clientY - sy;
  if(Math.abs(dx)<30 && Math.abs(dy)<30) return;

  const empty = tiles.indexOf(0);
  const er = Math.floor(empty/size);
  const ec = empty % size;

  let target = null;
  if(Math.abs(dx) > Math.abs(dy)){
    if(dx > 0 && ec > 0) target = er*size + (size-1);
    if(dx < 0 && ec < size-1) target = er*size;
  } else {
    if(dy > 0 && er > 0) target = (size-1)*size + ec;
    if(dy < 0 && er < size-1) target = ec;
  }
  if(target !== null) slideByIndex(target);
});

/* クリア */
function finish(){
  playing=false;
  clearInterval(timer);

  const time = Math.floor((Date.now()-startTime)/1000);
  const name = nameInput.value.trim() || "user";

  document.getElementById("clearBadge").textContent = "";
  document.getElementById("clearMainResult").textContent = `${name} - ${time}s`;
  document.getElementById("selfRankText").textContent = "";

  document.getElementById("clearModal").classList.remove("hidden");
  launchConfetti();
}

/* クリア操作 */
document.getElementById("retryBtn").onclick = ()=>{ closeModal(); startGame(); };
document.getElementById("okBtn").onclick = closeModal;
document.getElementById("shareBtn").onclick = async()=>{
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
  const c = document.getElementById("confetti");
  c.innerHTML="";
  for(let i=0;i<80;i++){
    const p = document.createElement("div");
    p.className="confetti-piece";
    p.style.left=Math.random()*100+"vw";
    p.style.setProperty("--hue",Math.random()*360);
    c.appendChild(p);
  }
  setTimeout(()=>c.innerHTML="",2000);
}
