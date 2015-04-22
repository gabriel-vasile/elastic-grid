PIXI.Graphics.prototype.moveTo = function(x, y) {//overwriting some PIXI methods to better suit my project
	if (y === undefined) {						 //extend moveTo to work by providing a single PIXI.Point
		this.drawShape(new PIXI.Polygon([x.x, x.y]))//instead of providing the x and y of a point.
	} else 
		this.drawShape(new PIXI.Polygon([x, y]));
	return this;
};

PIXI.Graphics.prototype.lineTo = function(x, y) {//same as moveTo
	if (y === undefined) {
		this.currentPath.shape.points.push(x.x, x.y);
	} else 
		this.currentPath.shape.points.push(x, y);
	this.dirty = true;
	return this;
};

PIXI.Graphics.prototype.updateVisual = function() {//flags to tell WebGL the visuals need to be redrawn
	this.dirty = true;
	this.clearDirty = true;
}
