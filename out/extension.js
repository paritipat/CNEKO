"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
let editor = vscode.window.activeTextEditor;
let allinwordcount = countWords(String(editor?.document.getText()));
let mytime;
function countWords(text) {
    const words = text.replace(/[ \t\n\x0B\f\r]/g, '');
    return words ? words.length : 0;
}
function countLines(text) {
    return text.split('\n').length;
}
function updateWordCountStatus() {
    function updateStatus() {
        editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const text = document.getText();
            const wordCount = countWords(text);
            const linecount = countLines(text);
            let curwordcount = wordCount - Number(allinwordcount);
            let tmpwordcount = Number(wordCount);
            let lang = document.languageId;
            if (curwordcount < 0) {
                curwordcount = tmpwordcount + Math.abs(tmpwordcount);
                curwordcount = tmpwordcount;
            }
            const line = editor.selection.active.line;
            statusBarItem.show();
            statusBarItem.text = `$(terminal-powershell) Ln ${line}, Words ${wordCount}, CodeLines ${linecount} , Wordcurrently ${curwordcount} , Language ${lang}`;
        }
        else {
            statusBarItem.text = 'Word Count: 0';
        }
    }
    updateStatus();
    vscode.workspace.onDidChangeTextDocument(updateStatus);
    statusBarItem.show();
}
function savefile(data) {
    const customFolderPath = 'C:/Users/maMo/Desktop/FinalProject/cneko/file.csv';
    const csvContentToAppend = data;
    if (data !== '$(sync~spin) Standby to Coding') {
        const csvContentBuffer = Buffer.from(csvContentToAppend + '\r\n', 'utf-8');
        fs.appendFile(customFolderPath, csvContentBuffer, (error) => {
            if (error) {
                throw error;
            }
            console.log('This data log was updated to file!');
        });
    }
}
function updateAllinWordCount() {
    editor = vscode.window.activeTextEditor;
    allinwordcount = countWords(String(editor?.document.getText()));
}
function isactivecurrenttab() {
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            const fileName = editor.document.fileName;
            console.log(fileName);
            vscode.commands.executeCommand('stopcoding.activate');
        }
    });
}
let webviewPanel;
function activate(context) {
    statusBarItem.text = `$(sync~spin) Standby to Coding`;
    statusBarItem.command = 'startcoding.activate';
    statusBarItem.show();
    vscode.workspace.onDidChangeTextDocument(() => {
        vscode.commands.executeCommand('startcoding.activate');
    });
    const showWebViewCommand = vscode.commands.registerCommand('myExtension.showWebView', () => {
        if (!webviewPanel) {
            const webviewHtmlPath = path.join(context.extensionPath, 'resources', 'webView.html');
            const webviewHtmlContent = fs.readFileSync(webviewHtmlPath, 'utf-8');
            webviewPanel = vscode.window.createWebviewPanel('myWebview', 'My Webview', vscode.ViewColumn.One, {});
            webviewPanel.webview.html = webviewHtmlContent;
            webviewPanel.onDidDispose(() => {
                webviewPanel = undefined;
            });
        }
        else {
            webviewPanel.reveal();
        }
    });
    const start = vscode.commands.registerCommand('startcoding.activate', () => {
        updateWordCountStatus();
        statusBarItem.command = 'stopcoding.activate';
        const start = Date.now();
        isactivecurrenttab();
        mytime = setInterval(() => {
            const diff = Math.floor((Date.now() - start) / 1000);
            const second = diff % 60;
            const minute = Math.floor(diff / 60);
            const hour = Math.floor(minute / 60);
            console.log(hour + ' min ' + minute + ' min ' + second + ' sec');
        }, 1000);
    });
    const stop = vscode.commands.registerCommand('stopcoding.activate', () => {
        savefile(statusBarItem.text);
        console.log(statusBarItem.text);
        statusBarItem.text = `$(sync~spin) Standby to Coding`;
        statusBarItem.command = 'startcoding.activate';
        statusBarItem.show();
        updateAllinWordCount();
        context.subscriptions.push(start);
        clearInterval(mytime);
    });
    context.subscriptions.push(statusBarItem, showWebViewCommand, start, stop);
}
exports.activate = activate;
function deactivate() {
    statusBarItem.dispose();
    savefile(statusBarItem.text);
    console.log(statusBarItem.text);
    clearInterval(mytime);
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map