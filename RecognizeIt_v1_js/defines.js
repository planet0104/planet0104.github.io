//----------------------------------
//		main使用
//----------------------------------

var WINDOW_WIDTH	=	400;
var WINDOW_HEIGHT	=	400;

//
//var UM_TRAIN		=	WM_USER + 0;

//----------------------------
//		用于Data/Mouse
//----------------------------

//内置模式总数
var NUM_PATTERNS	=	11;
//每个模式包含多少个向量
var NUM_VECTORS		=	12;

//公差
var MATCH_TOLERANCE	=	0.96;

//----------------------------
//		用于NeuralNet
//----------------------------

var ACTIVATION_RESPONSE	=	1.0;
var BIAS				=	-1;

//backprop的学习率
var LEARNING_RATE		=	0.5;

//错误极限
var ERROR_THRESHOLD		=	0.003;
var NUM_HIDDEN_NEURONS	=	6;