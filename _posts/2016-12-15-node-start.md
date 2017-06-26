---
layout: page
title: Node.js源码解析--启动Node.js
categories: [Node.js]
tags: [node_main.cc,node.cc,global,process,env.cc,bootstarp_node.js]
---

`Node.js`一直以来都是我工作中不可缺少的一部分，但对于它的了解却知之甚少。
平常的时候只会用`Node.js`来写写工具,组件。偶尔会用它来写写项目（原谅我是个FE），
所以并没有对`Node.js`进行过深入的学习。

从最开始的`Node.js 6+`文档翻译,到工具模块的编写(例如：[dns-proxy-server](https://github.com/Yi-love/dns-proxy-server) 一个dns代理工具)，
再到`Node.js`源码的解读，我都在试着一步一步的去了解`Node.js`。

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

> 第3步图中没有给出，安全通讯在第3步和第4步之间。

每个`C/C++`程序都有一个入口`main`，`Node.js`从`node_main.cc`开始执行`C++`核心模块。
在第11步以前，都是启动`Node.js`的`C++`核心模块，直到`LoadEnvironment()`函数的调用，
才真正的加载`Node.js`的`JavaScript`模块，`JavaScript`模块的`main`函数就是`bootstrap_node.js`文件。
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

那如何才能把这些参数正确的挂载到`process`对象上呢？

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

参考：[WideCharToMultiByte](http://www.cnblogs.com/gakusei/articles/1585211.html)

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

初始化主要包括：

1. 程序退出后对终端状态进行还原事件绑定
2. `__POSIX__`平台兼容初始化
3. cmd参数分类(转：2.1.2 )
4. 其它初始化

`__POSIX__`平台要而外初始化的主要是：信号处理 ，`stdin/stdout/stderr`可用 , 打开文件描述符限制设置上线。

>  初始化主要在图2-1的第3步中实现。

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

3.保证`stdin/stdout/stderr`可用

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

4.限制打开文件描述符的个数

一个进程不能无限的打开文件.必须进行限制。

`RLIMIT_NOFILE`(一个进程能打开的最大文件 数，内核默认是1024)。

```cpp
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

#### 2.2.3 其它初始化
1.获取准确的启动时间

`Node.js`启动的起始时间。`uv_default_loop`全局的事件循环.

```cpp
  prog_start_time = static_cast<double>(uv_now(uv_default_loop()));
```

2.尝试设置所有的代开的文件描述符为自动关闭

```cpp
 uv_disable_stdio_inheritance();
```

3.检测注册的异步debug消息队列(跨线程)

```cpp
uv_async_init(uv_default_loop(),
                            &dispatch_debug_messages_async,
                            DispatchDebugMessagesAsyncCallback)
```

4.删除异步debug消息的handle引用
> 不会对callback函数造成影响.

```cpp
uv_unref(reinterpret_cast<uv_handle_t*>(&dispatch_debug_messages_async))
```

5.全球化

```cpp
V8::SetFlagsFromString(icu_case_mapping, sizeof(icu_case_mapping) - 1);
V8::SetFlagsFromString(NODE_V8_OPTIONS, sizeof(NODE_V8_OPTIONS) - 1);
```


### 2.3 安全通讯
把基本的底层初始化和兼容都做好了以后，就要考虑安全通讯。因为网络传输容易被窃听。
比如网站的登录服务，如果登录的的密码不加密，很容易造成密码泄漏，没有加密过的密码会通过明文进行传输。
假如你加密了，但是可能使用的是`HTTP`协议，也一样有可能被劫持。居于上面的种种情况，
服务器开启安全通讯是必不可少的（虽然可以不开启，那就相当于裸奔）。

`Node.js`为了进行安全通讯而引入了`OPENSSL`，`OPENSSL`是一个是一个开放源代码的软件库包。
目前广泛被应用在互联网的网页服务器上。可以使用这个包来进行安全通信，避免窃听，同时确认另一端连接者的身份。

总结：`Node.js`的所有加密算法都是基于这个库，包括(`HTTPS`的`SSL`与`TLS`协议).一旦这个库存在漏洞就会影响全站。

这也就是为什么大家一听到`OPENSSL`有漏洞，就捉鸡的原因了。

>  以下的`HAVE_OPENSSL` 和 `NODE_FIPS_MODE`  都在`node.gyp`构建文件中定义。

```cpp
//node.cc#Start()
//应用程序可以使用OPENSSL来进行安全通信，避免窃听，同时确认另一端连接者的身份.
#if HAVE_OPENSSL
  //获取CA证书文件
  if (const char* extra = secure_getenv("NODE_EXTRA_CA_CERTS"))
    //设置CA证书
    crypto::UseExtraCaCerts(extra);
#ifdef NODE_FIPS_MODE
  //FIPS构建的情况下,我们应该确保先初始化随机源。
  OPENSSL_init();
#endif  // NODE_FIPS_MODE
  // V8 on Windows doesn't have a good source of entropy. Seed it from
  // OpenSSL's pool.
  // 允许主机应用程序提供一个回调可作为随机数生成器的熵的来源。
  V8::SetEntropySource(crypto::EntropySource);
#endif
```

1.从环境变量中获取参数`NODE_EXTRA_CA_CERTS`

例如，linux下可以通过命令：

```sh
 export | env 
```

```cpp
// 查看环境变量 , 在设置了uid的情况下，
inline const char* secure_getenv(const char* key) {
#ifndef _WIN32
  //geteuid()用来取得执行目前进程有效的用户识别码。
  //getuid()用来取得执行目前进程的用户识别码。
  if (getuid() != geteuid() || getgid() != getegid())
    return nullptr;
#endif
  //获取环境变量
  return getenv(key);
}
```

如果有就设置`CA`证书。这里的`CA`与开启`HTTPS`时需要设置的`CA`有区别。

2.设置V8引擎随机源生成器

我们所说的随机数其实也算通过一定的算法计算出来的(也就是：伪随机数)，这里面最重要的就是随机数的种子。
也就是这里的随机源（熵）。

某种情况下的随机数是可以被推导计算出来的。虽然这里不一定能保证随机数能做到正在的随机。
但是也应该竟可能的保证随机数的质量。

### 2.4 V8引擎启动
到了这一步（图2-1的第4步），说明我们需要开始创建一个平台，在上面搭建一个环境来解释执行`JavaScript`代码。

基本的工作有：

1. 设置线程池大小，并创建工作线程
2. 初始化V8
3. 创建V8实例`isolate`,并初始化


#### 2.4.1 设置线程池大小，并创建工作线程
首先会根据处理器的数量与需要设置的线程大小是否合理，最大线程池为`kMaxThreadPoolSize = 8`。

```cpp
//default-platform.cc
/**
 * [DefaultPlatform::SetThreadPoolSize 设置线程池大小]
 * @param thread_pool_size [线程数量]
 */
void DefaultPlatform::SetThreadPoolSize(int thread_pool_size) {
  base::LockGuard<base::Mutex> guard(&lock_);
  DCHECK(thread_pool_size >= 0);
  if (thread_pool_size < 1) {
    //获取处理器当前数量然后-1
    thread_pool_size = base::SysInfo::NumberOfProcessors() - 1;
  }
  thread_pool_size_ =
      std::max(std::min(thread_pool_size, kMaxThreadPoolSize), 1);//不能超过最大线程数限制
}
```

然后根据线程池大小`thread_pool_size`创建工作线程，并添加到队列里面。

```cpp
//default-platform.cc
/**
 * [DefaultPlatform::EnsureInitialized 确认平台已经初始化]
 */
void DefaultPlatform::EnsureInitialized() {
  base::LockGuard<base::Mutex> guard(&lock_);//guard：守护的意思
  if (initialized_) return;
  initialized_ = true;
  //添加工作线程到线程池
  //std::vector<WorkerThread*> thread_pool_;
  for (int i = 0; i < thread_pool_size_; ++i)
    thread_pool_.push_back(new WorkerThread(&queue_));
}
```

#### 2.4.2 初始化V8
`V8`初始化这里，大概就是初始化了一些底层的东西（暂时没有看明白，后期补上）。

```cpp
//v8.cc
/**
 * [V8::InitializeOncePerProcessImpl v8初始化]
 */
void V8::InitializeOncePerProcessImpl() {
  FlagList::EnforceFlagImplications();

  if (FLAG_predictable && FLAG_random_seed == 0) {
    // Avoid random seeds in predictable mode.
    FLAG_random_seed = 12347;
  }

  if (FLAG_stress_compaction) {
    FLAG_force_marking_deque_overflows = true;
    FLAG_gc_global = true;
    FLAG_max_semi_space_size = 1;
  }

  if (FLAG_turbo && strcmp(FLAG_turbo_filter, "~~") == 0) {
    const char* filter_flag = "--turbo-filter=*";
    FlagList::SetFlagsFromString(filter_flag, StrLength(filter_flag));
  }
  //初始化 node_os.cc
  //主要是把操作系统方面的操作绑定到当前环境
  base::OS::Initialize(FLAG_random_seed, FLAG_hard_abort, FLAG_gc_fake_mmap);
  //v8初始化
  Isolate::InitializeOncePerProcess();
  sampler::Sampler::SetUp();
  CpuFeatures::Probe(false);
  ElementsAccessor::InitializeOncePerProcess();
  LOperand::SetUpCaches();
  SetUpJSCallerSavedCodeData();
  ExternalReference::SetUp();
  Bootstrapper::InitializeOncePerProcess();
}
```

#### 2.4.3 创建V8引擎实例,并初始化
`V8`平台的创建与初始化之后，进一步（图2-1的第6步）就是需要创建一个`V8`引擎实例来跑我们的`JavaScript`模块。
`V8`引擎原本是用在chrome浏览器的，我们使用chrome时，每打开一个页面其实就是创建一个`V8`引擎实例。

```cpp
/**
 * [Start 开始执行]
 * @param  event_loop [uv_default_loop()]
 * @param  argc       [description]
 * @param  argv       [description]
 * @param  exec_argc  [description]
 * @param  exec_argv  [description]
 * @return            [description]
 */
inline int Start(uv_loop_t* event_loop,
                 int argc, const char* const* argv,
                 int exec_argc, const char* const* exec_argv) {
  //v8引擎初始化参数
  Isolate::CreateParams params;
  //容器
  ArrayBufferAllocator allocator;
  params.array_buffer_allocator = &allocator;
//性能分析器
#ifdef NODE_ENABLE_VTUNE_PROFILING
  params.code_event_handler = vTune::GetVtuneCodeEventHandler();
#endif
  //Isolate表示一个独立的v8引擎实例
  //E:\git\node-master\deps\v8\src\api.cc#Isolate* Isolate::New
  Isolate* const isolate = Isolate::New(params);
  if (isolate == nullptr)
    return 12;  // Signal internal error.
  //设置消息监听函数
  isolate->AddMessageListener(OnMessage);
  //设置异常中断监听函数
  isolate->SetAbortOnUncaughtExceptionCallback(ShouldAbortOnUncaughtException);
  //设置自动运行小任务
  isolate->SetAutorunMicrotasks(false);
  //设置错误回调
  isolate->SetFatalErrorHandler(OnFatalError);
  //跟踪堆对象分配堆快照。
  if (track_heap_objects) {
    isolate->GetHeapProfiler()->StartTrackingHeapObjects(true);
  }
  //互斥锁
  {
    Mutex::ScopedLock scoped_lock(node_isolate_mutex);
    CHECK_EQ(node_isolate, nullptr);
    node_isolate = isolate;
  }

  int exit_code;
  {
    //锁住
    Locker locker(isolate);
    //v8上下文
    Isolate::Scope isolate_scope(isolate);
    //v8对象指针的数组
    HandleScope handle_scope(isolate);
    //v8数据集
    IsolateData isolate_data(isolate, event_loop, allocator.zero_fill_field());
    //执行node.js
    exit_code = Start(isolate, &isolate_data, argc, argv, exec_argc, exec_argv);
  }

  {
    Mutex::ScopedLock scoped_lock(node_isolate_mutex);
    CHECK_EQ(node_isolate, isolate);
    node_isolate = nullptr;
  }

  isolate->Dispose();

  return exit_code;
}
```

创建整个`isolate`实例，然后监听相关的事件。

比如：

1. 设置消息监听函数
2. 设置异常中断监听函数
3. 设置自动运行小任务
4. 跟踪堆对象分配堆快照

> 互斥锁（英语：英语：Mutual exclusion，缩写 `Mutex`）是一种用于多线程编程中，防止两条线程同时对同一公共资源（比如全局变量）进行读写的机制。
该目的通过将代码切片成一个一个的临界区域（critical section）达成。临界区域指的是一块对公共资源进行访问的代码，并非一种机制或是算法。
一个程序、进程、线程可以拥有多个临界区域，但是并不一定会应用互斥锁。


### 2.5 Loading Node.js环境
`isolate`实例创建之后，就需要把整个`Node.js`的环境搭建起来，在这一步之前基本上都是在为启动`Node.js`做准备。


### 2.6 开始Node.js旅程

1.加载`bootstrap_node.js`，开始`Node.js`的`JavaScript`模块。

```cpp
Local<String> script_name = FIXED_ONE_BYTE_STRING(env->isolate(),
                                                    "bootstrap_node.js");
```

2.把global加到全局

```cpp
global->Set(FIXED_ONE_BYTE_STRING(env->isolate(), "global"), global);
```

3.绑定`process`到全局

```cpp
Local<Value> arg = env->process_object();
//执行bootstrap_node.js  arg === process
//执行boot_strap，并把process传递进去
f->Call(Null(env->isolate()), 1, &arg);
```

4.加载所有的`JavaScript`模块，之后，执行`startup`函数.

`startup`最重要的就是`else`里面的代码，这就是开始执行用户代码的开始。也就是整个项目真正开始执行用户代码的开始的地方。

```js
else {
  // 用户代码

  // If this is a worker in cluster mode, start up the communication
  // channel. This needs to be done before any user code gets executed
  // (including preload modules).
  if (process.argv[1] && process.env.NODE_UNIQUE_ID) {
    const cluster = NativeModule.require('cluster');
    cluster._setupWorker();

    // Make sure it's not accidentally inherited by child processes.
    // 确保不是子进程
    delete process.env.NODE_UNIQUE_ID; //cluster.fork()
  }

  if (process._eval != null && !process._forceRepl) { //命令行
    // User passed '-e' or '--eval' arguments to Node without '-i' or
    // '--interactive'
    preloadModules();

    const internalModule = NativeModule.require('internal/module');
    internalModule.addBuiltinLibsToObject(global); //加载模块到global对象
    run(() => {
      evalScript('[eval]');
    });
  } else if (process.argv[1]) {  //主要分支
    // make process.argv[1] into a full path
    const path = NativeModule.require('path');
    //获取模块的完整路径
    process.argv[1] = path.resolve(process.argv[1]);

    const Module = NativeModule.require('module');

    // check if user passed `-c` or `--check` arguments to Node.
    // js语法校验
    if (process._syntax_check_only != null) {
      const vm = NativeModule.require('vm');
      const fs = NativeModule.require('fs');
      const internalModule = NativeModule.require('internal/module');
      // read the source
      const filename = Module._resolveFilename(process.argv[1]);
      var source = fs.readFileSync(filename, 'utf-8');
      // remove shebang and BOM
      source = internalModule.stripBOM(source.replace(/^#!.*/, ''));
      // wrap it
      source = Module.wrap(source);
      // compile the script, this will throw if it fails
      new vm.Script(source, {filename: filename, displayErrors: true});
      process.exit(0);
    }
    //--require 加载预加载模块
    preloadModules();
    run(Module.runMain); //执行模块
  } else {
    preloadModules();
    // If -i or --interactive were passed, or stdin is a TTY.
    if (process._forceRepl || NativeModule.require('tty').isatty(0)) {
      // REPL
      const cliRepl = NativeModule.require('internal/repl');
      cliRepl.createInternalRepl(process.env, function(err, repl) {
        if (err) {
          throw err;
        }
        repl.on('exit', function() {
          if (repl._flushing) {
            repl.pause();
            return repl.once('flushHistory', function() {
              process.exit();
            });
          }
          process.exit();
        });
      });

      if (process._eval != null) {
        // User passed '-e' or '--eval'
        evalScript('[eval]');
      }
    } else {
      // Read all of stdin - execute it.
      process.stdin.setEncoding('utf8');

      var code = '';
      process.stdin.on('data', function(d) {
        code += d;
      });

      process.stdin.on('end', function() {
        process._eval = code;
        evalScript('[stdin]');
      });
    }
  }
}
```

执行了之后，进入了事件循环，也就是`libuv`库的事件轮询机制。

```cpp
{
  SealHandleScope seal(isolate);
  bool more;
  do {
    //反复的询问任务是否完成
    v8_platform.PumpMessageLoop(isolate);
    more = uv_run(env.event_loop(), UV_RUN_ONCE);//事件循环

    if (more == false) { //没有事件活跃
      v8_platform.PumpMessageLoop(isolate);
      EmitBeforeExit(&env); //准备退出

      // Emit `beforeExit` if the loop became alive either after emitting
      // event, or after running some callbacks.
      more = uv_loop_alive(env.event_loop());
      if (uv_run(env.event_loop(), UV_RUN_NOWAIT) != 0)
        more = true;
    }
  } while (more == true);
}
```

### 2.7 退出
从第15步开始，`Node.js`将会开始退出。