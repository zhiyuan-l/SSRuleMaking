'use strict';
const fs = require('fs');
const xml2js = require('xml2js');
const dateFormat = require('dateformat');
const default_date_format = "yyyy-mm-dd";
const day=dateFormat(new Date(), default_date_format);
const dir = day;
const rules_dir = `${dir}/rules`;

const aws_ip_json = require('./data/ip-ranges.json');
const aws_ipv4_prefixes = aws_ip_json.prefixes;
const aws_ipv6_prefixes = aws_ip_json.ipv6_prefixes;
const aws_ips = [];
const aws_ips_with_v6 = [];
let aws_ip_data = "";
let aws_ipv6_data = "";
let aws_sstap_rule_content = "#AWS IP Ranges Only,代理AWS,0,0,1,0,0,0,By-zhiyuan\n";
let aws_sstap_rule_file = `${rules_dir}/AWS-IPs.rules`;

const azure_ip_xml_file = fs.readFileSync("./data/PublicIPs_20180827.xml", "utf-8");
const azure_ips = [];
let azure_ip_json = null;
let azure_ip_data = "";
let azure_sstap_rule_content = "#AZURE IP Ranges Only,代理AZURE,0,0,1,0,0,0,By-zhiyuan\n";
let azure_sstap_rule_file = `${rules_dir}/AZURE-IPs.rules`;


let aws_azure_ip_data = "";
let azure_aws_sstap_rule_content = "#AZURE and AWS IP Ranges,代理AZURE和AWS,0,0,1,0,0,0,By-zhiyuan\n";
let azure_aws_sstap_rule_file = `${rules_dir}/AZURE-AWS-IPs.rules`;

// create dir for files
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

if (!fs.existsSync(rules_dir)){
    fs.mkdirSync(rules_dir);
}

// get aws ips
for (var prefix of aws_ipv4_prefixes) {
    aws_ips.push(prefix.ip_prefix);
    aws_ips_with_v6.push(prefix.ip_prefix);
    aws_ip_data += prefix.ip_prefix;
    aws_ip_data += "\n";
}

for (var prefix of aws_ipv6_prefixes) {
    aws_ips_with_v6.push(prefix.ipv6_prefix);
    aws_ipv6_data += prefix.ipv6_prefix;
    aws_ipv6_data += "\n";
}

// get azure ips

var parser = new xml2js.Parser();

parser.parseString(azure_ip_xml_file, function (err, result) {
    azure_ip_json = result;
    const regions = azure_ip_json.AzurePublicIpAddresses.Region;
    for (var region of regions) {
        console.log(region.$.Name);
        for (var ip_range of region.IpRange) {
            azure_ips.push(ip_range.$.Subnet);
            azure_ip_data += ip_range.$.Subnet;
            azure_ip_data += "\n";
        }
    }
    fs.writeFile(`${dir}/azure_ips-${day}.txt`, azure_ip_data, function (err) {
        if (err) {
            return console.log(err);
        }
    });
});

fs.writeFile(`${dir}/aws_ips-${day}.txt`, aws_ip_data + aws_ipv6_data, function (err) {
    if (err) {
        return console.log(err);
    }
});

aws_azure_ip_data = azure_ip_data + aws_ip_data + aws_ipv6_data;
fs.writeFile(`${dir}/azure_aws_ips-${day}.txt`, aws_azure_ip_data, function (err) {
    if (err) {
        return console.log(err);
    }
});

// write to rules files
azure_sstap_rule_content += azure_ip_data;
aws_sstap_rule_content += aws_ip_data + aws_ipv6_data;
azure_aws_sstap_rule_content += aws_azure_ip_data;

fs.writeFile(azure_sstap_rule_file, azure_sstap_rule_content, function (err) {
    if (err) {
        return console.log(err);
    }
});
fs.writeFile(aws_sstap_rule_file, aws_sstap_rule_content, function (err) {
    if (err) {
        return console.log(err);
    }
});
fs.writeFile(azure_aws_sstap_rule_file, azure_aws_sstap_rule_content, function (err) {
    if (err) {
        return console.log(err);
    }
});

console.log("The files has been saved!");