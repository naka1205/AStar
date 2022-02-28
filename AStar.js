const Direction = {
  kUP: "UP",
  kDown: "Down",
  kLeft: "Left",
  kRight: "Right",
  KLeftUP: "LeftUP",
  kLeftDown: "LeftDown",
  kRightUP: "RightUP",
  kRightDown: "RightDown",
};

class AStar {
  _width;
  _height;
  _data;
  _open_grids;
  _close_grids;
  _transverse_move;
  _vertical_move;
  _oblique_move;
  _can_oblique;
  constructor(width, height) {
    this._width = width;
    this._height = height;
    this._open_grids = [];
    this._close_grids = [];
    this._oblique_move = 14;
    this._vertical_move = 10;
    this._transverse_move = 10;
    this._can_oblique = true;

    this._data = [];

    for (let i = 0; i < width * height; i++) {
      this._data[i] = { CanMove: false };
    }
  }

  containGrid(list, pos) {
    var contain = false;
    for (let i = 0; i < list.length; i++) {
      if (list[i].x == pos.x && list[i].y == pos.y) {
        contain = true;
        break;
      }
    }

    return contain;
  }

  setTransverseMove(v) {
    this._transverse_move = v;
  }

  setVerticalMove(v) {
    this._vertical_move = v;
  }

  setObliqueMove(v) {
    this._oblique_move = v;
  }

  setCanOblique(v) {
    this._can_oblique = v;
  }

  setGridCanMove(pos, canmove) {
    var offset = this.getGridOffset(pos);
    try {
      this._data[offset].CanMove = canmove;
    } catch (error) {
      console.log("offset:" + offset);
      console.log(pos);
    }
  }

  getObliqueMove() {
    return this._oblique_move;
  }

  getVerticalMove() {
    return this._vertical_move;
  }

  getTransverseMove(v) {
    return this._transverse_move;
  }

  getCanOblique() {
    return this._can_oblique;
  }

  getGridOffset(pos) {
    return pos.x + pos.y * this._width;
  }

  getGridCanMove(pos) {
    var offset = this.getGridOffset(pos);
    var canmove = this._data[offset] ? this._data[offset] : null;
    return canmove ? canmove.CanMove : null;
  }

  getHValue(endpos, pos) {
    return Math.abs(pos.x - endpos.x) + Math.abs(pos.y - endpos.y);
  }

  getGValue(lastpos, pos) {
    var lastoffset = this.getGridOffset(lastpos);
    var lastg = this._data[lastoffset].G;

    var move = 0;
    if (lastpos.x == pos.x) {
      move = this._transverse_move;
    } else if (lastpos.y == pos.y) {
      move = this._vertical_move;
    } else {
      move = this._oblique_move;
    }

    return lastg + move;
  }

  getNearbyGrid(pos, direction) {
    var value = null;
    var _height = this._height - 1;
    var _width = this._width - 1;
    switch (direction) {
      case Direction.kUP:
        if (pos.y < _height) {
          value = { x: pos.x, y: pos.y + 1 };
        }
        break;
      case Direction.kDown:
        if (pos.y > 0) {
          value = { x: pos.x, y: pos.y - 1 };
        }
        break;
      case Direction.kLeft:
        if (pos.x > 0) {
          value = { x: pos.x - 1, y: pos.y };
        }
        break;
      case Direction.kRight:
        if (pos.x < _width) {
          value = { x: pos.x + 1, y: pos.y };
        }
        break;
      case Direction.KLeftUP:
        if (this._can_oblique && pos.y < _height && pos.x > 0) {
          value = { x: pos.x - 1, y: pos.y + 1 };
        }
        break;
      case Direction.kLeftDown:
        if (this._can_oblique && pos.y > 0 && pos.x > 0) {
          value = { x: pos.x - 1, y: pos.y - 1 };
        }
        break;
      case Direction.kRightUP:
        if (this._can_oblique && pos.y < _height && pos.x < _width) {
          value = { x: pos.x + 1, y: pos.y + 1 };
        }
        break;
      case Direction.kRightDown:
        if (this._can_oblique && pos.y > 0 && pos.x > _width) {
          value = { x: pos.x - 1, y: pos.y - 1 };
        }
        break;
      default:
        break;
    }

    return value;
  }

  getNearbyCanMoveGrid(pos, direction) {
    var value = this.getNearbyGrid(pos, direction);
    if (!value) {
      return null;
    }

    if (!this.getGridCanMove(value)) {
      return null;
    }

    var Left = this.getNearbyGrid(pos, "Left");
    var Right = this.getNearbyGrid(pos, "Right");
    var Down = this.getNearbyGrid(pos, "Down");
    var UP = this.getNearbyGrid(pos, "UP");

    if (
      direction === "LeftDown" &&
      !this.getGridCanMove(Left) &&
      !this.getGridCanMove(Down)
    ) {
      value = null;
    } else if (
      direction === "LeftUP" &&
      !this.getGridCanMove(Left) &&
      !this.getGridCanMove(UP)
    ) {
      value = null;
    } else if (
      direction === "RightDown" &&
      !this.getGridCanMove(Right) &&
      !this.getGridCanMove(Down)
    ) {
      value = null;
    } else if (
      direction === "RightUP" &&
      !this.getGridCanMove(Right) &&
      !this.getGridCanMove(UP)
    ) {
      value = null;
    }
    return value;
  }

