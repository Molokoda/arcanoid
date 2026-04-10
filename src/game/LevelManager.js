export class LevelManager {
  constructor(levels = DEFAULT_LEVELS) {
    this.levels = levels;
    this.index = 0;
  }

  get count() {
    return this.levels.length;
  }

  get levelNumber() {
    return this.index + 1;
  }

  reset() {
    this.index = 0;
  }

  current() {
    return this.levels[this.index];
  }

  hasNext() {
    return this.index + 1 < this.levels.length;
  }

  next() {
    if (this.hasNext()) this.index += 1;
    return this.current();
  }

  loadInto(brickField) {
    const level = this.current();
    brickField.loadFromMatrix(level.matrix);
    return level;
  }

  advanceInto(brickField) {
    if (!this.hasNext()) return false;
    this.next();
    this.loadInto(brickField);
    return true;
  }
}

const DEFAULT_LEVELS = [
  {
    name: "Warmup",
    matrix: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0]
    ]
  },
  {
    name: "Stairs",
    matrix: [
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 2, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 2, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 2, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 2, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 2, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 2, 1, 1, 1]
    ]
  },
  {
    name: "Frame",
    matrix: [
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      [2, 1, 0, 0, 0, 0, 0, 0, 1, 2],
      [2, 1, 0, 1, 1, 1, 1, 0, 1, 2],
      [2, 1, 0, 1, 0, 0, 1, 0, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
    ]
  },
  {
    name: "Checkers",
    matrix: [
      [1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
      [2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
      [1, 2, 1, 2, 3, 3, 2, 1, 2, 1],
      [2, 1, 2, 1, 3, 3, 1, 2, 1, 2],
      [1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
      [0, 2, 1, 2, 1, 2, 1, 2, 1, 0],
      [0, 0, 2, 1, 2, 1, 2, 1, 0, 0]
    ]
  },
  {
    name: "Layers",
    matrix: [
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3, 2, 2, 2, 2, 2, 2, 3, 3],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 1, 1, 1, 1, 1, 1, 2, 2],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0]
    ]
  }
];
