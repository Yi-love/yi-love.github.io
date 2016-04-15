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

待续......
























