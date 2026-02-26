/*
Reflective Sky — JSON World + Gentle Camera + Shooting Star
*/

const VIEW_W = 800;
const VIEW_H = 480;

let worldData;
let level;
let player;
let camX = 0;
let camY = 0;

function preload() {
  worldData = loadJSON("world.json");
}

function setup() {
  createCanvas(VIEW_W, VIEW_H);
  textFont("sans-serif");
  textSize(14);

  level = new WorldLevel(worldData);
  const start = worldData.playerStart ?? { x: 300, y: 300, speed: 3 };

  // Pass tail spec from level to player
  player = new Player(start.x, start.y, start.speed, level.tailSpec);

  camX = player.x - width / 2;
  camY = player.y - height / 2;
}

function draw() {
  // 1) Update player
  player.updateInput();

  // 2) Keep player inside world
  player.x = constrain(player.x, 0, level.w);
  player.y = constrain(player.y, 0, level.h);

  // 3) Camera target centered on player
  // Add a small auto-drift BEFORE lerp (calm breathing)
  let targetX = player.x - width / 2 + frameCount * (level.autoDrift.x ?? 0);
  let targetY = player.y - height / 2 + frameCount * (level.autoDrift.y ?? 0);

  // Clamp camera to world edges
  const maxCamX = max(0, level.w - width);
  const maxCamY = max(0, level.h - height);
  targetX = constrain(targetX, 0, maxCamX);
  targetY = constrain(targetY, 0, maxCamY);

  // 4) Smooth follow
  const camLerp = level.camLerp;
  camX = lerp(camX, targetX, camLerp);
  camY = lerp(camY, targetY, camLerp);

  // 5) Draw background + parallax stars using camera position
  level.drawBackground();
  level.drawParallax(camX, camY);

  // 6) World space (player)
  push();
  translate(-camX, -camY);
  level.drawWorld();
  player.draw();
  pop();

  // 7) Minimal HUD
  level.drawHUD(player, camX, camY);
}

function keyPressed() {
  if (key === "r" || key === "R") {
    const start = worldData.playerStart ?? { x: 300, y: 300, speed: 3 };
    player = new Player(start.x, start.y, start.speed, level.tailSpec);
  }
}
