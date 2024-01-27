# 42_ft_transcendence
School 42 project

## ローカル開発環境構築

## 事前準備

* [git](https://git-scm.com/downloads)
 
* [Docker Desktopのインストール](https://learn.microsoft.com/ja-jp/windows/wsl/tutorials/wsl-containers#install-docker-desktop)

* [Visual Studio Code](https://code.visualstudio.com/download)
 
## 初回セットアップ

リモートリポジトリの `git clone` 後、 `git checkout develop` にて、 `develop` ブランチのチェックアウトを行ってください。

## npmパッケージのインストール

以下のコマンドで、package-lock.jsonに記載された依存関係を基に、npmパッケージのインストールを行います。（コンテナ内で実行してください）。

```
> npm ci
```

新たなライブラリが追加された場合も `npm ci` で node_modules を更新するようにしてください。

### 拡張機能の事前準備

VSCode拡張機能「Prettier - Code formatter」をインストールする

### 整形手順

整形するHTMLファイル内で、 `Ctrl + Shift + P` を入力し、「Format Document」を選択
※プルリクエスト提出前に実行をお願いします。
