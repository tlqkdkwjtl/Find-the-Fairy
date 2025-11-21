// ======================================== 
// Platformer Jump 게임 JavaScript 코드
// 플랫폼 점프 게임
// ========================================

// ========================================
// Canvas 설정
// ========================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ========================================
// 이미지 로드
// ========================================
const images = {
  background: new Image(),
  playerStandRight: new Image(),
  playerStandLeft: new Image(),
  playerSitRight: new Image(),
  playerSitLeft: new Image(),
  storyStar: new Image(),
  woodNo: new Image(),
  wood: new Image()
};

// 이미지 경로 설정
images.background.src = "images/fores_tearth .png";
images.playerStandRight.src = "images/Stand up_right.png";
images.playerStandLeft.src = "images/Stand up_left.png";
images.playerSitRight.src = "images/sit_right.png";
images.playerSitLeft.src = "images/sit_left.png";
images.storyStar.src = "Story/story_star.png";
images.woodNo.src = "images/woood_no.png";
images.wood.src = "images/wood.png";

// 이미지 로드 완료 체크
let imagesLoaded = 0;
const totalImages = Object.keys(images).length;

Object.values(images).forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
      initGame();
    }
  };
  img.onerror = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
      initGame();
    }
  };
});

// ========================================
// 게임 상태 변수
// ========================================
let gameState = "menu"; // "menu", "instructions", "story", "playing", "ending", "gameOver"
let storyTextIndex = 0;
let fairyCount = 0; // 만난 요정 수

// 스토리 텍스트 (한 줄씩 표시)
const storyTexts = [
  "강아지와 등산을 가는 도중 ",
  "원래 가는 산길로 걸어갔으나 전혀 다른 곳으로 흘러가버렸습니다.",
  "해는 져버렸고 바람은 강해졌습니다.",
  "어쩔수 없이 눈앞에 보이는 산장으로 들어갔는데",
  "이상하게 깨끗한곳이였고 의심이 들었지만 하루밤을 보내게 되었습니다.", 
  "일어나세요! 하는 소리와 함께 무언가를 들은 강아지가 개구멍으로 들어가자 그곳에는 요정들이 갇쳐 있었습니다.",
  "요정들은 강아지를 부르며 소리쳤습니다.",
  "이곳에는 마녀가 살고있어 우리를 여기서 꺼내주면 주인이랑 같이 현실로 보내줄께", 
  "그런데 이걸 열려면 밖에 있는 우리 요정을 찾아와야 해"
];

// 플레이어 설정
let player = {
  x: 180,
  y: 500,
  width: 30,
  height: 30,
  xSpeed: 0,
  ySpeed: 0,
  jumpPower: -10,
  gravity: 0.4,
  grounded: false,
  lastDirection: "right", // "left" or "right"
  currentImage: null
};

// 플랫폼 배열
let platforms = [];

// 요정 배열
let fairies = [];

// 카메라 오프셋 (플레이어가 화면 중앙에 오도록)
let cameraOffsetX = 0;
let cameraOffsetY = 0;

// 게임 시간 관리
let startTime = Date.now();
let elapsedTime = 0;

// ========================================
// 키보드 입력 처리
// ========================================
let keys = {};

document.addEventListener("keydown", e => {
  keys[e.key] = true;
  
  // 스토리 화면에서 스킵
  if (gameState === "story" && e.key === "Escape") {
    gameState = "playing";
    startGame();
  }
  
  // 스토리 화면에서 다음 텍스트
  if (gameState === "story" && (e.key === " " || e.key === "Enter")) {
    storyTextIndex++;
    if (storyTextIndex >= storyTexts.length) {
      gameState = "playing";
      startGame();
    }
  }
  
  // 엔딩 화면에서 다음
  if (gameState === "ending" && (e.key === " " || e.key === "Enter")) {
    if (storyTextIndex === 0) {
      storyTextIndex = 1;
    } else {
      gameState = "gameOver";
    }
  }
});

document.addEventListener("keyup", e => keys[e.key] = false);

// ========================================
// 게임 초기화
// ========================================
function initGame() {
  if (imagesLoaded < totalImages) return;
  showMenu();
}

// ========================================
// 메뉴 화면
// ========================================
function showMenu() {
  gameState = "menu";
  drawMenu();
}

function drawMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 배경
  ctx.fillStyle = "#2c3e50";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 제목
  ctx.fillStyle = "white";
  ctx.font = "bold 32px Arial";
  ctx.textAlign = "center";
  ctx.fillText("플랫포머 점프", canvas.width / 2, 150);
  
  // 시작 버튼
  ctx.fillStyle = "#3498db";
  ctx.fillRect(canvas.width / 2 - 100, 250, 200, 50);
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("게임 시작", canvas.width / 2, 280);
  
  // 버튼 클릭 감지
  canvas.addEventListener("click", handleMenuClick, { once: true });
}

