---
title: First Time Fedora
date: "2022-11-16"
tags:
- linux
---

Just read the news that Fedora released 37, with the (almost) latest Linux kernel 6.0.7. That's very brave and new, I must try it!

I heard that you must upgrade your system for at most 9 months, and I think this is not a problem for me, I don't have any severe business running on any server, all my servers are dev-only.

The software packager `dnf` has a very new repo of packages, e.g. for `neovim` I can just run `dnf install neovim` and it will install the latest one to my system. I can't imagine when using Ubuntu.

## packages installed

- zsh
- neovim
- make cmake gcc-c++
- htop
- util-linux-user

After maybe 4 hours of using of the Fedora Desktop, I installed a server image instead to further check the difference from Ubuntu.

## Fedora CoreOS(Dec-2022)

When I was reviewing my cloud services and VM usage found that my AWS EC2 3 years Reserved Instances was about to expired, I didn't use it as much as I expected, it's a t3.small instance and the disk doesn't come with the reserved plan hence I attached 16GB disk to is, the total cost is about $11/month and I mainly used it for my proxy service.

Since I am more comfortable with GCP now, so I will replace it with a GCP VM. The normal compute engine prices are similar since my requirements are very clear now: just a proxy server to serve my normal daytime usage. So I will go with a [SPOT](https://cloud.google.com/compute/docs/instances/spot) VM, which is so cheap and I don't have anything to lose if it suddenly is deleted, and I only need it in the daytime. 

It takes several hours to finalize a script like this, it's mainly because CoreOS only accept ed25519 type ssh key, and you need to know the default username `core`.

``` shell
VM_NAME=hysteria
ZONE=asia-east2-a
SSH_PUBKEY="core:ssh-ed25519 <pub-key>"

gcloud compute instances create $VM_NAME \
  --provisioning-model=SPOT \
  --instance-termination-action=DELETE \
  --service-account sa@myproject.iam.gserviceaccount.com \
  --scopes compute-ro,storage-ro,cloud-platform \
  --image-project fedora-coreos-cloud \
  --image-family fedora-coreos-stable \
  --tags http-server,hysteria  \
  --metadata=ssh-keys="${SSH_PUBKEY}" \
  --machine-type e2-small \
  --zone $ZONE

gcloud dns record-sets update <proxy-domain> \
  --rrdatas=<VM_PUBLIC_IP> \
  --type=A --ttl=120 \
  --zone=myproject

ssh -i ~/.ssh/id_ed25519 core@<proxy-domain>
```

But after login in and trying to install tools with `dnf` or `yum`, just released that both are not installed and that is intended. But it has docker installed! Now I just need the `core` user to use docker by `sudo usermod -aG docker $USER` and I can almost do anything on it.
