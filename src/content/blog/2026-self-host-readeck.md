---
title: 终于找到合适我的自托管稍后阅读软件：Readeck
description: 
pubDate: '2026-01-15'
---

前几天看到有人推荐的 Readeck, 试了一下才发现正是我找了很久了几乎完美符合我需求的 App. 其实我一直没有停止过替代 ReadWise Reader 的开源软件，很好奇为什么 Readeck 的知名度没那么高，难道是因为代码没有托管在 GitHub 上面？

我之前在用 ReadWise Reader，一直在用，从 Beta 就开始用了，可能有两三年了吧，当时还发邮件申请了一个中国区半价的优惠，$49一年。刚开始用的时候很喜欢，甚至 RSS 阅读器也用他们的，但是后来发现同步太慢，而且访问服务要翻墙，到不是什么大不了的事情，但是偶尔没发现 VPN 断开的时候文章就会不同步而且自己也不知道，倒是心里一直有点慌：是不是要查一下 VPN 先？

RSS 阅读器我在用 Miniflux，当时刚开通了一年的 Inoreader 没两个月就发现 Miniflux 了，然后再也没回去，浪费了年费也心甘情愿，因为 Miniflux 真的太好用。所以之前的流程是先在 Miniflux 过滤发到 Instapaper，然后再发到
ReadWise Reader，Miniflux 是支持直接发到 Reader 的，不过忘了什么原因要这么弄了，没必要。

现在 Miniflux 也可以直接发到 Readeck，但是刚开始配置的时候有点问题，两个服务跑在同一个服务器上面但是用域名的方法不能发送成功，好像是已知的 DNS 的问题，后来的解决办法是创建一个 Podman Network 让两个服务跑在同一个网络下面，配置`Readeck URL`为`http://systemd-readeck:8000`就可以了。

## 自定义抓取规则

Readeck 支持 [Content Scripts](https://readeck.org/en/docs/content-scripts) 就是自定义文章抓取规则，对一些抓取错误的网站可以重新定义规则。我自己先写了两个，解决了多抓取内容的问题：

```js
// File: 36kr.com-newsflashes.js
exports.isActive = () => {
    console.warn($.url);
    return (
        $.domain === "36kr.com" && $.url.startsWith("https://36kr.com/newsflashes/")
    );
};

exports.setConfig = (config) => {
    config.bodySelectors = [
        "//div[contains(@class, 'newsflash-item')]/div[contains(@class, 'item-desc')]/pre[contains(@class, 'pre-item-des')]",
    ];
};

// File: macrumors.com.js
exports.isActive = () => {
    return $.domain === "macrumors.com";
};

exports.setConfig = (config) => {
    config.bodySelectors = [
        "//div[@id='maincontent']/article/div[contains(@class, 'js-content')]",
    ];
};
```
