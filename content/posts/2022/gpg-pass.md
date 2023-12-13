---
title: GPG and pass
date: "2022-02-06"
updated: "2022-02-06"
tags: 
- security
---

- [gpg](https://gnupg.org/)
- [Generating a new GPG key](https://docs.github.com/en/authentication/managing-commit-signature-verification/generating-a-new-gpg-key)
- [pass](https://www.passwordstore.org/)

```shell
gpg --full-generate-key
gpg --list-secret-keys
gpg --armor --export <key_id> # Export public key
gpg --armor --export-secret-keys <key_id> # Export private key

pass init <key_id>
pass git init
```
