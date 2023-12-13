---
title: Learning systemd
date: "2022-01-31"
updated: "2022-02-19"
tags: 
- linux
---

As I occasionally write services for daemon processes, every time when I need I just google for it, this works most of the time. But sometimes it repeated and I haven't keep a note of those one off(I wrongly thought) services. Recently read the blog [systemd by examples] which encourage me to write down my services and share here, most usefully hope I can copy them once needed, from here.

<!--truncate-->

- Check status or info of a unit don't need sudo
- A name default indicate to service, e.g. `systemctl status docker` for docker, `systemctl status docker.socket` for docker socket

## Notes from the book

> In systemd, a target is a unit that groups together other systemd units for a particular purpose. The units that a target can group together include services, paths, mount points, sockets, and even other targets.

## Examples

### Jenkins agent for SharedCloud

```ini
# TBC
```

### v2ray

Copied from archlinux wiki, [V2Ray service]

```ini
[Unit]
Description=V2Ray Service
After=network.target nss-lookup.target

[Service]
User=nobody
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_BIND_SERVICE
ExecStart=/usr/bin/v2ray -confdir /etc/v2ray/

[Install]
WantedBy=multi-user.target
```

### iptables save and restore

Copied from [iptables-restore.service] of awslabs/amazon-eks-ami, modified with adding `ExecStartPre`, my iptables file have some custom value need to be replaced for the current running machine, i.e. IP address.

```ini
[Unit]
Description=Restore iptables
# iptables-restore must start after docker because docker will
# reconfigure iptables to drop forwarded packets.
After=docker.service network.target nss-lookup.target

[Service]
Type=oneshot
ExecStartPre=/bin/bash /etc/sysconfig/replace_ip_in_iptables.sh
ExecStart=/bin/bash -c "/sbin/iptables-restore < /etc/sysconfig/iptables"
ExecStartPost=/usr/bin/mount /data

[Install]
WantedBy=multi-user.target
```

```shell
#!/bin/bash
/usr/bin/sed -i "s/MY_IP/$(hostname -I|cut -d' ' -f2)/g" /etc/sysconfig/iptables
```

### code-server

This file come from the builtin [code-server@.service], a good example for service to start on behalf of a particular user.

```ini
[Unit]
Description=code-server
After=network.target

[Service]
Type=exec
ExecStart=/usr/bin/code-server
Restart=always
User=%i

[Install]
WantedBy=default.target
```

## timer

> Not having the [Install] section makes this a static type of service that you can't enable.

```shell
systemctl list-unit-files -t timer
systemctl list-timers
```

## bootup

> D-Bus, which is short for Desktop Bus, is a messaging protocol that allows applications to communicate with each other. It also allows the system to launch daemons and applications on demand, whenever they're needed.

```shell
man bootup
systemctl list-dependencies local-fs.target
strings /lib/systemd/systemd | grep -A 100 'local-fs.target'
systemd-analyze # same as systemd-analyze time
systemd-analyze blame # See services run time
systemd-analyze critical-chain # target to start during bootup

ls -ltr /run/systemd/generator/ # systemd dynamic generate mounts from /etc/fstab to here
```

## systemctl cheatsheet

```shell
man systemd.directives
man systemd.unit

systemctl --state=help
systemctl list-units -t service
systemctl list-unit-files
systemctl list-unit-files -t
systemctl is-enabled docker
systemctl is-active docker
systemctl show
systemctl show --property=Virtualization

systemctl list-dependencies
systemctl list-dependencies --after network.target
systemd-analyze dot graphical.target

systemctl get-default
ls -ltr /lib/systemd/system/default.target

# This will shut down the graphics server and bring you back to a text-mode login prompt
sudo systemctl isolate multi-user
sudo systemctl isolate graphical

# cgroups
systemd-cgls
systemctl status user.slice
ls -l /sys/fs/cgroup

sudo apt install cgroup-tools
sudo yum install libcgroup-tools

lssubsys # view active resource controllers


# Limit for user
sudo systemctl set-property user-1001.slice CPUQuota=200%
# --runtime, reboot the restriction is gone
sudo systemctl set-property --runtime user-1001.slice MemoryMax=1G

sudo systemctl set-property user-1001.slice BlockIOReadBandwidth="/dev/sda 1M"
sudo systemctl set-property apache2.service BlockIOReadBandwidth="/dev/sda 1M"

# Created in /etc/systemd/system.control

# Only ff this is first-time for user-1001, need to reload.
sudo systemctl daemon-reload

cat /sys/fs/cgroup/cpu/user.slice/user-1001.slice/cpu.cfs_quota_us
# 200000

# Limit for service
## with systemctl cmd
sudo systemctl set-property cputest.service CPUQuota=90%

## with service file

#      [Service]
#      ExecStart=/usr/bin/stress-ng -c 4
#      CPUQuota=90%

```

> The ulimit command allows us to dynamically control resource usage for a shell session and for any processes that get started by the shell session.
> you can either set or lower limits as a normal user, but you need sudo privileges to increase any limits

```shell
ulimit -a
```

## References

- [systemd by examples]
- [systemd(debian)](https://wiki.debian.org/systemd)
- [systemctl(debian)](https://manpages.debian.org/bullseye-backports/systemd/systemctl.1.en.html)
- [systemd(rhel)](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/system_administrators_guide/chap-managing_services_with_systemd)
- [Use systemd timers instead of cronjobs](https://opensource.com/article/20/7/systemd-timers)
- [Why I Prefer systemd Timers Over Cron](https://trstringer.com/systemd-timer-vs-cronjob/)

[systemd by examples]: https://systemd-by-example.com/
[V2Ray service]: https://wiki.archlinux.org/title/V2Ray
[iptables-restore.service]: https://github.com/awslabs/amazon-eks-ami/blob/master/files/iptables-restore.service
[code-server@.service]: https://github.com/coder/code-server/blob/main/ci/build/code-server@.service
