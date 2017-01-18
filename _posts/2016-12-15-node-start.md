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
*  `Node.js`的`JavaScript`模块绝大部分只提供api,通过`V8`引擎解释执行，调用`C++`核心模块。

## 1. Node.js 结构
要理解Node.js的启动，就必须了解`Node.js`的层级关系。

![NODE.JS]({{site.baseurl}}/images/2016/1215_02.png)

Node的API分为`JavaScript`部分和`C++`部分，也就是我们经常说的`JavaScript`模块(下文统一使用)和`C++`核心模块(下文统一使用)。
一般我们只会使用`JavaScript`模块，`JavaScript`模块依赖于底层的`C++`核心模块。
`JavaScript`模块可以通过`require('module_name')`这样引入使用。
如果已经暴露再全局作用域则可以直接使用（`Buffer`模块就可以直接使用）。

## 2. Node.js 启动
启动`Node.js`最关键的就是启动`V8`引擎来解释`JavaScript`模块。其它就是一些围点打援的工作。

大的方向可以分为：

1. 参数处理
2. 初始化
3. 安全通讯
4. `V8`引擎启动
5. Loading `Node.js`环境
6. 开始`Node.js`旅程
7. 退出

![NODE_START]({{site.baseurl}}/images/2016/1215_01.png)

每个`C/C++`程序都有一个入口`main`，`Node.js`从`node_main.cc`开始执行`C++`核心模块。
在第11步以前，都是启动`Node.js`的`C++`核心模块，直到`LoadEnvironment()`函数的调用，
才真正的加载`Node.js`的`JavaScript`模块，`JavaScript`模块的`main`函数就是`boot_strap.js`文件。
第14步`uv_run`是`libuv`的事件轮询函数。`Node.js`从第15步开始便是销毁过程，最后恢复终端状态。

一句话总结`Node.js`：提供一个解释`JavaScript`的引擎，让`JavaScript`有能访问操作系统相关资源的能力，
能力的范围就由`Node.js`的`C++`核心模块决定，毕竟`JavaScript`模块只是个`lib`库。

> 下面会基本按照图2-1来讲述整个`Node.js`的启动。由于里面有很多细节，可能再整体感觉上会比较难以理解。


### 2.1 参数处理
顾名思义，就是处理`cmd`命令行传入参数进行处理,然后挂载到`process`对象上面，主要的两个参数是`argv`和`execArgv`。

命令行执行`Node.js`的方式:

```sh
node | node test.js  | node -v
```

先看一个`Node.js`的例子，这个例子是获取`process.argv` 和 `process.execArgv`。

```js
//argv.js
'use strict';
console.log(process.argv , process.execArgv);
```

`cmd`命令行执行:

```sh
node --harmony  argv.js  'hello' 'world'
```

输出得到(环境:`_WIN32`)：

```js
[ 'C:\\Program Files\\nodejs\\node.exe','E:\\node\\node\\argv.js','\'hello\'','\'world\'' ] //process.argv
[ '--harmony' ] //process.execArgv
```

那如何才能把这些参数正确的挂载到`process`对象上呢。

1.  `_WIN32`操作系统中参数的宽字符到多字节字符转换
2. cmd参数分类

#### 2.1.1 _WIN32操作系统中参数的宽字符到多字节字符转换
目的为了在启动`Node.js`的时候，参数的字节编码是相同的。

在图2-1中的第1步实现：

```cpp
//node_main.cc
#ifdef _WIN32
int wmain(int argc, wchar_t *wargv[]) {
  if (!IsWindows7OrGreater()) {
    exit(ERROR_EXE_MACHINE_TYPE_MISMATCH);
  }
  // Convert argv to to UTF8
  char** argv = new char*[argc + 1];
  for (int i = 0; i < argc; i++) {
    // 宽字节转多字节 ，获取大小
    DWORD size = WideCharToMultiByte(CP_UTF8,0,wargv[i],-1,nullptr,0,nullptr,nullptr);
    // 重新根据大小计算数据
    argv[i] = new char[size];
    DWORD result = WideCharToMultiByte(CP_UTF8,0, wargv[i], -1, argv[i], size, nullptr, nullptr);
  }
  return node::Start(argc, argv);
}
#else// UNIX
int main(int argc, char *argv[]) {
  // 设置为不缓存   setvbuf 为c函数
  setvbuf(stdout, nullptr, _IONBF, 0);
  setvbuf(stderr, nullptr, _IONBF, 0);
  return node::Start(argc, argv);
}
#endif
```

