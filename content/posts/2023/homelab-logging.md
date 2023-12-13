---
title: Homelab Logging
date: 2023-01-09
tags: 
- homelab
- logging
---

Recently I wanted to capture some frequently used apps logs and do some basic analysis on those, some apps run in docker and some are going utilities, all don't have log file management functions. I have tested some logging products and finally, find the one that suits me.

## Splunk
The first that comes to my mind is Splunk, it famous, has many advanced features and free to use for self-hosted, and is [supported by](https://docs.docker.com/config/containers/logging/splunk/) docker](https://docs.docker.com/config/containers/logging/splunk/) natively. I started to run it as a docker service on my QNAP NAS server, it's very easy to follow the official guide, just one thing to mention: don't forget to disable **Enable SSL** option in the **HTTP Event Collector** Global Settings page if you are not serving with HTTPS, it takes me some time to figure out why my logs not sending to it.

After setup, just run your docker command as the official example from docker(link in the above paragraph), for me I added 2 additional opts:

- `splunk-sourcetype=mycustomtype`: later in Splunk you can create a SourceType to extract useful fields from your log
- `splunk-format=raw`: I can't extract from the default format(JSON), hence need it to be raw

The Splunk is working very well, but only... it's too heavy. Since my logs are only less than 10MB a day(even less), a cloud-based Splunk instance should be better because I won't exceed most of the free tier usage. But they only offer a 14-day free trial, what happens after the trial? How much it will cost if I want to continue to use? You need to contact their support to know.

## syslog-ng

So I continue to search for a lightweight alternative. Docker is good at supporting logging drivers, there are [so many](https://docs.docker.com/config/containers/logging/configure/) of them! After doing a little research, decided to use Syslog since it is very widely supported by a lot of applications. Let's run!

```shell
docker run -d \
    --name=syslog-ng \
    -e PUID=1000 \
    -e PGID=1000 \
    -e TZ=Asia/Shanghai \
    -p 5514:5514/udp \
    -p 6601:6601/tcp \
    -p 6514:6514/tcp \
    -v /share/docker-volumes/syslog/config:/config \
    -v /share/docker-volumes/syslog/log:/var/log \
    --restart unless-stopped \
    linuxserver/syslog-ng:3.38.1
```

According to the image's official guide, I started syslog-ng like above, but the run has an issue, when it first starts it won't create the message files, you can see the complaints from `/var/config/log/current`, so need to login to the container and run below command(once) to fix it.

```shell
cd /var/log
touch message messages-kv.log
chown 1000 message messages-kv.log
```

Run a test: `logger -n 192.168.2.2 -d -P 5514 -t logger "Hello syslog"`, or test with docker:

```shell
docker run --rm \
    --log-driver syslog \
    --log-opt syslog-address=udp://192.168.2.2:5514 \
    alpine:edge echo hello world
```

## Send to cloud

So many choices, I also tried some but finally take Grafana Cloud, because I am family with Prometheus(yes, I stored my Homelab server's metrics on it as well at the end) and it's very generous for free use, 50GB logs storage is beyond enough for me.

Setup is easy, I am using syslog -> promtail -> Grafana Cloud way.

Logs(and metrics) on Cloud now!
