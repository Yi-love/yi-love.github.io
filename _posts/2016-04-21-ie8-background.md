---
layout: page
title: IE8 兼容背景颜色为：rgba时无法显示问题
categories: [前端]
tags: [ie8,background,rgba]
---

IE8下不支持rgba,对背景设置透明度的时候必须进行透明度兼容。

### css兼容代码

```css
.className{
  /*一般的高级浏览器都支持*/
  background: rgba(255,255,255,0.1);
  /*IE8下*/
  filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#19ffffff,endColorstr=#19ffffff);   
}
```

原理：使用渐变来完成透明度兼容。

### #19ffffff分析
#19ffffff 由两部分构成：19 和  ffffff

*   19：表示的透明度阀值 (19 === rgba中的0.1)
*   ffffff : 表示颜色

### 阀值计算
使用rgba下的透明度 ： alpha\*255 取整然后转换为16进制即可。

```
  rgba     ie8filter
  
  0.1      0.1*255 = 25 转为16进制 ： 19 (16+9)
  0.2      33
  0.3      4C
  0.4      66
  0.5      7F
  0.6      99
  0.7      B2
  0.8      C8
  0.9      E5 
```
