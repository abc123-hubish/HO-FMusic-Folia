# Folia HarmonyOS

应用启动后直接进入原项目的 Web 音乐资料库。搜索、登录、音乐库、播放页、歌词动画、主题和设置均由原项目的 React 页面提供；ArkTS 仅承载 ArkWeb 与文件、下载、系统媒体会话等能力，没有额外的原生首页或导航控件。

上游：<https://github.com/chthollyphile/folia-major>，版本 0.7.17，提交 d79fa951dfa631fa9b4b7ebb0b4f58bd3e2c1fa8。源代码保存在 `upstream/folia-major`，许可证为 AGPL-3.0。

## 版本管理与首次配置

项目统一由根目录 Git 仓库管理，`upstream/folia-major` 是包含当前鸿蒙适配改动的实际源码目录，不是子模块或外部目录链接。原外部源码仓库保留，后续本项目的修改在此目录内进行。Git 跟踪鸿蒙源码、Web 源码、构建脚本、依赖锁文件和文档；依赖、构建产物、`verification` 验证输出、本机 SDK 路径和签名材料由 `.gitignore` 排除。

新克隆的工作区先复制无签名凭据的配置模板：

```powershell
Copy-Item ./build-profile.example.json5 ./build-profile.json5
```

使用 DevEco Studio 配置本机 SDK 与签名。模板保留 `default` 和 `verification` product，但不包含签名配置；需要签名时，在本地 `build-profile.json5` 中添加签名配置并关联 product。当前机器已有的 `build-profile.json5` 和 `local.properties` 保留在本地，不进入提交。

在 DevEco 终端中使用 Node 24 和 ohpm 安装锁定依赖，再按下方构建命令生成 Web 资源和 HAP：

```powershell
ohpm install
npm --prefix ./upstream/folia-major ci
```

`entry/src/main/resources/rawfile/folia` 与 `upstream/folia-major/dist-harmony` 是生成目录，不进入 Git。首次克隆或切换源码版本后，先运行 `tools/build-web.mjs`，再构建 HAP；不要依赖旧的 Web 打包资源。QQ API 部署助手的依赖按 `deploy/qq-api/README.md` 单独安装。

## 使用与配置

- 默认固定横屏；“设置 → 通用 → 开启竖屏”可切换固定竖屏，关闭后恢复横屏，选择在重启后保留。两个模式都不跟随系统旋转开关或传感器。Web 布局适配横竖屏并避开系统手势区与开孔；设置面板随屏幕和窗口大小调整，关闭按钮位于独立顶栏，打开设置时自动隐藏触屏右上角的思索按钮。
- 左上角原项目的齿轮直接进入设置选项，隐藏顶部“帮助/选项”标签。在线音乐服务地址位于“集成 → 鸿蒙服务连接”，AI 接口统一位于其下方的“AI 主题”。本地音乐无需服务端。
- 网易云音乐 API 默认使用 `http://106.14.205.179:1000`，可在上述设置中修改；已有配置未填写网易云地址时也使用该默认值。酷狗、QQ 音乐地址留空时使用内置原生连接，也可填写自己的 API；其他歌词代理服务和 Navidrome 仍需配置可访问的服务。项目未包含第三方登录凭据。
- “设置 → 集成 → 鸿蒙服务连接 → AI 主题”统一配置 AI 主题生成和 AI 歌词分词。开启“使用自己的 AI 服务”，选择 Google Gemini 或其他兼容接口，填写模型、接口地址、温度与密钥后保存。连接测试使用当前输入的配置，不必先保存；支持需要 SSE 的兼容接口。配置仅存于应用私有目录，两类请求都通过鸿蒙原生网络直接发往选定的 AI 服务，无需填写或部署 FMusic AI 后端。
- 开启自己的 AI 服务后，选择“AI 主题”会默认开启切歌自动生成：已有 AI 主题直接读取，没有 AI 结果时等待歌词并调用配置的模型，JSON 自动保存、应用到对应歌曲；封面配色不算 AI 结果，纯音乐使用歌名。播放页主题选项下的“自动生成 AI 主题”可关闭该流程，关闭选择会保存，切歌、打开编辑器或重新选择 AI 都不会擅自开启。该按钮与外观设置的自动生成选项共用状态，支持配置导入导出和命令面板。编辑器显示生成进度，失败可查看原因并重试。
- 酷狗支持官方 App 扫码；QQ 音乐支持 QQ 和微信扫码。内置连接的登录凭据仅在原生侧处理，使用系统 Asset Store 加密保存；QQ 搜索与逐字歌词继续使用原有 QRC 管线。手动填写的 QQ/酷狗 API 地址优先，清空并保存后切回内置连接。实现与验证边界见 `HARMONY_MUSIC_LOGIN_20261016.md`。
- 波点音乐通过鸿蒙原生网络直接连接，无需填写 API 地址。资料库的平台入口可选择“波点音乐”，扫码使用波点官方客户端；搜索、歌单、音源和逐字歌词复用原项目 Omni。账号凭据仅存于原生侧的系统 Asset Store，加密存储不可用时仅保留本次运行会话。播放权限和地区限制由平台决定。
- 首次启动直接显示资料库；原项目的界面选择、播放入口和教程仍可在 Web 设置中打开。
- 启动完成后通过原生网络检查更新公告，软件 ID 为 `b4f32302-28d0-4062-a0de-380662fa3f70`。优先级 10 的最新有效记录决定提醒规则，优先级 1 提供公告标题和正文；“当前为//强制提醒”“当前为//强制关闭”“当前为//不强制”可与指令说明共存。原生弹窗提供“我知道了”和“更新时提醒”：后者记住当前应用版本，普通提醒在该版本内不再弹出，版本名称或版本号变化后恢复；强制提醒覆盖该选择，强制关闭始终不弹出。网络失败不阻塞应用启动。
- 鸿蒙 PC（2in1）使用沉浸式窗口顶栏：页面背景延伸到顶部，保留系统全屏/还原、最小化、关闭按钮和原生拖动；按钮颜色跟随应用明暗主题，顶部控件随按钮区变化自动避让。
- “本地”导入调用系统文件选择器，音频、同名歌词和封面复制到应用私有目录，重启后仍可读取。

