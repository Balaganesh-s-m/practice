
const board = document.getElementById("board");

const pieces = {
r:"♜",n:"♞",b:"♝",q:"♛",k:"♚",p:"♟",
R:"♖",N:"♘",B:"♗",Q:"♕",K:"♔",P:"♙"
};

let gameBoard = [
["r","n","b","q","k","b","n","r"],
["p","p","p","p","p","p","p","p"],
["","","","","","","",""],
["","","","","","","",""],
["","","","","","","",""],
["","","","","","","",""],
["P","P","P","P","P","P","P","P"],
["R","N","B","Q","K","B","N","R"]
];

let selected=null;
let currentPlayer="white";

function isWhite(p){return p===p.toUpperCase();}
function isBlack(p){return p===p.toLowerCase();}

function drawBoard(){
board.innerHTML="";
for(let r=0;r<8;r++){
for(let c=0;c<8;c++){
let sq=document.createElement("div");
sq.className="square "+((r+c)%2==0?"white":"black");
sq.dataset.r=r; sq.dataset.c=c;
let p=gameBoard[r][c];
if(p) sq.textContent=pieces[p];
sq.onclick=handleClick;
board.appendChild(sq);
}}}

function handleClick(e){
let r=+e.target.dataset.r;
let c=+e.target.dataset.c;

if(selected){
if(isValidMove(selected.r,selected.c,r,c)){
movePiece(selected.r,selected.c,r,c);
currentPlayer="black";
drawBoard();
setTimeout(aiMove,200);
}
selected=null;
}else{
let p=gameBoard[r][c];
if(p && isWhite(p)) selected={r,c};
}
}

function movePiece(sr,sc,tr,tc){
gameBoard[tr][tc]=gameBoard[sr][sc];
gameBoard[sr][sc]="";
}

function isPathClear(sr,sc,tr,tc){
let dr=Math.sign(tr-sr);
let dc=Math.sign(tc-sc);
let r=sr+dr,c=sc+dc;
while(r!=tr||c!=tc){
if(gameBoard[r][c]) return false;
r+=dr; c+=dc;
}
return true;
}

function isValidMove(sr,sc,tr,tc){
let p=gameBoard[sr][sc];
let t=gameBoard[tr][tc];
if(t && ((isWhite(p)&&isWhite(t))||(isBlack(p)&&isBlack(t)))) return false;

let dr=tr-sr, dc=tc-sc;

switch(p.toLowerCase()){
case "p":
let dir=isWhite(p)?-1:1;
if(dc==0 && !t){
if(dr==dir) return true;
if((sr==6||sr==1)&&dr==2*dir && !gameBoard[sr+dir][sc]) return true;
}
if(Math.abs(dc)==1 && dr==dir && t) return true;
return false;

case "r": return (sr==tr||sc==tc)&&isPathClear(sr,sc,tr,tc);
case "b": return Math.abs(dr)==Math.abs(dc)&&isPathClear(sr,sc,tr,tc);
case "q": return ((sr==tr||sc==tc)||Math.abs(dr)==Math.abs(dc))&&isPathClear(sr,sc,tr,tc);
case "n": return (Math.abs(dr)==2&&Math.abs(dc)==1)||(Math.abs(dr)==1&&Math.abs(dc)==2);
case "k": return Math.abs(dr)<=1&&Math.abs(dc)<=1;
}
return false;
}

function evaluate(){
let val={p:10,n:30,b:30,r:50,q:90,k:900};
let score=0;
for(let row of gameBoard){
for(let p of row){
if(!p) continue;
score+=isWhite(p)?val[p.toLowerCase()]:-val[p.toLowerCase()];
}}
return score;
}

function getMoves(isWhiteTurn){
let moves=[];
for(let sr=0;sr<8;sr++){
for(let sc=0;sc<8;sc++){
let p=gameBoard[sr][sc];
if(!p) continue;
if(isWhiteTurn && !isWhite(p)) continue;
if(!isWhiteTurn && !isBlack(p)) continue;

for(let tr=0;tr<8;tr++){
for(let tc=0;tc<8;tc++){
if(isValidMove(sr,sc,tr,tc)){
moves.push({sr,sc,tr,tc});
}}}}
}
return moves;
}

// 🔥 ALPHA-BETA
function alphabeta(depth, alpha, beta, isMax){
if(depth==0) return evaluate();

let moves=getMoves(isMax);

if(isMax){
let maxEval=-Infinity;
for(let m of moves){
let backup=gameBoard[m.tr][m.tc];
let piece=gameBoard[m.sr][m.sc];

gameBoard[m.tr][m.tc]=piece;
gameBoard[m.sr][m.sc]="";

let evalScore=alphabeta(depth-1,alpha,beta,false);

gameBoard[m.sr][m.sc]=piece;
gameBoard[m.tr][m.tc]=backup;

maxEval=Math.max(maxEval,evalScore);
alpha=Math.max(alpha,evalScore);
if(beta<=alpha) break; // PRUNE
}
return maxEval;
}else{
let minEval=Infinity;
for(let m of moves){
let backup=gameBoard[m.tr][m.tc];
let piece=gameBoard[m.sr][m.sc];

gameBoard[m.tr][m.tc]=piece;
gameBoard[m.sr][m.sc]="";

let evalScore=alphabeta(depth-1,alpha,beta,true);

gameBoard[m.sr][m.sc]=piece;
gameBoard[m.tr][m.tc]=backup;

minEval=Math.min(minEval,evalScore);
beta=Math.min(beta,evalScore);
if(beta<=alpha) break; // PRUNE
}
return minEval;
}
}

function aiMove(){
let bestMove=null;
let bestVal=Infinity;

let moves=getMoves(false);

for(let m of moves){
let backup=gameBoard[m.tr][m.tc];
let piece=gameBoard[m.sr][m.sc];

gameBoard[m.tr][m.tc]=piece;
gameBoard[m.sr][m.sc]="";

let val=alphabeta(2,-Infinity,Infinity,true);

gameBoard[m.sr][m.sc]=piece;
gameBoard[m.tr][m.tc]=backup;

if(val<bestVal){
bestVal=val;
bestMove=m;
}
}

if(bestMove){
movePiece(bestMove.sr,bestMove.sc,bestMove.tr,bestMove.tc);
currentPlayer="white";
drawBoard();
}
}

drawBoard();
