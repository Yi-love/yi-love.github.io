---
layout: page
title: git+jekyll+markdown搭建博客框架
categories: [笔记]
tags: [git , jekyll , markdown]
---

>### 前言 ###
>接着上一篇博客，继续来讲，如何搭建自己的博客框架。
>本来想着去网上克隆别人的框架，但是考虑自己也是做前端的吧，就一时兴起捣鼓了一个简洁的框架还是*响应式*的捏。
>虽然很简陋但是也算是简洁大方的表现吧。

>### 1.jekyll ###
>先来说说*jekyll*吧。整个个人博客都是按照jekyll的格式搭建的，这是必须的。如果你想搭建更好的也可以直接点击[jekyll]。
>先来看看最终的效果图：

![jekyll目录]({{site.baseurl}}/images/2015/1031_01.jpg)

[jekyll]:http://jekyllrb.com/docs/home/

>#### 1.1._includes 目录 ####
>这个目录下面存放的是一些基本固定不变的html文件，以及一些页面的公共部分。这些页面可以提供给*_layouts*目录下面的html使用。

>这个目录下我添加了以下4个文件：
>
>1.   基本设置
>2.   头部导航
>3.   页面底部
>4.   右侧信息

>#### 1.1.1基本设置 ####
>比如：html文本的编码设置，固定的样式外链，基本的js已入。等这一些都可以放到里面。
>
>我为了让网站在pc和移动端都可以比较完美的展示，添加了一下*meta*参数，还引入了一个base.css。

>这是一个如同bootstrap一样的响应式框架。不过很多组件都没有。
>但对付pc和移动端是够了。
{% highlight html %}
 	<!-- base.html -->
 	<meta charset="UTF-8">
	<meta name="apple-mobile-web-app-title" content="{ {page.title}}">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-touch-fullscreen" content="yes">
	<meta http-equiv="Cache-Control" content="no-siteapp">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
	<meta name="format-detection" content="telephone=no">
	<meta name="format-detection" content="email=no">
	<meta content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no" name="viewport">
	<link rel="stylesheet" href="{ {site.baseurl}}/stylesheets/normalize.css">
	<link rel="stylesheet" href="{ {site.baseurl}}/stylesheets/base.css">
	<link rel="stylesheet" href="{ {site.baseurl}}/stylesheets/syntax.css">
	<!-- 没有去空格 -->
	<script src="{ {site.baseurl}}/javascripts/base.js"></script>
	<!-- 去空格 -->
	<script src="{{site.baseurl}}/javascripts/base.js"></script>
	<title>{ {page.title}}</title>
{% endhighlight %}
>可能你不明白 { {site.baseurl}}这个是什么意思。其实这个就是_config.yml 里面定义的baseurl的值，看上面的js引入就明白了。这一篇我就不说jekyll的语法了，想了解 点击[jekyll]。

