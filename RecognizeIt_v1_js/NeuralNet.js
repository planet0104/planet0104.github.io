// JavaScript Document
//------------------------------------------------------------------------
//
//	Name: NeuralNet.js
//
//  Author: Mat Buckland 2002
//
//  Desc: 神经网络类
//-------------------------------------------------------------------------

/**
 * 神经细胞结构
 */
var Neuron = function(NumInputs){
	//神经细胞的输入个数
	//要为偏移值也附加一个权重，因此应将输入数目加1
	this.NumInputs  = NumInputs + 1;
	//每一个输入的权重
	this.Weight = [];
	//初始化权重为任意值
	for(var i=0; i<NumInputs+1; i++){
		this.Weight.push(Math.RandomClamped());
	}
	//细胞是否被激活
	this.Activation = 0;
	//错误值
	this.Error = 0;
}

/**
 * 神经细胞层结构
 */
var NeuronLayer = function(NumNeurons, NumInputsPerNeuron){
	//神经细胞数量
	this.NumNeurons = NumNeurons|0;
	//神经细胞层
	this.Neurons = [];
	//创建神经细胞
	for(var i=0; i<NumNeurons; i++){
		this.Neurons.push(new Neuron(NumInputsPerNeuron));
	}
}
 
//-----------------
// 	神经网络类
//-----------------
var NeuralNet = function(NumInputs, NumOutputs, HiddenNeurons, LearningRate){
	this.NumInputs = NumInputs;
	this.NumOutputs = NumOutputs;
	//*****注意：神经网络隐藏层固定为1层
	this.NumHiddenLayers = 1;
	this.NeuronsPerHiddenLyr = HiddenNeurons;
	//必须定义反向传播的学习率
	this.LearningRate = LearningRate;
	//累计神经网络的误差 (sum (outputs - expected))
	this.ErrorSum = 9999;
	//网络是否被培训
	this.Trained = false;
	//迭代计数器
	this.NumEpochs = 0;
	//存储每个层的神经细胞
	this.Layers = [];
	
	//初始化创建网络
	this.CreateNet();
}
 
/**
 * 创建ANN(人工神经网络)。所有权重初始化为 -1 < w < 1的范围
 */
NeuralNet.prototype.CreateNet = function(){
	//创建网络的层
	if(this.NumHiddenLayers > 0){
		//创建第一个隐藏层
		this.Layers.push(new NeuronLayer(this.NeuronsPerHiddenLyr, this.NumInputs));
		for(var i=0; i<this.NumHiddenLayers-1; i++){
			this.Layers.push(new NeuronLayer(this.NeuronsPerHiddenLyr, this.NeuronsPerHiddenLyr));
		}
			//创建输出层
		this.Layers.push(new NeuronLayer(this.NumOutputs, this.NeuronsPerHiddenLyr));
	}
	else
	{
		//创建输出层
		this.Layers.push(new NeuronLayer(this.NumOutputs, this.NumInputs));
	}
};
 
 /**
  * 初始化网络——设置所有权重0-1小随机数
  */
NeuralNet.prototype.InitializeNetwork = function(){
	//对每个层
	for(var i=0; i<this.NumHiddenLayers + 1; i++){
		//对每个神经细胞
		for(var n=0; n<this.Layers[i].NumNeurons; n++){
			//对每个权重
			for(var k=0; k<this.Layers[i].Neurons[n].NumInputs; k++){
				this.Layers[i].Neurons[n].Weight[k] = Math.RandomClamped();
			}
		}
	}
	this.ErrorSum = 9999;
	this.NumEpochs = 0;
};
 
 /**
  * 根据输入集合计算输出集合
  */
NeuralNet.prototype.Update = function(inputs){
	//存储每个层的输出结果
	var outputs = [];
	var Weight = 0;
	//首先检查输入数量是否正确
	if(inputs.length != this.NumInputs){
		//返回一个空数组
		return outputs;
	}
	//对每个层
	for(var i=0; i<this.NumHiddenLayers + 1; i++){
		if(i > 0){
			inputs = outputs.clone();
		}
		outputs.length = 0;
		cWeight = 0;
		 
		//对每个神经细胞计算( 输入 * 对应权重)
		
		for(var n=0; n<this.Layers[i].NumNeurons; n++){
			var netinput = 0;
			var NumInputs = this.Layers[i].Neurons[n].NumInputs;
			//对每个权重
			for(var k=0; k<NumInputs - 1; k++){
				//weights x inputs 相加
				netinput += this.Layers[i].Neurons[n].Weight[k] * 
				inputs[cWeight++];
			}
			
			 
			//添加偏移量bias
			netinput += this.Layers[i].Neurons[n].Weight[NumInputs-1] * BIAS;
			 
			//组合好的激活 首先通过S形函数过滤，并为每个神经细胞保存一个记录
			this.Layers[i].Neurons[n].Activation = this.Sigmoid(netinput, ACTIVATION_RESPONSE);
			 
			//创建这个层的同时，存储每个层的输出
			outputs.push(this.Layers[i].Neurons[n].Activation);
			cWeight  = 0;
		}
	}
	return outputs;
};
 
  /**
  * 给定一个训练集合，这个方法执行一次反向传播算法
  * 训练集合包括输入数组和输出数组。如果出现问题返回false
  * 参数 array SetIn, SetOut
  * 返回 bool
  */
