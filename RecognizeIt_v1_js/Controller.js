//------------------------------------------------------------------------
//
//	Name: CController.js
//
//  Author: Mat Buckland 2002
//
//  Desc: controller class for the RecognizeIt mouse gesture recognition
//        code project
//-------------------------------------------------------------------------
var LEARNING = 0;
var ACTIVE = 1;
var UNREADY = 2;
var TRAINING = 3;

var Controller = function(){

	//鼠标手势路径 未处理和平滑处理过的
	this.Path = [];
	this.SmoothPath = [];
	
	//平滑路径转换成向量
	this.Vectors = [];
	
	//如果用户正在画手势，为真
	this.isDrawing = false;
	
	//网络过程最高输出. 最可能被选中的合适手势
	this.HighestOutput = 0;
	
	//基于HighestOutput的最好的手势
	this.BestMatch = -1;
	
	//如果网络发现一个模式，这个是匹配
	this.Match = -1;
	
	//未处理鼠标手势将被用下面个数的点平滑处理
	this.NumSmoothPoints = NUM_VECTORS+1;
	
	//数据库里的模式数量
	this.NumValidPatterns = NUM_PATTERNS;
	
	//程序的当前状态
	this.Mode = UNREADY;
	
	//临时存储新添加的手势名称
	this.PatternName = "";
	
	//这个类存储所有训练数据
	this.Data = new Data(this.NumValidPatterns, NUM_VECTORS);
	
	//设置神经网络
	this.Net = new NeuralNet(NUM_VECTORS*2,	//inputs
							this.NumValidPatterns,	//outputs
							NUM_HIDDEN_NEURONS,	//hidden
							LEARNING_RATE);
};

//清空鼠标向量
Controller.prototype.Clear = function(){
	this.Path.length = 0;
	this.SmoothPath.length = 0;
	this.Vectors.length = 0;
};

//如果用户输入了一个手势弹出对话框
Controller.prototype.Dialog = function(){};

//下面这个Drawing函数是当鼠标右键按下或释放时都要调用的一个函数
//如果其中的第一个参数val为true，则标明鼠标右键已经按下。鼠标原有数据
//均要被清除，为接受下一个手势做好了准备

//如果val为false，则手势已经完成。这时手势或者就被添加到当前的数据集
//或者测试它是否与已经存在的某个模式匹配
Controller.prototype.Drawing = function(val)
{
	if(val == true)
	{
		this.Clear();
	}
	else
	{
		//如果点数足够，平滑和向量化数据
		if(this.Smooth())
		{
			//创建向量
			this.CreateVectors();
			if(this.Mode == ACTIVE)
			{
				if(!this.TestForMatch())
				{
					return false;
				}
			}
			else
			{
				//如果用户对手势满意，添加数据
				if(confirm("是否满意这个手势？"))
				{
					//获取手势名称
					this.PatternName = prompt("请输入手势名称：","");
					//添加数据
					this.Data.AddData(this.Vectors, this.PatternName);
					
					//删除旧网络
					this.Net = null;
					this.NumValidPatterns++;
					//创建一个新网络
					this.Net = new NeuralNet(NUM_VECTORS*2,
                                   this.NumValidPatterns,
                                   NUM_VECTORS*2,
                                   LEARNING_RATE);
					//训练网络
					this.TrainNetwork();
					this.Mode = ACTIVE;
				}
				else
				{
					//删除否决的手势
					this.Path.length = 0;
				}
			}
		}
	}
	this.isDrawing = val;
	return true;
};

//训练网络，使用当前数据集合通过backprop训练
Controller.prototype.TrainNetwork = function()
{
	this.Mode = TRAINING;
	if(!this.Net.Train(this.Data))
	{
		return false;
	}
	this.Mode = ACTIVE;
	return true;
};


//在先前学习好的手势中测试一个适合学习模式的手势
Controller.prototype.TestForMatch = function()
{
	//将平滑后的鼠标数据输入网络并找到匹配
	var outputs = this.Net.Update(this.Vectors);
	if(outputs.length == 0)
	{
		alert("ANN输出有误");
		return false;
	}
	
	//选择出最高的
	this.HighestOutput = 0;
	this.BestMatch = 0;
	this.Match = -1;
	
	for(var i=0; i<outputs.length; i++)
	{
		if(outputs[i] > this.HighestOutput)
		{
			//标记最合适的候选
			this.HighestOutput = outputs[i];
			
			this.BestMatch = i;
			
			//如果候选的输出超过极限就找到了一个结果！对其进行标记
			if(this.HighestOutput > MATCH_TOLERANCE)
			{
				this.Match = this.BestMatch;
				try{
						console.log("找到了一个结果！this.Match="+this.BestMatch);
					}catch(e){}
			}
		}
	}
	
	return true;
};

//清除屏幕，把应用程序设置为learning模式，准备接受用户定义手势
Controller.prototype.LearningMode = function()
{
	this.Mode = LEARNING;
	this.Clear();
	//更新窗口
};


//给出一系列点，创建一个路径
Controller.prototype.CreateVectors = function()
{
	for(var p=1; p<this.SmoothPath.length; p++)
	{
		var x = this.SmoothPath[p].x - this.SmoothPath[p-1].x;
		var y = this.SmoothPath[p].y - this.SmoothPath[p-1].y;
		var v1 = new Vector2D(1, 0);
		var v2 = new Vector2D(x, y);
		
		Vec2DNormalize(v2);
		this.Vectors.push(v2.x);
		this.Vectors.push(v2.y);
	}
};

