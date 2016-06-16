---
layout: page
title: React-Redux-koa-webpack 全面学习与实践
categories: [笔记,Node,JavaScript]
tags: [react,组件化,redux,koa,同构]
---

这是一篇告诉你如何从编写小的 React 静态浏览器demo，到结合react,redux,koa,webpack,isomorphic-fetch等工具和插件完成一个Node服务器与客户端同构demo的开发。

完成这个过程你需要学习或者了解的知识点有以下几点：

在编写代码过程中大量使用es6语法，所以没有接触过es6语法的可以先学习es6语法。

下面是主要的知识点：
{%highlight txt%}
koa :服务器
	koa-route ： koa路由控制
	koa-static : 静态文件目录
	koa-logger: 日志

swig ： html模版语言

history ： 历史记录

react : 组件管理
	react-dom: reactdom插入
	react-router：react路由

webpack : 文件打包

isomorphic-fetch：同构数据请求

recompose ：React的一个高阶功能组件

redux : Redux 就是用来确保 state 变化的可预测性
	
#babel
	babel-cli :js编译
	babel-preset-es2015-node5
{%endhighlight%}

这是一张服务器与客户端同构的结构图：

![react-redux-koa]({{site.baseurl}}/images/2016/0415_01.jpg)

### React
React 是较早使用 JavaScript 构建大型、快速的 Web 应用程序的技术方案。也可以说 在React里面一切都是组件。
下面是我个人在学习React的笔记以及对不同场景运用React的体会。通过不同的运用的场景来体会React。

### 1.React运用场景
>1.   静态页面 
>2.   react-koa-webpack开发
>3.   react-redux-koa-webpack开发

### 2 场景一 : 静态页面直接使用React
下面将使用购物车为案例，体验react。先看看案例的最终效果。

>效果图如下：

![react-redux-koa]({{site.baseurl}}/images/2016/0415_02.jpg)

React构造购物车demo: [购物车demo]({{site.baseurl}}/examples/koa-react-redux/react/index.html)

#### 2.1 购物车组件划分
react要求为了避免多余属性的存在。所以第一步的任务就是划分组件，分析每一个组件所需要的数据。

下图是我对购物车组件的划分（不包含没有划分组件的元素）：

![react-redux-koa]({{site.baseurl}}/images/2016/0415_03.jpg)


每一个绿色的框表示一件商品，所有的绿色框组合起来就是购物车商品列表。如果加上底部的菜单栏，那么一个简单的购物车就完成了。

#### 2.2 购物车数据流
我们都知道写出组件化很简单，如何与组件进行交互是很麻烦的。在这之前你得先了解一个概念。

>1.   props是一个父组件传递给子组件的数据流，这个数据流可以一直传递到子孙组件。而state代表的是一个组件内部自身的状态
>2.   改变一个组件自身状态，从语义上来说，就是这个组件内部已经发生变化，有可能需要对此组件以及组件所包含的子孙组件进行重渲染。
>3.   props是父组件传递的参数，可以被用于显示内容，或者用于此组件自身状态的设置（部分props可以用来设置组件的state），
           不仅仅是组件内部state改变才会导致重渲染，父组件传递的props发生变化，也会执行。
        
两者的变化都有可能导致组件重渲染，所以只有理解props与state的意义，才能很好地决定到底什么时候用props或state。

数据流图：

![react-redux-koa]({{site.baseurl}}/images/2016/0415_04.jpg)

数据从购物车顶层注入，分别根据不同组件的不同数据需要将数据流入到各个组件当中。有的数据可能直接使用，有的可能是通过计算出来的
衍生数据。

在购物车中，我们希望修改了购物车中商品的数量或者选择商品之后，数据都是最新的。那么这时候你可能想到的是双向数据绑定，react可以实现
双向数据绑定，但它的原理其实还是单一数据流，组合setSate等函数完成的双向数据绑定功能。说白了react没有真正的双向数据绑定，有也是通过其它方式
模拟的。

疑惑：为什么每次修改商品数量，或者选择商品还是其他操作，我都希望原来注入的Data元数据都是最新的？

