---
title: Upgrade Ubuntu kernel
date: "2022-03-22"
updated: "2022-03-22"
tags: 
- linux
---

Recently I have added some new devices to my homelab, phone size machine with Intel N5105 CPU, 16GB RAM and 256GB SSD storage, wanted to build a kubernetes cluster use 4 such machines. It also has built-in 2.5G NIC, WIFI6 and Bluetooth version 5.2, but the current Ubuntu LTS(20.04) has linux kernel 5.4 which don't support the NIC driver, need to upgrade kernel to solve this.

<!--truncate-->

https://kernel.ubuntu.com/~kernel-ppa/mainline/v5.17/

```
Test amd64/build succeeded (rc=0, on=amd64, time=0:11:17, log=amd64/log)
  amd64/linux-headers-5.17.0-051700-generic_5.17.0-051700.202203202130_amd64.deb
  amd64/linux-headers-5.17.0-051700_5.17.0-051700.202203202130_all.deb
  amd64/linux-image-unsigned-5.17.0-051700-generic_5.17.0-051700.202203202130_amd64.deb
  amd64/linux-modules-5.17.0-051700-generic_5.17.0-051700.202203202130_amd64.deb
```

Download all the deb files and save to a USB drive(FAT format), insert to the device and mount,

```shell
lsblk # to check the USB label

sudo mkdir -p /mnt/usb
sudo mount /dev/sdb2 /mnt/usb

# Install all the kernel packages
cd /mnt/usb
sudo dpkg -i *deb
```

Assign static IP address to file `/etc/netplan/00-installer-config.yaml`

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp1s0:
      dhcp4: no
      addresses: [192.168.3.12/24]
      routes:
        - to: default
          via: 192.168.3.1
      nameservers:
        addresses: [114.114.114.114, 114.114.115.115]
```

After those change, do a reboot. And upgrade all the package with

```shell
sudo apt update
sudo apt --fix-broken install -y
sudo apt upgrade -y
sudo apt autoremove
```
