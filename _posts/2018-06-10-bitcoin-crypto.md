---
layout: page
title: 比特币（BitCoin）非对称密钥使用基本分析
categories: [后端]
tags: [crypto,加密,go]
---

最近受到比特币感染，所以就想看看比特币基本的加解密技术是怎样实现的。网上翻了好多篇文章，基本上都只是说了基本原理。完整的实现逻辑好像没怎么有。

好吧，网上翻了老半天。从`go`开始学习，一路学习了`go`的一大箩筐基础知识。说句实话，真没Node.js好学。有点不习惯，特别是模块的定义和引入。

我抱着就只是来学习比特币的心态，就来看看喽。

那就看看`go`的加密模块吧。大家都知道非对称加密，是有2把钥匙的：私钥和公钥。

**公钥加密，私钥解密**

![](/images/2018/0610_02.jpeg)

比特币这里主要使用私钥进行数字签名，然后使用公钥进行签名认证。

> *什么是数字签名可以查看[这篇文章](http://www.ruanyifeng.com/blog/2011/08/what_is_a_digital_signature.html)*

这里为什么不讲加密和解密，因为比特币的数据都是公开的，每个人都可以看得见。通过数字签名，保证比特币交易记录的真实性。（**安全是相对的**）

这篇文章主要讲比特币地址生成，以及比特币交易的基本数字签名和签名验证。

![](/images/2018/0610_01.jpeg)

这里为列一下主要的点：

1. 比特币地址生成（上图步骤：1）
2. 数字签名（上图步骤：2）
3. 签名验证（上图步骤：3）

### 公钥和私钥生成
完成上面的3个步骤的前置条件就是要生成一对钥匙。那非对称加密算法有这么多，使用什么算法合适呢。

这里使用的是：椭圆曲线加密算法 - ECDSA

下面通过`ECDSA`加密算法生成2把钥匙。

```go
//椭圆算法
curve := elliptic.P256()
//生成私钥,公钥
private, err := ecdsa.GenerateKey(curve, rand.Reader)
if err != nil {
    log.Panic(err)
}
d := private.D.Bytes()
b := make([]byte, 0, privKeyBytesLen)
//私钥
priKey := paddedAppend(privKeyBytesLen, b, d)
//公钥
pubKey := append(private.PublicKey.X.Bytes(), private.PublicKey.Y.Bytes()...)
```

`append`函数主要目的是将公钥的`x`和`y`的值拼接起来。

通过`ECDSA` 我们的到了一把私钥`priKey`和一把对应的公钥`pubKey`。

### 比特币地址生成
最重要的一个数据就是比特币地址。先来看看地址是如何生成的。

```txt
1. 公钥哈希值 = RIMPED160(SHA256(公钥))

2. 校验码 = 前四字节(SHA256(SHA256(0 + 公钥哈希值)))

3. 比特币地址 = 1 + Base58(0 + 公钥哈希值 + 校验码)
```
可以看到关键的就是如何求出公钥`hash`，以及校验码。

![](/images/2018/0610_03.png)

#### 公钥hash值
先使用`sha256`计算出哈希值，然后再使用`ripemd160`进行求值。

```go
//hash公钥
h := sha256.New()
h.Write(pubKey)
fmt.Printf("sha256 pubKey: %02X\n", h.Sum(nil))

//ripemd160 hash
hasher := ripemd160.New()
hasher.Write(h.Sum(nil))
sha256Hash := hasher.Sum(nil)
fmt.Printf("公钥哈希值: ripemd160 sha256 hash: %02X\n", sha256Hash)
```

最后得到了`sha256Hash`公钥哈希值。

#### 校验码
通过上面的计算得出了想要的公钥哈希值之后，可以计算校验码。通过2次`sha256`函数计算得出一个hash值，然后再取前面4字节。

```go
//sha256Hash  公钥哈希值
pubKeyAddrSource := append([]byte{0x00} , sha256Hash...)
//校验码
verifyCode := sha256.New()
verifyCode.Write(pubKeyAddrSource)
verifyCodeHash := sha256.New()
verifyCodeHash.Write(verifyCode.Sum(nil))
verifyCode2 := verifyCodeHash.Sum(nil)
fmt.Printf("校验码: sha256(sha256) pubKey: %02X\n", verifyCode2[0:4])

//地址元数据
pubKeyAddrSource = append(pubKeyAddrSource , verifyCode2[0:4]...)
fmt.Printf("地址元数据: 0+公钥哈希值+校验码 : %02X\n", pubKeyAddrSource)
```

#### 生成Addr
最后一步就是生成比特币地址，`Base58`算法则是主要的。

先来看看`Base58`算法。使用它的主要目的是：
1. 避免混淆。在某些字体下，数字0和字母大写O，以及字母大写I和字母小写l会非常相似。
2. 不使用"+"和"/"的原因是非字母或数字的字符串作为帐号较难被接受。
3. 没有标点符号，通常不会被从中间分行。
4. 大部分的软件支持双击选择整个字符串。

```go
// b58encode encodes a byte slice b into a base-58 encoded string.
func b58encode(b []byte) (s string) {
    /* See https://en.bitcoin.it/wiki/Base58Check_encoding */
    const BITCOIN_BASE58_TABLE = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    /* Convert big endian bytes to big int */
    x := new(big.Int).SetBytes(b)
    /* Initialize */
    r := new(big.Int)
    m := big.NewInt(58)
    zero := big.NewInt(0)
    s = ""
    /* Convert big int to string */
    for x.Cmp(zero) > 0 {
        /* x, r = (x / 58, x % 58) */
        x.QuoRem(x, m, r)
        /* Prepend ASCII character */
        s = string(BITCOIN_BASE58_TABLE[r.Int64()]) + s
    }
    return s
}
```

使用上面的`b58encode`生成比特币地址。

```go
//地址
pubKeyAddr := b58encode(pubKeyAddrSource)

for _, v := range pubKeyAddrSource {
    if v != 0 {
        break
    }
    pubKeyAddr = "1" + pubKeyAddr
}

fmt.Println("地址: b58encode : ", pubKeyAddr)
```

到这里，就已经可以得到想要的比特币地址了。

### 数字签名
有了私钥，你就可以对文本签名。别人拿了你的公钥就可以根据签名认证你是否拥有私钥。在比特币中，这就是证明你拥有存款的办法。

```go
//获取钥匙
key := createKey()
priKey := ecdsa.PrivateKey{}
//椭圆算法
curve := elliptic.P256()
priKey.D = new(big.Int).SetBytes(key.PrivateKey)

pub := ecdsa.PublicKey{}
pub.Curve = curve
pub.X = key.PublicKey.X
pub.Y = key.PublicKey.Y

priKey.PublicKey = pub
//进行数据签名
r , s , hash , err := createSign(&priKey , []byte("这是我的钱"))
```

### 签名验证
验证的时候需要提供签名和公钥，算出公钥哈希值并和比特币支出脚本的公钥哈希值对比，最后再验证签名。

```go
if ecdsa.Verify(&pub ,hash , r , s) {
    fmt.Println("is ok")
}else {
    fmt.Println("is error")
}
```

到这里比特币基本的基本原理就分析完成来。

**效果图**

![](/images/2018/0610_04.png)


代码：[https://github.com/Yi-love/go-demo/blob/master/publickey.go](https://github.com/Yi-love/go-demo/blob/master/publickey.go)

### 参考资料
[椭圆曲线加密算法](http://www.ehcoo.com/Bitcoin_ECDSA.html)

[比特币加密算法](https://www.cnblogs.com/huazhenghao/p/5516688.html)

[base58](https://zh.wikipedia.org/wiki/Base58)