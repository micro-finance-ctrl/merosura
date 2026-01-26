const board = document.getElementById("board");
const movesEl = document.getElementById("moves");
const timeEl = document.getElementById("time");
const affiliate = document.getElementById("affiliate");

let size = 4;
let tiles = [];
let moves = 0;
let startTime = 0;
let timer;

const badges = {
  5: "🍫 Sweet Solver",
  7: "🔥 Bitter Challenger",
  10: "👑 Cocoa Master"
};

document.querySelectorAll(".sizes button").forEach(btn => {
  btn.onclick = () => start(Number(btn.dataset.size));
});

start(size);

function start(n) {
  size = n;
  moves = 0;
  movesEl.textContent = "moves: 0";
  startTime = Date.now();

  clearInterval(timer);
  timer = setInterval(updateTime, 1000);

  tiles = [...Array(size * size).keys()];
  shuffleSolvable();

  board.style.gridTemplateColumns = `repeat(${size},1fr)`;
  board.style.setProperty("--size", size);

  render();
  affiliate.classList.toggle("hidden", size <= 5);
}

function updateTime() {
  const t = Math.floor((Date.now() - startTime) / 1000);
  timeEl.textContent = `time: ${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`;
}

function shuffleSolvable() {
  do {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  } while (!isSolvable());
}

function isSolvable() {
  let inv = 0;
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] && tiles[j] && tiles[i] > tiles[j]) inv++;
    }
  }
  if (size % 2) return inv % 2 === 0;
  const row = size - Math.floor(tiles.indexOf(0) / size);
  return (row % 2 === 0) !== (inv % 2 === 0);
}

function render() {
  board.innerHTML = "";
  tiles.forEach((n,i)=>{
    const d=document.createElement("div");
    if(n===0){d.className="tile empty";}
    else{
      d.className="tile";
      d.textContent=n;
      d.onclick=()=>move(i);
    }
    board.appendChild(d);
  });
}

function move(i) {
  const e=tiles.indexOf(0);
  const ok=Math.abs(i%size-e%size)+Math.abs(Math.floor(i/size)-Math.floor(e/size))===1;
  if(!ok)return;
  [tiles[i],tiles[e]]=[tiles[e],tiles[i]];
  moves++;
  movesEl.textContent=`moves: ${moves}`;
  playMoveSound();
  render();
  if(isCleared()) showClear();
}

function isCleared(){
  return tiles.slice(0,-1).every((v,i)=>v===i+1);
}

function showClear(){
  clearInterval(timer);

  document.getElementById("shareSize").textContent = `${size}×${size} CLEARED`;
  document.getElementById("shareTime").textContent = timeEl.textContent;
  document.getElementById("shareMoves").textContent = `moves: ${moves}`;

  let b="";
  if(badges[size]){
    localStorage.setItem(`badge_${size}`,"true");
    b=`badge unlocked: ${badges[size]}`;
  }
  document.getElementById("clearBadge").textContent=b;
  document.getElementById("clearModal").classList.remove("hidden");
}

function closeModal(){
  document.getElementById("clearModal").classList.add("hidden");
}

function playMoveSound(){
  const s=document.getElementById("moveSound");
  s.volume=0.25;
  s.currentTime=0;
  s.play();
}

function shareImage(){
  const card=document.getElementById("shareCard");
  html2canvas(card,{scale:2}).then(c=>{
    c.toBlob(b=>{
      const f=new File([b],"merosura.png",{type:"image/png"});
      if(navigator.share && navigator.canShare({files:[f]})){
        navigator.share({
          files:[f],
          text:`I cleared ${size}×${size} in Merosura 🍫`,
          title:"Merosura"
        });
      }else{
        const a=document.createElement("a");
        a.href=URL.createObjectURL(b);
        a.download="merosura.png";
        a.click();
      }
    });
  });
}
