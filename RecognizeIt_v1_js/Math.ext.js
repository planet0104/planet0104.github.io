// JavaScript Document
////////////////////////////////////

//         JavaScript Math 对象 扩展

///////////////////////////////////
/**
 * 产生L到B之间的随机整数
 */
Math.RandInt = function (L, B) {
	return Math.floor( Math.random()*(B - L + 1)) + L;
};

/*
 * 返回 -1 < n < 1
 */
Math.RandomClamped = function(){
	return Math.random() - Math.random();
};
/*
 * 限定大小
 */
Math.Clamp = function(arg, min, max){
	if (arg < min){
		arg = min;
	}
	if(arg > max){
		arg = max;
	}
};