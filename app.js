const board = document.getElementById("board");
const timeEl = document.getElementById("time");
const affiliate = document.getElementById("affiliate");
const nameInput = document.getElementById("playerName");
const startBtn = document.getElementById("startBtn");

let size = 3;
let tiles = [];
let startTime = null;
let timer = null;
let playing = false;

/* 初期表示 */
initBoard();

/* サイズ選択 */
document.querySelectorAll(".sizes button").forEach(btn => {
  btn.onclick = () => {
    size = Number(btn.dataset.size);
    document.querySelectorAll(".sizes button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    initBoard();
  };
});

/* START */
startBtn.onclick = () => {
  if (!playing) startGame();
};

function initBoard() {
  playing = false;
  clearInterval(timer);
  timeEl.textContent = "time: --:--";
  tiles = [...Array(size * size).keys()];
  board.style.gridTemplateColumns = `repeat(${size},1fr)`;
  render();
  affiliate.classList.toggle("hidden", size <= 5);
}

function startGame() {
  playing = true;
  shuffle();
  startTime = Date.now();
  timer = setInterval(updateTime, 1000);
  render();
}

function updateTime() {
  const t = Math.floor((Date.now() - startTime) / 1000);
  timeEl.textContent = `time: ${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`;
}

function shuffle() {
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
}

function render() {
  board.innerHTML = "";
  tiles.forEach((n,i)=>{
    const d=document.createElement("div");
    d.className=n===0?"tile empty":"tile";
    d.textContent=n||"";
    d.onclick=()=>playing && move(i);
    board.appendChild(d);
  });
}

function move(i) {
  const e=tiles.indexOf(0);
  const ok=Math.abs(i%size-e%size)+Math.abs(Math.floor(i/size)-Math.floor(e/size))===1;
  if(!ok)return;
  [tiles[i],tiles[e]]=[tiles[e],tiles[i]];
  document.getElementById("moveSound").play();
  render();
  if(tiles.slice(0,-1).every((v,i)=>v===i+1)) finish();
}

function finish() {
  playing=false;
  clearInterval(timer);
  const t=Math.floor((Date.now()-startTime)/1000);
  const name=nameInput.value||"no-name";
  document.getElementById("resultText").textContent=`${name} : ${t}s (${size}×${size})`;
  document.getElementById("clearModal").classList.remove("hidden");
}

/* SNS SHARE */
const url=location.href;
function shareX(){window.open(`https://twitter.com/intent/tweet?text=Merosuraで遊んでみて🍫&url=${url}`);}
function shareLine(){window.open(`https://social-plugins.line.me/lineit/share?url=${url}`);}
function shareIG(){alert("Instagramは画像投稿がおすすめ！スクショしてシェアしてね📸");}
function shareTikTok(){alert("TikTokで #Merosura を付けて紹介してね🎵");}

function closeModal(){
  document.getElementById("clearModal").classList.add("hidden");
}
