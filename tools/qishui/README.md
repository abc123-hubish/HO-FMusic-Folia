# 汽水音乐鸿蒙接入

Web adapter 来自 Folia `v0.7.22` 的 `src/services/onlineMusic/qishui/`，已按本项目旧版 Omni 登录、收藏和电台契约适配。协议依赖固定为 `qishui-music-api@0.2.2`。

入口与边界：

- `src/harmony/qishui.ts`：异步操作桥，接入现有统一账号窗口。
- `entry/src/main/ets/services/qishui/QishuiService.ets`：限制请求域名、方法、超时与大小。
- `QishuiCrypto.ets`：原生 P-256 密钥、签名与随机数。
- `QishuiSession.ets`：使用 `MusicSession` 分块写入 Asset Store，Preferences 只保存设备 ID。
- `useNativeProviderLibrary.ts`：复用波点的账号生命周期，启动先验证原生会话，再恢复匹配账号的公开歌单快照。

网页只接收二维码、公开账号资料、歌曲和歌单。原始会话、票据、私钥不进入网页或日志。登录采用抖音扫码；同机扫码体验仍需真机验收。当前沿用上游的标准音质未加密音源范围，部分歌曲可能仅试听，不增加音频解密。

构建和检查（项目根目录）：

```powershell
node tools/build-web.mjs
node --test tools/verify-qishui-native.mjs tools/verify-qishui-session.mjs tools/verify-bodian-native.mjs
node tools/verify-qishui-browser.mjs
.\tools\build-hap.ps1 -Clean
```

`verify-qishui-native` 执行实际生成的 ArkJS 协议包，使用合成网络响应和 Node 加密实现替代原生服务；浏览器检查使用打包后的页面、真实账号 controller 和相同协议包。它们不代表真机或真实账号授权成功。

动态电台模式目录现已对齐 Android 分支：通过 Omni 加载汽水场景，按平台保存 FM 选择，场景卡直接播放，模式面板按汽水目录显示。没有专辑接口、新建歌单和收藏歌单能力，与该分支的汽水能力声明一致。

Android 对照固定到 `whycfawa/folia-android` 的 `android-0.7.22` 分支，提交 `64fddcc1a406c5628260b5c781469439d3891e1d`。其 `src/nativeBridge/api/qishui.js` 使用相同的 0.2.2 协议，以 WebCrypto 替代 Node 加密，通过原生 HTTP 取数，账号存在 localStorage。本项目使用原生 CryptoKit、RCP 与加密分块存储，网页继续通过 Omni。

同步该分支的“我喜欢”歌单 `type:1` 修复：`compatibility.mjs` 在构建时对固定包做精确匹配覆盖，同时区分喜欢和普通歌单的分页游标，并在会话代次变化后清理推荐流和分页缓存。包升级或代码漂移会中止构建，避免静默漏修。完整 CDN 范围也用于重开后的缓存音源代理。不完整的喜欢列表只补充已知喜欢，不删除尚未读到的歌曲。

汽水原生歌词的来源显示为汽水音乐；直接播放及预取共用原生歌词优先规则，有可用歌词时不自动跨平台替换，缺失时才按已有设置匹配其他来源。用户已选的导入文件和在线匹配仍保留；旧匹配可在歌词页使用重置恢复原生来源。音源使用与 Android adapter 一致的标准档，试听起点仍交给公共时间轴处理。

浏览器检查执行真实生产播放器和生成的协议包，以可解码的合成 WAV 验证搜索、实际音频时钟、歌词、暂停/继续、拖动、下一首、账号重开恢复和退出。真实服务端授权、账号曲库权限和真机后台播放仍需实际账号验收。
