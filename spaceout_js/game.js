var VK_ENTER = 13,
	VK_SPACE = 32,
	VK_LEFT = 37,
	VK_UP = 38,
	VK_RIGHT = 39,
	VK_DOWN = 40,
	VK_A = 65,
	VK_W = 87,
	VK_D = 68,
	VK_S = 83,
	VK_R = 82,
	VK_PAUSE = 19;

function copy(o){
	return JSON.parse(JSON.stringify(o));
}
/**
 * 计时器
 */
function Timer(fps){
	this.fps = fps;
	this.frameTime = 1000 / fps;
}

/**
 * 启动
 */
Timer.prototype.start = function(){
	//设置计数器起始值
	this.startTime = Date.now();
	//lastTime 记录上一次的时间值
	this.lastTime = Date.now() - this.startTime;
	
	//更新时间在下一帧使用
	this.nextTime = this.lastTime;
};

/**
 * 是否允许下一帧
 */
Timer.prototype.readyForNextFrame = function(){
	//逝去的时间
	this.currentTime = Date.now() - this.startTime;
	
	if(this.currentTime > this.nextTime){
		//逝去的时间
		this.timeElapsed = (this.currentTime - this.lastTime) / 1000;
		this.lastTime = this.currentTime;
		//更新时间
		this.nextTime = this.currentTime + this.frameTime;
		return true;
	}
	return false;
};

function loadResources(srcMaps, cb, listener){
	loadImage(srcMaps, cb, listener);
}

function loadImage(srcMaps, cb, listener){
		//console.log(srcMaps);
		var imageMaps = {};
		function check(listener){
			//console.log('check.');
			if(listener)
				listener(Object.keys(imageMaps).length, Object.keys(srcMaps).length);
			if(Object.keys(srcMaps).length == Object.keys(imageMaps).length){
				console.log('ImgaeLoader All Over.');
				cb(imageMaps);
			}
		}
		for(var key in srcMaps){
			if(srcMaps[key].indexOf('.mid')!=-1){
				function t(){
					var theKey = key;
					loadRemote(srcMaps[theKey], function(data) {
						imageMaps[theKey] = data;
						check(listener);
					});
				}(t());
			}else if(srcMaps[key].indexOf('.ogg')!=-1
			|| srcMaps[key].indexOf('.mp3')!=-1){
				function t(){
					var theKey = key;
					loadSound(srcMaps[theKey], {
						success:function(buffer){
							//console.log('ogg_key='+theKey);
							imageMaps[theKey] = buffer;
							check(listener);
						},
						error:function(err){
							console.log('err', err);
							imageMaps[theKey] = null;
							check(listener);
						}
					});
				}(t());
			}else{
				var image = new Image();
				image.src = srcMaps[key];
				image.key = key;
				image.onload = function(){
					imageMaps[this.key] = this;
					check(listener);
				};
			}
		}
	}

/**
 * 产生L到B之间的随机整数
 */
Math.randInt = function (L, B) {
	return Math.floor( Math.random()*(B - L + 1)) + L;
};

/**
 * 修改rect大小
 */
function inflateRect(rect, dx){
	if(rect.left-dx<rect.right+dx && rect.top-dx<rect.bottom+dx){
		rect.left -= dx;
		rect.top -= dx;
		rect.right += dx;
		rect.bottom += dx;
	}
}
/**偏移rect */
function offsetRect(rect, dx, dy){
	rect.left += dx;
	rect.right += dx;

	rect.top += dy;
	rect.bottom += dy;
}

function copyRect(){
	var rect;
	var src;
	if(arguments.length == 1){
		src = arguments[0];
		rect = new Rect();
	}else{
		src = arguments[1];
		rect = arguments[0];
	}
	rect.left = src.left;
	rect.top = src.top;
	rect.right = src.right;
	rect.bottom = src.bottom;
	return rect;
}

function ptInRect(rect, x, y){
	return x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom;
}

