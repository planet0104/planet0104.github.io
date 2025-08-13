// JavaScript Document

/////////////////////////////////////////////////////////////////////
//
//	2D Vector structure and methods
//
/////////////////////////////////////////////////////////////////////

var Vector2D = function(x, y){
	this.x = x || 0;
	this.y = y || 0;
};

Vector2D.prototype.add = function(rhs)
{
	this.x += rhs.x;
	this.y += rhs.y;
	return this;
};

Vector2D.prototype.sub = function(rhs)
{
	this.x -= rhs.x;
	this.y -= rhs.y;
	return this;
};

Vector2D.prototype.mul = function(rhs)
{
	this.x *= rhs;
	this.y *= rhs;
	return this;
};

Vector2D.prototype.div = function(rhs){
	this.x /= rhs;
	this.y /= rhs;
	return this;
};


//两个向量相乘
var Vector2DMUL = function(lhs, rhs){
	var ret = new Vector2D(lhs.x, lhs.y);
	ret.mul(rhs);
	return ret;
};
//两个向量相减
var Vector2DSUB = function(lhs, rhs){
	var ret = new Vector2D(lhs.x, lhs.y);
	ret.sub(rhs);
	return ret;
};
//返回2D向量的长度
var Vec2DLength = function(v){
	return Math.sqrt(v.x * v.x + v.y * v.y);
};
//单位化2D向量
var Vec2DNormalize = function(v){
	var vector_length = Vec2DLength(v);
	if(v.x==0 && vector_length==0){
		v.x = 0;
	}else{
		v.x = v.x / vector_length;
	}
	if(v.y==0 && vector_length==0){
		v.y = 0;
	}else{
		v.y = v.y / vector_length;
	}
};
//计算点积
var Vec2DDot = function(v1, v2){
	return v1.x*v2.x + v1.y*v2.y;
};
//符号
var Vec2DSign = function(v1, v2){
	if(v1.y*v2.x > v1.x*v2.y){
		return 1;
	}else{
		return -1;
	}
};