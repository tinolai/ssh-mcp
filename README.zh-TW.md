# SSH MCP 伺服器

[![NPM 版本](https://img.shields.io/npm/v/ssh-mcp)](https://www.npmjs.com/package/ssh-mcp)
[![下載量](https://img.shields.io/npm/dm/ssh-mcp)](https://www.npmjs.com/package/ssh-mcp)
[![Node 版本](https://img.shields.io/node/v/ssh-mcp)](https://nodejs.org/)
[![授權](https://img.shields.io/github/license/tufantunc/ssh-mcp)](./LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/tufantunc/ssh-mcp?style=social)](https://github.com/tufantunc/ssh-mcp/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/tufantunc/ssh-mcp?style=social)](https://github.com/tufantunc/ssh-mcp/forks)
[![建置狀態](https://github.com/tufantunc/ssh-mcp/actions/workflows/publish.yml/badge.svg)](https://github.com/tufantunc/ssh-mcp/actions)
[![GitHub issues](https://img.shields.io/github/issues/tufantunc/ssh-mcp)](https://github.com/tufantunc/ssh-mcp/issues)

[![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/tufantunc/ssh-mcp)](https://archestra.ai/mcp-catalog/tufantunc__ssh-mcp)

**SSH MCP 伺服器**是一個本地的 Model Context Protocol (MCP) 伺服器，提供 SSH 控制功能給 Linux 和 Windows 系統，讓 LLM 和其他 MCP 客戶端能夠透過 SSH 安全地執行 shell 指令。

## 目錄

- [快速開始](#快速開始)
- [功能特色](#功能特色)
- [安裝](#安裝)
- [客戶端設定](#客戶端設定)
- [測試](#測試)
- [安全性最佳實踐](#安全性最佳實踐)
- [免責聲明](#免責聲明)
- [支援](#支援)

## 快速開始

- [安裝](#安裝) SSH MCP 伺服器
- [設定](#客戶端設定) SSH MCP 伺服器
- [設定](#客戶端設定) 你的 MCP 客戶端（例如 Claude Desktop、Cursor 等）
- 透過自然語言在 Linux 或 Windows 伺服器上執行遠端 shell 指令

## 功能特色

- 符合 MCP 規範的伺服器，提供 SSH 功能
- 在遠端 Linux 和 Windows 系統上執行 shell 指令
- 透過密碼或 SSH 金鑰進行安全認證
- 使用 TypeScript 和官方 MCP SDK 建構
- **可設定的逾時保護**，自動中止處理程序
- **優雅的逾時處理** - 在關閉連線前嘗試終止掛起的處理程序
- **增強的安全功能**：
  - 支援環境變數處理敏感資料（密碼）
  - 指令白名單/黑名單進行存取控制
  - 審計日誌追蹤指令執行
  - 清理錯誤訊息防止資訊洩漏
  - 密碼傳輸使用 Base64 編碼
  - 使用唯一標記增強提示符偵測

### 工具

- `exec`：在遠端伺服器上執行 shell 指令
  - **參數**：
    - `command`（必要）：要在遠端 SSH 伺服器上執行的 shell 指令
    - `description`（選用）：此指令作用的可選描述（會作為註解附加）
  - **逾時設定**：

- `sudo-exec`：使用 sudo 提權執行 shell 指令
  - **參數**：
    - `command`（必要）：要使用 sudo 以 root 身份執行的 shell 指令
    - `description`（選用）：此指令作用的可選描述（會作為註解附加）
  - **注意事項**：
    - 對於需要密碼的 sudo，需要設定 `--sudoPassword`
    - 如果不需要或無法使用 sudo 存取，可以在啟動時傳遞 `--disableSudo` 旗標來停用
    - 對於持久的 root 存取，考慮使用 `--suPassword` 來建立 root shell
    - 如果伺服器使用 `--disableSudo` 啟動，此工具將完全無法使用
  - **逾時設定**：
    - 逾時透過命令列參數 `--timeout` 設定（毫秒）
    - 預設逾時：60000ms（1 分鐘）
    - 當指令逾時時，伺服器會在關閉連線前自動嘗試中止執行中的處理程序
  - **最大指令長度設定**：
    - 最大指令字元數透過 `--maxChars` 設定
    - 預設：`1000`
    - 無限制模式：設定 `--maxChars=none` 或任何 `<= 0` 的值（例如 `--maxChars=0`）

## 安裝

1. **克隆儲存庫**：
   ```bash
   git clone https://github.com/tufantunc/ssh-mcp.git
   cd ssh-mcp
   ```
2. **安裝依賴項**：
   ```bash
   npm install
   ```

## 客戶端設定

你可以設定你的 IDE 或 LLM（如 Cursor、Windsurf、Claude Desktop）來使用此 MCP 伺服器。

**必要參數**：
- `host`：Linux 或 Windows 伺服器的主機名稱或 IP
- `user`：SSH 使用者名稱

**選用參數**：
- `port`：SSH 連接埠（預設：22）
- `password`：SSH 密碼（或使用 `key` 進行金鑰式認證）
- `key`：私人 SSH 金鑰的路徑
- `sudoPassword`：sudo 提權的密碼（執行 sudo 指令時）
- `suPassword`：su 提權的密碼（當你需要持久的 root shell 時）
- `timeout`：指令執行逾時時間，以毫秒為單位（預設：60000ms = 1 分鐘）
- `maxChars`：`command` 輸入的最大允許字元數（預設：1000）。使用 `none` 或 `0` 停用限制。
- `disableSudo`：完全停用 `sudo-exec` 工具的旗標。當不需要或無法使用 sudo 存取時很有用。
- `commandWhitelist`：允許的指令模式逗號分隔列表（支援正則表達式）。只有符合這些模式的指令才會被允許。
- `commandBlacklist`：被封鎖的指令模式逗號分隔列表（支援正則表達式）。符合這些模式的指令將被封鎖。

```commandline
{
    "mcpServers": {
        "ssh-mcp": {
            "command": "npx",
            "args": [
                "ssh-mcp",
                "-y",
                "--",
                "--host=1.2.3.4",
                "--port=22",
                "--user=root",
                "--password=pass",
                "--key=path/to/key",
                "--timeout=30000",
                "--maxChars=none"
            ]
        }
    }
}
```

### Claude Code

你可以使用 `claude mcp add` 命令將此 MCP 伺服器新增到 Claude Code。這是 Claude Code 的推薦方法。

**基本安裝**：

```bash
claude mcp add --transport stdio ssh-mcp -- npx -y ssh-mcp -- --host=YOUR_HOST --user=YOUR_USER --password=YOUR_PASSWORD
```

**安裝範例**：

**使用密碼認證**：
```bash
claude mcp add --transport stdio ssh-mcp -- npx -y ssh-mcp -- --host=192.168.1.100 --port=22 --user=admin --password=your_password
```

**使用 SSH 金鑰認證**：
```bash
claude mcp add --transport stdio ssh-mcp -- npx -y ssh-mcp -- --host=example.com --user=root --key=/path/to/private/key
```

**自訂逾時和無字元限制**：
```bash
claude mcp add --transport stdio ssh-mcp -- npx -y ssh-mcp -- --host=192.168.1.100 --user=admin --password=your_password --timeout=120000 --maxChars=none
```

**支援 Sudo 和 Su**：
```bash
claude mcp add --transport stdio ssh-mcp -- npx -y ssh-mcp -- --host=192.168.1.100 --user=admin --password=your_password --sudoPassword=sudo_pass --suPassword=root_pass
```

**使用環境變數（建議，更安全）**：
```bash
export SSH_HOST=192.168.1.100
export SSH_USER=admin
export SSH_PASSWORD=your_password
export SSH_SUDO_PASSWORD=sudo_pass
export SSH_COMMAND_WHITELIST="ls,cat,grep,docker"
claude mcp add --transport stdio ssh-mcp -- npx -y ssh-mcp
```

**使用指令白名單**：
```bash
claude mcp add --transport stdio ssh-mcp -- npx -y ssh-mcp -- --host=192.168.1.100 --user=admin --password=your_password --commandWhitelist="^ls.*,cat.*,grep.*"
```

**使用指令黑名單**：
```bash
claude mcp add --transport stdio ssh-mcp -- npx -y ssh-mcp -- --host=192.168.1.100 --user=admin --password=your_password --commandBlacklist="rm,shutdown,reboot,sudo"
```

**安裝範圍**：

你可以在新增伺服器時指定範圍：

- **本地範圍**（預設）：在目前專案中個人使用
  ```bash
  claude mcp add --transport stdio ssh-mcp --scope local -- npx -y ssh-mcp -- --host=YOUR_HOST --user=YOUR_USER --password=YOUR_PASSWORD
  ```

- **專案範圍**：透過 `.mcp.json` 檔案與你的團隊分享
  ```bash
  claude mcp add --transport stdio ssh-mcp --scope project -- npx -y ssh-mcp -- --host=YOUR_HOST --user=YOUR_USER --password=YOUR_PASSWORD
  ```

- **使用者範圍**：在所有你的專案中可用
  ```bash
  claude mcp add --transport stdio ssh-mcp --scope user -- npx -y ssh-mcp -- --host=YOUR_HOST --user=YOUR_USER --password=YOUR_PASSWORD
  ```

**驗證安裝**：

新增伺服器後，重新啟動 Claude Code 並要求 Cascade 執行指令：
```
"你能在遠端伺服器上執行 'ls -la' 嗎？"
```

有關 Claude Code 中 MCP 的更多資訊，請參閱[官方文件](https://docs.claude.com/en/docs/claude-code/mcp)。

## 測試

你可以使用 [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) 對此 MCP 伺服器進行視覺化除錯。

```sh
npm run inspect
```

## 安全性最佳實踐

### 環境變數（建議）
為了更好的安全性，對敏感資料使用環境變數而不是命令列參數：

```bash
export SSH_HOST=your-server.com
export SSH_USER=your-username
export SSH_PASSWORD=your-password
export SSH_SUDO_PASSWORD=your-sudo-password
export SSH_SU_PASSWORD=your-su-password
export SSH_COMMAND_WHITELIST="ls,cat,grep,docker,^ps.*"
export SSH_COMMAND_BLACKLIST="rm,shutdown,reboot,sudo"
```

### 指令存取控制
- **白名單**：只允許特定指令或模式
  ```bash
  --commandWhitelist="ls,cat,grep,docker,^ps.*,^tail.*"
  ```
- **黑名單**：封鎖危險指令
  ```bash
  --commandBlacklist="rm,shutdown,reboot,sudo,dd,format"
  ```

### 審計日誌
所有指令執行都會以 JSON 格式記錄到 stderr：
```json
{"timestamp":"2024-01-01T12:00:00.000Z","level":"INFO","event":"command_execution","details":"{\"command\":\"ls -la\",\"tool\":\"exec\",\"user\":\"admin\",\"host\":\"server.com\"}"}
```

### 密碼安全性
- 密碼在傳輸時會進行 base64 編碼以避免 shell 注入
- 錯誤訊息會被清理以防止資訊洩漏
- 考慮使用 SSH 金鑰而不是密碼以獲得更好的安全性

## 免責聲明

SSH MCP 伺服器在 [MIT 授權](./LICENSE) 下提供。使用風險自負。此專案不隸屬於或得到任何 SSH 或 MCP 提供者的認可或支持。

## 貢獻

我們歡迎貢獻！請參閱我們的[貢獻指南](./CONTRIBUTING.md)了解更多資訊。

## 行為準則

此專案遵循[行為準則](./CODE_OF_CONDUCT.md)以確保對每個人都有友善的環境。

## 支援

如果你覺得 SSH MCP 伺服器有幫助，請考慮給儲存庫星標或貢獻！歡迎 Pull request 和回饋。
