---
layout: page
title: 【译】Node.js之Stream（流）对象权威指南
categories: [翻译,CSS]
tags: [css ,技术]
---

`Stream`流对象为Node.js带来了强大的力量：你可以使用异步的方式处理输入和输出，可以根据所依赖的步骤来对数据进行输送。**本教程中，我将带你熟悉理论，并教你如何灵活使用`Stream`对象，就像使用`Gulp`一样。**

***

当我在写一本名为 [《前端工具之Gulp，Brower和Yeoman》](https://www.manning.com/books/front-end-tooling-with-gulp-bower-and-yeoman/?a_aid=fettblog&a_bid=238ac06a) 的书时，我决定不仅要展示API和使用案例，还需要关注底层的实现思想。


你知道这在JavaScript中很特别，工具和框架的更新换代比你为它们注册域名和Github团队的速度还要快。**例如[Gulp.js](http://gulpjs.com/)，最重要的一个概念是流！**


## 约50年的流
在`Gulp`里，你想要读取一些输入文件并且输送它们为指定的输出，加载一些`JavaScript`文件并打包成一个文件。`Gulp`的API提供了一些方法来读取，输送，和写文件，所有的方法都是基于流实现的。

>  在计算机中流是一个很老的概念，,源自1960年代早期Unix。

“流是一个数据随着时间序列从源到目的地的过程。“ @ddprrt

数据源可以是多种类型的：文件，计算机内存或者像键盘，鼠标之类的输入设备。

流一旦打开，数据就会从原点开始分割成一块块的小的数据然后被进行传输消费。输入一个文件，每个字符或者字节都会被读取一次；键盘输入，每个按键将传输数据流。

>  最大的优势在于一次加载所有数据,理论上,输入可以无限输入的完全没有限制。

来着键盘的任意一个输入都是有意义的 —— 为什么你应该通过键盘输入控制电脑关闭输入流？

输入流统称为**可读流**，这意味着它们从原点读取数据。另一方面，有输出流和终点；它们可能是文件或者某一段内存，一般输出设备和命令行，打印机，或屏幕有点类似。

它们统称为**输出流值**，意味着它们存储来着流的数据。下图说明了流是如何工作的。

![流]({{site.baseurl}}/images/2017/0512_01.jpg)

数据是由一组可用的元素组成的序列（就像字符或者字节）。

可读流可以来自不同的来源，例如输入设备（键盘），文件，内存里面的数据。可写流可以任意的终点，例如文件和内存，以及众所周知的命令行。


可读和可写流可以互换：键盘输入可以保存在文件中,命令行输入可以作为文件的输入流。

它不仅可以有无尽的输入，而且你可以结合不同的可读和可写流。关键的输入可以直接存储到一个文件中，或者你可以通过命令行和打印机打印文件。接口保持不变，无论来源或目的地是什么。

在Node.js最简单的涉及到把流的从标准输入输送到标准输出的程序例子，使用控制台：

```js
process.stdin.pipe(process.stdout); 
```

我们把我们的可读流（`process.stdin`）把它输送到可写流（`process.stdout`）上。在这之前，我们可以把任意的流内容从任意的原点输送到任意的终点。


就以[request](https://www.npmjs.com/package/request)包为例，我们可以使用它向指定的`URL`发送`http`请求。为什么不从网上来取一些页面并且使用`process.stdin`把它打印出来？

```js
const request = require('request');
request('https://fettblog.eu').pipe(process.stdout);  
```

使用控制台输出一个`HTML`确实不怎么有用，但是使用它输送到一个文件却是网络利刃。

## 转换数据
流不止适合用来在不同的原点和终点之间传输数据。

**流一旦打开数据只会暴露一次，开发者可以在数据到达终点之前进行转换数据，最简单的例子就是把一个文件所有小写字符转换为大写字符**

这是流其中的一个最大的优势所在。流一旦打开你就可以一块块的读取数据，你可以在程序的不同位置进行操作。下图说明了这个过程。


![转换数据]({{site.baseurl}}/images/2017/0512_02.jpg)

对于修改数据，你只需要在输入和输出之间添加对应的程序转换代码块。

本例子中，你拿到来自不同原点和渠道的输入数据并且使用`toUpperCase`进行转换。这个会把小写字符转换为它们对于的大写字符。这个函数一旦定义，就可以在不同的输入原点和输出重复使用。

下面，我定义了一个`toUpperCase`的函数——用来转换任意字符对应的大写字符。创建这个函数有多种方式，但是我是Node.js流封装库像`through2`之类的超级粉丝。他们已经定义一个好的包装,可以轻松的创建一个转换体:

```js
const through2 = require('through2');

const toUpperCase = through2((data, enc, cb) => {      /* 1 */  
  cb(null, new Buffer(data.toString().toUpperCase())); /* 2 */
});

process.stdin.pipe(toUpperCase).pipe(process.stdout);  /* 3 */  
```

* `through2`库绑定第一个参数为函数。 这个函数用来传递数据（默认为`Buffer`实例），传入一些字符编码和一旦我们传入回调函数我们就可以在转换完成之后进行调用。
* 通常，在Node.js流里面，我们传递`Buffer`类型的数据流。可以来自`process.stdin`的数据，在我们按下回车键之后。来自一个文件，这实际上可以任何东西。我们转换当前`Buffer`为字符串，把小写转换为大写，然后转换为`Buffer`再次输出。回调函数有2个参数，第一个参数是错误信息。如果你没有对`end`事件进行监听来捕获错误，流将崩溃程序会由于异常而退出。没有异常第一个参数会返回`null`。第二个参数是转换的数据。
* 我们可以传递我们可读的输入数据到这个转换函数。转换好的数据传递到我们的可读流。

这是完全在函数式编程的路子。我们可以重复使用这个函数来转换不同输入或输出，只要它是可读流。我们不需要关心输入源或输出。同时,我们并不局限于一个单一的转换。我们可以同时链式调用多个转换就像这样：

```js
const through2 = require('through2');

const toUpperCase = through2((data, enc, cb) => {  
  cb(null, new Buffer(data.toString().toUpperCase()));
});

const dashBetweenWords = through2((data, enc, cb) => {  
  cb(null, new Buffer(data.toString().split(' ').join('-')));
});

process.stdin  
  .pipe(toUpperCase)
  .pipe(dashBetweenWords)
  .pipe(process.stdout);
```

如果你熟悉`Gulp`,对上面的代码应该会有映象。很简洁，不是吗？然而，`Gulp`流需要特别注意的不同点是：不会传递`Buffer`类型的数据，我们使用插件，老的JavaScript对象。


## 流对象












