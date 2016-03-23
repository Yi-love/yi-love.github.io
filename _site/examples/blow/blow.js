
var B = (function(){
	var body = document.getElementsByTagName('body')[0];
	//对象
	function Blow(obj){
		this.blowbox = obj.blowbox;
		this.cursor = obj.cursor;
		this.blowmax = obj.blowmax;
		this.maxbox = obj.maxbox;
		this.blowsmall = obj.blowsmall;
		this.max = obj.max;
		this.pst = {};
	};
	//初始化
	Blow.prototype.init = function(){
		var blowmax = this.blowmax ,
			blowbox = this.blowbox,
			cursor = this.cursor,
			max = this.max , 
			blowsmall = this.blowsmall,
			maxbox = this.maxbox,
			pst = this.pst;
		
		setCss(blowmax , {width : max*2+'px' , height:max*2+'px'});
		addEvent(blowbox , 'mousemove' , function(e){
			setCss(maxbox , {display: 'block'});
			pst = getPosition(e,max , blowbox);
			setCss(cursor , {top : pst.top+'px' , left:pst.left+'px'});
			showMax(pst , blowmax);
		});	
		addEvent(blowbox, 'mouseout' , function(e){
			setCss(maxbox , {display: 'none'});
		});
		
	};
	/**
	 * 事件监听
	 * @param {Object} element 元素
	 * @param {Object} type    类型
	 * @param {Object} fn      回调函数
	 */
	function addEvent(element , type , fn){
		if( element.addEventListener ){
			element.addEventListener(type , fn);
		}else if( element.attachEvent ){
			element.attachEvent('on'+type , fn);
		}else{
			element['on'+type] = fn;
		}
	};
	/**
	 * 设置元素样式属性
	 * @param {Object} element 元素
	 * @param {Object} props   属性对象
	 */
	function setCss(element , props){
		if( element.style ){
			for (var prop in  props ) {
				element.style[prop] = props[prop];
			};
		}else if(element.runtimeStyle){
			for (var prop in  props ) {
				element.runtimeStyle[prop] = props[prop];
			};
		}
	};
	//获取位置
	function getPosition(e , max , blowbox){
		var offset = getOffset(blowbox) , 
			xy = getScrollXY();
		var x = +(e.clientX-offset.left+xy.x) , 
			y = +(e.clientY-offset.top+xy.y);
		var left = x-max*0.25 > 0 ? x-max*0.25 : 0 , 
			top = y-max*0.25 > 0 ? y-max*0.25 : 0;
			
		left = left > max*0.5 ? max*0.5 : left ;
		top = top > max*0.5 ? max*0.5 : top ;
		
		return {left:left ,top:top};
	};
	//展示大图
	function showMax(pst , blowmax){
		var x = pst.left*2 , y = pst.top*2;
		if ( blowmax.style ){
			blowmax.style.marginLeft = -x +'px';
			blowmax.style.marginTop = -y+'px';
		}else if( blowmax.runtimeStyle ){
			blowmax.runtimeStyle.marginLeft = -x +'px';
			blowmax.runtimeStyle.marginTop = -y+'px';
		}
	};
	//获取距离距离top和left的距离
	function getOffset(element){
		var top = 0 , left = 0;
		if ( element ) {
			while ( element != body && element != document ){
				top = +element.offsetTop > top ? +element.offsetTop : top;
				left = +element.offsetLeft > left ? +element.offsetLeft : left;
				element = element.parentNode;
			}
		}
		return {left:left , top:top};
	};
	//获取屏幕滚动距离
	function getScrollXY(){
		return {
			x : window.scrollX || window.scrollLeft || document.documentElement.scrollLeft || document.body.scrollLeft,
			y : window.scrollY || window.scrollTop|| document.documentElement.scrollTop || document.body.scrollTop
		}
	};
	return {
		run : function(obj){
			return new Blow(obj).init();
		}
	}
})();

	//手势
var	cursor = document.getElementById('j_blow_cursor'),
	//小图
	blowsmall = document.getElementById('j_blow_small'),
	//大图
	blowmax = document.getElementById('j_blow_max'),
	//大图box
	maxbox = document.getElementById('j_blow_max_box'),
	//小图box
	blowbox = document.getElementById('j_blow_box');

//运行
;B.run({
	blowbox :blowbox,
	cursor : cursor,
	blowmax : blowmax,
	maxbox : maxbox,
	blowsmall : blowsmall,
	max : 464//大图大小
})
