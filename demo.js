var AStar = require("./AStar");

var width = 20;
var height = 20;

var obj = new AStar(width, height);

for (let i = 0; i < width; i++) {
  for (let j = 0; j < height; j++) {
    var grid = {x : j, y : i}
    obj.setGridCanMove(grid, (parseInt(Math.random() * 10)) < 8)
  }
  
}

var start = {x : 0, y : 0}
var over = {x : width-1, y : height-1}

obj.setGridCanMove(start, true)
obj.setGridCanMove(over, true)

obj.debug()

var info = []
obj.setCanOblique(false)
info = obj.findOptimumSolution(start, over)
obj.debug(info, start, over)


obj.setCanOblique(true)
info = obj.findOptimumSolution(start, over)
obj.debug(info, start, over)