function handleMenuClick(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // 시작 버튼 영역
  if (x >= canvas.width / 2 - 100 && x <= canvas.width / 2 + 100 &&
      y >= 250 && y <= 300) {
    gameState = "instructions";
    showInstructions();
  } else {
    drawMenu();
    canvas.addEventListener("click", handleMenuClick, { once: true });
  }
}

// ========================================
// 게임 설명 화면
// ========================================
function showInstructions() {
  drawInstructions();
  
  // 아무 키나 누르면 스토리로
  const handleKey = (e) => {
    if (e.key === " " || e.key === "Enter") {
      gameState = "story";
      storyTextIndex = 0;
      document.removeEventListener("keydown", handleKey);
      drawStory();
    }
  };
  document.addEventListener("keydown", handleKey, { once: true });
}

function drawInstructions() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 배경
  ctx.fillStyle = "#34495e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 설명 텍스트
  ctx.fillStyle = "white";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("게임 설명", canvas.width / 2, 100);
  
  ctx.font = "16px Arial";
  ctx.fillText("← → : 좌우 이동", canvas.width / 2, 180);
  ctx.fillText("스페이스바 : 점프", canvas.width / 2, 220);
  ctx.fillText("화면 좌우로 이동하여", canvas.width / 2, 280);
  ctx.fillText("새로운 플랫폼을 발견하세요", canvas.width / 2, 310);
  ctx.fillText("요정 3명을 만나면", canvas.width / 2, 350);
  ctx.fillText("특별한 선물을 받습니다!", canvas.width / 2, 380);
  
  ctx.font = "14px Arial";
  ctx.fillStyle = "#95a5a6";
  ctx.fillText("스페이스바 또는 엔터를 눌러 계속", canvas.width / 2, 500);
  
  requestAnimationFrame(drawInstructions);
}

// ========================================
// 스토리 화면
// ========================================
function drawStory() {
  if (gameState !== "story") return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 배경
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 스토리 이미지
  if (images.storyStar.complete && images.storyStar.naturalWidth > 0) {
    const imgAspect = images.storyStar.height / images.storyStar.width;
    const drawWidth = canvas.width * 0.7;
    const drawHeight = drawWidth * imgAspect;
    const x = (canvas.width - drawWidth) / 2;
    const y = 100;
    ctx.drawImage(images.storyStar, x, y, drawWidth, drawHeight);
  }
  
  // 텍스트 표시
  if (storyTextIndex < storyTexts.length) {
    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(storyTexts[storyTextIndex], canvas.width / 2, canvas.height - 80);
    
    ctx.font = "12px Arial";
    ctx.fillStyle = "#95a5a6";
    ctx.fillText("스페이스바 또는 엔터: 다음 | ESC: 스킵", canvas.width / 2, canvas.height - 30);
  }
  
  requestAnimationFrame(drawStory);
}

// ========================================
// 게임 시작
// ========================================
function startGame() {
  // 플레이어 초기화
  player.x = 180;
  player.y = 500;
  player.xSpeed = 0;
  player.ySpeed = 0;
  player.grounded = false;
  player.lastDirection = "right";
  
  // 플랫폼 초기화
  platforms = [];
  fairies = [];
  fairyCount = 0;
  cameraOffsetX = 0;
  cameraOffsetY = 0;
  
  // 기본 플랫폼 생성
  const startPlatformY = canvas.height - 50;
  const startPlatformX = 150;
  const startPlatformWidth = 100;
  const startPlatformHeight = 10;
  
  platforms.push({
    x: startPlatformX,
    y: startPlatformY,
    width: startPlatformWidth,
    height: startPlatformHeight
  });
  
  // 플레이어를 기본 플랫폼 위에 배치
  player.y = startPlatformY - player.height;
  
  // 초기 플랫폼 몇 개 생성
  generateInitialPlatforms();
  
  // 요정 생성
  generateFairies();
  
  startTime = Date.now();
  update();
}

function generateInitialPlatforms() {
  const platformWidth = 80;
  const platformHeight = 10;
  const startPlatformY = canvas.height - 50;
  const minPlatformY = 50;
  const numPlatforms = 5;
  
  for (let i = 0; i < numPlatforms; i++) {
    const y = minPlatformY + i * 100;
    const x = Math.random() * (canvas.width - platformWidth);
    
    platforms.push({
      x: x,
      y: y,
      width: platformWidth,
      height: platformHeight
    });
  }
}

