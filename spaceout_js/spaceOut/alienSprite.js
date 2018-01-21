//Sprite派生 AlienSprite

function AlienSprite(){
    Sprite.apply(this, arguments);
}

AlienSprite.ext(Sprite);

AlienSprite.prototype.update = function(){

    //调用Sprite的update方法
    var spriteAction = this.uber('update');
    //查看外星人是否应该发射导弹
    if(Math.randInt(0, (difficulty / 2))== 0)
        spriteAction = SPRITE_ACTION_ADDSPRITE;

    return spriteAction;
};


// AlienSprite.prototype.getBitmap = function(){
//     return uber('getBitmap');
// }

AlienSprite.prototype.addSprite = function(){
    //console.log('AlienSprite.prototype.addSprite');
    //创建新的导弹子画面
    var bounds = new Rect(0, 0, 640, 410);
    var pos = this.position;
    var sprite;
    if(this.bitmap == blobboBitmap){
        //Blobbo导弹
        sprite = new Sprite(bMissileBitmap, bounds, BOUNDS_ACTION_DIE);
        sprite.setVelocity(0, 7);//在这个游戏中，Blobbo发射速度最快的导弹
    }else if(this.bitmap == jellyBitmap){
        //Jelly导弹
        sprite = new Sprite(jMissileBitmap, bounds, BOUNDS_ACTION_DIE);
        sprite.setVelocity(0, 5);//Jelly发射中速导弹
    }else{
        //Timmy导弹
        sprite = new Sprite(tMissileBitmap, bounds, BOUNDS_ACTION_DIE);
        sprite.setVelocity(0, 3);//Timmy的导弹是最慢的
    }
    //设置并返回导弹子画面的位置
    sprite.setPosition(pos.left + (this.getWidth() / 2), pos.bottom);
    return sprite;
};