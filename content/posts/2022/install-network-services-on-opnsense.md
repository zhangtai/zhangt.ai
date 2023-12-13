---
title: Install network services on OpnSense
date: '2022-02-27'
updated: '2022-02-27'
tags:
- homelab
- network
---

[frp] is my choice of homelab NAT service because [others] fails me, and [v2ray] is for egress proxy. Both are very critical network services to me and I want them to run all the time, together with my router OpnSense. But OpnSense is based on FreeBSD which is not using systemd as service manager, which is new to me so I spent some time and managed to setup v2ray service, frp will be the next. This post is about how to set them up. When researching, I learnt from below articles.

<!--truncate-->

- [rc-scripting](https://docs.freebsd.org/en/articles/rc-scripting/)
- [freebsd-service-config](https://jacquesheunis.com/post/freebsd-service-config/)

## v2ray

> OpnSense official also provided v2ray package, but I can't get it work though...

The final service file(`/usr/local/etc/rc.d/v2ray`) is here, it is enabled by `rcvar=v2ray_enable`(will auto start when booting).

```shell
#!/bin/sh
#
# $FreeBSD$
#

# PROVIDE: v2ray
# REQUIRE: LOGIN FILESYSTEMS
# BEFORE: securelevel
# KEYWORD: shutdown

. /etc/rc.subr

name=v2ray
rcvar=v2ray_enable

load_rc_config $name

procname="/usr/local/etc/${name}/${name}"
pidfile="/var/run/${name}.pid"
command=/usr/sbin/daemon
command_args="-p ${pidfile} ${procname} -c /usr/local/etc/${name}/config.json"

run_rc_command "$1"
```

## frp(c)

`/usr/local/etc/rc.d/frpc`, need to set `frpc_enable="YES"` in /etc/rc.conf to make it running automatically, but this is not required to set for v2ray, I don't understand.

```shell
#!/bin/sh
#
# $FreeBSD$
#

# PROVIDE: frpc
# REQUIRE: LOGIN FILESYSTEMS
# BEFORE: securelevel
# KEYWORD: shutdown

. /etc/rc.subr

name=frpc
rcvar=frpc_enable

load_rc_config $name

procname="/usr/local/bin/${name}"
pidfile="/var/run/${name}.pid"
command=/usr/sbin/daemon
command_args="-p ${pidfile} ${procname} -c /usr/local/etc/frpc.ini"

run_rc_command "$1"
```

[frp]: https://github.com/fatedier/frp
[others]: 2022-02-06-homelab-nat-in-china.md
[v2ray]: https://github.com/v2fly/v2ray-core
