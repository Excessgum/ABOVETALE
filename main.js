function random(v) {
  return Math.floor(Math.random() * v);
}

function init() {
  let mazeCanvas = document.getElementById("maze");
  ctx = mazeCanvas.getContext("2d");
  ctx.font = "bold 48px sans-serif";

  createMaze(W, H);
  repaint();
}

function go() {
  window.onkeydown = mykeydown;
  window.onkeyup = mykeyup;

  let mazeCanvas = document.getElementById("maze");
  mazeCanvas.onmousedown = mymousedown;
  mazeCanvas.onmouseup = mykeyup;
  mazeCanvas.oncontextmenu = function (e) {
    e.preventDefault();
  };
  mazeCanvas.addEventListener("touchstart", mymousedown);
  mazeCanvas.addEventListener("touchend", mykeyup);

  timer = setInterval(tick, 45);
  document.getElementById("START").style.display = "none";
  document.getElementById("bgm").play();
}

function tick() {
  player.update();
  aliens.forEach((a) => a.update());
  repaint();
}

// ===== 迷路生成 =====
function createMaze(w, h) {
  for (let y = 0; y < h; y++) {
    maze[y] = [];
    for (let x = 0; x < w; x++) {
      maze[y][x] =
        x == 0 || x == w - 1 || y == 0 || y == h - 1 ? 1 : 0;
    }
  }

  for (let y = 2; y < h - 2; y += 2) {
    for (let x = 2; x < w - 2; x += 2) {
      maze[y][x] = 1;

      let dir = random(y == 2 ? 4 : 3);
      let px = x;
      let py = y;

      switch (dir) {
        case 0: py++; break;
        case 1: px--; break;
        case 2: px++; break;
        case 3: py--; break;
      }
      maze[py][px] = 1;
    }
  }
}

// ===== 描画補助 =====
function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// ===== 描画 =====
function repaint() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 900, 600);

  ctx.save();
  ctx.beginPath();
  ctx.arc(300, 300, 300, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = "brown";
  ctx.translate(6 * 50, 6 * 50);
  ctx.translate(-player.getScrollX(), -player.getScrollY());

  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      if (maze[y][x] == 1) {
        ctx.fillRect(x * 50, y * 50, 50, 50);
      }
    }
  }

  aliens.forEach((a) => a.paint(ctx, 50, 50));
  ctx.restore();

  // ミニマップ
  ctx.fillStyle = "#eeeeee";
  ctx.fillRect(650, 0, 250, 600);

  ctx.save();
  ctx.translate(670, 300);
  ctx.fillStyle = "brown";
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      if (maze[y][x] == 1) {
        ctx.fillRect(x * 7, y * 7, 7, 7);
      }
    }
  }

  drawCircle(player.x * 7 + 3, player.y * 7 + 3, 3, "red");
  aliens.forEach((a) => {
    drawCircle(a.x * 7 + 3, a.y * 7 + 3, 3, "purple");
  });
  ctx.restore();

  // コントローラ
  let arrows = document.getElementById("arrows");
  ctx.drawImage(arrows, 670, 70, 200, 200);

  let ax = -100, ay = -100;
  switch (keyCode) {
    case 39: ax = 830; ay = 170; break;
    case 40: ax = 770; ay = 230; break;
    case 37: ax = 710; ay = 170; break;
    case 38: ax = 770; ay = 120; break;
  }
  drawCircle(ax, ay, 30, "yellow");

  // 主人公
  player.paint(ctx, 300, 300, 50, 50);

  ctx.fillStyle = "yellow";
  if (status == GAMEOVER) {
    ctx.fillText("GAME OVER", 150, 200);
  } else if (status == GAMECLEAR) {
    ctx.fillText("GAME CLEAR", 150, 200);
  }
}

// ===== 入力 =====
function mykeydown(e) {
  keyCode = e.keyCode;
}

function mykeyup(e) {
  keyCode = 0;
}

function mymousedown(e) {
  let mouseX = !isNaN(e.offsetX) ? e.offsetX : e.touches[0].clientX;
  let mouseY = !isNaN(e.offsetY) ? e.offsetY : e.touches[0].clientY;

  if (670 < mouseX && mouseX < 870 && 70 < mouseY && mouseY < 270) {
    mouseX -= 770;
    mouseY -= 170;
    if (Math.abs(mouseX) > Math.abs(mouseY)) {
      keyCode = mouseX < 0 ? 37 : 39;
    } else {
      keyCode = mouseY < 0 ? 38 : 40;
    }
  }
}
