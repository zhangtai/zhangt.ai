---
title: First Time OpenWrt
date: "2022-11-08"
tags:
- network
- firewall
---

I have been using OpnSense for the last 4(?) years, mostly satisfied with it.

Inspired by [HN article](https://kohlschuetter.github.io/blog/posts/2022/10/28/linux-nanopi-r4s/) for fixing the NanoPi R4S issue and upgrading the kernel, I search for this device on Taobao, and found R5S is available. But wait, there is R6S!? Just 2 days after release, even lucky that find the company FriendlyELEC in my city(Guangzhou), ordered and received it. Let's power on.

It installed OpenWrt by default, not the official one but a fork named FriendlyWrt, I can start it and connect it to monitoring and login to it, but all the network ports not working, as advised by the seller, I need to re-install the system. Installed the latest version with docker, powered it on again, networks working fine.

Here are some notes during I setup and learning in the first 3 days.

## DDNS of CloudFlare

- Lookup Hostname: `example.tld`
- IP version: `IPv4`
- DDNS Service: `cloudflare.com-v4`
- Domain: `*.myhome.example.tld`
- Username: `Bearer`
- Password: `seCreTtok3n`

Since I am using wildcard domain names, the [script](https://github.com/openwrt/packages/blob/master/net/ddns-scripts/files/usr/lib/ddns/update_cloudflare_com_v4.sh) can't handle it and caused can't find zone issue, the simple solution is hard-code your `zone_id`` in the file(`/usr/lib/ddns/update_cloudflare_com_v4.sh`)

```shell
# ...
zone_id=abc123def456abc123def456abc123def456
# ...
```

## Reverse Proxy with Nginx

When using OpnSense I was using haproxy, and the setup of service is very cumbersome, need to manually click to create a lot of services and mapping, I am not clever enough to figure out how to manage by config files, because the config files of haproxy is too complicated to me and error-prone when doing it manually.

When researching reverse proxy on OpenWrt, I see people recommended nginx and finally figured out how to set up with config files, the easy to understand, and backup config files. 

1. Install `luci-ssl-nginx`, and **important** `nginx-all-module` otherwise some feature missing will cause you a headache, for me it was realip module which caused the `wss` proxy fails.
1. Create TLS cert and key for your public service and save to e.g. `/etc/certs/myhome.example.tld`, I am using cerbot.
1. We will listen our services at port `10443` since most ISPs blocked port `443`. Create a port forwarding for the port `10443` in `Network -> Firewall -> Port Forwards` for the OpenWrt instance.
1. Add services in `/etc/config/nginx`:
```ruby
 config server 'codeserver'
      list listen '10443 ssl'
      option server_name 'code.myhome.example.tld'
      list include 'conf.d/code-server.loc'
      option ssl_certificate '/etc/certs/myhome.example.tld/cert.pem'
      option ssl_certificate_key '/etc/certs/myhome.example.tld/privkey.pem'
      option access_log 'off; # logd openwrt'
```
1. Create `/etc/nginx/conf.d/code-server.loc`
```nginx
location / {
    proxy_pass http://192.168.2.123:8080/;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### Issues

> Error: [emerg] 4775#0: could not build server_names_hash, you should increase server_names_hash_bucket_size: 32

Add the below config in /etc/nginx/conf.d/custom.conf file, which will be inserted into http section of generated nginx conf file.

```nginx
server_names_hash_bucket_size  64;
```

## Proxy on OpenWrt
There is a lot of enthusiasm in China for using OpenWrt/LEDE, especially the VPN/Proxy features, but I failed to manage to set up passwall on my device, and seems it's not possible to set up a transparent proxy for HTTPS traffic, so I just need to run a hysteria proxy client on the router and open port `3128` so any device can use it by explicitly set the `https_proxy` environment variable.

But setup a service with init.d on OpenWrt is not straight(to me?), so I am going to use the docker service:

```shell
docker run -dt --network=host --name hysteria \
    -v /etc/hysteria/config.json:/etc/hysteria.json \
    tobyxdd/hysteria:v1.2.2 -c /etc/hysteria.json
```

## Adblock

Some lists can't be downloaded in China due to GFW, hence need proxy.

In `Additional Settings`, choose `curl` as Download Utility, input Parameter as `-x localhost:3128 --connect-timeout 20 --silent --show-error --location -o`.

## iperf3 benchmark

1. [Download](https://iperf.fr/iperf-download.php) to the client, ((my) server(OpenWrt) already has it).
1. Start it on server: `iperf3 -s`
1. Run on the client:

```console
$ iperf3 -t 60 -c 192.168.2.1 -i 10
Connecting to host 192.168.2.1, port 5201
[  4] local 192.168.2.21 port 44904 connected to 192.168.2.1 port 5201
[ ID] Interval           Transfer     Bandwidth       Retr  Cwnd
[  4]   0.00-10.00  sec  2.74 GBytes  2.35 Gbits/sec    0   12.2 MBytes       
[  4]  10.00-20.00  sec  2.74 GBytes  2.35 Gbits/sec   33   12.2 MBytes       
[  4]  20.00-30.00  sec  2.74 GBytes  2.35 Gbits/sec    0   12.2 MBytes       
[  4]  30.00-40.00  sec  2.73 GBytes  2.35 Gbits/sec    0   12.3 MBytes       
[  4]  40.00-50.00  sec  2.73 GBytes  2.35 Gbits/sec    0   12.3 MBytes       
[  4]  50.00-60.00  sec  2.73 GBytes  2.35 Gbits/sec    0   12.3 MBytes       
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bandwidth       Retr
[  4]   0.00-60.00  sec  16.4 GBytes  2.35 Gbits/sec   33             sender
[  4]   0.00-60.00  sec  16.4 GBytes  2.35 Gbits/sec                  receiver

iperf Done.
```
