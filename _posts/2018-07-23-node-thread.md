---
layout: page
title: 【译】Node.js工作线程介绍
categories: [Node.js]
tags: [thread,翻译]
---

几天前，Node.js的10.5.0版本已经发布，其中包含的主要功能之一是增加了对（和实验）线程支持。

有意思的是，作为一门不已线程为荣并拥有非常棒的异步I/O的语言。那么为什么我们还需要在Node中的线程呢？

最简单的回答是：为了解决在处理繁重的CPU密集型计算时，表现更为出色。因为Node.js在AI，机器学习，数据科学等领域表现并不是很强大。有很多正在进行努力解决这个问题，但我们还没有部署例如微服务时一样高性能的。

这里，我根据官方文档，写了一个简单的案例，希望对你开始学习线程会有一点帮助。

## 如何使用线程模块？
首先，我们需要引入`worker_threads`模块。

注意，只有在启动脚本中使用`--experimental-worker`才有用。否则模块是无法被找到的。

注意区分`worker`和线程，整个文档将介绍如何引用：工作线程或简单的`worker`。

如果你过去使用过多处理，你会发现这种方法有很多相似之处，但如果你没有，请不要担心，我会尽可能多地解释。

## 你能用它做什么？
工作线程就像我之前提到的那样，用于处理CPU密集型任务，不适用于I/O密集型任务。因为根据官方文档，Node提供的处理异步I/O的内部机制比使用工作线程更有效。所以...不要同时使用。

让我们从一个简单的例子开始，学习如何创建一个工作线程并使用它。

### 案例1

```js
const { Worker, isMainThread,  workerData } = require('worker_threads');

let currentVal = 0;
let intervals = [100,1000, 500]

function counter(id, i){
  console.log("[", id, "]", i)
  return i;
}

if(isMainThread) {
  console.log("this is the main thread")
  for(let i = 0; i < 2; i++) {
    let w = new Worker(__filename, {workerData: i});
  }

  setInterval((a) => currentVal = counter(a,currentVal + 1), intervals[2], "MainThread");
} else {

  console.log("this isn't")

  setInterval((a) => currentVal = counter(a,currentVal + 1), intervals[workerData], workerData);

}
```

上面的例子将简单地输出一组显示增量计数器的行，这将使用不同的速度增加它们的值。

![thread](/images/2018/0723_01.png)

让我们分解一下：

*  `if`语句中的代码创建了2个工作线程，由于传递了`__filename`参数，因此它们的代码取自同一个文件。 工作线程现在需要文件的完整路径，他们无法处理相对路径，因此这就是使用此值的原因。
* 将2个`worker`作为全局参数发送，其形式为您在第二个参数中看到的`workerData`属性。 然后可以通过具有相同名称的常量访问该值（请参阅如何在文件的第一行中创建常量，并在稍后的最后一行中使用该常量）。


这个例子是你可以用这个模块做的最基本的事情之一，但它不是那么有趣，是吗？ 让我们看另一个例子。

### 案例2
作为最后一个例子，我将坚持使用相同的功能，但向您展示如何清理它并具有更易维护的版本。

```js
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const request = require("request");

function startWorker(path, cb) {
  let w = new Worker(path, {workerData: null});
  w.on('message', (msg) => {
    cb(null, msg)
  })
  w.on('error', cb);
  w.on('exit', (code) => {
    if(code != 0)
          console.error(new Error(`Worker stopped with exit code ${code}`))
   });
  return w;
}

console.log("this is the main thread")

let myWorker = startWorker(__dirname + '/workerCode.js', (err, result) => {
  if(err) return console.error(err);
  console.log("[[Heavy computation function finished]]")
  console.log("First value is: ", result.val);
  console.log("Took: ", (result.timeDiff / 1000), " seconds");
})

const start = Date.now();
request.get('http://www.google.com', (err, resp) => {
  if(err) {
    return console.error(err);
  }
  console.log("Total bytes received: ", resp.body.length);
  //myWorker.postMessage({finished: true, timeDiff: Date.now() - start}) //you could send messages to your workers like this
}) 
```

并且您的线程代码可以在另一个文件中，例如：

```js
const {  parentPort } = require('worker_threads');

function random(min, max) {
  return Math.random() * (max - min) + min
}

const sorter = require("./test2-worker");

const start = Date.now()
let bigList = Array(1000000).fill().map( (_) => random(1,10000))

/**
//you can receive messages from the main thread this way:
parentPort.on('message', (msg) => {
  console.log("Main thread finished on: ", (msg.timeDiff / 1000), " seconds...");
})
*/

sorter.sort(bigList);
parentPort.postMessage({ val: sorter.firstValue, timeDiff: Date.now() - start});
```

分解一下，我们看到：

1. 主线程和工作线程现在将其代码放在不同的文件中。 这更容易维护和扩展。
2. `startWorkerfunction`返回新实例，如果您愿意，可以稍后向其发送消息。
3. 如果主线程的代码实际上是主线程（我们删除了主IF语句），您不再需要担心。
4. 您可以在`worker`的代码中看到如何从主线程接收消息，从而允许双向异步通信。

通过这篇文章，我希望你能够理解如何开始使用这个新模块。 请记住：

1. 这仍然是高度实验性的，这里解释的内容可能会在未来的版本中发生。
2. 去阅读PR评论和文档，有关于此的更多信息，我只关注它的基本步骤。
3. 玩的开心！ 四处游玩，报告错误并提出改进建议，这刚刚开始！


原文： [https://medium.com/dailyjs/threads-in-node-10-5-0-a-practical-intro-3b85a0a3c953](https://medium.com/dailyjs/threads-in-node-10-5-0-a-practical-intro-3b85a0a3c953)