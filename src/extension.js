"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// baserCMSのバージョンを判定する関数
function detectBaserCMSVersion(workspacePath) {
    // baserCMS 5系: config/.env ファイルが存在するかチェック
    const envPath = path.join(workspacePath, 'config', '.env');
    if (fs.existsSync(envPath)) {
        return '5.x';
    }
    // baserCMS 4系: app/Config/install.php ファイルが存在するかチェック
    const installPath = path.join(workspacePath, 'app', 'Config', 'install.php');
    if (fs.existsSync(installPath)) {
        return '4.x';
    }
    return 'unknown';
}
function activate(context) {
    // ステータスバーアイテムを作成
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = 'baserCMS: Debug Mode';
    statusBarItem.show();
    // ステータスバーアイテムがクリックされたときの処理
    statusBarItem.command = 'extension.toggleDebugMode';
    // コマンドを登録
    let disposable = vscode.commands.registerCommand('extension.toggleDebugMode', () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            const workspacePath = workspaceFolders[0].uri.fsPath;
            const version = detectBaserCMSVersion(workspacePath);
            if (version === '5.x') {
                handleBaserCMS5(workspacePath);
            }
            else if (version === '4.x') {
                handleBaserCMS4(workspacePath);
            }
            else {
                vscode.window.showErrorMessage('baserCMSのバージョンが判定できませんでした。');
            }
        }
        else {
            vscode.window.showErrorMessage('ワークスペースが開かれていません');
        }
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(statusBarItem);
}
function handleBaserCMS5(workspacePath) {
    const envPath = path.join(workspacePath, 'config', '.env');
    if (fs.existsSync(envPath)) {
        const currentEnv = fs.readFileSync(envPath, 'utf8');
        const currentDebugValue = /DEBUG=(true|false)/.exec(currentEnv)?.[1];
        const options = [
            { label: 'true', description: 'Debug Mode ON' },
            { label: 'false', description: 'Debug Mode OFF' }
        ];
        vscode.window.showQuickPick(options, {
            placeHolder: `現在のDEBUGモード: ${currentDebugValue}`
        }).then(selection => {
            if (selection) {
                const newEnv = currentEnv.replace(/DEBUG=(true|false)/, `DEBUG=${selection.label}`);
                fs.writeFileSync(envPath, newEnv, 'utf8');
                vscode.window.showInformationMessage(`DEBUGモードが${selection.label}に変更されました`);
            }
        });
    }
    else {
        vscode.window.showErrorMessage('.envファイルが見つかりませんでした');
    }
}
function handleBaserCMS4(workspacePath) {
    const installPath = path.join(workspacePath, 'app', 'Config', 'install.php');
    if (fs.existsSync(installPath)) {
        const installConfig = fs.readFileSync(installPath, 'utf8');
        const currentDebugValue = /\$debug\s*=\s*(\d);/.exec(installConfig)?.[1];
        const options = [
            { label: '0', description: 'Debug Mode OFF' },
            { label: '1', description: 'Basic Debug Mode' },
            { label: '2', description: 'Advanced Debug Mode' }
        ];
        vscode.window.showQuickPick(options, {
            placeHolder: `現在のDEBUGモード: ${currentDebugValue}`
        }).then(selection => {
            if (selection) {
                const newConfig = installConfig.replace(/\$debug\s*=\s*\d;/, `$debug = ${selection.label};`);
                fs.writeFileSync(installPath, newConfig, 'utf8');
                vscode.window.showInformationMessage(`DEBUGモードが${selection.label}に変更されました`);
            }
        });
    }
    else {
        vscode.window.showErrorMessage('install.phpファイルが見つかりませんでした');
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map