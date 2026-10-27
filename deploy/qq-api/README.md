# FMusic QQ 音乐服务

独立部署官方 Folia 文档使用的 `@yakult-green-tea/qq-music-api` 3.1.4，不依赖鸿蒙应用或 Electron 进程。

需要 Node.js 20 以上。安装并启动：

```sh
npm ci --omit=dev --ignore-scripts --no-audit --no-fund
npm start
```

默认监听 3200，QQ 扫码和微信扫码由上游 API 提供。`PORT` 可修改端口。首次启动会在 `.auth-state` 中生成独立密钥，以后复用；账号登录态保存为加密文件。服务目录和状态目录都应只允许部署账号访问。备份、迁移时保留整个状态目录；不要把该目录放进安装包或公开分享。

`QQ_STATE_DIR` 可指定独立状态目录，适合 systemd 服务。也兼容上游的 `QQ_AUTH_STATE_PATH`、`QQ_AUTH_SESSION_PATH` 和 `QQ_SESSION_SECRET` 环境变量。密钥不输出到日志。

启动后检查 `http://127.0.0.1:3200/login/status`，未登录时应返回 `{"code":200,"data":{}}`。此版本的常驻 Node 路由没有 `/login/channels`，该地址返回 404；Folia 已兼容这一情况，会显示 QQ 和微信两种扫码方式。匿名曲库可用 `/getSongInfo/0039MnYb0qxYhV` 检查。

在 FMusic 中打开“设置 → 集成 → 鸿蒙服务连接 → QQ 音乐 API”，填入手机能访问的完整服务地址，例如 `https://qq-api.example.com`。服务根目录直接启动时，地址末尾不加 `/api/qq`。保存后切换到 QQ 音乐，点击连接账号扫码。远程长期部署应通过进程管理器设置开机启动，并配置手机可访问的网络入口。

来源：[Folia QQ 音乐部署指南](https://github.com/chthollyphile/folia-major/blob/main/docs/qq-music-deployment.md)。
