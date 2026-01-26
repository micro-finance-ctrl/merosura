const board = document.getElementById("board");
const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("playerName");
const timeEl = document.getElementById("time");
const affiliate = document.getElementById("affiliate");
const moveSound = document.getElementById("moveSound");

let size = 3, tiles = [], playing = false;
let startTime, timer;

/* 名前必須 */
nameInput.addEventListener("input", () => {
  startBtn.disabled = nameInput.value.trim() === "";
});

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

/* 初期化 */
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
init();

/* スタート */
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

/* 移動（基本） */
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

/* クリア */
function finish(){
  playing=false;
  clearInterval(timer);
  const time=Math.floor((Date.now()-startTime)/1000);
  document.getElementById("clearMainResult").textContent=
    `${nameInput.value} - ${time}s`;
  document.getElementById("clearBadge").textContent="🎉 自己ベスト！";
  document.getElementById("selfRankText").textContent="👤 自己ランキング：1位";
  document.getElementById("worldRankText").textContent="🌍 世界ランキング：1位";
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