  getOrientation(g1, g2) {
    if (!g1 || !g2) {
      return null;
    }

    var names = [];

    var offset = this.subGrid(g2, g1);
    if (offset.x > 0) {
      names.push("Right");
    } else if (offset.x < 0) {
      names.push("Left");
    }

    if (offset.y > 0) {
      names.push("UP");
    } else if (offset.y < 0) {
      names.push("Down");
    }

    return names;
  }

  getOrientationIndex(orientation) {
    var index = 999;
    var num = 0;
    for (const key in Direction) {
      if (Direction[key] === orientation) {
        index = num;
      }
      num++;
    }

    return index;
  }

  handleGrid(grid, orientation, endpos) {
    var neargrids = this.getNearbyCanMoveGrid(grid, orientation);
    if (neargrids && !this.containGrid(this._close_grids, neargrids)) {
      var offset = this.getGridOffset(neargrids);
      var thisG = this.getGValue(grid, neargrids);

      if (this.containGrid(this._open_grids, neargrids)) {
        var orientationIndex = this.getOrientationIndex(orientation);
        var orientationParent = this.getOrientation(
          neargrids,
          this._data[offset].Parent
        );
        if (
          this._data[offset].G > thisG ||
          (this._data[offset].G == thisG &&
            orientationIndex < this.getOrientationIndex(orientationParent))
        ) {
          this._data[offset].G = thisG;
          this._data[offset].F = thisG + this.getHValue(endpos, neargrids);
          this._data[offset].Parent = grid;
        }
      } else {
        this._data[offset].G = thisG;
        this._data[offset].F = thisG + this.getHValue(endpos, neargrids);
        this._data[offset].Parent = grid;

        this._open_grids.push(neargrids);
      }
    }
  }

  subGrid(g1, g2) {
    return { x: g1.x - g2.x, y: g1.y - g2.y };
  }

  findOptimumSolution(start_, endpos_) {
    var change_pos = start_.x < endpos_.x || start_.y < endpos_.y;

    var start, endpos;
    if (change_pos) {
      start = endpos_;
      endpos = start_;
    } else {
      start = start_;
      endpos = endpos_;
    }

    var path = [];
    this._close_grids = [];
    this._open_grids = [];

    this._open_grids.push(start);
    var startoffset = this.getGridOffset(start);

    this._data[startoffset].G = 0;
    this._data[startoffset].F = this.getHValue(endpos, start);

    while (true) {
      if (this._open_grids.length == 0) {
        break;
      }

      if (this.containGrid(this._open_grids, endpos)) {
        break;
      }
      // console.log(1)
      this._open_grids.sort((a, b) => {
        var offseta = this.getGridOffset(a);
        var offsetb = this.getGridOffset(b);
        return this._data[offseta].F < this._data[offsetb].F;
      });

      var grid = this._open_grids[0];
      this._open_grids.splice(0, 1);
      this._close_grids.push(grid);

      for (const key in Direction) {
        this.handleGrid(grid, Direction[key], endpos);
      }
    }

    var offsettemp = this.getGridOffset(endpos);
    var temp = this._data[offsettemp];

    if (temp.Parent) {
      path.push(endpos);
    }

    while (true) {
      if (!temp.Parent) {
        break;
      }

      path.push(temp.Parent);

      offsettemp = this.getGridOffset(temp.Parent);
      temp = this._data[offsettemp];
    }

    this._close_grids = [];
    this._open_grids = [];

    var num = this._width * this._height;
    for (let i = 0; i < num; i++) {
      this._data[i].G = null;
      this._data[i].F = null;
      this._data[i].Parent = null;
    }

    var path_ = []
    if (change_pos) {
      for (let i = path.length -1; i >= 0; i--) {
        path_.push(path[i])
      }
    }else {
      for (let i = 0; i < path.length; i++) {
        path_.push(path[i])
      }
    }

    return path_;
  }

  debug(path, start, endpos) {
    console.log("=============debug=============");
    for (let i = 0; i < this._height; i++) {
      var line = "";
      for (let j = 0; j < this._width; j++) {
        if (start && start.x == i && start.y == j) {
          line = line + "A" + "  ";
        } else if (endpos && endpos.x == i && endpos.y == j) {
          line = line + "B" + "  ";
        } else if (path && this.containGrid(path, { x: i, y: j })) {
          line = line + "+" + "  ";
        } else {
          line =
            line + (this.getGridCanMove({ x: i, y: j }) ? " " : "*") + "  ";
        }
      }
      console.log(line);
    }
    console.log("=============end=============");
  }
}

module.exports = AStar;
