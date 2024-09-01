# baserCMS Debug Toggle

![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/fuchigam1.basercms-debug-toggle) ![License](https://img.shields.io/github/license/fuchigam1/basercms-debug-toggle)

baserCMS 4.x および 5.x のデバッグモードを切り替えるためのVSCode拡張機能です。

## 機能

- baserCMS 4.x のデバッグモードを `0`, `1`, `2` の間で切り替え可能
- baserCMS 5.x のデバッグモードを `true` と `false` の間で切り替え可能
- baserCMSのバージョンは自動で検出
- 現在のデバッグモードをVSCodeのステータスバーに表示

## インストール方法

1. Visual Studio Code を開く
2. 拡張機能ビュー (`Ctrl+Shift+X`) を開く
3. `baserCMS Debug Toggle` を検索
4. 「インストール」をクリック

または、[Visual Studio Code Marketplace](https://marketplace.visualstudio.com/vscode)から直接インストールできます。

## 使い方

1. VSCodeでbaserCMSプロジェクトを開きます。
2. コマンドパレット (`Ctrl+Shift+P`) から「Toggle baserCMS Debug Mode」を実行してください。
3. ステータスバーに現在のデバッグモードが表示されます。
4. ステータスバーのアイテムをクリックするか、コマンドパレットから切り替えを実行できます。

## スクリーンショット

![スクリーンショット](images/screenshot.png)

## 要件

- baserCMS 4.x または 5.x プロジェクト

## サポート

- [GitHubのissuesページ](https://github.com/fuchigam1/basercms-debug-toggle/issues)で報告してください。

## リリースノート

詳細は [CHANGELOG](CHANGELOG.md) を参照してください。

## ライセンス

このプロジェクトはMITライセンスのもとでライセンスされています。詳細は [LICENSE](LICENSE) ファイルを参照してください。