function generateFairies() {
  // 랜덤하게 요정 생성 (플랫폼 위에)
  const numFairies = 3;
  fairies = [];
  
  for (let i = 0; i < numFairies; i++) {
    const platformIndex = Math.floor(Math.random() * platforms.length);
    const platform = platforms[platformIndex];
    
    fairies.push({
      x: platform.x + platform.width / 2 - 10,
      y: platform.y - 20,
      width: 20,
      height: 20,
      collected: false,
      side: Math.random() > 0.5 ? "left" : "right" // 왼쪽 또는 오른쪽에서 나타남
    });
  }
}

// ========================================
// 플랫폼 생성 (화면 경계에서)
// ========================================
function generatePlatformsAtBoundary(side) {
  const platformWidth = 80;
  const platformHeight = 10;
  const numNewPlatforms = 3;
  
  for (let i = 0; i < numNewPlatforms; i++) {
    let x, y;
    
    if (side === "left") {
      // 왼쪽에서 벗어났을 때 오른쪽에 생성
      x = canvas.width + Math.random() * 200;
    } else {
      // 오른쪽에서 벗어났을 때 왼쪽에 생성
      x = -200 - Math.random() * 200;
    }
    
    y = 100 + i * 150 + Math.random() * 50;
    
    platforms.push({
      x: x,
      y: y,
      width: platformWidth,
      height: platformHeight
    });
  }
  
  // 새 플랫폼에 요정 추가 (확률적으로)
  if (Math.random() > 0.5 && fairies.length < 3) {
    const newPlatform = platforms[platforms.length - 1];
    fairies.push({
      x: newPlatform.x + newPlatform.width / 2 - 10,
      y: newPlatform.y - 20,
      width: 20,
      height: 20,
      collected: false,
      side: side
    });
  }
}

// ========================================
// 그리기 함수
// ========================================

// 배경 그리기
function drawBackground() {
  if (images.background.complete && images.background.naturalWidth > 0) {
    // 배경을 타일링하여 그리기
    const pattern = ctx.createPattern(images.background, "repeat");
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// 플레이어 그리기
function drawPlayer() {
  let img = null;
  
  // 현재 방향과 상태에 따라 이미지 선택
  if (keys["ArrowRight"]) {
    player.lastDirection = "right";
    img = images.playerStandRight;
  } else if (keys["ArrowLeft"]) {
    player.lastDirection = "left";
    img = images.playerStandLeft;
  } else {
    // 입력이 없을 때는 마지막 방향에 따라 앉기 이미지
    if (player.lastDirection === "right") {
      img = images.playerSitRight;
    } else {
      img = images.playerSitLeft;
    }
  }
  
  // 이미지가 로드되었으면 그리기
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, player.x - cameraOffsetX, player.y - cameraOffsetY, player.width, player.height);
  } else {
    // 이미지가 없으면 기본 사각형
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x - cameraOffsetX, player.y - cameraOffsetY, player.width, player.height);
  }
}

// 플랫폼 그리기
function drawPlatforms() {
  ctx.fillStyle = "#8B4513";
  platforms.forEach(p => {
    ctx.fillRect(p.x - cameraOffsetX, p.y - cameraOffsetY, p.width, p.height);
  });
}