NeuralNet.prototype.NetworkTrainingEpoch = function(SetIn, SetOut){
	//创建一些数组
	var curWeight = [];
	var curNrnOut = [], curNrnHid = [];
	
	//用下面的变量保存训练集的累计误差
	this.ErrorSum = 0;
	 
	//通过网络使每一个输入模式得到处理,计算网络输出误差，并更新对应权重
	for(var vec=0; vec<SetIn.length; vec++){
		//首先通过网络对这一组输入向量进行计算，并获取相应的输出
		var outputs = this.Update(SetIn[vec]);
		
		 
		//如果遇到了错误，即返回
		if(outputs.length == 0){
			return false;
		}
		
		//为每个输出神经细胞计算误差并调整相应的权重
		for(var op=0; op<this.NumOutputs; op++){
			//首先计算误差值
			var err = (SetOut[vec][op] - outputs[op]) * outputs[op]
			 * (1 - outputs[op]);
			  
			//更新SSE(Sum of Squared Error差值的平方和)
			//更新误差总值（当该总值低于一预设阀值时，即可知训练完成）
			this.ErrorSum += (SetOut[vec][op] - outputs[op]) *
			  					(SetOut[vec][op] - outputs[op]);
			//alert("this.ErrorSum="+this.ErrorSum);
			
			//人工神经网络有1一个隐藏层则一共有两层 - 隐藏层+输出层
			//用一个记录来保存误差 / Layers[1] 是输出层 Layers[0]是隐藏层
			this.Layers[1].Neurons[op].Error = err;
			
			var wl = this.Layers[1].Neurons[op].Weight.length;
			//更新每一个权重，但不包括偏移bias
			for(var i=0; i<wl-1; i++){
				//根据backprop(反向传播)规则计算新权重
				this.Layers[1].Neurons[op].Weight[i]
				+= err * this.LearningRate * this.Layers[1].Neurons[i].Activation;
			} 
			//加上这个神经细胞的偏移量
			this.Layers[1].Neurons[op].Weight[wl-1]
			+= err * this.LearningRate * BIAS;
		}
		
		//**向后移动到隐藏层**//
		var hwl = this.Layers[0].Neurons.length;
		//为隐藏层的每个神经细胞计算误差信号，并调整相应权重
		for(var i=0; i<hwl; i++){
			var err = 0;
			var owl = this.Layers[1].Neurons.length;
			//为了计算此神经细胞的误差，需要对它所链接到的每个输出层细胞进行重复
			//并对它们的误差×权重求总和
			for(var j=0; j<owl; j++){
				err += this.Layers[1].Neurons[j].Error * 
				this.Layers[1].Neurons[j].Weight[i];
			}
			//现在我们可以计算误差
			err *= this.Layers[0].Neurons[i].Activation * (1 - this.Layers[0].Neurons[i].Activation);
			//对该神经细胞的每个权重，根据误差信号和学习率计算新权重
			for(var w=0; w<this.NumInputs; w++){
				//根据backprop规则来计算新误差
				this.Layers[0].Neurons[i].Weight[w]+=err*this.LearningRate*SetIn[vec][w];
			}
			//和偏移值
			this.Layers[0].Neurons[i].Weight[this.NumInputs] +=
			err * this.LearningRate * BIAS;
		}
	}//下一个输入向量
	return true;
};
 
 /**
  * 根据一个训练集合对网络进行训练。如果数据集合中出现错误返回false
  */
 NeuralNet.prototype.Train = function(data){
/*
 var SetIn = data.GetInputSet();
	var SetOut = data.GetOutputSet();
	
	//确保训练集为有效的、
	if((SetIn.length != SetOut.length) || 
		(SetIn[0].length != this.NumInputs) ||
		(SetOut[0].length != this.NumOutputs))
	{
		alert("Error: Inputs != Outputs");
		return false;
	}
	
	//将所有权重初始化为小的随机数
	this.InitializeNetwork();
	
	//利用backprop进行训练，直到SSE小于用户定义的阀值
	while(this.ErrorSum > ERROR_THRESHOLD){
		//如果出现任何问题，则返回 false
		if(!this.NetworkTrainingEpoch(SetIn, SetOut)){
			return false;
		}
		//调用显示程序来显示误差总和
		//UpdateWindow
	}
*/
//不训练，直接给神经网络输入已经训练好的权重数据
	//每一层
	for(var i=0; i<TrainedWeights.length; i++){
		var layer = TrainedWeights[i];
		for(var j=0; j<layer.length; j++){
			var neuron = layer[j];
			for(var k=0; k<neuron.length; k++){
				this.Layers[i].Neurons[j].Weight[k] = neuron[k];
			}
		}
	}
	this.Trained = true;
	return true;
 };
 
 /**
  * S形响应曲线
  */
NeuralNet.prototype.Sigmoid = function(netinput, response){
	return ( 1 / ( 1 + Math.exp(-netinput / response)));
};