function GameEngine(context, width, height, fps){
    this.width = width;
    this.height = height;
    this.sleep = false;
    this.sprites = [];
    this.fps = fps || 1;
    this.zOrder = 0;
    this.context = context;
    this.start = false;
}

GameEngine.prototype.initialize = function(){
};

GameEngine.prototype.start = function(){
    
};

/**
 * 添加一个精灵
 */
GameEngine.prototype.addSprite = function(sprite){
    if(sprite){
        if(this.sprites.length>0){
            //根据z-order插入精灵到数组
            for(var i=0; i<this.sprites.length; i++){
                var siSprite = this.sprites[i];
                if(sprite.zOrder<siSprite.zOrder){
                    this.sprites.splice(i,0,sprite);
                    return;
                }
            }
        }
        this.sprites.push(sprite);
    }
};

GameEngine.prototype.drawSprites = function(context){
    for(var idx=0; idx<this.sprites.length; idx++){
        var sprite = this.sprites[idx];
        sprite.draw(context);
    }
};

/**
 * 更新精灵
 */
GameEngine.prototype.updateSprites = function(){
    var oldSpritePos;
    var spriteAction;

    for(var idx=0; idx<this.sprites.length; idx++){
        var sprite = this.sprites[idx];
        
        //保存精灵旧的位置以防需要回复它
        oldSpritePos = sprite.position;
        //更新精灵
        spriteAction = sprite.update();

        //处理添加精灵操作
        if (spriteAction == SPRITE_ACTION_ADDSPRITE)
        //允许精灵添加一个精灵
            this.addSprite(sprite.addSprite());

        //处理 SPRITE_ACTION_KILL
        if(spriteAction == SPRITE_ACTION_KILL){
            //通知游戏精灵死亡
            this.spriteDying(sprite);

            //kill
            this.sprites.splice(idx, 1);
            idx--;
            continue;
        }
        //检查是否与其他精灵发生碰撞
        if(this.checkSpriteCollision(sprite))
            sprite.position = oldSpritePos;
    }
};

/**
 * 清除精灵
 */
GameEngine.prototype.cleanupSprites = function(){
    this.sprites.length = 0;
}

/**
 * 检查一个坐标点是否存在余精灵数组中某个
 */
GameEngine.prototype.isPointInSprite = function(x, y){
    for(var idx=0; idx<this.sprites.length; idx++){
        var sprite = this.sprites[idx];
        if(!sprite.hidden && sprite.isPointInside(x,y))
            return sprite;
    }
    return null;
}

GameEngine.prototype.end = function(){};

GameEngine.prototype.activate = function(){};

GameEngine.prototype.deactivate = function(){};

GameEngine.prototype.paint = function(){};

GameEngine.prototype.cycle = function(){};

GameEngine.prototype.handleKeys = function(){};

GameEngine.prototype.mouseButtonDown = function(x, y){};
GameEngine.prototype.mouseButtonUp = function(x, y){};
GameEngine.prototype.mouseMove = function(x, y){};

/**
 * 处理碰撞检测
 */
GameEngine.prototype.spriteCollision = function(spriteHitter, spriteHittee){

};

/** 死亡处理 */
GameEngine.prototype.spriteDying = function(spriteDying){

};

/**
 * 检测精灵是否与其他精灵发生碰撞
 */
GameEngine.prototype.checkSpriteCollision = function(testSprite){
    for(var idx=0; idx<this.sprites.length; idx++){
        var sprite = this.sprites[idx];
        //确保不与自身进行碰撞检测
        if(testSprite == sprite) continue;
        //检测碰撞
        if(testSprite.testCollision(sprite))
            //检测到碰撞
            return this.spriteCollision(sprite, testSprite);
    }
    //没有碰撞
    return false;
};