这是因为购物车中所有的操作的结果就是要提交商品数据。
这些数据就是元数据中的某些属性或者衍生数据来着。我们必须保证元数据是随着用户操作保持时时更新，在最后用户提交商品到订单的时候数据才是最新的。

结论：这里使用props属性传递是最合适的。

代码如下：
{%highlight js %}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>购物车</title>
  <link rel="stylesheet" href="./index.css">
</head>
<body>
  <div id="cart"></div>
  <script src="./build/react.js"></script>
  <script src="./build/react-dom.js"></script>
  <script src="./build/browser.min.js"></script>
  <script type="text/babel">
  var CART_INFO = [
    {
      isChecked: true,
      isSku : true,
      isDeleted : false,
      isCollect : false,
      thumb : './images/01.png',
      title : '七匹狼男鞋',
      num : 10,
      gid:88888,
      store : 100,
      price : 45.37,
      original : 999.99,
      skuMap : ['颜色：红色','尺寸：30']
    },
    {
      isChecked: false,
      isSku : true,
      isDeleted : true,
      isCollect : true,
      thumb : './images/02.png',
      title : '拖把',
      num : 1,
      gid:88899,
      store : 67,
      price : 22.09,
      original : 120.00,
      skuMap : ['型号：中','尺寸：1.5米']
    },
    {
      isChecked: true,
      isSku : false,
      isDeleted : true,
      isCollect : false,
      thumb : './images/03.png',
      title : '这个太牛逼了',
      num : 3,
      gid:555555,
      store : 20,
      price : 99.78,
      original : 21000.99,
      skuMap : false
    }
  ];
    /**
     * [NumberInput   数量选择]
     */
	var NumberInput = React.createClass({
		numSub:function(op){
			this.setBuyNum(this.props.state.num-1);
		},
		onChange: function(e){
			this.setBuyNum(+(e.target.value.replace(/[^\d]/g ,'')));
		},
		numAdd : function(e){
			this.setBuyNum(+this.props.state.num+1);
		},
		setBuyNum : function(num){
			num = num >= this.props.state.min ? num : this.props.state.min;
			num = num <= this.props.state.max ? num : this.props.state.max;
			this.props.onChange(this.props.id,'num' , num);
		},
		shouldComponentUpdate: function(nextProps, nextState) {
		  	return nextProps.state.num != this.props.state.num;
		},
		render: function() {
			return (
              <div className="op-box"><span className="op" onClick={this.numSub}>-</span>
              <input className="buynum" type="text" value={this.props.state.num || 1} onChange={this.onChange} /><span className="op" onClick={this.numAdd}>+</span></div>
			);
		}
	});
	/**
     * [Operater   操作]
     */
	var Operater = React.createClass({
		handleCollect : function(){
			this.props.onChange(this.props.id, 'isCollect', !this.props.isCollect);
		},
		handleDelete : function(){
			this.props.onChange(this.props.id, 'isDeleted', !this.props.isDeleted);
		},
		// shouldComponentUpdate: function(nextProps, nextState) {
		//   	return nextProps.isCollect != this.props.isCollect || nextProps.isDeleted != this.props.isDeleted;
		// },
		render : function(){
			var collecttxt= '收藏', collectcss = 'collect' ,  deletetxt = '删除' , delectcss='delete';
			this.props.isCollect ? (collecttxt = '取消'+collecttxt , collectcss = 'discollect') : null;
			this.props.isDeleted ? (deletetxt = '取消' , delectcss = 'disdelete' ) : null;
			return (<div className="item-opbox">
						<span className={'op-i '+collectcss} onClick={this.handleCollect}>{collecttxt}</span>
						<span className ={'op-i '+delectcss} onClick={this.handleDelete}>{deletetxt}</span>
					</div>)
		}
	});
	/**
	 * [SkuContainer sku渲染 ]
	 */
	var SkuContainer = React.createClass({
		render : function(){
			return (<div className="sku-box">
					{ this.props.isSku && this.props.skuMap.map(function(sku , key){ 
						return (<span key={key}>{sku}</span>)
						})
					}
				   </div>)
		}
	});
	/**
	 * [CheckBox 选中]
	 */
	var CheckBox = React.createClass({
		handleChecked:function(e){
			this.props.onChange(this.props.id, 'isChecked', !this.props.isChecked);
		},
		// shouldComponentUpdate: function(nextProps, nextState) {
		//   	return nextProps.isChecked != this.props.isChecked;
		// },
		render : function(){
			return (<input type="checkbox" checked={this.props.isChecked} onChange={this.handleChecked} />);
		}
	});
	/**
	 * [CartItem 单个商品渲染]
	 */
	var CartItem = React.createClass({
		render : function(){
			var that = this;
			return (<div><table className="cart"><thead><tr><td>选择</td><td></td><td>名称</td><td>价格</td><td>原价</td><td>描述</td><td>数量</td><td>操作</td></tr></thead><tbody>
					{this.props.carts && this.props.carts.map(function(car , key){
						return (<tr key={key}>
								<td><CheckBox isChecked={car.isChecked} id={key} onChange={that.props.onChange} /></td>
								<td><img src={car.thumb} width="60" height="60" /></td>
								<td><h4>{car.title}</h4></td>
								<td><div>{car.price}</div></td>
								<td><div>{car.original}</div></td>
								<td><SkuContainer isSku={car.isSku} skuMap={car.skuMap} /></td>
								<td><NumberInput state ={ {num : car.num,max:car.store , min : 1}} id={key} onChange={that.props.onChange} /></td>
								<td><Operater isDeleted={car.isDeleted} isCollect={car.isCollect} id={key} onChange={that.props.onChange} /></td>
							</tr>)
						})
					}</tbody></table></div>)
		}
	});
	/**
	 * [CartMenu 提交bar]
	 */
	var CartMenu = React.createClass({
		render : function(){
			return (<div className="cart-allpay">
				<label><input type="checkbox" checked={this.props.isAll} onChange={this.props.isCheckAll} />全选</label>
				<span className="num">{this.props.num}个</span> <span className="pay">{this.props.money}元</span><button onClick={this.props.onClick}>获取数据</button>
				</div>)
		}
	});

	/**
	 * [cart  购物车]
	 */
	var Cart = React.createClass({
		getInitialState:function(){
			return {carts:[] , num : 0 , money: 0 ,isAll : false};
		},
		componentWillMount: function(){
			var carts = this.props.carts;
			var data = this.computed(carts);
			data.carts = carts;
			this.handleSet(data);
		},
		handleChange : function(key ,props, value){
			var carts = this.state.carts;
			carts[key][props] = value;
			var data = this.computed(carts);
			data.carts = carts;
			this.handleSet(data);
		},
		handleClick: function(){
			console.log(this.state);
		},
		handleSet : function(obj){
			this.setState({carts:obj.carts , num:obj.num , money:obj.money , isAll:obj.isAll})
		},
		isCheckAll : function(e){
			var isall = !this.state.isAll , carts = this.state.carts; 
			for (var i = 0; i < carts.length; i++) {
			 	carts[i].isChecked = isall;
			};
			var data = this.computed(carts);
			data.carts = carts;
			this.handleSet(data);
		},
		computed : function(carts){
			 var num = 0 , money = 0 , isAll = true;
			 for (var i = 0; i < carts.length; i++) {
			 	if ( carts[i].isChecked ){
			 		num += carts[i].num;
			 		money += carts[i].num*carts[i].price;
			 	}else{
			 		isAll = false;
			 	}
			 };
			 return {num : num >0 ? num : 0 , money : money > 0 ? money : 0.00 , isAll:isAll}
		},
		render: function(){
			console.log('render start');
			return (<div>
					<CartItem carts={this.state.carts} onChange={this.handleChange} />
					<CartMenu isAll={this.state.isAll} isCheckAll={this.isCheckAll} num={this.state.num} money={this.state.money} onClick={this.handleClick} />
				</div>)
		}
	});
	ReactDOM.render(<Cart carts={CART_INFO} /> , document.getElementById('cart'));

</script>
</body>
</html>
{%endhighlight%}










