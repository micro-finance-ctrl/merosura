/* ===== TIME FORMAT ===== */
function formatTime(sec){
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}時間${m}分${s}秒`;
}

/* ===== ELEMENTS ===== */
const board = document.getElementById("board");
const startBtn = document.getElementById("startBtn");
const timeEl = document.getElementById("time");
const hint = document.getElementById("hint");
const bestEl = document.getElementById("best");
const idleAd = document.getElementById("idleAd");
const clearAd = document.getElementById("clearAd");
const clearModal = document.getElementById("clearModal");
const clearText = document.getElementById("clearText");
const rankBtn = document.getElementById("rankBtn");
const rankModal = document.getElementById("rankModal");
const rankList = document.getElementById("rankList");
const rankClose = document.getElementById("rankClose");
const retryBtn = document.getElementById("retryBtn");
const okBtn = document.getElementById("okBtn");
const moveSound = document.getElementById("moveSound");
const nameInput = document.getElementById("playerName");

/* SHARE */
const shareX = document.getElementById("shareX");
const shareLINE = document.getElementById("shareLINE");
const shareFB = document.getElementById("shareFB");
const shareIG = document.getElementById("shareIG");
const shareTT = document.getElementById("shareTT");

/* ADS */
const ADS = [
`<a href="https://px.a8.net/svt/ejp?a8mat=4AVF04+87B1LM+4QYG+66OZ5" rel="nofollow"><img src="https://www20.a8.net/svt/bgt?aid=260126644496&wid=002&eno=01&mid=s00000022156001039000&mc=1"></a>`,
`<a href="https://px.a8.net/svt/ejp?a8mat=4AVF04+61B9CQ+4EKC+631SX" rel="nofollow"><img src="https://www28.a8.net/svt/bgt?aid=260126644365&wid=002&eno=01&mid=s00000020550001022000&mc=1"></a>`,
`<a href="https://px.a8.net/svt/ejp?a8mat=4AVF04+4BE6FU+5SHA+5Z6WX" rel="nofollow"><img src="https://www20.a8.net/svt/bgt?aid=260126644261&wid=002&eno=01&mid=s00000027019001004000&mc=1"></a>`,
`<a href="https://px.a8.net/svt/ejp?a8mat=4AVF04+4RGVRU+NA2+62U35" rel="nofollow"><img src="https://www29.a8.net/svt/bgt?aid=260126644288&wid=002&eno=01&mid=s00000003017001021000&mc=1"></a>`
];
const pickAd = () => ADS[Math.floor(Math.random()*ADS.length)];

/* GAME STATE */
const SIZES = [3,4,5,6,7,8,9,10];
let size = 3;
let tiles = [];
let state = "IDLE";
let timer = null;
let startTime = 0;
const getName = () => nameInput.value.trim() || "USER";

/* SIZE BUTTONS */
const sizesEl = document.getElementById("sizes");
SIZES.forEach(s=>{
  const b=document.createElement("button");
  b.textContent=`${s}×${s}`;
  if(s===size) b.classList.add("active");
  b.onclick=()=>{ size=s; document.querySelectorAll("#sizes button").forEach(x=>x.classList.remove("active")); b.classList.add("active"); reset(); };
  sizesEl.appendChild(b);
});

/* STATE */
function setState(s){
  state=s;
  hint.classList.toggle("hidden", s!=="IDLE");
  idleAd.classList.toggle("hidden", !(s==="IDLE" && size>=4));
  clearModal.classList.toggle("hidden", s!=="CLEAR");
}

/* RESET */
function reset(){
  clearInterval(timer);
  timer=null;
  timeEl.textContent=`⏱ ${formatTime(0)}`;
  setState("IDLE");
  tiles=[...Array(size*size).keys()];
  board.style.gridTemplateColumns=`repeat(${size},1fr)`;
  shuffle();
  render();
  updateBest();
  idleAd.innerHTML = size>=4 ? pickAd() : "";
}

/* START */
startBtn.onclick=()=>{
  if(state!=="IDLE") return;
  setState("PLAYING");
  startTime=Date.now();
  timer=setInterval(()=>{
    const sec=Math.floor((Date.now()-startTime)/1000);
    timeEl.textContent=`⏱ ${formatTime(sec)}`;
  },1000);
};

/* SHUFFLE & SOLVE */
function shuffle(){
  do{ tiles.sort(()=>Math.random()-.5); }while(!isSolvable()||isSolved());
}
function isSolvable(){
  let inv=0;
  for(let i=0;i<tiles.length;i++)for(let j=i+1;j<tiles.length;j++)if(tiles[i]&&tiles[j]&&tiles[i]>tiles[j])inv++;
  if(size%2===1) return inv%2===0;
  const row=size-Math.floor(tiles.indexOf(0)/size);
  return row%2===0?inv%2===1:inv%2===0;
}
function isSolved(){ return tiles.slice(0,-1).every((v,i)=>v===i+1); }

/* RENDER */
function render(){
  board.innerHTML="";
  tiles.forEach((n,i)=>{
    const d=document.createElement("div");
    d.className="tile"+(n===0?" empty":"");
    d.textContent=n||"";
    if(n!==0){
      d.addEventListener("pointerup",()=>{ if(state==="PLAYING") slideFromIndex(i); });
    }
    board.appendChild(d);
  });
}

/* SLIDE */
function slideFromIndex(i){
  const e=tiles.indexOf(0);
  const er=Math.floor(e/size), ec=e%size;
  const tr=Math.floor(i/size), tc=i%size;
  if(er!==tr && ec!==tc) return;
  const path=[];
  if(er===tr){
    const step=tc>ec?1:-1;
    for(let c=ec+step;c!==tc+step;c+=step) path.push(er*size+c);
  }else{
    const step=tr>er?1:-1;
    for(let r=er+step;r!==tr+step;r+=step) path.push(r*size+ec);
  }
  let pos=e;
  path.forEach(p=>{ tiles[pos]=tiles[p]; tiles[p]=0; pos=p; });
  render();
  checkClear();
}

/* CLEAR */
function checkClear(){
  if(isSolved()){
    clearInterval(timer);
    setState("CLEAR");
    const sec=Math.floor((Date.now()-startTime)/1000);
    saveBest(sec);
    clearText.textContent=formatTime(sec);
    clearAd.innerHTML = size>=4 ? pickAd() : "";
  }
}
retryBtn.onclick=()=>{ reset(); startBtn.click(); };
okBtn.onclick=()=>{ reset(); };

/* BEST */
function saveBest(t){
  const key=`best_${size}`;
  const prev=JSON.parse(localStorage.getItem(key)||"null");
  if(!prev||t<prev.time){
    localStorage.setItem(key,JSON.stringify({name:getName(),time:t}));
  }
}
function updateBest(){
  const b=JSON.parse(localStorage.getItem(`best_${size}`)||"null");
  bestEl.textContent=b?`🍫 BEST (${size}×${size}) : ${formatTime(b.time)} (${b.name})`:`🍫 BEST (${size}×${size}) : --`;
}

/* RANK */
rankBtn.onclick=()=>{
  rankList.innerHTML="";
  SIZES.forEach(s=>{
    const b=JSON.parse(localStorage.getItem(`best_${s}`)||"null");
    const li=document.createElement("li");
    li.textContent=b?`${s}×${s} : ${formatTime(b.time)} (${b.name})`:`${s}×${s} : --`;
    rankList.appendChild(li);
  });
  rankModal.classList.remove("hidden");
};
rankClose.onclick=()=>rankModal.classList.add("hidden");

/* SHARE */
function getShareText(){
  const sec=Math.floor((Date.now()-startTime)/1000);
  return `🍫 Merosura ${size}×${size} を ${formatTime(sec)} でクリア！`;
}
const url=encodeURIComponent(location.href);
shareX.onclick=()=>window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${url}`,"_blank");
shareLINE.onclick=()=>window.open(`https://social-plugins.line.me/lineit/share?url=${url}`,"_blank");
shareFB.onclick=()=>window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`,"_blank");
shareIG.onclick=async()=>{ await navigator.clipboard.writeText(location.href); alert("URLをコピーしたよ！"); };
shareTT.onclick=async()=>{ await navigator.clipboard.writeText(location.href); alert("URLをコピーしたよ！"); };

/* BOOT */
reset();
