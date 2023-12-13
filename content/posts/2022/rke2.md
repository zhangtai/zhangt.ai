---
author: "ZHANG Tai"
title: Using RKE2
date: "2022-01-30"
updated: "2022-03-22"
tags: 
  - kubernetes
---

I used to setup my homelab kubernetes cluster with [Rancher] and [rke], both are products of Rancher. Honestly I haven't spent too much time on both. Until recently I want to setup kubernetes cluster, again. So I goto Rancher's website found that they have another product: RKE2.

It's easy to setup just follow the [RKE2 official installation guide]. Here is summary of my installtion manually, I opened a tmux session with 4 panes, one for server, 3 for agents. Each has 4 cores, 8GB RAM 160GB storage, they are VMs running on a host of ESXi instance.

## Server

```shell
# Add proxy only if you have such dependency
curl -sfL https://get.rke2.io | sudo https_proxy=http://192.168.3.1:8889 INSTALL_RKE2_CHANNEL=latest sh -

sudo bash -c 'cat > /etc/default/rke2-server <<EOF
CONTAINERD_HTTP_PROXY=http://192.168.3.1:8889
CONTAINERD_HTTPS_PROXY=http://192.168.3.1:8889
CONTAINERD_NO_PROXY=127.0.0.0/8,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,.svc,.cluster.local
EOF'

# Or
sudo bash -c 'cat > /usr/local/lib/systemd/system/rke2-server.env <<EOF
HOME=/root
HTTP_PROXY=http://192.168.3.1:8889
HTTPS_PROXY=http://192.168.3.1:8889
NO_PROXY=127.0.0.0/8,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,.svc,.cluster.local
EOF'

sudo systemctl enable rke2-server.service

sudo systemctl start rke2-server.service
# sudo journalctl -u rke2-server -f
sudo cat /var/lib/rancher/rke2/server/node-token

# save /etc/rancher/rke2/rke2.yaml as token to communicate with cluster api
```

### On Proxmox

Although it's not good to install on Proxmox instead of VM inside it, for POC purpose I tried to installed it on Proxmox. Below line is required to add to `/etc/network/interfaces`, under `auto vmbr0` section.

Restart network with` /etc/init.d/networking restart` or with `systemd restart networking`.

```
up ip route add default via 192.168.3.1 dev vmbr0
```

### Remote connect via frp

The default connection string is generated for LAN connection(of course), but when connecting from remote from home, you need to expose the API server https port, for example I am using frp.

`/etc/rancher/rke2/config.yaml`

```yaml
tls-san:
  - "<frp-server-id>"
```

`frpc.ini`

```ini
[kubernetes-api]
type = tcp
local_ip = 192.168.1.3
local_port = 6443
remote_port = 6443
```

`rke2.yaml`

```yaml
# ...
    server: https://120.24.177.213:16443
# ...
```

## Agent

```shell
sudo apt update && sudo apt install -y nfs-common
curl -sfL https://get.rke2.io | sudo https_proxy=http://192.168.3.1:8889 INSTALL_RKE2_TYPE="agent" INSTALL_RKE2_CHANNEL=latest sh -
sudo systemctl enable rke2-agent.service
sudo mkdir -p /etc/rancher/rke2/

sudo bash -c 'cat > /etc/default/rke2-agent <<EOF
CONTAINERD_HTTP_PROXY=http://192.168.3.1:8889
CONTAINERD_HTTPS_PROXY=http://192.168.3.1:8889
CONTAINERD_NO_PROXY=127.0.0.0/8,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,.svc,.cluster.local
EOF'

sudo bash -c 'cat > /etc/rancher/rke2/config.yaml <<EOF
server: https://192.168.3.10:9345
token: <token from server node>
EOF'

sudo systemctl start rke2-agent.service
```

## StorageClass: NFS

https://github.com/kubernetes-sigs/nfs-subdir-external-provisioner

```shell
helm repo add nfs-subdir-external-provisioner https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/
helm install nfs-subdir-external-provisioner nfs-subdir-external-provisioner/nfs-subdir-external-provisioner \
    --set nfs.server=192.168.3.2 \
    --set nfs.path=/k8s-pv
```

## StorageClass: Longhorn

- https://longhorn.io/docs/1.2.3/deploy/install/

Just install according to the official guide, add ingress hostname if you want to access the dashboard by domain.

```shell
helm repo add longhorn https://charts.longhorn.io
helm repo update
helm install longhorn longhorn/longhorn \
  --namespace longhorn-system \
  --create-namespace
```

- https://longhorn.io/docs/1.2.3/deploy/accessing-the-ui/longhorn-ingress/

```yaml
spec:
  rules:
    - host: longhorn.lan
      http:
        paths:
          # ...
```

Installation

```shell
USER=<USERNAME_HERE>
PASSWORD=<PASSWORD_HERE>
echo "${USER}:$(openssl passwd -stdin -apr1 <<< ${PASSWORD})" >> auth

kubectl -n longhorn-system apply -f longhorn-ingress.yml
```

## Install Jenkins

```shell
helm install jenkins jenkins/jenkins \
  --set persistence.storageClassName="longhorn" \
  --set persistence.size="16Gi" \
  --set controller.ingress.enabled=true \
  --set controller.ingress.hostName="jenkins.lan" \
  --namespace jenkins \
  --create-namespace
```

[rancher]: https://rancher.com
[rke]: https://rancher.com/rke
[RKE2 official installation guide]: https://docs.rke2.io/install/quickstart/
