#!/bin/bash
dir="apnic"

if [[ ! -e $dir ]]; then
    mkdir $dir
fi

curl -vs http://ftp.apnic.net/apnic/stats/apnic/delegated-apnic-latest 2>/dev/null | awk -F '|' '/CN/&&/ipv4/ {print $4 "/" 32-log($5)/log(2)}'|cat > $dir/apnic_cn_ip.txt

# sudo -u nobody zsh

curl -vs http://ftp.apnic.net/apnic/stats/apnic/delegated-apnic-latest 2>/dev/null | awk -F '|' '/CN/&&/ipv6/ {print $4 "/" $5}'|cat > $dir/apnic_cn_ipv6.txt 