# Gmail 邮件发送配置指南

## 📧 快速开始

### 第 1 步：启用 Gmail 两步验证

1. 访问 [Google 账号安全设置](https://myaccount.google.com/security)
2. 找到「两步验证」并点击启用
3. 按照提示完成设置（通常需要手机验证）

### 第 2 步：生成应用专用密码

1. 访问 [应用专用密码页面](https://myaccount.google.com/apppasswords)
2. 如果看不到此选项，请确认已启用两步验证
3. 在「选择应用」下拉菜单中选择「邮件」
4. 在「选择设备」下拉菜单中选择「其他（自定义名称）」
5. 输入名称，例如：`MailFrame`
6. 点击「生成」
7. **复制生成的 16 位密码**（例如：`abcd efgh ijkl mnop`，去掉空格）

### 第 3 步：配置环境变量

1. 复制 `.env.example` 为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入你的信息：
   ```bash
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcdefghijklmnop  # 刚才生成的 16 位密码（去掉空格）
   MAIL_FROM=你的名字 <your-email@gmail.com>
   ```

### 第 4 步：重启应用

```bash
# 停止当前运行的服务（如果有）
# 然后重新启动
npm run dev
```
