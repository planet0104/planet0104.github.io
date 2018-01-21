var BOUNDS_ACTION_STOP = 0;
var BOUNDS_ACTION_WRAP = 1;
var BOUNDS_ACTION_BOUNCE = 2;
var BOUNDS_ACTION_DIE = 3;

var SPRITE_ACTION_NONE = 0;
var SPRITE_ACTION_KILL = 1;
var SPRITE_ACTION_ADDSPRITE = 2;

/***
 * 精灵
 * @bitmap 位图
 * @bounds 移动范围
 * @boundsAction 达到边界时的动作
 */
function Sprite(bitmap, bounds, boundsAction){
  if(bitmap ==null) return;
  this.bitmap = bitmap;
  this.bounds = {left:0, top:0, right:bitmap.width, bottom:bitmap.height};
  if(bounds){
    this.bounds.left = bounds.left;
    this.bounds.top = bounds.top;
    this.bounds.right = bounds.right;
    this.bounds.bottom = bounds.bottom;
  }
  this.boundsAction = boundsAction || BOUNDS_ACTION_STOP;
  this.velocity = {x:0, y:0};
  //计算一个随机位置
  var xPos = Math.randInt(0, this.bounds.right - this.bounds.left);
  var yPos = Math.randInt(0, this.bounds.bottom - this.bounds.top);
  this.position = new Rect(xPos, yPos, xPos+bitmap.width, yPos+bitmap.height);
  
  //碰撞检测矩形
  this.collision = {};
  //标记是否死亡
  this.dying = false;
  //显示完所有帧之后删除子画面
  this.oneCycle = false;
	this.zOrder = 0;
	this.hidden = false;
  this.numFrames = 1;
  this.curFrame = 0;
  this.frameDelay = 0;
  this.frameTrigger = 0;
}

Sprite.prototype.kill = function(){ this.dying = true; };

Sprite.prototype.addSprite = function(){
    //console.log('Sprite.prototype.addSprite');
    return null;
};

