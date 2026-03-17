# SSH-MCP 安全性功能測試指南

## 遠端測試步驟

### 1. 測試環境變數支援

在終端機設置環境變數：
```bash
export SSH_HOST=putin2
export SSH_USER=tino
export SSH_PASSWORD=s2kk!np2!!
export SSH_SUDO_PASSWORD=s2kk!np2!!
```

然後啟動 MCP 伺服器（不帶密碼參數）：
```bash
node build/index.js --timeout=30000
```

### 2. 測試指令白名單

設置白名單：
```bash
export SSH_COMMAND_WHITELIST="ls,cat,echo,ps,whoami"
```

測試場景：
- ✅ 執行 `ls -la` -> 應該成功
- ✅ 執行 `cat /etc/passwd` -> 應該成功  
- ✅ 執行 `whoami` -> 應該成功
- ❌ 執行 `touch test.txt` -> 應該被拒絕
- ❌ 執行 `sudo su` -> 應該被拒絕

### 3. 測試指令黑名單

設置黑名單：
```bash
export SSH_COMMAND_BLACKLIST="touch,sudo,shutdown,reboot,passwd"
```

測試場景：
- ✅ 執行 `ls -la` -> 應該成功
- ✅ 執行 `cat file.txt` -> 應該成功
- ❌ 執行 `touch test.txt` -> 應該被拒絕
- ❌ 執行 `sudo whoami` -> 應該被拒絕
- ❌ 執行 `passwd` -> 應該被拒絕

### 4. 查看審計日誌

執行一些指令後，檢查 stderr 輸出：
```bash
# 執行指令時會輸出類似以下的日誌到 stderr
{"timestamp":"2024-01-01T12:00:00.000Z","level":"INFO","event":"command_execution","details":"{\"command\":\"ls -la\",\"tool\":\"exec\",\"user\":\"tino\",\"host\":\"putin2\"}"}
```

### 5. 測試密碼安全性

- 密碼在傳輸時會被 Base64 編碼
- 錯誤訊息不會包含敏感資訊
- 嘗試錯誤密碼時，錯誤訊息應該是通用的

## 使用 MCP Inspector 測試

1. 啟動 Inspector：
```bash
npm run inspect
```

2. 在瀏覽器中打開 http://localhost:3000

3. 測試 exec 工具：
```json
{
  "name": "exec",
  "arguments": {
    "command": "ls -la",
    "description": "list files"
  }
}
```

4. 測試被拒絕的指令（設置白名單後）：
```json
{
  "name": "exec", 
  "arguments": {
    "command": "touch test.txt",
    "description": "try to create file"
  }
}
```
應該返回錯誤：`Command 'touch' is not in the whitelist`

## 預期結果

✅ 所有安全性功能正常運作：
- 環境變數優先於命令列參數
- 指令白名單/黑名單正確過濾
- 審計日誌記錄所有執行
- 密碼安全傳輸
- 錯誤訊息不洩漏敏感資訊
