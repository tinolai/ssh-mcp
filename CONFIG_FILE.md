# SSH-MCP 配置檔案支援

## 概述

SSH-MCP 支援使用 JSON 配置檔案來管理所有設定，包括連線參數和安全選項。

## 配置檔案位置

系統會按以下順序查找配置檔案：
1. 當前工作目錄：`./ssh_config.json`
2. 專案根目錄：`<專案路徑>/ssh_config.json`
3. 用戶配置目錄：`~/.ssh_mcp/ssh_config.json`

## 配置檔案格式

```json
{
  "host": "your-server.com",
  "port": 22,
  "user": "username",
  "password": "password",
  "sudoPassword": "sudo-password",
  "suPassword": "su-password",
  "key": "/path/to/private/key",
  "timeout": 30000,
  "maxChars": "none",
  "security": {
    "commandWhitelist": [
      "ls",
      "cat",
      "echo",
      "ps",
      "whoami",
      "grep",
      "tail",
      "head",
      "^ps.*",
      "^ls.*"
    ],
    "commandBlacklist": [
      "rm",
      "dd",
      "format",
      "fdisk",
      "shutdown",
      "reboot",
      "sudo",
      "su",
      "passwd",
      "chmod",
      "chown",
      "mkfs",
      "fsck"
    ],
    "auditLogging": true,
    "sanitizeErrors": true,
    "encodePasswords": true
  },
  "logging": {
    "level": "INFO",
    "includeTimestamp": true,
    "includeUserInfo": true
  }
}
```

## 配置優先級

配置值的優先級順序（高到低）：
1. **命令列參數**（`--host=value`）
2. **環境變數**（`SSH_HOST=value`）
3. **配置檔案**
4. **預設值**

## 安全性建議

### 1. 使用環境變數處理敏感資訊

```json
{
  "host": "your-server.com",
  "user": "username",
  // 不要在配置檔案中保存密碼
  // "password": "password",  // ❌ 不建議
  "security": {
    "commandBlacklist": [
      "rm",
      "dd",
      "format",
      "fdisk",
      "shutdown",
      "reboot",
      "sudo",
      "su",
      "passwd"
    ]
  }
}
```

然後使用環境變數：
```bash
export SSH_PASSWORD="your-password"
export SSH_SUDO_PASSWORD="your-sudo-password"
```

### 2. 檔案權限

確保配置檔案有適當的權限：
```bash
chmod 600 ssh_config.json  # 只有所有者可讀寫
```

## 在 MCP 客戶端中使用

### Claude Desktop / Windsurf

```json
{
  "mcpServers": {
    "ssh-mcp": {
      "args": [
        "/path/to/ssh-mcp/build/index.js"
      ],
      "command": "node",
      "env": {
        "SSH_PASSWORD": "your-password",
        "SSH_SUDO_PASSWORD": "your-sudo-password"
      }
    }
  }
}
```

### 使用環境變數（推薦）

```json
{
  "mcpServers": {
    "ssh-mcp": {
      "args": [
        "/path/to/ssh-mcp/build/index.js"
      ],
      "command": "node"
    }
  }
}
```

然後在環境中設置：
```bash
export SSH_HOST="your-server.com"
export SSH_USER="username"
export SSH_PASSWORD="password"
export SSH_SUDO_PASSWORD="sudo-password"
export SSH_COMMAND_WHITELIST="ls,cat,echo"
```

## 配置選項說明

### 連線選項
- `host`: SSH 伺服器主機名或 IP
- `port`: SSH 連接埠（預設：22）
- `user`: SSH 使用者名稱
- `password`: SSH 密碼（建議使用環境變數）
- `key`: SSH 私鑰路徑
- `sudoPassword`: sudo 密碼（建議使用環境變數）
- `suPassword`: su 密碼（建議使用環境變數）
- `timeout`: 指令執行逾時時間（毫秒）
- `maxChars`: 指令最大字元數（"none" 表示無限制）

### 安全選項
- `commandWhitelist`: 允許的指令列表
- `commandBlacklist`: 禁止的指令列表
- `auditLogging`: 是否啟用審計日誌
- `sanitizeErrors`: 是否清理錯誤訊息
- `encodePasswords`: 是否對密碼進行 Base64 編碼

### 日誌選項
- `level`: 日誌級別（INFO, WARN, ERROR）
- `includeTimestamp`: 是否包含時間戳
- `includeUserInfo`: 是否包含用戶資訊

## 範例配置

### 開發環境配置
```json
{
  "host": "dev-server.local",
  "user": "developer",
  "timeout": 60000,
  "security": {
    "commandWhitelist": [
      "ls", "cat", "cd", "pwd", "git", "npm", "node", "docker"
    ],
    "auditLogging": true
  }
}
```

### 生產環境配置
```json
{
  "host": "prod-server.com",
  "user": "admin",
  "timeout": 30000,
  "security": {
    "commandWhitelist": [
      "ps", "top", "df", "du", "tail", "grep", "systemctl status"
    ],
    "commandBlacklist": [
      "rm", "dd", "format", "fdisk", "shutdown", "reboot",
      "systemctl stop", "systemctl restart", "iptables"
    ],
    "auditLogging": true,
    "sanitizeErrors": true
  }
}
```
