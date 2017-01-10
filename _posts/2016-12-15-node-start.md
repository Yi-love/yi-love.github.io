---
layout: page
title: Node.js源码解析--node启动解析
categories: [Node]
tags: [node_main.cc,node.cc,global,process,env.cc,boot_starp.js]
---

`C++`和`JavaScript`到底是怎么相互运行？

`Node.js`的轮询代码长啥样？

首先得理解

* c++预编译语言，js解释型语言

也就是说js并不会执行任何东西，他只是解释这个东西怎么做，并没有真正的做。chrome的v8引擎就是为了做这件事。
总结一句话，我们所写的js代码,在Node.js里面是通过v8解释执行的。

* v8解释执行js,Node.js提供api

Node.js 与 V8 的关系就好比：你去银行柜台取钱，你在柜员窗口跟柜员说取500,这个时候柜员要求你提供银行卡并要你输入密码，确认无误后，柜员会操作电脑进行扣款，并在成功后，把500元和卡退还给你。
这里面：柜员就好比Node.js ，电脑就好比v8(确切一点应该是银行系统)。你说的每一句话，传递到柜员的耳朵里，然后操作电脑完成取钱的操作。

总结，这就是我为什么说Node.js只是提供api接口，并没有真正干事的理由。 

现实，也就是所有的`JavaScript`代码都是通过Node.js的`vm`模块进行包装后，丢给Node.js的`C++`contextify解释执行。

## Node.js启动流程图
Node.js环境的启动，大概分为了以下几种：

* 系统平台初始化
* v8平台初始化
* v8初始化
* 创建v8引擎实例
* Node环境启动
* Node.js初始化
* loop循环

![Node.js启动流程图]({{site.baseurl}}/images/2016/1215_01.png)

退出的话，即从里到外一步一步的退出，最后恢复初始状态。


### 1.1 入口何在
写过`C`或者`C++`的同学，都应该知道，不管`C`和`C++`程序，入口都是`main()`函数。Node.js也不例外。`node_main.cc`就是Node.js的入口文件。
因为`_WIN32`和`__POSIX__`的不同，说以，Node.js会根据不同操作系统来执行不同的函数。不过放心，`node_main.cc`内部已经做了兼容处理。

```cpp
//src/node_main.cc
#include "node.h"

#ifdef _WIN32
int wmain(int argc, wchar_t *wargv[]) {
  //宽字符到多字节字符转换函数 使用`CP_UTF8`代码页实现`UTF-8`与`Unicode`之间的转换。
  //目的就是首先通过`WideCharToMultiByte`函数获取每个参数的`size`,然后根据size把宽字节的`wargv[i]`拷贝到`argv[i]`,这也就是
  //源码中，`WideCharToMultiByte`函数每次循环都执行2次的原因。
  WideCharToMultiByte(CP_UTF8,0,wargv[i],-1,argv[i],size,nullptr,nullptr);
  //开始执行
  return node::Start(argc, argv);
}
#else
// UNIX
int main(int argc, char *argv[]) {
  // Disable stdio buffering, it interacts poorly with printf()
  // calls elsewhere in the program (e.g., any logging from V8.)
  setvbuf(stdout, nullptr, _IONBF, 0);
  setvbuf(stderr, nullptr, _IONBF, 0);
  return node::Start(argc, argv);
}
#endif
```

这也就是我们可以通过命令行执行`Node.js`的原因，本质上他就是一个`C++`程序。

例如：

```sh
 node
```

待续...