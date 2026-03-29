# 阿里云 Docker 部署指南

## 📋 目录

1. [部署架构](#部署架构)
2. [前置准备](#前置准备)
3. [部署步骤](#部署步骤)
4. [环境变量配置](#环境变量配置)
5. [数据库配置](#数据库配置)
6. [OSS 配置](#oss 配置)
7. [域名和 HTTPS](#域名和 https)
8. [监控和日志](#监控和日志)
9. [故障排查](#故障排查)

---

## 部署架构

### 推荐架构（阿里云 ECS + Docker）

```
┌─────────────────────────────────────────────────┐
│              阿里云 ECS 实例                      │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │         Docker Compose                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌───────┐ │   │
│  │  │  Nginx   │  │   API    │  │  DB   │ │   │
│  │  │  :80     │  │  :8080   │  │ :5432 │ │   │
│  │  │ (前端)   │  │ (后端)   │  │(数据库)│ │   │
│  │  └──────────┘  └──────────┘  └───────┘ │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
           ▲
           │
           │ HTTPS (443)
           │
    ┌──────────────┐
    │  阿里云 SLB   │ (可选 - 负载均衡)
    └──────────────┘
           ▲
           │
    ┌──────────────┐
    │  域名解析     │
    │ machrio.com  │
    └──────────────┘
```

### 组件说明

| 组件 | 镜像 | 端口 | 说明 |
|------|------|------|------|
| 前端 | nginx:alpine | 80 | 静态文件服务 |
| 后端 | eclipse-temurin:21-jre | 8080 | Spring Boot API |
| 数据库 | postgres:15-alpine | 5432 | PostgreSQL 数据库 |

---

## 前置准备

### 1. 阿里云账号准备

- [x] 注册阿里云账号
- [x] 完成实名认证
- [x] 确保账户有足够余额

### 2. 创建 ECS 实例

**推荐配置**（生产环境）:
- **地域**: 华东 1（杭州）或 华北 2（北京）
- **实例规格**: ecs.c6.large (2 核 4GB) 或更高
- **操作系统**: Alibaba Cloud Linux 3 或 Ubuntu 22.04
- **存储**: 40GB ESSD 云盘
- **网络**: VPC 专有网络
- **安全组**: 开放 80, 443, 22 端口

**最小配置**（测试环境）:
- **实例规格**: ecs.t6-c1m2.large (2 核 2GB)
- **存储**: 20GB 高效云盘

### 3. 创建 RDS PostgreSQL（可选 - 推荐）

**为什么不使用容器运行数据库？**
- ✅ 数据持久化更安全
- ✅ 自动备份和恢复
- ✅ 高可用架构
- ✅ 性能监控

**RDS 配置**:
- **版本**: PostgreSQL 15
- **规格**: 2 核 4GB 高可用版
- **存储**: 50GB ESSD
- **白名单**: 添加 ECS 实例 IP

### 4. 配置 OSS（可选）

- **Bucket 名称**: machrio-admin
- **地域**: 与 ECS 相同地域
- **权限**: 私有读写
- **CDN**: 可选配

---

## 部署步骤

### 步骤 1: 连接 ECS 实例

```bash
# 使用 SSH 连接
ssh root@your-ecs-public-ip

# 或使用阿里云 Workbench
# https://ecs.console.aliyun.com/#/workbench
```

### 步骤 2: 安装 Docker 和 Docker Compose

```bash
# 更新系统包
sudo yum update -y  # Alibaba Cloud Linux / CentOS
# 或
sudo apt update -y  # Ubuntu

# 安装 Docker
curl -fsSL https://get.docker.com | bash -s docker

# 启动 Docker
sudo systemctl enable docker
sudo systemctl start docker

# 验证安装
docker --version
docker compose version

# 添加当前用户到 docker 组（可选）
sudo usermod -aG docker $USER
```

### 步骤 3: 上传代码到 ECS

**方法 A: 使用 Git**

```bash
# 克隆仓库
cd /opt
git clone https://github.com/ryan823-dev/machrio-admin.git
cd machrio-admin

# 或使用阿里云 Codeup
# git clone https://codeup.aliyun.com/your-repo.git
```

**方法 B: 使用 SCP**

```bash
# 在本地执行
tar -czf machrio-admin.tar.gz machrio-admin
scp machrio-admin.tar.gz root@your-ecs-ip:/opt/

# 在 ECS 上解压
cd /opt
tar -xzf machrio-admin.tar.gz
```

**方法 C: 使用阿里云 OSS 中转**

```bash
# 1. 本地上传到 OSS
ossutil cp -r machrio-admin oss://your-bucket/deployments/

# 2. ECS 下载
ossutil cp -r oss://your-bucket/deployments/machrio-admin /opt/
```

### 步骤 4: 配置环境变量

```bash
cd /opt/machrio-admin

# 创建 .env 文件
cat > .env << EOF
# 数据库配置
DB_PASSWORD=your-strong-password-here

# JWT 配置
JWT_SECRET=your-super-secret-production-key-change-this-please

# CORS 配置
CORS_ORIGINS=https://admin.machrio.com,https://machrio.com

# OSS 配置
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_BUCKET=machrio-admin

# 前端 API 地址
VITE_API_URL=https://api.machrio.com/api
EOF

# 设置权限
chmod 600 .env
```

### 步骤 5: 启动服务

```bash
# 使用 Docker Compose 启动
docker compose up -d

# 查看启动日志
docker compose logs -f

# 检查服务状态
docker compose ps
```

### 步骤 6: 验证部署

```bash
# 测试后端健康检查
curl http://localhost:8080/actuator/health

# 测试前端
curl http://localhost:80

# 查看 API 日志
docker compose logs api

# 查看数据库日志
docker compose logs db
```

---

## 环境变量配置

### 必需的环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DB_PASSWORD` | 数据库密码 | `StrongP@ssw0rd123` |
| `JWT_SECRET` | JWT 密钥（至少 32 字符） | `your-super-secret-key...` |
| `CORS_ORIGINS` | 允许的域名（逗号分隔） | `https://admin.machrio.com` |
| `OSS_ACCESS_KEY_ID` | 阿里云 AccessKey ID | `LTAI5t...` |
| `OSS_ACCESS_KEY_SECRET` | 阿里云 AccessKey Secret | `your-secret-key` |
| `VITE_API_URL` | 前端 API 地址 | `https://api.machrio.com/api` |

### 可选的环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `OSS_ENDPOINT` | OSS 端点 | `https://oss-cn-hangzhou.aliyuncs.com` |
| `OSS_BUCKET` | OSS Bucket 名称 | `vertax` |
| `LOG_LEVEL_APP` | 应用日志级别 | `INFO` |

### 获取阿里云 AccessKey

1. 访问 https://ram.console.aliyun.com/
2. 创建 RAM 用户（建议使用子账号）
3. 授予 OSS 相关权限
4. 创建 AccessKey

**推荐权限策略**:
```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "oss:GetObject",
        "oss:PutObject",
        "oss:DeleteObject",
        "oss:ListObjects"
      ],
      "Resource": [
        "acs:oss:*:*:machrio-admin/*"
      ]
    }
  ]
}
```

---

## 数据库配置

### 方案 A: 使用阿里云 RDS（推荐）

**优点**:
- ✅ 自动备份和恢复
- ✅ 高可用架构（主从复制）
- ✅ 性能监控和告警
- ✅ 自动升级和补丁

**配置步骤**:

1. **创建 RDS 实例**
   ```bash
   # 阿里云控制台 -> RDS -> 创建实例
   ```

2. **设置白名单**
   ```bash
   # 添加 ECS 实例 IP 到 RDS 白名单
   # RDS 控制台 -> 白名单设置 -> 添加 ECS 内网 IP
   ```

3. **创建数据库**
   ```sql
   -- RDS 控制台 -> 数据库管理 -> 创建数据库
   -- 数据库名：machrio_admin
   -- 字符集：UTF8
   ```

4. **修改 docker-compose.yml**
   ```yaml
   services:
     api:
       environment:
         - SPRING_DATASOURCE_URL=jdbc:postgresql://your-rds-endpoint:5432/machrio_admin
         - SPRING_DATASOURCE_USERNAME=your-rds-user
         - SPRING_DATASOURCE_PASSWORD=your-rds-password
   ```

5. **移除 db 服务**
   ```yaml
   # 注释或删除 db 服务
   # db:
   #   image: postgres:15-alpine
   #   ...
   ```

### 方案 B: 使用 Docker 容器

**优点**:
- ✅ 成本低
- ✅ 部署简单

**缺点**:
- ❌ 需要自己管理备份
- ❌ 数据持久化依赖卷

**配置**:
```yaml
# docker-compose.yml 已配置好
volumes:
  - postgres_data:/var/lib/postgresql/data
```

**备份脚本**:
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker exec machrio-admin-db pg_dump -U postgres machrio_admin > $BACKUP_DIR/backup_$DATE.sql

# 保留最近 7 天的备份
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

**设置定时任务**:
```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /opt/machrio-admin/backup.sh
```

---

## OSS 配置

### 创建 Bucket

1. 访问 https://oss.console.aliyun.com/
2. 创建 Bucket
   - **名称**: machrio-admin
   - **地域**: 与 ECS 相同
   - **读写权限**: 私有
   - **存储类型**: 标准存储

### 获取凭证

```bash
# 在 RAM 控制台创建 AccessKey
# https://ram.console.aliyun.com/manage/ak
```

### 配置到环境变量

```bash
# .env 文件
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_ACCESS_KEY_ID=LTAI5txxxxxxx
OSS_ACCESS_KEY_SECRET=xxxxxxxxxxxxxxxx
OSS_BUCKET=machrio-admin
```

### 测试 OSS 连接

```bash
# 安装 ossutil
wget https://gosspublic.alicdn.com/ossutil/1.7.19/ossutil64
chmod +x ossutil64
./ossutil64 config

# 测试上传
./ossutil64 cp test.txt oss://machrio-admin/test.txt
```

---

## 域名和 HTTPS

### 配置域名解析

1. **在 DNS 服务商添加记录**
   ```
   类型：A
   主机记录：admin
   记录值：your-ecs-public-ip
   TTL: 10 分钟
   ```

2. **验证解析**
   ```bash
   ping admin.machrio.com
   ```

### 申请 SSL 证书

**方案 A: 阿里云 SSL 证书（免费）**

1. 访问 https://yundun.console.aliyun.com/?p=cas
2. 购买免费 SSL 证书（DV）
3. 填写域名：admin.machrio.com
4. 验证域名所有权
5. 下载证书（Nginx 格式）

**方案 B: Let's Encrypt（免费）**

```bash
# 安装 Certbot
sudo yum install certbot python3-certbot-nginx -y

# 申请证书
sudo certbot --nginx -d admin.machrio.com

# 自动续期
sudo certbot renew --dry-run
```

### 配置 Nginx 反向代理

```nginx
# /etc/nginx/conf.d/machrio-admin.conf
server {
    listen 80;
    server_name admin.machrio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.machrio.com;

    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/admin.machrio.com.crt;
    ssl_certificate_key /etc/nginx/ssl/admin.machrio.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 前端
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 重启 Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 监控和日志

### Docker 日志管理

```bash
# 查看实时日志
docker compose logs -f api

# 查看最近 100 行
docker compose logs --tail=100 api

# 查看特定时间范围
docker compose logs --since="2024-01-01T00:00:00" api
```

### 阿里云监控集成

**安装云监控插件**:

```bash
# 下载插件
wget http://cms-agent.oss-cn-beijing.aliyuncs.com/release/latest/cms-monitor-agent.tar.gz

# 解压安装
tar -xzf cms-monitor-agent.tar.gz
cd CmsMonitorAgent
sudo bash install.sh
```

**配置监控告警**:
1. 访问 https://cms.console.aliyun.com/
2. 创建监控告警规则
   - CPU 使用率 > 80%
   - 内存使用率 > 85%
   - 磁盘使用率 > 80%
3. 设置通知方式（短信、邮件、钉钉）

### 日志服务 SLS（可选）

```bash
# 安装 Logtail
wget http://logtail-release.oss-cn-hangzhou.aliyuncs.com/linux64/logtail.sh
chmod +x logtail.sh
sudo bash logtail.sh install your-project-id your-region
```

---

## 故障排查

### 常见问题

#### 1. 容器启动失败

```bash
# 查看容器状态
docker compose ps

# 查看详细日志
docker compose logs api

# 常见原因:
# - 数据库连接失败
# - 端口被占用
# - 环境变量缺失
```

**解决方案**:
```bash
# 检查端口
netstat -tulpn | grep 8080

# 检查环境变量
docker compose config

# 重新创建容器
docker compose down
docker compose up -d --force-recreate
```

#### 2. 数据库连接失败

```bash
# 测试数据库连接
docker exec -it machrio-admin-db psql -U postgres -d machrio_admin

# 查看数据库日志
docker compose logs db

# 检查网络
docker network inspect machrio-admin_machrio-network
```

#### 3. CORS 错误

**症状**: 前端请求被浏览器拦截

**解决方案**:
```bash
# 检查 CORS 配置
docker compose exec api env | grep CORS

# 修改 .env 文件
CORS_ORIGINS=https://admin.machrio.com,https://machrio.com

# 重启服务
docker compose restart api
```

#### 4. 内存不足

```bash
# 查看内存使用
free -h
docker stats

# 调整 JVM 参数
# docker-compose.yml
environment:
  - JAVA_TOOL_OPTIONS=-Xms256m -Xmx512m
```

#### 5. 磁盘空间不足

```bash
# 查看磁盘使用
df -h
docker system df

# 清理未使用的资源
docker system prune -a

# 清理日志
sudo truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

### 紧急联系信息

- **阿里云技术支持**: 95187
- **工单系统**: https://workorder.console.aliyun.com/
- **文档中心**: https://help.aliyun.com/

---

## 性能优化建议

### 1. 数据库优化

```sql
-- 添加索引（已包含在迁移脚本中）
CREATE INDEX idx_conversations_intent ON ai_conversations(intent_score DESC);
CREATE INDEX idx_conversations_product_interests ON ai_conversations USING GIN(product_interests);

-- 分析表
ANALYZE ai_conversations;
```

### 2. JVM 优化

```yaml
# docker-compose.yml
environment:
  - JAVA_TOOL_OPTIONS=-Xms512m -Xmx1g -XX:+UseG1GC -XX:MaxGCPauseMillis=200
```

### 3. Nginx 优化

```nginx
# 开启缓存
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m;

location /api {
    proxy_cache api_cache;
    proxy_cache_valid 200 10m;
}
```

### 4. CDN 加速

- 前端静态资源接入 CDN
- OSS 配置 CDN 加速域名

---

## 安全建议

### 1. 安全组配置

**最小开放端口**:
- ✅ 80 (HTTP) - 用于 HTTPS 重定向
- ✅ 443 (HTTPS) - 主要服务端口
- ✅ 22 (SSH) - 限制源 IP 访问

**不开放**:
- ❌ 8080 (API) - 内部访问
- ❌ 5432 (数据库) - 内部访问

### 2. 数据库安全

```sql
-- 创建只读用户用于备份
CREATE ROLE readonly WITH LOGIN PASSWORD 'strong-password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
```

### 3. 定期更新

```bash
# 定期更新系统包
sudo yum update -y

# 定期更新 Docker 镜像
docker compose pull
docker compose up -d
```

---

## 部署检查清单

### 部署前

- [ ] ECS 实例创建并配置好
- [ ] 安全组规则设置
- [ ] RDS 实例创建（如使用）
- [ ] OSS Bucket 创建
- [ ] 域名解析配置
- [ ] SSL 证书申请

### 部署中

- [ ] Docker 安装完成
- [ ] 代码上传到 ECS
- [ ] 环境变量配置
- [ ] docker-compose 启动
- [ ] 服务健康检查通过

### 部署后

- [ ] HTTPS 配置完成
- [ ] 监控告警设置
- [ ] 备份策略配置
- [ ] 日志收集配置
- [ ] 性能测试

---

## 版本更新流程

```bash
# 1. 拉取最新代码
cd /opt/machrio-admin
git pull origin main

# 2. 停止服务
docker compose down

# 3. 重新构建
docker compose build --no-cache

# 4. 启动服务
docker compose up -d

# 5. 查看日志
docker compose logs -f

# 6. 验证功能
curl https://admin.machrio.com/api/actuator/health
```

---

**文档版本**: 1.0  
**最后更新**: 2026-03-28  
**维护者**: Machrio Team
