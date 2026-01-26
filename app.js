const board = document.getElementById("board");
const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("playerName");
const timeEl = document.getElementById("time");
const moveSound = document.getElementById("moveSound");

const rankingBtn = document.getElementById("openRanking");
const rankingScreen = document.getElementById("rankingScreen");
const closeRankingBtn = document.getElementById("closeRanking");
const rankList = document.getElementById("rankList");

let size = 3, tiles = [], playing = false;
let startTime, timer;

/* 名前必須 */
nameInput.addEventListener("input", () => {
  startBtn.disabled = nameInput.value.trim() === "";
});

/* ランキング */
rankingBtn.onclick = () => {
  loadRanking();
  rankingScreen.classList.remove("hidden");
};
closeRankingBtn.onclick = () => rankingScreen.classList.add("hidden");

/* サイズ */
document.querySelectorAll(".sizes button").forEach(btn=>{
  btn.onclick=()=>{
    size=+btn.dataset.size;
    document.querySelectorAll(".sizes button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    init();
  };
});

startBtn.onclick=()=>!playing&&startGame();

function init(){
  playing=false;
  clearInterval(timer);
  timeEl.textContent="time: --";
  tiles=[...Array(size*size).keys()];
  board.style.gridTemplateColumns=`repeat(${size},1fr)`;
  render();
}
init();

/* スタート */
function startGame(){
  playing=true;
  shuffleSolvable();
  startTime=Date.now();
  timer=setInterval(()=>{
    timeEl.textContent=`time: ${Math.floor((Date.now()-startTime)/1000)}s`;
  },1000);
  render();
}

/* シャッフル */
function shuffleSolvable(){
  do{ tiles.sort(()=>Math.random()-0.5); }while(!isSolvable());
}
function isSolvable(){
  let inv=0;
  for(let i=0;i<tiles.length;i++)
    for(let j=i+1;j<tiles.length;j++)
      if(tiles[i]&&tiles[j]&&tiles[i]>tiles[j]) inv++;
  if(size%2===1) return inv%2===0;
  const row=size-Math.floor(tiles.indexOf(0)/size);
  return row%2===0?inv%2===1:inv%2===0;
}

/* 描画 */
function render(){
  board.innerHTML="";
  tiles.forEach((n,i)=>{
    const d=document.createElement("div");
    d.className=n===0?"tile empty":"tile";
    d.textContent=n||"";
    d.onclick=()=>playing&&move(i);
    board.appendChild(d);
  });
}

/* 移動 */
function move(i){
  const e=tiles.indexOf(0);
  const fr=Math.floor(i/size),fc=i%size;
  const er=Math.floor(e/size),ec=e%size;
  if(fr===er||fc===ec){
    [tiles[i],tiles[e]]=[tiles[e],tiles[i]];
    moveSound.currentTime=0; moveSound.play();
    render();
    if(tiles.slice(0,-1).every((v,i)=>v===i+1)) finish();
  }
}

/* ランキング保存 */
function saveRecord(name,time){
  const key=`rank_${size}`;
  const list=JSON.parse(localStorage.getItem(key)||"[]");
  list.push({name,time});
  list.sort((a,b)=>a.time-b.time);
  localStorage.setItem(key,JSON.stringify(list.slice(0,20)));
  return list.findIndex(r=>r.name===name&&r.time===time)+1;
}

function loadRanking(){
  const key=`rank_${size}`;
  const list=JSON.parse(localStorage.getItem(key)||"[]");
  rankList.innerHTML="";
  list.forEach((r,i)=>{
    rankList.innerHTML+=`<li>${i+1}. ${r.name} - ${r.time}s</li>`;
  });
}

/* クリア */
function finish(){
  playing=false;
  clearInterval(timer);
  const time=Math.floor((Date.now()-startTime)/1000);
  const name=nameInput.value;
  const rank=saveRecord(name,time);

  document.getElementById("clearBadge").textContent=
    rank===1 ? "🎉 自己ベスト更新！" : "";
  document.getElementById("clearMainResult").textContent=
    `${name} - ${time}s`;
  document.getElementById("selfRankText").textContent=
    `この端末での順位：${rank}位`;

  document.getElementById("clearModal").classList.remove("hidden");
  launchConfetti();
}

/* クリア操作 */
document.getElementById("retryBtn").onclick=()=>{ closeModal(); startGame(); };
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
