---
title: Install extension on code-server from the marketplace
date: "2022-02-10"
updated: "2022-02-10"
tags: 
- linux
---

I use code-server daily, but there is [an restriction] to install latest awesome extensions, so I created a script to download and install extensions from the VSCode official marketplace. One issue for using this script is that it will sometime failed to download extension due to Microsoft's requests limit. You can either retry or manual download.

<!--truncate-->

It will:

- Check the list of extensions latest version, and
- Do nothing if you already on the latest
- Try to download if not installed or not latest
- If it failed to download, will print the url for you to manual download

```shell
#!/bin/bash

EXT_NAMES=(
    redhat.vscode-yaml
    PKief.material-icon-theme
    dracula-theme.theme-dracula
)

get_ext_json()
{
    URL=$1
    JSON=$(curl -s "$URL" | grep jiContent | sed 's/<script class="jiContent" defer="defer" type="application\/json">//'|sed 's/<\/script>//')
    echo "$JSON"
}

for EXT_FULL_NAME in "${EXT_NAMES[@]}"
do
    INSTALLED_VERSION=$(code-server --list-extensions --show-versions | rg -o "${EXT_FULL_NAME}@(.*)" -r '$1')
    JSON_RESPONSE=$(get_ext_json "https://marketplace.visualstudio.com/items?itemName=${EXT_FULL_NAME}")
    LATEST_VERSION=$(echo "${JSON_RESPONSE}"|jq -r .Resources.Version)
    if [[ ${INSTALLED_VERSION} == ${LATEST_VERSION} ]]; then
        echo "${EXT_FULL_NAME} already installed with the latest version ${LATEST_VERSION}"
    else
        if [ -z "${INSTALLED_VERSION}" ]; then
            echo "[${EXT_FULL_NAME}] not installed, trying to download and install"
        else
            echo "[${EXT_FULL_NAME}] upgrading from ${INSTALLED_VERSION} to ${LATEST_VERSION}"
        fi
        AUTHOR=$(echo "${JSON_RESPONSE}"|jq -r .Resources.PublisherName)
        EXTNAME=$(echo "${JSON_RESPONSE}"|jq -r .Resources.ExtensionName)
        EXT_URL="https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${AUTHOR}/vsextensions/${EXTNAME}/${LATEST_VERSION}/vspackage"
        EXT_FILENAME="${AUTHOR}.${EXTNAME}-${LATEST_VERSION}.vsix"
        echo "Downloading..."
        curl -sL "$EXT_URL" -o "/tmp/${EXT_FILENAME}.gz"
        if [[ $(file -b "/tmp/${EXT_FILENAME}.gz") == "JSON data" ]]; then
            echo "Failed to download ${EXTNAME}, manual download with: ${EXT_URL}"
        else
            gunzip "/tmp/${EXT_FILENAME}.gz"
            echo "Saved to /tmp/${AUTHOR}.${EXTNAME}-${LATEST_VERSION}.vsix, installing now"
            code-server --install-extension "/tmp/${AUTHOR}.${EXTNAME}-${LATEST_VERSION}.vsix"
            rm -f "/tmp/${AUTHOR}.${EXTNAME}-${LATEST_VERSION}.vsix"
        fi
    fi
done
```
