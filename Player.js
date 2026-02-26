class Player {
  constructor(x, y, speed, tailSpec) {
    this.x = x;
    this.y = y;
    this.s = speed ?? 3;

    // Velocity for smooth motion
    this.vx = 0;
    this.vy = 0;

    // Tail history (will store past positions)
    this.tail = [];
    this.tailLen = tailSpec?.length ?? 16;
    this.tailFade = tailSpec?.fade ?? 0.85; // closer to 1 = longer visible
  }

  updateInput() {
    const dx =
      (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) -
      (keyIsDown(LEFT_ARROW) || keyIsDown(65));
    const dy =
      (keyIsDown(DOWN_ARROW) || keyIsDown(83)) -
      (keyIsDown(UP_ARROW) || keyIsDown(87));

    // Desired direction normalized (no diagonal boost)
    const len = max(1, abs(dx) + abs(dy));
    const ax = (dx / len) * this.s;
    const ay = (dy / len) * this.s;

    // Ease velocity toward desired acceleration
    const ease = 0.12; // smaller = calmer
    this.vx = lerp(this.vx, ax, ease);
    this.vy = lerp(this.vy, ay, ease);

    // Gentle drag to settle when no input
    const drag = 0.98;
    this.vx *= drag;
    this.vy *= drag;

    this.x += this.vx;
    this.y += this.vy;

    // Record tail history
    this.tail.unshift({ x: this.x, y: this.y });
    if (this.tail.length > this.tailLen) this.tail.pop();
  }

  draw() {
    noStroke();

    // Tail (fading streak)
    for (let i = this.tail.length - 1; i >= 1; i--) {
      const a = pow(this.tailFade, this.tail.length - 1 - i); // front is brighter
      const p0 = this.tail[i];
      const p1 = this.tail[i - 1];
      const w = map(i, 0, this.tail.length - 1, 1, 3); // subtle taper
      stroke(230, 245, 255, 200 * a);
      strokeWeight(w);
      line(p0.x, p0.y, p1.x, p1.y);
    }

    push();
    translate(this.x, this.y);

    // Core bright circle
    fill(255, 255, 255, 230);
    ellipse(0, 0, 15, 15);

    pop();

    // Reset stroke state for caller
    noStroke();
  }
}
