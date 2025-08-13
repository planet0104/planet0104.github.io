//------------------------------------------------------------------------
//
//	Name: Data.js
//
//  Author: Mat Buckland 2002
//
//  Desc: class to manipulate the gesture data for the RecognizeIt mouse
//        gesture recognition code project
//-------------------------------------------------------------------------

//---------------------------------------------------------------
// 
// 训练数据
//---------------------------------------------------------------

var InputVectors = [
	//右
	[1,0, 1,0, 1,0, 1,0, 1,0, 1,0, 1,0, 1,0, 1,0, 1,0, 1,0, 1,0],
	//左
	[-1,0, -1,0, -1,0, -1,0, -1,0, -1,0, -1,0, -1,0, -1,0, -1,0, -1,0, -1,0],
	//下
	[0,1, 0,1, 0,1, 0,1, 0,1, 0,1, 0,1, 0,1, 0,1, 0,1, 0,1, 0,1],
	//上
	[0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1],
	//顺时针正方形
	[1,0, 1,0, 1,0, 0,1, 0,1, 0,1, -1,0, -1,0, -1,0, 0,-1, 0,-1, 0,-1],
	//逆时针正方形
	[-1,0, -1,0, -1,0, 0,1, 0,1, 0,1, 1,0, 1,0, 1,0, 0,-1, 0,-1, 0,-1],
	//右箭头
	[1,0, 1,0, 1,0, 1,0, 1,0, 1,0, 1,0, 1,0, 1,0, -0.45,0.9, -0.9, 0.45, -0.9,0.45],
	//左箭头
	[-1,0, -1,0, -1,0, -1,0, -1,0, -1,0, -1,0, -1,0, -1,0, 0.45,0.9, 0.9, 0.45, 0.9,0.45],
	//西南
	[-0.7,0.7, -0.7,0.7, -0.7,0.7, -0.7,0.7, -0.7,0.7, -0.7,0.7, -0.7,0.7, -0.7,0.7,-0.7,0.7, -0.7,0.7, -0.7,0.7, -0.7,0.7],
	//东南
	[0.7,0.7, 0.7,0.7, 0.7,0.7, 0.7,0.7, 0.7,0.7, 0.7,0.7, 0.7,0.7, 0.7,0.7, 0.7,0.7,0.7,0.7, 0.7,0.7, 0.7,0.7],
	//zorro
	[1,0, 1,0, 1,0, 1,0, -0.72,0.69,-0.7,0.72,0.59,0.81, 1,0, 1,0, 1,0, 1,0, 1,0]
]

var Names = 
[
	"右",
	"左",
	"下",
	"上",
	"顺时针正方形",
	"逆时针正方形",
	"左箭头",
	"右箭头",
	"西南",
	"东南",
	"Z箭头"
]


var Data = function(NumStartPatterns, VectorSize){
	//训练集合
	this.SetIn = [];
	this.SetOut = [];
	
	//手势的名称
	this.Names = [];
	
	//组成手势的向量(模式)
	this.Patterns = [];
	
	//加载到数据库的模式数量
	this.NumPatterns = NumStartPatterns;
	
	//样本向量的长度
	this.VectorSize = VectorSize;
	
	this.Init();
	this.CreateTrainingSetFromData();
};

/**
 *将预定义的模式和名称添加到Names和Patterns
 */
Data.prototype.Init = function(){
	//循环模式数据
	for(var ptn=0; ptn<this.NumPatterns; ptn++){
		//将其添加到模式数组
		var temp = [];
		
		for(var v=0; v<this.VectorSize*2; v++){
			temp.push(InputVectors[ptn][v]);
		}
		
		this.Patterns.push(temp);
		
		//添加模式的名称
		this.Names.push(Names[ptn]);
	}
};

/**
 * 这个函数从定义的数据中创建训练集，
 *一些附加的模式将通过添加随机噪声形成
 */
Data.prototype.CreateTrainingSetFromData = function(){
	//清空向量
	this.SetIn.length = 0;
	this.SetOut.length = 0;
	
	//添加每一个模式
	for(var ptn=0; ptn<this.NumPatterns; ptn++){
		//将数据添加到训练集
		this.SetIn.push(this.Patterns[ptn]);
		
		//给这个模式创建输出向量。首先填充0数组
		var outputs = [];
		for(var i=0; i<this.NumPatterns; i++){
			outputs.push(0);
		}
		
		//设置相关输出为1
		outputs[ptn] = 1;
		
		//添加到输出集合
		this.SetOut.push(outputs);
	}
};

/**
 * 返回val处模式的名称
 */
Data.prototype.PatternName = function(val){
	if(this.Names.length > 0){
		return this.Names[val];
	}else{
		return "";
	}
};

/**
 * 给训练数据中添加一个新的模式和模式名称。
 * 另外，这个函数自动添加正确的模式的脏版本
 */
Data.prototype.AddData = function(data, NewName){
	//检查大小是否正确
	if(data.length != this.VectorSize*2){
		alert("Incorrect Data Size");
		return false;
	}
	
	//添加名字
	this.Names.push(NewName);
	
	//添加数据
	this.Patterns.push(data);
	
	//记录模式数量
	this.NumPatterns++;
	
	//创建新的训练集
	this.CreateTrainingSetFromData();
	
	return true;
};

Data.prototype.GetInputSet = function(){ return this.SetIn };
Data.prototype.GetOutputSet = function(){ return this.SetOut };