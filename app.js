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

/* 初期表示（3×3・未開始） */
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
  tiles = [...Array(size * size).keys()]; // 0は空白
  board.style.gridTemplateColumns = `repeat(${size},1fr)`;
  render();
  affiliate.classList.toggle("hidden", size <= 5);
}

/* ====== ここが重要：必ず解けるシャッフル ====== */
function startGame() {
  playing = true;
  shuffleSolvable();
  startTime = Date.now();
  timer = setInterval(updateTime, 1000);
  render();
}

function shuffleSolvable() {
  do {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  } while (!isSolvable());
}

/* 解けるか判定（全サイズ対応） */
function isSolvable() {
  let inv = 0;
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] && tiles[j] && tiles[i] > tiles[j]) inv++;
    }
  }
  // 奇数サイズ
  if (size % 2 === 1) return inv % 2 === 0;

  // 偶数サイズ
  const emptyRowFromBottom = size - Math.floor(tiles.indexOf(0) / size);
  return emptyRowFromBottom % 2 === 0 ? inv % 2 === 1 : inv % 2 === 0;
}
/* ============================================== */

function updateTime() {
  const t = Math.floor((Date.now() - startTime) / 1000);
  timeEl.textContent = `time: ${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`;
}

function render() {
  board.innerHTML = "";
  tiles.forEach((n,i)=>{
    const d=document.createElement("div");
    d.className = n===0 ? "tile empty" : "tile";
    d.textContent = n || "";
    d.onclick = () => playing && move(i);
    board.appendChild(d);
  });
}

function move(i) {
  const e = tiles.indexOf(0);
  const ok = Math.abs(i%size - e%size) + Math.abs(Math.floor(i/size) - Math.floor(e/size)) === 1;
  if (!ok) return;
  [tiles[i], tiles[e]] = [tiles[e], tiles[i]];
  const s = document.getElementById("moveSound");
  s.currentTime = 0; s.play();
  render();
  if (isCleared()) finish();
}

function isCleared() {
  return tiles.slice(0,-1).every((v,i)=>v===i+1);
}

function finish() {
  playing = false;
  clearInterval(timer);
  const t = Math.floor((Date.now()-startTime)/1000);
  const name = nameInput.value || "no-name";
  document.getElementById("resultText").textContent = `${name} : ${t}s (${size}×${size})`;
  savePersonal(size, name, t);
  showRanks(size);
  document.getElementById("clearModal").classList.remove("hidden");
}

/* 自己ベスト（ローカル） */
function savePersonal(size, name, time) {
  const key = `best_${size}`;
  const arr = JSON.parse(localStorage.getItem(key) || "[]");
  arr.push({name, time});
  arr.sort((a,b)=>a.time-b.time);
  localStorage.setItem(key, JSON.stringify(arr.slice(0,5)));
}

function showRanks(size) {
  const p = document.getElementById("personalRank");
  p.innerHTML = "";
  (JSON.parse(localStorage.getItem(`best_${size}`)||"[]"))
    .forEach(r=>p.innerHTML+=`<li>${r.name} - ${r.time}s</li>`);

  const w = document.getElementById("worldRank");
  w.innerHTML = "";
  [{name:"world1",time:10},{name:"world2",time:12},{name:"world3",time:15}]
    .forEach(r=>w.innerHTML+=`<li>${r.name} - ${r.time}s</li>`);
}

function closeModal(){
  document.getElementById("clearModal").classList.add("hidden");
}

/* SNS */
const url = location.href;
function shareX(){ window.open(`https://twitter.com/intent/tweet?text=Merosuraで遊んでみて🍫&url=${url}`); }
function shareLine(){ window.open(`https://social-plugins.line.me/lineit/share?url=${url}`); }
function shareIG(){ alert("Instagramはスクショ投稿がおすすめ📸"); }
function shareTikTok(){ alert("TikTokで #Merosura を付けて紹介してね🎵"); }
