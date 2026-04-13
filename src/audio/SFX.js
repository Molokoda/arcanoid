export class SFX {
  constructor({ volume = 0.25, muted = false } = {}) {
    this.volume = volume;
    this.muted = muted;

    this.ctx = null;
    this.master = null;

    this._timerLevel = 0;
    this._seq = 0;
  }

  init() {
    if (this.ctx) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : this.volume;
    this.master.connect(this.ctx.destination);
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : this.volume;
  }

  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.value = this.muted ? 0 : this.volume;
  }

  _beep({
    type = "sine",
    freq = 440,
    freqTo = null,
    duration = 0.06,
    attack = 0.003,
    release = 0.03,
    gain = 0.4
  } = {}) {
    if (!this.ctx || !this.master || this.muted) return;

    const t0 = this.ctx.currentTime;
    const t1 = t0 + Math.max(0.005, duration);

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqTo != null) osc.frequency.exponentialRampToValueAtTime(freqTo, t1);

    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t1 + release);

    osc.connect(g);
    g.connect(this.master);

    osc.start(t0);
    osc.stop(t1 + release + 0.01);
  }

  bounce() {
    this._beep({
      type: "triangle",
      freq: 420,
      freqTo: 260,
      duration: 0.04,
      gain: 0.35
    });
  }

  brickHit(strength = 1) {
    const f = strength >= 3 ? 880 : strength === 2 ? 720 : 560;
    this._beep({
      type: "square",
      freq: f,
      freqTo: f * 0.8,
      duration: 0.035,
      gain: 0.28
    });
  }

  brickBreak() {
    this._beep({
      type: "square",
      freq: 980,
      freqTo: 420,
      duration: 0.06,
      gain: 0.35
    });
  }

  loseLife() {
    this._beep({
      type: "sawtooth",
      freq: 220,
      freqTo: 110,
      duration: 0.12,
      gain: 0.35
    });
  }

  levelComplete() {
    this._seq += 1;
    const seq = this._seq;
    if (this._timerLevel) {
      clearTimeout(this._timerLevel);
      this._timerLevel = 0;
    }

    this._beep({
      type: "sine",
      freq: 660,
      freqTo: 990,
      duration: 0.09,
      gain: 0.28
    });
    if (this.ctx) {
      this._timerLevel = setTimeout(() => {
        if (this._seq !== seq) return;
        this._timerLevel = 0;
        this._beep({
          type: "sine",
          freq: 880,
          freqTo: 1320,
          duration: 0.09,
          gain: 0.22
        });
      }, 70);
    }
  }
}
