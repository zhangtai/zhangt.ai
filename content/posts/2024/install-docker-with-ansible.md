---
title: Install docker with ansible
date: 2024-01-04
---

Most importantly, don't use `ansible.builtin.apt_key` to import apt key of docker because it is deprecated.

```yaml
- name: Install apt packages
  ansible.builtin.apt:
    update_cache: yes
    cache_valid_time: 7200
    pkg:
      - curl
      - ca-certificates
      - gnupg
      - software-properties-common
      - python3-pip
      - python3-debian

- name: Add Docker repo using key from URL.
  ansible.builtin.deb822_repository:
    name: docker
    types: deb
    uris: "https://download.docker.com/linux/debian"
    architectures: arm64
    suites: bookworm
    components: stable
    signed_by: https://download.docker.com/linux/debian/gpg
    state: present
    enabled: true
```
