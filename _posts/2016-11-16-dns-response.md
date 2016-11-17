---
layout: page
title: DNS 响应报文详解
categories: [Node.js,JavaScript,DNS]
tags: [dns,dgram,http/s,响应报文解析]
---

上一篇我已经解释了DNS请求报文怎么解析,不会的自己坐飞机([飞机入口]({{site.baseurl}}/node.js/javascript/dns/2016/11/11/dns-request.html))。

这一篇主要从DNS服务的角度来解释，如何自己创建响应报文返回给客户端。

<!-- more -->

就这个命题，可以罗列出DNS服务器在创建`response`响应报文时需要解决的问题。

*  dns数据报类型`Buffer`?                               
*  Node.js中Buffer如何创建?  
*  正常情况我们操作的字符串和数字等是否可以转换为`Buffer`?
*  `Buffer`是否可以创建`response`响应报文指定类型的参数值?
*  `response`响应报文与`request`请求报文的异同?

说到这，你是不是已经察觉到。既然`dns`请求和`dns`响应都做了，那是不是自己动手写一个dns代理服务器也可以信手拈来呢。

答案是: `Yes`。

那然我们继续完成这最后一步，`response`响应报文的创建。

## DNS响应报文格式

`response`响应报文和`request`请求报文格式相同。不同的地方是参数的值不同。

## response参数详解
*   `Header` 报文头
*   `Question` 查询的问题
*   `Answer`   应答
*   `Authority` 授权应答
*   `Additional` 附加信息

``` 
  DNS format

  +--+--+--+--+--+--+--+
  |        Header      |
  +--+--+--+--+--+--+--+
  |      Question      |
  +--+--+--+--+--+--+--+
  |      Answer        |
  +--+--+--+--+--+--+--+
  |      Authority     |
  +--+--+--+--+--+--+--+
  |      Additional    |
  +--+--+--+--+--+--+--+
```

### Header报文头

属性说明：

* 客户端请求ID是为了保证收到DNS服务器返回报文时能正确知道是哪一个请求的响应报文。所以一个完整的DNS请求和响应，里面`request`和`response`的`ID`
必须保持一致。
*  `header.qr = 1`，表示响应报文
*  `header.ancoubt`,这个牵涉到应答记录条目，所以要根据应答字段`Answer`计算。

```js
  var response = {};
  var header = response.header = {};

  header.id = request.header.id;//id相同，视为一个dns请求
  
  header.qr = 1;    //响应报文
  header.opcode = 0;//标准查询
  header.rd = 1;
  header.ra = 0;
  
  header.z = 0;
  header.rcode = 0;//没有错误

  header.qdcount = 1;
  header.nscount = 0;
  header.arcount = 0;
  header.ancount = 1;//这里answer为一个，所以设置为1.如果有多个answer那么就要考虑多个answer
```

### Question 请求数据
将请求数据原样返回。

```js
  var question = response.question = {};
  question.qname = request.question.qname;
  question.qtype = request.question.qtype;
  question.qclass = request.question.qclass;
```

### Answer应答报文数据
这个部分的内容就是dns服务器要返回的数据报。

`RDDATA`为数据字段。长度不固定。

格式：

```
  Answer format

    0  1  2  3  4  5  6  7  0  1  2  3  4  5  6  7
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                    NAME                       |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                    TYPE                       |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                    CLASS                      |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                    TTL                        |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                    RDLENGTH                   |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                    RDATA                      |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+

```

```js
  var answer = {};

  answer.name = request.question.qname;
  answer.type = 1;
  answer.class = 1;
  answer.ttl = ttl || 1;//报文有效跳数
  answer.rdlength = 4;
  answer.rdata = rdata;//数据记录
```

### Authority/Additional 数据
自己处理的请求没有授权应答和附加数据。


## `Buffer`类型响应报文
得到了想要的一切响应数据之后，下一步就是将这些数据转换为客户端可以解析的`Buffer`类型。

那这一步的工作正好与`request`请求报文解析的工作恰好相反。报上面的数据一一拼凑为`response`响应报文格式数据。

### Buffer长度确定
返回一段`Buffer`报文，总得先创建一定长度的`Buffer`。

根据字段分析，除了`Question.qname`字段和`Answer.name`字段是长度不固定的，其它的字段都是可以计算出来。

通过带入数据可以得到需要创建的`Buffer`的大小。

```
  len = Header + Question + Answer
      = 12 + (Question.qname.length+4) + (Answer.name.length + 14)
      = 30 + Question.qname.length + Answer.name.length
```

确定需要创建的`Buffer`实例的长度为`30 + Question.qname.length + Answer.name.length`后，就可以进行参数转换了。

### `Buffer`实例参数转换
`response`数据大概分为了3中类型：

* 普通完整字节类别
* 需要按位拼接成一个字节的类别
* 无符号整数类别

#### 普通完整字节类别
这种往往是最好处理的了，直接`copy`过来就可以了。

使用`buf.copy(target[, targetStart[, sourceStart[, sourceEnd]]])`函数进行拷贝.

例如拷贝`header.id`:

```js
  header.id.copy(buf,0,0,2);
```

通过这种方式即可将其它参数进行一一转换。

#### 需要按位拼接成一个字节的类别
这种主要数针对`Header`的第`[3,4]`个字节。应为这2个字节的数据是按位的长度区分，现在需要拼凑成完整字节。

首先需要确定的是字节长度，以及默认值，然后确定位操作符。

`1byte = 8bit`

默认值为：`0 = 0x00`

操作符：

```
  &: 不行,因为任何数&0 == 0
  |: ok ,任何数 | 0 都等于这个数
```

通过`|`可以得到想要的结果：

```js
  buf[2] = 0x00 | header.qr << 7 | header.opcode << 3 | header.aa << 2 | header.tc << 1 | header.rd;
  buf[3] = 0x00 | header.ra << 7 | header.z << 4 | header.rcode;
```

#### 无符号整数类别
假如你看过`Buffer`的api或使用`Buffer`创建过`buf`无符号整数，那么这个问题就可以很容易解决了。

`buf.writeUInt16BE(value, offset[, noAssert])`和`buf.writeUInt32BE(value, offset[, noAssert])`，一看就知道一个是创建`16`位，一个是`32`位。

```js
 buf.writeUInt16BE(header.ancount, 6);
 buf.writeUInt32BE(answer.rdata, len-4);
```

## 应用场景