//将鼠标数据转换成一定数量的点
Controller.prototype.Smooth = function()
{
	//确保工作的点达到足够的数目
	if(this.Path.length < this.NumSmoothPoints)
	{
		//返回
		return false;
	}
	
	//复制原始未加工的鼠标数据
	this.SmoothPath = this.Path.clone();
	
	//当点数过多时，通过对所有的点循环，找出最小的跨度，在它原有位置中间
	//创建一个新点，并删除原有的两个点
	while(this.SmoothPath.length > this.NumSmoothPoints)
	{
		var ShortestSofar = 99999999;
		var PointMarker = 0;
		
		//计算最短跨度(即相邻两点间的距离)
		//console.log("this.SmoothPath.length="+this.SmoothPath.length);
		for(var SpanFront = 2; SpanFront < this.SmoothPath.length-1; SpanFront++)
		{
			//在这些点之间计算距离
			var len = Math.sqrt(
							(this.SmoothPath[SpanFront-1].x -
							 this.SmoothPath[SpanFront].x)*
							 (this.SmoothPath[SpanFront-1].x -
							 this.SmoothPath[SpanFront].x)+
							 (this.SmoothPath[SpanFront-1].y -
							 this.SmoothPath[SpanFront].y)*
							 (this.SmoothPath[SpanFront-1].y -
							 this.SmoothPath[SpanFront].y)
							);
			//console.log("len="+len);
			if(len < ShortestSofar)
			{
				ShortestSofar = len;
				PointMarker = SpanFront;
			}
		}
		//console.log("PointMarker="+PointMarker);
		
		//找出最短跨度，然后计算跨度的中点，作为新点的插入位置，并删除跨度
		//原来的两个点
		var newPoint = {x:0,y:0};
		newPoint.x = (this.SmoothPath[PointMarker-1].x +
					this.SmoothPath[PointMarker].x)/2;
		newPoint.y = (this.SmoothPath[PointMarker-1].y +
					this.SmoothPath[PointMarker].y)/2;
					
		this.SmoothPath[PointMarker-1] = newPoint;
		this.SmoothPath.remove(PointMarker, PointMarker);
	}
	return true;
};

//画出鼠标手势和有关数据，例如训练代数和错误信息
Controller.prototype.Render = function(c)
{
	if(this.Mode == TRAINING)
	{
		var s = "Error: " + this.Net.ErrorSum;
		c.strokeText(s, WINDOW_WIDTH/2, 10);
		s = "Epochs: " + this.Net.NumEpochs;
		c.strokeText(s, 5, 15);
	}
	
	if(this.Net.Trained){
		if(this.Mode == ACTIVE)
		{
			var s = "手势识别状态:OK";
			c.strokeText(s, 5, WINDOW_WIDTH-10);
		}
		
		if(this.Mode == LEARNING)
		{
			var s = "Recognition circuits offline - Enter a new gesture";
			c.strokeText(s, 5, WINDOW_WIDTH-20);
		}
	}
	else
	{
		var s = "Training in progress...";
		c.strokeText(s, 5, WINDOW_WIDTH-20);
	}
	
	if(!this.isDrawing)
	{
		//render best match
		if(this.HighestOutput > 0)
		{
			if((this.SmoothPath.length > 1) && (this.Mode != LEARNING) )
			{
				//如果最高输出小于容忍值
				if(this.HighestOutput < MATCH_TOLERANCE)
				{
					var s = "我猜是： " +
								this.Data.PatternName(this.BestMatch);
					c.strokeText(s, 5, 15);
				}
				//否则
				else
				{
					c.fillStyle = '#00f';
					var s = this.Data.PatternName(this.Match);
					c.strokeText(s, 5, 15);
					c.fillStyle = '#000';
				}
			}
			else if(this.Mode != LEARNING)
			{
				c.fillStyle = '#f00';

				var s = "没有足够的点绘图，再试一次";
				c.strokeText(s, 5, 15);

				c.fillStyle = '#000';
			}
			
		}
	}

	if(this.Path.length < 1)
	{
		return;
	}
	//画路径
	c.beginPath();
	//开始画线
	c.moveTo(this.Path[0].x, this.Path[0].y);
	for(var vtx=1; vtx<this.Path.length; vtx++)
	{
		c.lineTo(this.Path[vtx].x, this.Path[vtx].y);
	}
	c.stroke();
	//c.closePath();
	//画线将平滑的路径连起来
	
	if((!this.isDrawing) && (this.SmoothPath.length > 0))
	{
		//for(var vtx=0; vtx<this.Path.length; vtx++)
		for(var vtx=1; vtx<this.SmoothPath.length; vtx++)
		{
			
			var pt = this.SmoothPath[vtx];
			//Ellipse(surface, pt.x-2, pt.y-2, pt.x+2, pt.y+2);
			//c.arc(pt.x,pt.y,2,true);
			c.beginPath();
			c.arc(pt.x,pt.y,2,0,Math.PI*2,true);
			c.stroke();
		}
	}
	
	//c.stroke();
};

//调用本函数把一个点加入鼠标路径
Controller.prototype.AddPoint = function(p)
{
	this.Path.push(p);
};