## 构建

使用 Node 24 与 `D:\dev26\DevEco Studio`：

```powershell
& 'D:\dev26\DevEco Studio\tools\node\node.exe' tools/build-web.mjs
& ./tools/build-hap.ps1
```

Web 构建保留原项目完整的浏览器代码，输出到 `entry/src/main/resources/rawfile/folia`。`build-profile.json5` 使用本机 DevEco 签名配置，签名材料不应发布。

构建同时从锁定的 `bodian-music-api@0.1.2` 生成原生 ArkJS 协议模块；`tools/build-bodian.mjs` 仅替换网络、URL 和二维码宿主接口，保留上游的签名、权限、登录、分页与写入校验。RCP 保留播放接口的 GET JSON body；ArkWeb 只接收公开结果和二维码地址。协议升级需显式核对适配器，生成模块的许可证保留在 `entry/src/main/ets/services/bodian/licenses`。

验证构建使用独立 product，避免与 DevEco 的 default 输出相互覆盖：

```powershell
& ./tools/build-hap.ps1 -Product verification
& 'D:\dev26\DevEco Studio\tools\node\node.exe' tools/verify-web.mjs
```

`verification/web-checks.json` 记录生产 Web 包验证，`verification/Folia-HarmonyOS-signed.hap` 是经过签名检查后的交付副本。模拟器截图和运行日志也保存在 `verification`。浏览器验证、HAP 构建和设备验证是不同的检查，不代表所有在线服务或所有原项目功能已验收。

## 功能对齐状态

保留完整浏览器前端，包括 14 种内置歌词动画、原项目的背景、搜索/账户/音乐库/队列、主题、均衡器、响度、歌词处理与原设置页面。已经接入本地文件导入和重启恢复、歌词/JSON/图片等 Blob 导出、外部链接、系统播放控制与 seek。

原项目依赖 Electron 的能力仍需单独迁移，不能宣称已经全部对齐：桌面模组的 Node 能力、托盘和全局快捷键、桌面悬浮窗、本机远程控制服务、依赖 FFmpeg 的视频导出、依赖桌面模型的人声分离，以及原文件夹扫描和持续监听。当前本地导入采用多文件选择。在线平台登录、AI 服务与真机音频后台运行还需使用真实服务和设备进一步验收。
