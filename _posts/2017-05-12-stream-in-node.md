---
layout: page
title: 【译】Node.js之Stream（流）对象权威指南
categories: [翻译,CSS]
tags: [css ,技术]
---

`Stream`流对象为Node.js带来了强大的力量：你可以使用异步的方式处理输入和输出，可以根据所依赖的步骤来对数据进行转换。**本教程中，我将带你熟悉理论，并教你如何灵活使用`Stream`对象，就像使用`Gulp`一样。**

***

当我在写一本名为 [《前端工具之Gulp，Brower和Yeoman》](https://www.manning.com/books/front-end-tooling-with-gulp-bower-and-yeoman/?a_aid=fettblog&a_bid=238ac06a) 的书时，我决定不仅要展示API和使用案例，还需要关注底层的实现思想。


你知道这在JavaScript中很特别，工具和框架的更新换代比你为它们注册域名和Github团队的速度还要快。**例如[Gulp.js](http://gulpjs.com/)，最重要的一个概念是流！**


## 约50年的流
在`Gulp`里，你想要读取一些输入文件并且转换它们为指定的输出，加载一些`JavaScript`文件并打包成一个文件。`Gulp`的API提供了一些方法来读取，转换，和写文件

























