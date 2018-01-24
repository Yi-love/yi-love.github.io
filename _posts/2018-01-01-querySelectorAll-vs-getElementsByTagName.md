---
layout: page
title: querySelectorAll Vs getElementsByTagName 区别
categories: [JavaScript]
tags: [html,document,javascript]
---

日常开发中，有时候会用到`querySelectorAll` 或者 `getElementsByTagName` 从DOM树中获取元素集合。虽然表面上看没有很大区别，但是往往现实却并非如此。

|---|---|---|
| \ | querySelectorAll | getElementsByTagName  |
| 遍历方式 | 深度优先 | 深度优先 |
| 返回值类型 | NodeList | HTMLCollection |
| 返回值状态 | 静态 | 动态 |

由此可知，除了遍历方式都是深度优先之外。其它的都是不同的。

### 深度优先遍历

**深度优先搜索算法**（英语：Depth-First-Search，简称DFS）是一种用于遍历或搜索树或图的算法。沿着树的深度遍历树的节点，尽可能深的搜索树的分支。当节点v的所在边都己被探寻过，搜索将回溯到发现节点v的那条边的起始节点。这一过程一直进行到已发现从源节点可达的所有节点为止。如果还存在未被发现的节点，则选择其中一个作为源节点并重复以上过程，整个进程反复进行直到所有节点都被访问为止。属于盲目搜索。

--摘自《[wikipedia](https://zh.wikipedia.org/wiki/%E6%B7%B1%E5%BA%A6%E4%BC%98%E5%85%88%E6%90%9C%E7%B4%A2)》

那么在DOM树中使用该算法遍历也是相同的道理，只不过节点就对应着DOM树中的元素。

![different]({{site.baseurl}}/images/2018/0101_01.jpg)

### 返回值
那么重点还是在返回值上。动态集合指的就是会随着DOM树元素的增加而增加，减少而减少。静态集合则会被受DOM树元素变化的影响。

NodeList对象是一个节点的集合，是由`Node.childNodes`和`document.querySelectorAll`返回的。NodeList并不是都是静态的，也就是说`Node.childNodes`返回的也是一个动态的元素集合，`querySelectorAll` 返回的是一个静态集合。

HTMLCollection 返回一个时时包括所有给定标签名称的元素的HTML集合。

对比下来可以发现，NodeList 既可以是静态也可以是动态的，而HTMLCollection则一直是动态的。

下面的这种情况，NodeList是动态的：

```js
var one = document.querySelector('.one')
var child = one.childNodes;
console.log(child.length);//7
one.appendChild(document.createElement('div'));
console.log(child.length);//8
```

![different]({{site.baseurl}}/images/2018/0101_02.jpg)

在需要遍历DOM树元素的时候就需要格外注意了，使用动态集合有可能会出现意想不到的结果。

### 总结
所以在以后的开发中一定要注意`querySelectorAll` 和 `getElementsByTagName`选择器的用法，因为有可能死循环就会出莫名其妙的出现在某个角落里面。