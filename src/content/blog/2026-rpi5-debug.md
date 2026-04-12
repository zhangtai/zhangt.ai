---
title: 树莓派5 UART Debug
description: Raspberry Pi 5 debug
pubDate: 2026-04-12
---

前段时间在开发 ESP32 项目的时候了解了 UART，并且以它为协议创作了很好玩的电脑控制器和信息显示设备，也从此了解了原来这个端口的用途和很广泛的支持，也知道了原来树莓派也很好的支持，甚至在第五代还单独开发了一个 debug 接口，于是开始了树莓派的 UART 调试，前后共买了三个连接器，一个比一个大也一个比一个更好用。第一个最小巧但是只支持GPIO，我没连接成功过，而且我的GPIO端口还要连墨水屏显示器，所以放弃了。第二个也很小，type-c接口很方便，但是只支持115200 baud rate，太慢了。第三个最大而且还要type-c转换器，但是支持树莓派5 debug 口最高的 921600 baud rate。所以我最终的选择是它，除非发现更小巧的设备。

![三个连接器](https://zhangtai.oss-cn-guangzhou.aliyuncs.com/public/img/blog/debug-devices-3.avif)


![树莓派连接](https://zhangtai.oss-cn-guangzhou.aliyuncs.com/public/img/blog/rpi5-debug.avif)
