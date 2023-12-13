---
title: Nix on macOS
date: 2022-12-11
---

Although I have tried to install Nix on Linux before(failed), I never successfully installed it, because the update nixpkgs need "Internet" connection, which is blocked in China. Today I am going to do it again, with my M1 Macbook.

```shell
# Of course you need to setup proxy before this.
export https_proxy=http://localhost:3128
curl -L https://nixos.org/nix/install -o /tmp/nix_install.sh
sh /tmp/nix_install.sh
# The official guide is just 1 line to install: `sh <(curl -L https://nixos.org/nix/install)`.
```

Even if proxy was set it will still be stuck at running `sudo HOME=/var/root NIX_SSL_CERT_FILE=/nix/var/nix/profiles/default/etc/ssl/certs/ca-bundle.crt /nix/store/7n5yamgzg5dpp5vb6ipdqgfh6cf30wmn-nix-2.12.0/bin/nix-channel --update nixpkgs`, because the sudo won't recognize the proxy settings. Cancel the installation with `Ctrl-C`, it's fine we will continue it with `sudo https_proxy=http://127.0.0.1:9080 -i nix-channel --update nixpkgs`.

Next, as the guide says run `nix-shell -p nix-info --run "nix-info -m"`, but it is very slow, again due to proxy. We need to edit the plist file to add environment variable of proxies to it. Edit file `sudo vim /Library/LaunchDaemons/org.nixos.nix-daemon.plist`, in the `EnvironmentVariables` dict add 2 entries for proxies and restart with `sudo launchctl stop org.nixos.nix-daemon && sudo launchctl start org.nixos.nix-daemon`

```xml
    <key>http_proxy</key>
    <string>http://127.0.0.1:9080</string>
    <key>https_proxy</key>
    <string>http://127.0.0.1:9080</string>
```

Now you can run `nix-shell -p nix-info --run "nix-info -m"`, test with `nix-shell -p hello` and `hello`.
