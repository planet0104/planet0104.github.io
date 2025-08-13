/**
 * Array.clone
 */
Array.prototype.clone = function ()
{
	var o = [];
	for(var i = 0; i < this.length; i++)
	{
		o[i] = this[i];
	}
	return o;
};

Array.prototype.indexOf = function(o)
{
	var idx = null;
	for(var i = 0; i < this.length; i++)
	{
		if(this[i] === o)
		{
			idx = i;
			break;
		}
	}
	return idx;
};

/**
 * 交换数组中的两个元素值
 */
Array.prototype.swap = function(idx1, idx2)
{
	if(this[idx1] && this[idx2])
	{
		var temp = this[idx1];
		this[idx1] = this[idx2];
		this[idx2] = temp;
	}
	return this;
};

/*
 * 从数组中移除元素
 */
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to)
{
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

/*
 * 从数组中插入元素
 */
Array.prototype.insert = function( i, v )
{
	return this.splice(i,0,v);
};

/*
 * 数组 复制
 */
Array.prototype.copy = function() {
    return [].concat(this);
  };
/*
 * 判断数组是否相等
 */
Array.prototype.equal = function(array2){
	var temp = new Array();
   if ( (!this[0]) || (!array2[0]) ) { // If either is not an array
      return false;
   }
   if (this.length != array2.length) {
      return false;
   }
   // Put all the elements from array1 into a "tagged" array
   for (var i=0; i<this.length; i++) {
      key = (typeof this[i]) + "~" + this[i];
   // Use "typeof" so a number 1 isn't equal to a string "1".
      if (temp[key]) { temp[key]++; } else { temp[key] = 1; }
   // temp[key] = # of occurrences of the value (so an element could appear multiple times)
   }
   // Go through array2 - if same tag missing in "tagged" array, not equal
   for (var i=0; i<array2.length; i++) {
      key = (typeof array2[i]) + "~" + array2[i];
      if (temp[key]) {
         if (temp[key] == 0) { return false; } else { temp[key]--; }
      // Subtract to keep track of # of appearances in array2
      } else { // Key didn't appear in array1, arrays are not equal.
         return false;
      }
   }
   // If we get to this point, then every generated key in array1 showed up the exact same
   // number of times in array2, so the arrays are equal.
   return true; 
};