function resizeCanvas(oWidth, oHeight, center){
  var clientWidth = window.innerWidth;
  var clientHeight = window.innerHeight;

  var canvasWidth = oWidth;//clientWidth
  var canvasHeight = oHeight;//clientHeight
  //宽高比528/512
  if(clientHeight > clientWidth){
    //竖屏
    canvasWidth = clientWidth;
    canvasHeight = clientWidth*oHeight/oWidth;
  }else{
    canvasHeight = clientHeight;
    canvasWidth = clientHeight*oWidth/oHeight;
  }
  canvas.style.width = canvasWidth+'px';
  canvas.style.height = canvasHeight+'px';
  //设置比例
  canvas.ratio = canvas.ratioX = canvas.ratioY = canvasWidth/canvas.width;
  //左右居中
  canvas.style.marginLeft = (clientWidth-canvasWidth)/2+'px';
  if(center){
	  //上下居中
	  canvas.style.marginTop = (clientHeight-canvasHeight)/2+'px';
  }
}

function touchX(event){
	var event = event || window.event;
	var x = event.touches[0].pageX;
	
	if(canvas.ratio){
		return x/canvas.ratio;
	}else{
		return x;
	}
}

function touchY(event){
	var event = event || window.event;
	var y = event.touches[0].pageY;
	if(canvas.ratio){
		return y/canvas.ratio;
	}else{
		return y;
	}
}

function mouseX(event){
	if(canvas.ratio){
		return event.layerX/canvas.ratio;
	}else{
		return event.layerX;
	}
}

function mouseY(event){
	if(canvas.ratio){
		return event.layerY/canvas.ratio;
	}else{
		return event.layerY;
	}
}

function realX(x){
	if(canvas.ratioX){
		return x/canvas.ratioX;
	}else{
		return x/canvas.ratio;
	}
}

function realY(y){
	if(canvas.ratioY){
		return y/canvas.ratioY;
	}else{
		return y/canvas.ratio;
	}
}

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext();

function loadSound(url, cb) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    audioContext.decodeAudioData(request.response, cb.success, cb.error);
  }
  request.send();
}

function loadSoundLoop(buffer) {
  //console.log('playSound>>');
  try{
	var source = audioContext.createBufferSource();
	source.buffer = buffer;
	source.connect(audioContext.destination);
	source.loop = true;
	return source;
  }catch(e){
	  console.log(e);
  }
}

function startPlay(source){
	if(source) source.start(0);
}

function playSound(buffer, loop) {
  //console.log('playSound>>');
  try{
	var source = audioContext.createBufferSource();
	source.buffer = buffer;
	source.connect(audioContext.destination);
	source.loop = loop || false;
	source.start(0);
	return source;
  }catch(e){
	  console.log(e);
  }
}

function stopPlay(source) {
	if(source){
		source.loop = false;
		source.stop();
		source.disconnect();	
	}
}

function playMidi(data, onPlayEnd){
	var midiFile = MidiFile(data);
	var synth = Synth(44100);
	var replayer = Replayer(midiFile, synth);
	var audio = AudioPlayer(replayer, null, onPlayEnd);
}

function loadRemote(path, callback) {
	var fetch = new XMLHttpRequest();
	fetch.open('GET', path);
	fetch.overrideMimeType("text/plain; charset=x-user-defined");
	fetch.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			/* munge response into a binary string */
			var t = this.responseText || "" ;
			var ff = [];
			var mx = t.length;
			var scc= String.fromCharCode;
			for (var z = 0; z < mx; z++) {
				ff[z] = scc(t.charCodeAt(z) & 255);
			}
			callback(ff.join(""));
		}
	}
	fetch.send();
}

Function.prototype.ext = function (parent) {
    this.prototype = new parent();
    var d = {}, 
        p = this.prototype;
    this.prototype.constructor = parent; 
    this.prototype.uber = function uber(name) {
        if (!(name in d)) {
            d[name] = 0;
        }        
        var f, r, t = d[name], v = parent.prototype;
        if (t) {
            while (t) {
                v = v.constructor.prototype;
                t -= 1;
            }
            f = v[name];
        } else {
            f = p[name];
            if (f == this[name]) {
                f = v[name];
            }
        }
        d[name] += 1;
        r = f.apply(this, Array.prototype.slice.apply(arguments, [1]));
        d[name] -= 1;
        return r;
    };
    return this;
};

function Rect(left, top, right, bottom){
	this.left = left;
	this.top = top;
	this.right = right;
	this.bottom = bottom;
};

function newRect(left, top, right, bottom){
	return {left:left, top:top, right:right, bottom:bottom};
};