>*注意使用时 { { 之间不要有空格，我这里为了防止被解析了才打空格。*



#### 1.1.2头部导航 ###
>因为简洁，所以导航没有什么内容。非常简单。但必须配上base.css才会有效果。
{% highlight html %}
 	<!-- header.html -->
 	<div class="j-container-fluid j-header">
		<div class="j-row">
			<div class="j-container">
				<nav class="j-row j-nav">
					<a href="{ {site.baseurl}}/">首页</a>
					<a href="{ {site.baseurl}}/list.html">归档</a>
					<a href="https://github.com/Yi-love">Github</a>
					<a href="{ {site.baseurl}}/me.html">Me</a>
				</nav>
			</div>
		</div>
	</div>
{% endhighlight %}


#### 1.1.3底部信息 ###
>因为看了《大话西游》,感觉经典对白实在太好。于是想来一句。感觉很多都太长，所以就选了这一句短的来充当底部咯。
{% highlight html %}
 	<!-- footer.html -->
 	<div class="j-container-fluid j-footer">
		<div class="j-container">
			<p class="j-footer-say">喜欢一个人需要理由吗？需要吗？不需要吗？需要吗？……</p>
			<p class="j-footer-say j-tlgr">——周星驰 《大话西游》</p>
		</div>
	</div>

{% endhighlight %}

#### 1.1.4右侧信息  ###
>博客一般都会在右边放置一下辅助信息。比如文章分类。
{% highlight html %}
 	<!-- side.html -->
 	<div class="j-col-xs-12 j-col-sm-12 j-col-md-3">
		<div class="j-user">
			<div class="j-user-thumb">
				<a href=""><img src="{ {site.baseurl}}/images/user.jpg" alt="" /></a>
			</div>
			<div class="j-user-info">
				<a href="">微信</a>
				<a href="">微博</a>
				<a href="">QQ</a>
			</div>
		</div>
		<div class="j-class-list">
			<h3 class="j-row">分类</h3>
			{% for category in site.categories %}
			<a href="{ {site.baseurl}}/category.html?category={ { category|first}}">
				{ {category | first}} 
				<span class="j-class-i-num">({ {category | last | size}})</span>
			</a>
			{% endfor %}
		</div>
	</div>
{% endhighlight %}
>分类这里现在不好解释，等到下一篇说jekyll基本语法的时候，一起讨论。因为这个文章分类需要配合js才能实现。


### 1.2_layouts目录 ####
>这个目录是存放模板文件的。也就是说，你每个网页都可以使用其中的一个作为模版输出。这样就可以节省很多的不必要重复的代码。
>
>模版文件的引入是通过 { % include 文件  %} 完成的。
 
>例如：我的默认模板，引入了 base.html , header.html , side.html , footer.html, 其中还有一个 { { content}} 那么这个就是 引用了该模板的页面的内容所填充的部分。

{% highlight html %}
 	<!-- default.html -->
 	<!DOCTYPE html>
	<html lang="zh-cmn-Hans">
	<head>
		{ % include base.html %}
	</head>
	<body>
		{ % include header.html %}
		<div class="j-container">
			<div class="j-row">
				<div class="j-col-xs-12 j-col-sm-12 j-col-md-9">
					{ {content}}
				</div>
				{ % include side.html %}
			</div>
		</div>
		{ % include footer.html %}
	</body>
	</html>
{% endhighlight %}

>引用方法：
{% highlight TeX %}
    ---
	layout: default  // 引用的模版名称
	title: Github-我的第一篇博客   //文章标题
	categories:  [笔记]      //文章分类 array
	tags: [记事]             //文章标签 array
	---
	
	这是内容                //内容
{% endhighlight %}
>以上就是引用模版文件的语法。如果不用就删掉layout即可。[*- - -*] 这三根横杆一定要置顶不能有空格和空行。


>#### 1.3_posts目录 ####
>这个目录是整个博客系统所用文章存放的目录，所有的文章都必须按照   *YYYY-MM-DD-name.textile* 的格式命名
>
>以我的第一篇博客为例：2015-1027-first-blog.md
>
>因为我是按markdown语法写的所以后缀是.md , 你也可以按html来写，那后缀改为.html即可。
>不管你用什么语法，到最后jekyll会编译回html文件存放在 _site 目录下。
{% highlight TeX %}
 	---
	layout: page
	title: Github-我的第一篇博客
	categories:  [笔记]
	tags: [记事]
	---
	## 前言 ##
	>真正的入职前端已有半年多，加上自己的实习经验已差不多快一年了。感受颇多，
	>但又感觉自己没有积累到什么东西。所以就想起了写起博客来了。
	>虽然以前自己在*CSDN*上有自己的博客，也写了有30篇左右的文章，
	>但大多都是自己原来的一些代码而已，说明性的内容比较少，就想起了自己搭建一个
	>博客系统。但发觉要自己去买服务器的话，感觉有点奢侈。
	>后面偶然发现了*Github*居然可以搭建博客，而且免费。
	>兴起之下在下班之后就自己捣鼓用Github来
	>搭建自己的博客。
	
	>经过一个星期的晚上奋战，终于搭建好了。

{% endhighlight %}


#### 1.4 images , javascript ,stylesheets ####
>这个分别对应的文件就不言而喻了吧。分别对应：图片目录，js目录，css目录。

> 最后剩余的就只有：

>1.   _config.yml (配置文件)
>2.   index.html  (博客首页)
>3.   category.html (文章分类页)
>4.   list.html  (文章归档页)
>5.   me.html   (个人介绍页)


#### 最后给个调用流程图 ####
>只要明白：

>1.   _includes  公共文件目录
>2.   _layouts  模版文件目录
>3.   _posts    文章目录

>只有知道这几个目录是干什么就可以了。
>其他的简单了吧。

>![调用流程图]({{site.baseurl}}/images/2015/1031_02.jpg)
























