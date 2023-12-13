---
title: Expose Homelab services through HAPROXY with OPNSENSE
date: '2022-03-25'
updated: '2022-03-25'
tags: 
- homelab
- network
---

> UPDATE(2023-01-09): I no longer use OpnSense anymore, instead I am using OpenWrt now.

In this post I will show you how to expose the homelab services through HAPROXY as a reversed proxy, but keep in mind this is dangerous because anyone knows the domains you set up will be able to connect your homelab directly, and if you not securely setup your firewall they can hack you and your families devices.

<!--truncate-->

## Prerequisites

- A domain, the provider supports wildcard domains(I use cloudflare)
- Wildcard TLS cert and privkey
- Public IP address provided by your ISP
- OpnSense with os-ddclient and os-haproxy plugins installed

## Setups

### Dynamic DNS

As a home internet service, ISP will only provide dynamic IP(At least in China), so you need to setup ddns service to update the IP address when changing.

Go to `Services / Dynamic DNS / Settings` and create one with the inputs:

- Service: `Cloudflare`
- Username: `<email>`
- Password: `<Cloudflare Global Token>`
- zone: `<e.g. example.com>`
- Hostnames: `<*.example.com>`
- Check ip method: `Interface`
- Force SSL: `true`
- Interface to monitor: `WAN`

### Wildcard TLS certificate and Private key

I use ~~certbot~~ **acme.sh** to create and rotate my certs, ~~after the certs created and upload~~ save to the OpnSense system in `System / Trust / Certificates`

### Port Forward

You will need to select a primary port for all the services(e.g. 1234), this will be listened to by a frontend service. For a simple homelab with not too much and complex services, one public service can serve all the services. In this post, I will create only one.

You may need to create an alias of the custom port in `Firewall / Aliases`, if you are not using a standard HTTPS port for exposing because some ISP not allowing the opening 80 or 443 ports.

Go to `Firewall / NAT / Port Forward` and create a new rule as:

- Interface: `WAN`
- Protocol: `TCP`
- Destination: `WAN net`
- Destination port range: `<Port_Alias>`
- Redirect target IP: `<OPNSENSE_LAN_IP_Alias>`
- Redirect target port: `<Port_Alias>`
- NAT reflection: `Enable`

You will also need to set `Firewall / Settings / `Advanced` on the below field to enable NAT reflection:

- Reflection for port forwards: `true`
- Automatic outbound NAT for Reflection: `true`

### HAProxy

The sequence for setup each service in HAProxy is this chart, each service has a detailed explanation on the configuration page.

```mermaid
%%{
  init: {
    'theme': 'base',
    'themeVariables': {
      'primaryColor': '#ffd479',
      'primaryTextColor': '#277BC0',
      'primaryBorderColor': '#277BC0',
      'lineColor': '#3B9AE1',
      'secondaryColor': '#006100',
      'tertiaryColor': '#fff'
    }
  }
}%%
graph LR
    rs1[Real Server 1] --> bp1[Backend Pools 1]
    bp1 --> con1[Conditions 1]
    con1 --> ru1[Rules 1]
    rs2[Real Server 2] --> bp2[Backend Pools 2]
    bp2 --> con2[Conditions 2]
    con2 --> ru2[Rules 2]
    rsn[Real Server n] --> bpn[Backend Pools n]
    bpn --> conn[Conditions n]
    conn --> run[Rules n]
    ru1 --> ps[Public Services]
    ru2 --> ps
    run --> ps
```

I will show an example to expose code-server service with port `8080` on a local machine with ip `192.168.1.2`

#### Real Server

- Name or Prefix: `CODE-SERVER`
- FQDN or IP: `192.168.1.2`
- Port: `8080`
- SSL: According to your service

#### Backend Pool

- Name: `CODE-SERVER`
- Servers: `CODE-SERVER`

#### Condition

- Name: `CODE-SERVER`
- Condition type: `<Host starts with>` (Select depends on your real needs)
- Host Prefix: `code-server.example.com`

#### Rule

- Name: `CODE-SERVER`
- Select conditions: `CODE-SERVER`
- Use backend pool: `CODE-SERVER`

#### Public Service

As said, you will only create one public service

- Name: `<e.g. homelab>`
- Listen Addresses: `0.0.0.0:<Your_Port>`
- Default Backend Pool: `none`
- Enable SSL offloading: true
- Certificates: `<The one created earlier>`
- Default certificate: `<Same as Certificates>`
- Enable HTTP/2: true
- Rules: `<Select in the dropdown>`
