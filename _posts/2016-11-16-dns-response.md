---
layout: page
title: DNS 响应报文详解
categories: [Node.js,JavaScript,DNS]
tags: [dns,dgram,http/s]
---

上一篇我已经解释了DNS请求报文怎么解析,不会的自己坐飞机([飞机入口]({{site.baseurl}}/2016-11-11-dns-request.md))。

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
  header.ancount = 1;
```

### Question 请求数据

```js
  var question = response.question = {};
  question.qname = request.question.qname;
  question.qtype = request.question.qtype;
  question.qclass = request.question.qclass;
```

### Answer应答报文数据
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