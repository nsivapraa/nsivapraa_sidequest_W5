class WorldLevel {
  constructor(json) {
    this.schemaVersion = json.schemaVersion ?? 1;
    this.w = json.world?.w ?? 2400;
    this.h = json.world?.h ?? 1600;
    this.bg = json.world?.bg ?? [5, 8, 20];

    // Camera knobs
    this.camLerp = json.camera?.lerp ?? 0.1;
    this.autoDrift = {
      x: json.camera?.autoDrift?.x ?? 0,
      y: json.camera?.autoDrift?.y ?? 0,
    };

    // Starfield spec
    const sf = json.starfield ?? {};
    this.layersSpec = sf.layers ?? [
      { count: 120, parallax: 0.3, size: [1, 2], twinkle: 0.02 },
      { count: 180, parallax: 0.6, size: [1, 2.5], twinkle: 0.025 },
      { count: 240, parallax: 0.9, size: [1, 3], twinkle: 0.03 },
    ];
    this.tailSpec = sf.shootingStarTail ?? { length: 16, fade: 0.85 };

    // Pre-generate stars per layer
    this.layers = this.layersSpec.map((spec) => {
      const stars = [];
      for (let i = 0; i < spec.count; i++) {
        stars.push({
          x: random(0, this.w),
          y: random(0, this.h),
          r: random(spec.size[0], spec.size[1]),
          baseAlpha: random(150, 255),
          tw: spec.twinkle * random(0.6, 1.4), // twinkle speed variance
          phase: random(TWO_PI),
        });
      }
      return { spec, stars };
    });
  }

  drawBackground() {
    // Gradient from top (1,17,43) to bottom (0,0,0)
    const top = color(1, 17, 43);
    const bot = color(0, 0, 0);

    // Draw a fullscreen gradient in screen space (not translated by the camera)
    noStroke();
    for (let y = 0; y < height; y++) {
      const t = y / (height - 1);
      const c = lerpColor(top, bot, t);
      stroke(c);
      line(0, y, width, y);
    }
    noStroke();
  }

  // Parallax starfield (draw BEFORE world/players)
  drawParallax(camX, camY) {
    noStroke();
    // subtle color variation for stars
    for (const layer of this.layers) {
      const { parallax } = layer.spec;
      // Parallax offset: stars shift less than camera
      const px = camX * parallax;
      const py = camY * parallax;

      for (const s of layer.stars) {
        // Twinkle alpha using a slow sine
        s.phase += s.tw;
        const a = s.baseAlpha * (0.7 + 0.3 * (0.5 + 0.5 * sin(s.phase)));

        fill(230, 235, 255, a);
        // wrap with world bounds (tile effect so stars continue)
        const sx = (s.x - px) % this.w;
        const sy = (s.y - py) % this.h;
        const drawX = sx < 0 ? sx + this.w : sx;
        const drawY = sy < 0 ? sy + this.h : sy;

        circle(drawX, drawY, s.r);
      }
    }
  }

  drawWorld() {
    // Optional: a very faint horizon nebula or nothing—keep it minimal
    // Keeping this empty preserves the meditative mood.
  }

  drawHUD(player, camX, camY) {
    // Minimal HUD: corner caption
    noStroke();
    fill(200, 210, 230, 180);
    text(
      "Float through a starry night sky! (Use WASD/Arrow keys to move, press 'R' to reset).",
      12,
      22,
    );
  }
}