/** 更新 */
Sprite.prototype.update = function(){
  //console.log('>>this.boundsAction='+this.boundsAction+'>>'+this.bitmap.src);
  //查看是否需要删除子画面
  if(this.dying)
    return SPRITE_ACTION_KILL;
  //更新帧
  this.updateFrame();
	var newPosition={}, spriteSize={}, boundsSize={};
	newPosition.x = this.position.left + this.velocity.x;
	newPosition.y = this.position.top + this.velocity.y;
	spriteSize.x = this.position.right - this.position.left;
	spriteSize.y = this.position.bottom - this.position.top;
	boundsSize.x = this.bounds.right - this.bounds.left;
	boundsSize.y = this.bounds.bottom - this.bounds.top;
  //检查边界动作
  if(this.boundsAction == BOUNDS_ACTION_WRAP){
    if((newPosition.x + spriteSize.x)<this.bounds.left)
      newPosition.x = this.bounds.right;
    else if(newPosition.x > this.bounds.right)
      newPosition.x = this.bounds.left - spriteSize.x;
    
    if((newPosition.y + spriteSize.y)<this.bounds.top)
      newPosition.y = this.bounds.bottom;
    else if(newPosition.y>this.bounds.bottom)
      newPosition.y = this.bounds.top - spriteSize.y;
  }else if(this.boundsAction == BOUNDS_ACTION_BOUNCE){
    var bounce = false;
    var newVelocity = copy(this.velocity);
    if(newPosition.x < this.bounds.left){
      bounce = true;
      newPosition.x = this.bounds.left;
      newVelocity.x = -newVelocity.x;
    }else if((newPosition.x + spriteSize.x)>this.bounds.right){
        bounce = true;
        newPosition.x = this.bounds.right - spriteSize.x;
        newVelocity.x = -newVelocity.x;
    }
    if(newPosition.y<this.bounds.top){
      bounce = true;
      newPosition.y = this.bounds.top;
      newVelocity.y = -newVelocity.y;
    }else if((newPosition.y+spriteSize.y)>this.bounds.bottom){
      bounce = true;
      newPosition.y = this.bounds.bottom - spriteSize.y;
      newVelocity.y = -newVelocity.y;
    }
    if(bounce){
      this.setVelocity(newVelocity.x, newVelocity.y);
    }
  }else if(this.boundsAction == BOUNDS_ACTION_DIE){
    if((newPosition.x + spriteSize.x)<this.bounds.left ||
    newPosition.x > this.bounds.right ||
    (newPosition.y + spriteSize.y)<this.bounds.top ||
    newPosition.y > this.bounds.bottom)
    return SPRITE_ACTION_KILL;
  }else{
    //停止(默认)
    if(newPosition.x < this.bounds.left || newPosition.x>(this.bounds.right-spriteSize.x)){
      newPosition.x = Math.max(this.bounds.left, Math.min(newPosition.x, this.bounds.right-spriteSize.x));
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
    if(newPosition.y < this.bounds.top || newPosition.y>(this.bounds.bottom-spriteSize.y)){
      newPosition.y = Math.max(this.bounds.top, Math.min(newPosition.y, this.bounds.bottom-spriteSize.y));
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
  }
  this.setPosition(newPosition.x, newPosition.y);
  return SPRITE_ACTION_NONE;
};
Sprite.prototype.draw = function(context){
  //如果没有隐藏，则绘制子画面
  if(this.bitmap && !this.hidden){
    //如果有必要，绘制适当的帧
    if(this.numFrames == 1)
      context.drawImage(this.bitmap, this.position.left, this.position.top);
    else
      context.drawImage(this.bitmap, 0, this.curFrame * this.getHeight(), this.getWidth(), this.getHeight(), this.position.left, this.position.top, this.getWidth(), this.getHeight());
  }
};
Sprite.prototype.offsetPosition = function(x, y){
  offsetRect(this.position, x, y);
  this.calcCollisionRect();
};
Sprite.prototype.setPosition = function(x, y){
  offsetRect(this.position, x - this.position.left, y - this.position.top);
  this.calcCollisionRect();
};

Sprite.prototype.getX = function(){
  return this.position.left+(this.position.right - this.position.left) /2;
};

Sprite.prototype.getY = function(){
  return this.position.top+(this.position.bottom - this.position.top) /2;
};

Sprite.prototype.getWidth = function(){ return this.bitmap.width; };
Sprite.prototype.getHeight = function(){ return this.bitmap.height / this.numFrames; };
Sprite.prototype.setVelocity = function(x, y){
  this.velocity.x = x;
  this.velocity.y = y;
  return this;
};

Sprite.prototype.isPointInside = function(x, y){
  return ptInRect(this.position, x, y);
};

/** 根据位置矩形计算碰撞矩形 **/
Sprite.prototype.calcCollisionRect = function(){
  var xShrink = (this.position.left-this.position.right)/12;
  var yShrink = (this.position.top-this.position.bottom)/12;
  copyRect(this.collision, this.position);
  inflateRect(this.collision, xShrink, yShrink);
};

/** 检测是否与另一个子画面碰撞 **/
Sprite.prototype.testCollision = function(testSprite){
  var rectTest = testSprite.collision;
  return this.collision.left <= rectTest.right &&
        rectTest.left <= this.collision.right &&
        this.collision.top <= rectTest.bottom &&
        rectTest.top <= this.collision.bottom;
};

/**
 * 设置子画面帧数
 */
Sprite.prototype.setNumFrames = function(numFrames, oneCycle){
  this.oneCycle = oneCycle || false;
  //设置帧数
  this.numFrames = numFrames;
  //重新计算位置
  this.position.bottom = this.position.top + ((this.position.bottom - this.position.top) / numFrames);
  this.calcCollisionRect();
};

Sprite.prototype.getBitmap = function(){
  return this.bitmap;
}

/**
 * 更新自画面的当前动画帧
 */
Sprite.prototype.updateFrame = function(){
  this.frameTrigger--;
  if(this.frameDelay >= 0 && this.frameTrigger <=0){
    //重置帧触发器
    this.frameTrigger = this.frameDelay;
    //将帧加1
    this.curFrame++;
    if(this.curFrame >= this.numFrames){
      //检查是否显示完所有帧之后删除子画面
      if(this.oneCycle)
        this.dying = true;
      else
        this.curFrame = 0;
    }
  }
};


function Background(){
  if(arguments.length==1){
    //console.log('Background>arguments.length==1');
    this.bitmap = arguments[0];
    this.color = 0;
    this.width = this.bitmap.width;
    this.height = this.bitmap.height;
  }
  if(arguments.length == 3){
    //console.log('Background>arguments.length==3');
    this.width = arguments[0];
    this.height = arguments[1];
    this.color = arguments[2];
  }
}

Background.prototype.update = function(){

};

Background.prototype.draw = function(){
  //绘制背景
  if(this.bitmap)
    context.drawImage(this.bitmap, 0, 0);
  else{
    context.fillStyle = this.color;
    context.fillRect(0, 0, this.width, this.height);
  }
};


//背景图层
function BackgroundLayer(bitmap, speed, direction){
    this.bitmap = bitmap;
    this.direction = direction ||　BackgroundLayer.SCROLL_LEFT;
    this.width = this.bitmap.width;
    this.height = this.bitmap.height;
    this.speed = speed || 0;
    //将视口默认设置为整个图层图像
    this.viewPort = new Rect();
    this.viewPort.left = this.viewPort.top = 0;
    this.viewPort.right = this.bitmap.width;
    this.viewPort.bottom = this.bitmap.height;
    //console.log('this.speed=', speed, 'direction', direction);
}

BackgroundLayer.prototype.update = function(){
    //console.log('layer update:');
    switch(this.direction){
        case BackgroundLayer.SCROLL_UP:
            //向上移动图层
            this.viewPort.top += this.speed;
            this.viewPort.bottom += this.speed;
            //如果视口已经完全从位图的底部卷出，则将其移动到位图的顶部
            if(this.viewPort.top > this.height){
                this.viewPort.bottom = this.viewPort.bottom - this.viewPort.top;
                this.viewPort.top = 0;
            }
        break;
        case BackgroundLayer.SCROLL_RIGHT:
            //向右移动图层
            this.viewPort.left -= this.speed;
            this.viewPort.right -= this.speed;
            //如果视口已经完全从位图左侧卷出则将其移动到位图的右侧
            if(this.viewPort.right < 0){
                this.viewPort.left = this.width - (this.viewPort.right - this.viewPort.left);
                this.viewPort.right = this.width;
            }
        break;
        case BackgroundLayer.SCROLL_DOWN:
            //向下移动图层
            this.viewPort.top -= this.speed;
            this.viewPort.bottom -= this.speed;
            if(this.viewPort.bottom < 0){
                this.viewPort.top = this.height - (this.viewPort.bottom - this.viewPort.top);
                this.viewPort.bottom = this.height;
            }
        break;
        case BackgroundLayer.SCROLL_LEFT:
            //向左移动图层
            this.viewPort.left += this.speed;
            this.viewPort.right += this.speed;
            if(this.viewPort.left > this.width){
                this.viewPort.right = (this.viewPort.right - this.viewPort.left);
                this.viewPort.left = 0;
            }
        break;
    }
};

BackgroundLayer.prototype.draw = function(context, x, y){
    //只绘制通过视口看到的那一部分图层
    //如果视口从微秃的顶部和左侧卷出则分成4段绘制卷出的图像
    if(this.viewPort.top <0 && this.viewPort.left < 0){
        //绘制拆开的视口，从顶部环绕到底部，从左侧环绕到右侧

        //绘制左上部分(对应图片右下部分)
        context.drawImage(this.bitmap,
            this.width+this.viewPort.left, this.height+this.viewPort.top, //图像源左上角
            -this.viewPort.left, -this.viewPort.top,    //图像源宽高
            x, y,//目标绘制坐标
            -this.viewPort.left, -this.viewPort.top);
        //绘制右上部分(对应图片左下部分)
        context.drawImage(this.bitmap,
            0, this.height + this.viewPort.top,
            -this.viewPort.right, -this.viewPort.top,
            x-this.viewPort.left, y,
            -this.viewPort.right, -this.viewPort.top);
        //绘制左下部分(对应图片右上部分)
        context.drawImage(this.bitmap,
            this.width+this.viewPort.left, 0,
            -this.viewPort.left, this.viewPort.bottom,
            x, y - this.viewPort.top,
            -this.viewPort.left, this.viewPort.bottom);
        //绘制右下部分(对应图片左上部分)
        context.drawImage(this.bitmap,
            0, 0,
            this.viewPort.right, this.viewPort.bottom,
            x - this.viewPort.left, y - this.viewPort.top,
            this.viewPort.right, this.viewPort.bottom);
    }else if(this.viewPort.top < 0 && this.viewPort.right > this.width){
        //绘制拆开的视口，从顶部环绕到底部，从右侧环绕到左侧
        context.drawImage(this.bitmap,
            this.viewPort.left, this.height + this.viewPort.top,
            this.width - this.viewPort.left, -this.viewPort.top,
            x, y,
            this.width - this.viewPort.left, -this.viewPort.top);
        context.drawImage(this.bitmap,
            0, this.height + this.viewPort.top,
            this.viewPort.right - this.width, -this.viewPort.top,
            x + (this.width - this.viewPort.left), y,
            this.viewPort.right - this.width, -this.viewPort.top);
        context.drawImage(this.bitmap,
            this.viewPort.left, 0,
            this.width - this.viewPort.left, this.viewPort.bottom,
            x, y - this.viewPort.top,
            this.width - this.viewPort.left, this.viewPort.bottom);
        context.drawImage(this.bitmap,
            0, 0,
            this.viewPort.right - this.width, this.viewPort.bottom,
            x + (this.width - this.viewPort.left), y - this.viewPort.top,
            this.viewPort.right - this.width, this.viewPort.bottom);
    }else if(this.viewPort.bottom > this.height && this.viewPort.left < 0){
        //绘制拆开的视口，从底部环绕到顶部，从左侧环绕到右侧
        context.drawImage(this.bitmap,
            this.width + this.viewPort.left, this.viewPort.top,
            -this.viewPort.left, this.height - this.viewPort.top,
            x, y,
            -this.viewPort.left, this.height - this.viewPort.top);
        context.drawImage(this.bitmap,
            0, this.viewPort.top,
            this.viewPort.right, this.height - this.viewPort.top,
            x - this.viewPort.left, y,
            this.viewPort.right, this.height - this.viewPort.top);
        context.drawImage(this.bitmap,
            this.width + this.viewPort.left, 0,
            -this.viewPort.left, thyis.viewPort.bottom - this.height,
            x, y + (this.height - this.viewPort.top),
            -this.viewPort.left, thyis.viewPort.bottom - this.height);
        context.drawImage(this.bitmap,
            0, 0,
            this.viewPort.right, this.viewPort.bottom - this.height,
            x - this.viewPort.left, y + (this.height - this.viewPort.top),
            this.viewPort.right, this.viewPort.bottom - this.height);
    }else if(this.viewPort.bottom > this.height && this.viewPort.right > this.width){
        //绘制所有窗口，从底部环绕到顶部，从右侧环绕到左侧
        context.drawImage(this.bitmap,
            this.viewPort.left, this.viewPort.top,
            this.width - this.viewPort.left, this.height - this.viewPort.top,
            x, y,
            this.width - this.viewPort.left, this.height - this.viewPort.top);
        context.drawImage(this.bitmap,
            0, this.viewPort.top,
            this.viewPort.right - this.width, this.height - this.viewPort.top,
            x + (this.width - this.viewPort.left), y,
            this.viewPort.right - this.width, tis.height - this.viewPort.top);
        context.drawImage(this.bitmap,
            this.viewPort.left, 0,
            this.width - this.viewPort.left, this.viewPort.bottom - this.height,
            x, y+ (this.height - this.viewPort.top),
            this.width - this.viewPort.left, this.viewPort.bottom - this.height);
        context.drawImage(this.bitmap,
            0, 0,
            this.viewPort.right - this.width, this.viewPort.bottom - this.height,
            x + (this.width - this.viewPort.left), y + (this.height - this.viewPort.top),
            this.viewPort.right - this.width, this.viewPort.bottom - this.height);
    }else if(this.viewPort.top < 0){
        //绘制拆开的视口，从顶部环绕到底部
        context.drawImage(this.bitmap,
            this.viewPort.left, this.height + this.viewPort.top,
            this.viewPort.right - this.viewPort.left, -this.viewPort.top,
            x, y,
            this.viewPort.right - this.viewPort.left, -this.viewPort.top);
        context.drawImage(this.bitmap,
            this.viewPort.left, 0,
            this.viewPort.right - this.viewPort.left, this.viewPort.bottom,
            x, y - this.viewPort.top,
            this.viewPort.right - this.viewPort.left, this.viewPort.bottom);
    }else if(this.viewPort.right > this.width){
        //绘制拆开的视口，从右侧环绕到左侧
        var w = this.width - this.viewPort.left;
        var h = this.viewPort.bottom - this.viewPort.top;
        if(w>0 && h>0){
          context.drawImage(this.bitmap,
            this.viewPort.left, this.viewPort.top,
            w, h,
            x, y,
            w, h);
        }
        
        context.drawImage(this.bitmap,
            0, this.viewPort.top,
            this.viewPort.right - this.width, this.viewPort.bottom - this.viewPort.top,
            x + (this.width - this.viewPort.left), y,
            this.viewPort.right - this.width, this.viewPort.bottom - this.viewPort.top);
    }else if(this.viewPort.bottom > this.height){
        //绘制拆开的窗口，从底部环绕到顶部
        context.drawImage(this.bitmap,
            this.viewPort.left, this.viewPort.top,
            this.viewPort.right - this.viewPort.left, this.height - this.viewPort.top,
            x, y,
            this.viewPort.right - this.viewPort.left, this.height - this.viewPort.top);
        context.drawImage(this.bitmap,
            this.viewPort.left, 0,
            this.viewPort.right - this.viewPort.left, this.viewPort.bottom - this.height,
            x, y+(this.height - this.viewPort.top),
            this.viewPort.right - this.viewPort.left, this.viewPort.bottom - this.height);
    }else if(this.viewPort.left < 0){
        //绘制拆开的视口，从左侧环绕到右侧
        context.drawImage(this.bitmap,
            this.width + this.viewPort.left, this.viewPort.top,
            -this.viewPort.left, this.viewPort.bottom - this.viewPort.top,
            x, y,
            -this.viewPort.left, this.viewPort.bottom - this.viewPort.top);
        context.drawImage(this.bitmap,
            0, this.viewPort.top,
            this.viewPort.right, this.viewPort.bottom - this.viewPort.top,
            x - this.viewPort.left, y,
            this.viewPort.right, this.viewPort.bottom - this.viewPort.top);
    }else{
        //一次性绘制整个视口
        context.drawImage(this.bitmap,
            this.viewPort.left, this.viewPort.top,
            this.viewPort.right - this.viewPort.left, this.viewPort.bottom - this.viewPort.top,
            x, y,
            this.viewPort.right - this.viewPort.left, this.viewPort.bottom - this.viewPort.top);
    }
    
};

BackgroundLayer.prototype.setViewPort = function(rect){
    this.viewPort = copyRect(rect);
};

BackgroundLayer.SCROLL_UP = 0;
BackgroundLayer.SCROLL_RIGHT = 1;
BackgroundLayer.SCROLL_DOWN = 2;
BackgroundLayer.SCROLL_LEFT = 3;

function ScrollingBackground(){
    Background.apply(this, arguments);
    this.layers = [];
}

ScrollingBackground.ext(Background);

ScrollingBackground.prototype.update = function(){
    //调用Background的update方法
    this.uber('update');
    //更新图层
    for(var i=0; i<this.layers.length; i++)
        this.layers[i].update();
};

ScrollingBackground.prototype.draw = function(context){
    //console.log('ScrollingBackground.draw');
    //调用Background的draw方法
    this.uber('draw', context);
    //绘制图层
    for(var i=0; i<this.layers.length; i++)
        this.layers[i].draw(context, 0, 0);
};

ScrollingBackground.prototype.addLayer = function(layer){
      this.layers.push(layer);
};

function StarryBackground() {

    if(arguments.length >= 2){
      this.width = arguments[0];
      this.height = arguments[1];
    }
    if(arguments.length == 2){
      //console.log('Background>arguments.length == 2');
      this.numStars = 100;
      this.twinkleDelay = 50;
    }
    if(arguments.length == 4){
      //console.log('Background>arguments.length == 4');
      this.numStars = arguments[2];
      this.twinkleDelay = arguments[3];
    }
    this.stars = [];
    this.starColors = [];
    //创建星星
    for(var i=0; i<this.numStars; i++){
      this.stars.push({
        x: Math.randInt(0, this.width),
        y: Math.randInt(0, this.height)
      });
      this.starColors.push("rgb(128, 128, 128)");
    }
}

StarryBackground.ext(Background);

StarryBackground.prototype.update = function(){
  //随机更改星星灰度，使之闪烁
  var rgb;
  for(var i=0; i<this.numStars; i++){
    if(Math.randInt(0, this.twinkleDelay) == 0){
      rgb = Math.randInt(0, 256);
      this.starColors[i] = 'rgb('+rgb+','+rgb+','+rgb+')';
    }
  }
};

StarryBackground.prototype.draw = function(){
  //绘制纯黑色背景
  context.fillStyle = 'rgb(0, 0, 0)';
  context.fillRect(0, 0, this.width, this.height);
  //绘制星星
  for(var i=0; i<this.numStars; i++){
    context.fillStyle = this.starColors[i];
    context.fillRect(this.stars[i].x, this.stars[i].y, 1, 1);
  }
};