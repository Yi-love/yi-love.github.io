---
layout: page
title: Node.js源码解析--启动Node.js
categories: [Node]
tags: [node_main.cc,node.cc,global,process,env.cc,boot_starp.js]
---

`Node.js`一直以来都是我工作中不可缺少的一部分，但对于它的了解却知之甚少。
平常的时候只会用`Node.js`来写写工具,组件。偶尔会用它来写写项目（原谅我是个FE），
所以并没有对`Node.js`进行过深入的学习。

从最开始的`Node.js 6+`文档翻译,到工具模块的编写(例如：`dns-proxy-server` 一个dns代理工具)，
再到`Node.js`源码的解读，我都在试着一步一步的把`Node.js`读透。

了解`Node.js`启动流程之前，还必须明白：

*  `C++`是编译型语言，`JavaScript`解释型语言，请去查查再继续往下看；
*  `JavaScript`不能像`C`或`C++`能通过操作系统直接访问文件,`Node.js`它的这种能力也是来自于底层`C`和`C++`的支持；
*  `Node.js`实际上是一个`C++`程序,这就是为什么可以命令行执行`node`的原因；
*  `Node.js`的`JS`部分只提供api,`C++`才执行`JavaScript`(实际上目前是`Node.js`里面依赖的基础模块`V8`引擎执行的)。

## 1. Node.js 结构
要理解Node.js的启动，就必须了解`Node.js`的层级关系。

![NODE.JS]({{site.baseurl}}/images/2016/1215_02.png)

Node的api分为`JavaScript`部分和`C++`部分，也就是我们经常说的`JavaScript`模块和`C++`核心模块。
一般我们只会使用`JavaScript`模块，因为`JavaScript`模块基本上就是`C++`核心模块的`JS`版。
使用方式就是通过`require('module_name')`这样引入使用。

## 2. Node.js启动
启动`Node.js`最关键的就是启动`V8`引擎来解释`JavaScript`代码。其它就是一些围点打援的工作。

![NODE——START]({{site.baseurl}}/images/2016/1215_01.png)


每个`C/C++`程序都有一个入口`main`，`Node.js`也不例外，`node_main.cc`就是入口。在第11步以前，都是启动`Node.js`的`C++`部分，
直到`LoadEnvironment()`函数的调用，才真正的加载`Node.js`的`JavaScript`部分，
也就是说`JavaScript`部分的`main`函数就是`boot_strap.js`文件。第14步`uv_run`是`libuv`的事件轮询函数。结束`Node.js`从第15步开始。
最后恢复终端状态。

