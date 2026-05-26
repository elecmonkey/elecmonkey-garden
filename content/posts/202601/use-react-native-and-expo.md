---
title: "使用 Expo 框架试图上手 React Native 移动端开发记录"
date: "2026-01-26"
description: "使用 Expo 框架上手 React Native 开发，Android 与 iOS 模拟器及真机调试的完整流程记录"
tags: ["React", "React Native", "Expo", "移动端", "iOS", "Android"]
author: "Elecmonkey"
---

完全没有移动端开发经验/知识，完全没有接触过 Kotlin 和 Swift。纯记录折腾成功的流程。

## 创建项目

```bash
pnpx create-expo-app@latest
```

创建一个 demo 项目，然后让 AI 随便改一改，把名字换了，做了一个生成随机数的小 demo。

在 package.json 添加以下 script：

```json
"web": "expo start --web"
```

运行：

```bash
pnpm web
```

打开浏览器，没大问题，就用这个 demo 做测试了。


## Android 端

### Android 模拟器运行

安装 Android Studio！初次打开 Android Studio 会提示安装 Android SDK，我下载了 Android API 36，看起来是最新的，不太清楚对应什么范围的 Android 版本号。

然后在顶部找 Tools -> Device Manager，创建一个 Android 手机的模拟器，我选了 Pixel 7 Pro，API 36. 把模拟器跑起来，放置备用。

`package.json` 里应该默认有：

```json
"ios": "expo run:android"
```

所以运行：

```bash
pnpm android
```

如果刚刚的模拟器在后台正常运行，这一步应该是能连上去的，第一次需要等待自动安装 Expo Go，有进度条能看着它动。完成后：

![rn-android-simulator](https://images.elecmonkey.com/articles/202601/rn-android-simulator.png)

### Android 真机运行

Expo 官方是提供一个名为 EAS (Expo Application Services) 的托管构建服务，可以直接构建好 apk 和 ipa（需要 99 刀开发者账号）。不过 Android 没有那么讲究，可以直接用用 EAS 的免费额度。


```bash
# 安装 EAS 命令行工具
pnpm add -g eas-cli
# 登录 Expo 账号
eas login
```

登录 Expo 账号，

```bash
eas build:configure
```

会问 Which platforms would you like to configure for EAS Build? 选择 Android. 这一步会生成 `eas.json`.

```bash
eas build -p android --profile preview --clear-cache
```

按提示填一些签名之类的东西。本地 cli 有概率一直卡住（如果网络不太稳），这个时候打开自己的 expo.dev 后台，找到这次构建任务，就能找到构建成功的 apk 下载链接。下载好后传到手机上安装。

![rn-android-real](https://images.elecmonkey.com/articles/202601/rn-android-real.png)

## iOS 端

### iOS 模拟器运行

去 App Store 下载比较新的 Xcode 版本。（为此我还被迫先升级了一下 macOS 版本。。。应该到 Sequoia 的最新小版本了，我是真的有点抵触 macOS 26 Tahoe 的液态玻璃。。。）

Xcode 里面会有 iOS Simulator，需要提前下载模拟镜像，我姑且下载一个 iOS 26.

![download-ios-26-simulator](https://images.elecmonkey.com/articles/202601/download-ios-26-simulator.png)

`package.json` 里应该默认有：

```json
"ios": "expo run:ios"
```

所以运行：

```bash
pnpm ios
```

macOS 会自动打开 iOS Simulator，第一次打开需要等待 Expo Go 自动安装完成，同样应该不会下载太久，有进度条能看着它动。完成后：

![rn-ios-simulator](https://images.elecmonkey.com/articles/202601/rn-ios-simulator.png)

### iOS 真机运行

首先，由于我没有 99 美元的 Apple 开发者账号，所以不能用 Expo 提供的托管服务来构建。只能本地用 Xcode 构建好，连接数据线以开发者模式安装在自己的 iPhone 上。

首先需要在 Expo 侧预编译、把 JavaScript 代码打包好，

自行在 `package.json` 里添加两个 script：

```json
"prebuild": "expo prebuild",
"export": "expo export",
```

运行：

```bash
pnpm prebuild
pnpm export
```

`prebuild` 会生成 `ios` 和 `android` 目录，里面是原生项目代码，可以用 Xcode 和 Android Studio 打开。`export` 会把 JavaScript 代码打包好，供原生项目使用。

这个时候我们需要安装相关的 iOS 开发的原生依赖项。

```bash
brew install cocoapods
```

然后进入 `ios` 目录，运行：

```bash
pod install
```

安装过程似乎会从 GitHub 拉取资源，所以网络情况还需要注意一下。顺利完成后，`ios` 目录下会出现 `app.xcworkspace`，这个就是我们要用 Xcode 打开的东西了。用访达进入 `ios` 目录，双击打开 `app.xcworkspace`。

现在我们来到 Xcode 了！

设置自己的开发者身份信息。在 TARGETS → app → Signing & Capabilities 里选择自己的 Apple ID 账号，把 Team 换成自己的 Apple ID (Personal Team). 这一步不设置的话后续无法 build. Bundle Identifier 需要一个类似于 com.yourname.appname 的唯一标识符，会自动使用 React Native 项目的。

连接好 iPhone，选择真机作为运行目标，第一次连接需要手机开启开发者模式，按提示进行各种信任。具体流程记不太清了，但是系统提示很清晰，没有额外求助搜索引擎或人工智能。部分提示只有英语。

在导航栏的 app ▸ iPhone 点击 app，Edit Scheme，把 Debug 改成 Release。这一步如果不做，似乎不会把 JS Bundle 打包进 app 里。

![release-app](https://images.elecmonkey.com/articles/202601/release-app.png)

然后就到了见证奇迹的时刻，点击左上角的运行按钮，Xcode 会开始编译打包安装到真机上。这个过程会比较久，耐心等待。

![rn-ios-real](https://images.elecmonkey.com/articles/202601/rn-ios-real.png)