`WideCharToMultiByte`是宽字符到多字节字符转换函数 ，使用`CP_UTF8`把`Unicode`转换为`UTF-8`编码。

思路：就是首先通过`WideCharToMultiByte`函数获取每个参数的`size`,然后根据size把宽字节的`wargv[i]`拷贝到`argv[i]`,
这也就是源码中，`WideCharToMultiByte`函数每次循环都执行2次的原因。

`node::Start(argc, argv)` 为执行`node`命名空间下的`Start()`方法(该方法在`node.cc`中实现)。

#### 2.1.2 cmd参数分类
最开始的参数都是在`argv`里面，`exec_argv`和`v8_argv`都是没有值的，`Node.js`为了进行区分参数的含义。
就要对`argv`参数进行拆分，基本上`--`开头的都会被保存到`execArgv`里面，除了个别例外的(例如：`node -v`)。

```cpp
//node.cc
/**
 * [ParseArgs 解析参数列表进行参数分类]
 * @param argc      [命令行参数个数]
 * @param argv      [命令行参数数组]
 * @param exec_argc [执行参数个数]
 * @param exec_argv [执行参数数组]
 * @param v8_argc   [v8参数个数]
 * @param v8_argv   [v8参数数组]
 */
static void ParseArgs(int* argc,const char** argv,int* exec_argc,
                    const char*** exec_argv,int* v8_argc,const char*** v8_argv)
```

例如在命令行输入`node -v`时 ，当`Node.js`执行到`ParseArgs`函数的时候，`while`循环判断每个`argv[i]`是不是等于`-v`,如果等于就执行
查看`Node.js`版本号的语句，然后结束`Node.js`.由此可知 执行`node --version` 等价于`node -v`.

```cpp
//循环判断每个参数的含义 , 必须保证--开头的参数是在node之后,无-开头参数之前。
while (index < nargs && argv[index][0] == '-' && !short_circuit) {
  const char* const arg = argv[index];
  //...
  if (strcmp(arg, "--version") == 0 || strcmp(arg, "-v") == 0) {//查看版本号
    printf("%s\n", NODE_VERSION);
    exit(0);
  }
  //...
  //还有很多else if
```

如果输入以下命令`node --v8-pool-size=6 argv.js   'hello' 'world'`，上文的输出就会变成：

```js
 [ 'C:\\Program Files\\nodejs\\node.exe','E:\\node\\node\\argv.js','\'hello\'','\'world\'' ] 
 [ '--v8-pool-size=6' ] //process.execArgv
```

`--v8-pool-size=6`是设置`V8`线程池大小。这个参数会在初始化`V8`的时候用到。

```cpp
else if (strncmp(arg, "--v8-pool-size=", 15) == 0) {
  v8_thread_pool_size = atoi(arg + 15);
}
```

总之，最后会通过`memcpy`函数把数据保存到对应的数组里面。

### 2.2 初始化
在启动`V8`引擎之前还需要对平台进行一些相关信息的初始化，因为各个平台的不同，要针对特定平台进行初始化。

初始化包括：

1. 程序退出后对终端状态进行还原事件绑定
2. `__POSIX__`平台兼容初始化
3. cmd参数分类(转：2.1.2 )
4. 全球化
5. v8解析输出

`__POSIX__`平台要而外初始化的主要是：信号处理 ，`stdin/stdout/stderr`可用 , 打开文件描述符限制设置上线。

#### 2.2.1 程序退出后对终端状态进行还原事件绑定
当整个`Node.js`退出后，不管是异常还是进程安全结束。都要对执行命令的终端恢复原始状态。也就是图2-1的第20步。

