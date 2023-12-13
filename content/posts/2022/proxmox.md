---
title: Proxmox
date: "2022-02-18"
updated: "2022-02-26"
tags: 
- vm
- iac
- container
---

<!--truncate-->

## system settings

### Update repositories

https://pve.proxmox.com/wiki/Package_Repositories#sysadmin_no_subscription_repo

### certificate

Create TLS key and privkey, to replace each and restart with `pveproxy restart`,

- /etc/pve/nodes/pve/pve-ssl.pem
- /etc/pve/nodes/pve/pve-ssl.key

## VM

I use [Ubuntu Cloud Image] for VM, which is small, e.g the latest ubuntu 20.04.3 server size as now is 1.26GB, however the cloud image is only 560MB, and it supports cloudinit which is very useful as a template image. I created a repo [proxmox-ansible] to create template VM base on this image on proxmox, I also use this repo to maintain my proxmox server.

### Resize VM disk

[Resize_disks]

```shell
qm resize <vmid> virtio0 +100G

# Login to <vmid>
sudo -i
dmesg | grep vda
fdisk -l /dev/vda | grep ^/dev
parted /dev/vda
    print
    F
    resizepart 1 100%
    quit
fdisk -l /dev/vda | grep ^/dev
reboot
```

## LXC

Most of the time you don't need a VM to run an application or database, and actually it's much easier for CICD works with LXC, it's lightweight and fast. But the default images provided by Proxmox is mostly outdated and not update regularly, there are alternatives if the defaults not satisfies you.

### Turnkey

There are some many ready to use template on [Turnkey], but personally I never use those, because usually when I want to use or test tools I build on my own.

### Official LXC and LXD images

LXC official built lots of popular linux distros, and update very frequently, especially if you use Ubuntu, it's the same company supports both. But, since I haven't installed lxc myself, and can download the template by the [official script], so I haven't use those images(directly) as well(Actually I used it, in the next section). Good news is that by analyzing the script, you can easily figure out the [index file] for downloading the images. e.g. [latest ubuntu 20.04 image]

### distrobuilder

> `distrobuilder` is an image building tool for LXC and LXD.
> It's used to build all our official images available on our image server.

The [distrobuilder] is created and used by LXC to build container images. With this tool you can build your own image without depends on anyone! The [GitHub page] has very detailed guide for how to use so I won't duplicate it here.

```shell
cd builder
# The ubuntu.yaml file copied from the distrobuilder repo
# https://github.com/lxc/distrobuilder/blob/master/doc/examples/ubuntu.yaml
sudo $HOME/go/bin/distrobuilder build-lxc ubuntu.yaml ~/ContainerImages/ubuntu
```

Rename the generated `rootfs.tar.xz` file and upload to pve path `/var/lib/vz/template/cache`

```shell
scp ~/ContainerImages/ubuntu/rootfs.tar.xz pve:/var/lib/vz/template/cache/ubuntu-20211230-2.tar.xz

host_name=code-server
vmid=1001
template=ubuntu-20211230-2.tar.xz
cpu=4
memory=4096
root_disk_size=20
ip_last=11

pct create "${vmid}" "local:vztmpl/${template}" \
  --cpulimit "${cpu}" \
  --memory "${memory}" \
  --storage local-lvm \
  --rootfs "local-lvm:${root_disk_size}" \
  --ostype ubuntu \
  --ssh-public-keys /root/pubKeys/mbp.key \
  --start 1 \
  --hostname "${host_name}" \
  --unprivileged 1 \
  --net0 "name=eth0,bridge=vmbr0,firewall=1,gw=192.168.3.1,ip=192.168.3.${ip_last}/24,type=veth"
```

#### Build with Google Cloud Build

https://cloud.google.com/free/docs/gcp-free-tier/#cloud-build

TBC

[Ubuntu Cloud Image]: https://cloud-images.ubuntu.com/
[proxmox-ansible]: https://github.com/zhangtai/proxmox-ansible
[Turnkey]: https://www.turnkeylinux.org/
[official script]: https://github.com/lxc/lxc/blob/master/templates/lxc-download.in
[index file]: https://uk.lxd.images.canonical.com/meta/1.0/index-user
[distrobuilder]: https://linuxcontainers.org/distrobuilder/
[GitHub page]: https://github.com/lxc/distrobuilder
[latest ubuntu 20.04 image]: https://uk.lxd.images.canonical.com/images/ubuntu/bionic/amd64/default/
[Resize_disks]: https://pve.proxmox.com/wiki/Resize_disks
