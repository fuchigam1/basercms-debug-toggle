import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let statusBarItem: vscode.StatusBarItem;

// baserCMSのバージョンを判定する関数
function detectBaserCMSVersion(workspacePath: string): string {
    const envPath = findEnvFileRecursively(workspacePath);
    if (envPath) {
        return '5.x';
    }

    const installPath = findInstallPhpRecursively(workspacePath);
    if (installPath) {
        return '4.x';
    }

    return 'unknown';
}

// 再帰的にconfig/.envを検索する関数
function findEnvFileRecursively(dir: string): string | null {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);

        if (fs.statSync(fullPath).isDirectory()) {
            const result = findEnvFileRecursively(fullPath);
            if (result) {
                return result;
            }
        } else if (file === '.env' && fullPath.includes('config')) {
            return fullPath;
        }
    }

    return null;
}

// 再帰的にinstall.phpを検索する関数
function findInstallPhpRecursively(dir: string): string | null {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);

        if (fs.statSync(fullPath).isDirectory()) {
            const result = findInstallPhpRecursively(fullPath);
            if (result) {
                return result;
            }
        } else if (file === 'install.php' && fullPath.includes('Config')) {
            return fullPath;
        }
    }

    return null;
}

// ステータスバーの表示を更新する関数
function updateStatusBar(workspacePath: string) {
    const version = detectBaserCMSVersion(workspacePath);

    if (version === '5.x') {
        const envPath = findEnvFileRecursively(workspacePath);
        if (envPath) {
            const currentEnv = fs.readFileSync(envPath, 'utf8');
            const currentDebugValue = /export DEBUG="(true|false)"/.exec(currentEnv)?.[1];
            const displayValue = currentDebugValue === 'true' ? '1' : '0';
            statusBarItem.text = `baserCMS: Debug Mode: ${displayValue}`;
            console.log(`ステータスバー更新: baserCMS: Debug Mode: ${displayValue}`);
        }
    } else if (version === '4.x') {
        const installPath = findInstallPhpRecursively(workspacePath);
        if (installPath) {
            const installConfig = fs.readFileSync(installPath, 'utf8');
            const currentDebugValue = /Configure::write\('debug',\s*(\d)\);/.exec(installConfig)?.[1];
            statusBarItem.text = `baserCMS: Debug Mode: ${currentDebugValue}`;
            console.log(`ステータスバー更新: baserCMS: Debug Mode: ${currentDebugValue}`);
        }
    } else {
        statusBarItem.text = `baserCMS: Debug Mode: unknown`;
        console.log('ステータスバー更新: baserCMS: Debug Mode: unknown');
    }

    statusBarItem.show();
}

export function activate(context: vscode.ExtensionContext) {
    // ステータスバーアイテムを作成
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    context.subscriptions.push(statusBarItem);

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        const workspacePath = workspaceFolders[0].uri.fsPath;
        updateStatusBar(workspacePath);
    }

    // ステータスバーアイテムがクリックされたときの処理
    statusBarItem.command = 'extension.toggleDebugMode';

    // コマンドを登録
    let disposable = vscode.commands.registerCommand('extension.toggleDebugMode', () => {
        if (workspaceFolders) {
            const workspacePath = workspaceFolders[0].uri.fsPath;
            const version = detectBaserCMSVersion(workspacePath);

            if (version === '5.x') {
                handleBaserCMS5(workspacePath);
            } else if (version === '4.x') {
                handleBaserCMS4(workspacePath);
            } else {
                vscode.window.showErrorMessage('baserCMSのバージョンが判定できませんでした。');
            }
        } else {
            vscode.window.showErrorMessage('ワークスペースが開かれていません');
        }
    });

    context.subscriptions.push(disposable);
}

function handleBaserCMS5(workspacePath: string) {
    const envPath = findEnvFileRecursively(workspacePath);
    if (envPath) {
        const currentEnv = fs.readFileSync(envPath, 'utf8');
        const currentDebugValue = /export DEBUG="(true|false)"/.exec(currentEnv)?.[1];

        const options: vscode.QuickPickItem[] = [
            { label: 'true', description: 'Debug Mode ON' },
            { label: 'false', description: 'Debug Mode OFF' }
        ];

        vscode.window.showQuickPick(options, {
            placeHolder: `現在のDEBUGモード: ${currentDebugValue}`
        }).then(selection => {
            if (selection) {
                const newEnv = currentEnv.replace(/export DEBUG="(true|false)"/, `export DEBUG="${selection.label}"`);
                fs.writeFileSync(envPath, newEnv, 'utf8');
                vscode.window.showInformationMessage(`DEBUGモードが${selection.label}に変更されました`);
                updateStatusBar(workspacePath);
            }
        });
    } else {
        vscode.window.showErrorMessage('.envファイルが見つかりませんでした');
    }
}

function handleBaserCMS4(workspacePath: string) {
    const installPath = findInstallPhpRecursively(workspacePath);
    if (installPath) {
        const installConfig = fs.readFileSync(installPath, 'utf8');
        const currentDebugValue = /Configure::write\('debug',\s*(\d)\);/.exec(installConfig)?.[1];

        const options: vscode.QuickPickItem[] = [
            { label: '0', description: 'Debug Mode OFF' },
            { label: '1', description: 'Basic Debug Mode' },
            { label: '2', description: 'Advanced Debug Mode' }
        ];

        vscode.window.showQuickPick(options, {
            placeHolder: `現在のDEBUGモード: ${currentDebugValue}`
        }).then(selection => {
            if (selection) {
                const newConfig = installConfig.replace(/Configure::write\('debug',\s*\d\);/, `Configure::write('debug', ${selection.label});`);
                fs.writeFileSync(installPath, newConfig, 'utf8');
                vscode.window.showInformationMessage(`DEBUGモードが${selection.label}に変更されました`);
                updateStatusBar(workspacePath);
            }
        });
    } else {
        vscode.window.showErrorMessage('install.phpファイルが見つかりませんでした');
    }
}

export function deactivate() {}