```cpp
//node.cc
//程序退出后对终端状态进行还原
//To be called when the program exits. 
//Resets TTY settings to default values for the next process to take over.
atexit([] () { uv_tty_reset_mode(); });
```

#### 2.2.2 __POSIX__平台兼容初始化
1.信号处理这里牵涉到多线程信号处理，这里`Node.js`主要是为了屏蔽信号，以及对特殊信号进行特殊处理。

首先了解一下多线程的信号处理原则：

将对信号的异步处理，转换成同步处理，也就是说用一个线程专门的来“同步等待”信号的到来，
而其它的线程可以完全不被该信号中断/打断(interrupt)。
这样就在相当程度上简化了在多线程环境中对信号的处理。而且可以保证其它的线程不受信号的影响。
这样我们对信号就可以完全预测，因为它不再是异步的，而是同步的（我们完全知道信号会在哪个线程中的哪个执行点到来而被处理！）。
而同步的编程模式总是比异步的编程模式简单。
其实多线程相比于多进程的其中一个优点就是：多线程可以将进程中异步的东西转换成同步的来处理。

`Node.js`在这里设置信号屏蔽集，屏蔽对某些信号的响应处理。

```cpp
  sigset_t sigmask;
  sigemptyset(&sigmask);//设置信号集
  sigaddset(&sigmask, SIGUSR1);//添加信号
  const int err = pthread_sigmask(SIG_SETMASK, &sigmask, nullptr);//多线程设置信号屏蔽集
```

`pthread_sigmask`函数来屏蔽某个线程对某些信号的响应处理，仅留下需要处理该信号的线程来处理指定的信号。
实现方式是：利用线程信号屏蔽集的继承关系(在主进程中对sigmask进行设置后，主进程创建出来的线程将继承主进程的掩码).

2.解决`SIGPIPE`信号关闭进程的问题

```cpp
for (unsigned nr = 1; nr < kMaxSignal; nr += 1) {
  if (nr == SIGKILL || nr == SIGSTOP)//指定SIGKILL 和SIGSTOP 以外的所有信号
    continue;
  //sa_handler 代表新的信号处理函数
  //SIG_DFL：默认信号处理程序
  //SIG_IGN：忽略信号的处理程序
  //意在解决SIGPIPE信号关闭进程的问题
  act.sa_handler = (nr == SIGPIPE) ? SIG_IGN : SIG_DFL;
  CHECK_EQ(0, sigaction(nr, &act, nullptr)); //sigaction:设置信号处理方式
}
```

3. 保证`stdin/stdout/stderr`可用

保证在使用标准输入/输出/错误的时候，这3个文件描述符是可用的。

```cpp
// 保证 stdin/stdout/stderr 有效
for (int fd = STDIN_FILENO; fd <= STDERR_FILENO; fd += 1) {
  struct stat ignored;
  if (fstat(fd, &ignored) == 0)
    continue;
  if (fd != open("/dev/null", O_RDWR)) //写入/dev/null的东西会被系统丢掉
    ABORT();
}
```

4. 限制打开文件描述符的个数

一个进程不能无限的打开文件.必须进行限制。

`RLIMIT_NOFILE`(一个进程能打开的最大文件 数，内核默认是1024)

```cpp
  // 
  if (getrlimit(RLIMIT_NOFILE, &lim) == 0 && lim.rlim_cur != lim.rlim_max) {
    rlim_t min = lim.rlim_cur;
    rlim_t max = 1 << 20;
    // But if there's a defined upper bound, don't search, just set it.
    if (lim.rlim_max != RLIM_INFINITY) {
      min = lim.rlim_max;
      max = lim.rlim_max;
    }
    do {
      lim.rlim_cur = min + (max - min) / 2;
      if (setrlimit(RLIMIT_NOFILE, &lim)) {
        max = lim.rlim_cur;
      } else {
        min = lim.rlim_cur;
      }
    } while (min + 1 < max);
  }
```

#### 2.2.3 全球化