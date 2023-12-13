---
title: Expose Homelab services through NAT, in China
date: '2022-02-06'
updated: '2022-02-13'
tags: 
- homelab
- network
---

In China, the control is very strict for whom and what you can share on the internet, everything on internet must can be associated with a real national ID and been censored. Which is very annoying to whom have no interest about politics and only want to learn new things on the internet, because it's very slow for accessing services outside of China and vice versa, if you are lucky enough that the service has not been blocked totally 🤫.

<!--truncate-->

There are some interesting limits you may never heard of, so far as I know:

- Individual can register domestic Cloud services, you can get public IP for your VM, but if you use the IP to build a website, it won't be accessible by anyone unless you report your plan and intent for your website firstly to the audit, and sees you can't change the content(too much) after approved.
- Home WAN service don't have a public accessible IP address, there is a chance you can ask you ISP for a dynamic public IP but there are some restrictions as well, you must be living in particular Providence/City and using some ISP, even you got it, port 80 and 443 are blocked.

So, the take away is: if you want a fast NAT you can't use custom domains and maybe required some hacks, if you want to use custom domain, it will be slow. Here are some methods I have tried, due to my own special requirements I need to use some of them together.

## Cloudflare Tunnel

> Cloudflare Tunnel is tunneling software that lets you quickly secure and encrypt application traffic to any type of infrastructure, so you can hide your web server IP addresses, block direct attacks, and get back to delivering great applications.

It's very quick to setup and reliable, speed is very slow.

I have originally setup this service on a dev VM machine, it's working ok as long as the host and VM running fine, but when realized I need to remotely shutdown and start the host(Dell R720 with iDRAC management interface) then I can't access the proxy when the host is down. So I have switched the service to another always on host, a Synology DS216II NAS server. This machine has been running about 5 years no issues and when restart from power outrage of my apartment it will restart with all docker services. Here is my configurations.

1. Open Docker app on DSM web console
1. Search image `cloudflare/cloudflared` and download the latest tag
1. Create a container with it and in Advanced settings:
  - Enable auto-restart
  - Volume Mapping, you need to prepare `config.yaml`, `cert.pem` and `<token>.json`, manual install it once you will know how to generate those files. I have saved those files in `docker/cloudflared` folder in NAS
    - docker/cloudflared/cert.pem:/etc/ssl/certs/ca-certificates.crt
    - docker/cloudflared:/etc/cloudflared
  - Network: **Use the same network as Docker Host**
  - Environment:
    - Command: `tunnel --config /etc/cloudflared/config.yaml run`

## Teleport

Prerequisites

- A domain
- A VM outside China, open port 443

Follow the [teleport linux installation] guide, and install the service on public VM, add a new node from homelab by [daemon setup guide].

```ini
[Unit]
Description=Teleport SSH Service
After=network.target

[Service]
Type=simple
Restart=on-failure
ExecStart=/usr/local/bin/teleport start --roles=node --token=<token> --auth-server=<proxy_domain>:443

[Install]
WantedBy=multi-user.target
```

### Add an application

Server:

```shell
sudo tctl tokens add \
    --type=app \
    --app-name=jenkins \
    --app-uri=http://jenkins.lan
```

Client:

```ini
[Unit]
Description=Teleport Jenkins Service
After=network.target

[Service]
Type=simple
Restart=on-failure
ExecStart=/usr/local/bin/teleport app start \
  --token=<token> \
  --auth-server=<proxy_domain>:443 \
  --name=jenkins \
  --uri=https://jenkins.lan

[Install]
WantedBy=multi-user.target
```

## frp

https://github.com/fatedier/frp

It solves the slow issue for Cloudflare Tunnel, can't use custom domain if the server is inside China.

`/etc/frp/frps.ini`

```ini
[common]
bind_port = 12340
vhost_http_port = 10443
```

`docker run --network host -d -v /etc/frp/frps.ini:/etc/frp/frps.ini --name frps snowdreamtech/frps`

[teleport linux installation]: https://goteleport.com/docs/getting-started/linux-server/
[daemon setup guide]: https://goteleport.com/docs/setup/admin/daemon/