// 요정 그리기
function drawFairies() {
  fairies.forEach(fairy => {
    if (!fairy.collected) {
      // 요정을 노란색 원으로 표시
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(
        fairy.x - cameraOffsetX + fairy.width / 2,
        fairy.y - cameraOffsetY + fairy.height / 2,
        fairy.width / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // 요정 눈
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(
        fairy.x - cameraOffsetX + fairy.width / 2 - 5,
        fairy.y - cameraOffsetY + fairy.height / 2 - 2,
        2,
        0,
        Math.PI * 2
      );
      ctx.arc(
        fairy.x - cameraOffsetX + fairy.width / 2 + 5,
        fairy.y - cameraOffsetY + fairy.height / 2 - 2,
        2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  });
}

// 시간 표시
function drawTime() {
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Time: " + elapsedTime + "초", 10, 20);
  ctx.fillText("요정: " + fairyCount + "/3", 10, 45);
}

// ========================================
// 게임 로직 함수
// ========================================

// 플레이어 이동 처리
function updatePlayerMovement() {
  // 좌우 이동
  if (keys["ArrowLeft"]) {
    player.x -= 3;
  }
  if (keys["ArrowRight"]) {
    player.x += 3;
  }
  
  // 중력 적용
  player.ySpeed += player.gravity;
  player.y += player.ySpeed;
  
  // 점프 (바닥에 서있을 때만 가능)
  if (player.grounded && keys[" "]) {
    player.ySpeed = player.jumpPower;
    player.grounded = false;
  }
  
  // 화면 아래로 떨어지지 않도록 (바닥 경계)
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.ySpeed = 0;
    player.grounded = true;
  }
  
  // 화면 좌우 경계 체크 및 새 플랫폼 생성
  if (player.x < 0) {
    // 왼쪽으로 벗어남
    generatePlatformsAtBoundary("left");
    // 플레이어를 오른쪽으로 이동
    const offset = canvas.width;
    player.x += offset;
    cameraOffsetX += offset;
    // 모든 플랫폼과 요정도 이동
    platforms.forEach(p => p.x += offset);
    fairies.forEach(f => f.x += offset);
  } else if (player.x > canvas.width) {
    // 오른쪽으로 벗어남
    generatePlatformsAtBoundary("right");
    // 플레이어를 왼쪽으로 이동
    const offset = -canvas.width;
    player.x += offset;
    cameraOffsetX += offset;
    // 모든 플랫폼과 요정도 이동
    platforms.forEach(p => p.x += offset);
    fairies.forEach(f => f.x += offset);
  }
}

// 플랫폼 충돌 검사
function checkPlatformCollision() {
  player.grounded = false;
  
  platforms.forEach(p => {
    const isColliding = 
      player.x + player.width > p.x &&
      player.x < p.x + p.width &&
      player.y + player.height > p.y &&
      player.y + player.height < p.y + p.height &&
      player.ySpeed > 0;
    
    if (isColliding) {
      player.y = p.y - player.height;
      player.ySpeed = 0;
      player.grounded = true;
    }
  });
}

// 요정 충돌 검사
function checkFairyCollision() {
  fairies.forEach(fairy => {
    if (!fairy.collected) {
      const isColliding = 
        player.x + player.width > fairy.x &&
        player.x < fairy.x + fairy.width &&
        player.y + player.height > fairy.y &&
        player.y < fairy.y + fairy.height;
      
      if (isColliding) {
        fairy.collected = true;
        fairyCount++;
        
        // 3명의 요정을 모두 만나면 엔딩
        if (fairyCount >= 3) {
          gameState = "ending";
          storyTextIndex = 0;
        }
      }
    }
  });
}

// ========================================
// 엔딩 화면
// ========================================
function drawEnding() {
  if (gameState !== "ending") return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 배경
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 이미지 표시
  if (storyTextIndex === 0) {
    // wood_no.png
    if (images.woodNo.complete && images.woodNo.naturalWidth > 0) {
      const imgAspect = images.woodNo.height / images.woodNo.width;
      const drawWidth = canvas.width * 0.8;
      const drawHeight = drawWidth * imgAspect;
      const x = (canvas.width - drawWidth) / 2;
      const y = (canvas.height - drawHeight) / 2;
      ctx.drawImage(images.woodNo, x, y, drawWidth, drawHeight);
    }
    
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("스페이스바 또는 엔터를 눌러 계속", canvas.width / 2, canvas.height - 30);
  } else {
    // wood.png
    if (images.wood.complete && images.wood.naturalWidth > 0) {
      const imgAspect = images.wood.height / images.wood.width;
      const drawWidth = canvas.width * 0.8;
      const drawHeight = drawWidth * imgAspect;
      const x = (canvas.width - drawWidth) / 2;
      const y = (canvas.height - drawHeight) / 2;
      ctx.drawImage(images.wood, x, y, drawWidth, drawHeight);
    }
    
    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("축하합니다!", canvas.width / 2, 50);
    ctx.fillText("3명의 요정을 모두 만났습니다!", canvas.width / 2, 80);
    
    ctx.font = "14px Arial";
    ctx.fillText("스페이스바 또는 엔터를 눌러 종료", canvas.width / 2, canvas.height - 30);
  }
  
  requestAnimationFrame(drawEnding);
}

// ========================================
// 게임 메인 루프
// ========================================
function update() {
  if (gameState === "playing") {
    // 화면 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 배경 그리기
    drawBackground();
    
    // 플레이어 이동 처리
    updatePlayerMovement();
    
    // 플랫폼 충돌 검사
    checkPlatformCollision();
    
    // 요정 충돌 검사
    checkFairyCollision();
    
    // 경과 시간 계산
    elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // 게임 요소 그리기
    drawPlatforms();
    drawFairies();
    drawPlayer();
    drawTime();
    
    // 다음 프레임 예약
    requestAnimationFrame(update);
  } else if (gameState === "ending") {
    drawEnding();
  }
}

// 게임 시작 (이미지 로드 완료 후)
if (imagesLoaded === totalImages) {
  initGame();
}
