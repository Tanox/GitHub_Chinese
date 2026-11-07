# 独立采集服务（自托管部署与接入）

> 适用版本：**v1.13.30** ｜ 维护者：Sut
> 本文件是「无浏览器 / serverless 采集」的**唯一权威文档**（对应任务 **W5** 决议：采用自托管 `server/collect-service` 作为无浏览器采集的替代路径）。分支 / 提交 / 编码 / 审查规范见 `docs/README.md` 索引，本文不重复。

---

## 1. 背景与定位（为什么需要它）

- Next.js 词典采集工作台部署在 serverless（EdgeOne / Vercel）等**无浏览器**运行时，而「批量 URL 采集 / 文本采集」依赖 `puppeteer-core`（需 Chrome / Edge 内核），无法在运行环境内启动浏览器。
- 解决方式：**将采集计算下沉到你自托管的、具备浏览器的机器上**，对外暴露为独立 HTTP 服务；Next 路由在配置 `COLLECT_SERVICE_URL` 后把采集请求代理给它，上游不可用 / 鉴权失败时**自动回退本地采集**（默认行为不变）。
- 该服务直接复用 `src/lib/collector-core` 的全部采集实现，**零额外核心开发**，仅作网络边界封装（Express + SSE）。这是 W5 决议中成本最低、风险最小的路径。

---

## 2. 架构与数据流

```
 浏览器 / 用户
      │  POST /api/collect | /api/batch-collect
      ▼
 Next.js 路由 (Node runtime，先经 api-guard 令牌+限流)
  src/app/api/collect/route.ts
  src/app/api/batch-collect/route.ts
      │  读取并校验请求体一次（原始字符串供代理、解析结果供回退）
      │
      ├─ 未配置 COLLECT_SERVICE_URL ──► 本地 collectFromUrls / processRawData
      │                                 （需运行环境有浏览器，serverless 下通常不可用）
      │
      └─ 已配置 COLLECT_SERVICE_URL ──► proxyCollectRequest
                                           │  POST ${COLLECT_SERVICE_URL}/api/{kind}
                                           │  透传上游 SSE 流；携带 Bearer（若配令牌）
                                           ▼
                                  自托管采集服务 (默认 :8787)
                                  server/collect-service/index.js
                                           │  复用 src/lib/collector-core
                                           ▼
                                      browser-pool → Chrome / Edge

  失败 / 401 / 无 body / 网络错误 / 客户端中断  ⇒  返回 null  ⇒  路由回退本地采集
```

---

## 3. 服务端部署（`server/collect-service`）

### 3.1 前置要求

- Node **≥ 22.22.2**（见 `package.json` `engines`）。
- 依赖已含：`express@^5`、`puppeteer-core@^25`（位于 `dependencies`，无需额外安装）。
- 一台**可用浏览器**：Chrome / Edge。`puppeteer-core` 不自带内核，自动探测失败时用 `PUPPETEER_EXECUTABLE_PATH` 指定（经 `src/lib/browser-resolver.js` 解析）。

### 3.2 启动

```bash
# 方式一：npm 脚本
npm run collect-service            # = node server/collect-service/index.js

# 方式二：自定义端口 / 令牌
COLLECT_SERVICE_PORT=8787 COLLECT_SERVICE_TOKEN='你的强令牌' node server/collect-service/index.js
```

### 3.3 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `COLLECT_SERVICE_PORT` | 否 | 监听端口，默认 `8787` |
| `COLLECT_SERVICE_TOKEN` | **公网必填** | 配置后 `/api/*` 要求 `Authorization: Bearer <token>`；`/health` 始终免鉴权；采用恒定时间比对，避免时序枚举 |
| `GITHUB_ZH_COOKIES` | 否 | 登录态 cookie 的 JSON 数组（T18），用于抓取需鉴权的私有页，例 `[{"name":"user_session","value":"xxx","domain":".github.com"}]`；也可由请求体 `cookies` 字段逐请求覆盖 |
| `PUPPETEER_EXECUTABLE_PATH` | 否 | 指定浏览器内核路径（自动探测失败时使用） |

### 3.4 接口契约

| 方法 | 路径 | 说明 | 请求体 |
|------|------|------|--------|
| `POST` | `/api/collect` | 文本采集，SSE 流式返回 | `{ "data": "<粘贴文本>" }` → `processRawData` |
| `POST` | `/api/batch-collect` | 批量 URL 采集，SSE 流式返回 | `{ "urls": ["https://…"], "cookies"?: [...] }` → `collectFromUrls` |
| `GET`  | `/health`  | 存活探测，**始终免鉴权** | 返回 `{ "ok": true }` |

> SSE 事件帧格式：`data: <JSON>\n\n`；采集过程按 `type` 区分 `log` / `progress` / `result` / `error`（与 Next 本地采集的 SSE 协议一致，前端无需区分来源）。

### 3.5 进程保活与反向代理（建议）

- **保活**：用 `pm2` / `systemd` / `docker` 守护进程，避免退出后采集全回退本地。
- **容器化注意**：镜像内需安装 Chromium（或挂载宿主浏览器），并设 `PUPPETEER_EXECUTABLE_PATH`；`puppeteer-core` 不会自动下载内核。
- **反代（nginx / caddy）**：仅暴露 `/api` 与 `/health`，开启 HTTPS，按需要限制来源 IP；`/health` 用于负载均衡探活。

---

## 4. Next 侧接入（工作台 / API 路由）

### 4.1 启用代理

在 Next 运行环境（EdgeOne / Vercel 环境变量面板）设置：

```bash
COLLECT_SERVICE_URL=https://your-collect-host:8787   # 非空即启用代理
COLLECT_SERVICE_TOKEN=你的强令牌                       # 与服务端成对配置
```

- `isCollectServiceEnabled()` 在 `COLLECT_SERVICE_URL` 非空时为真（`src/lib/collect-service-client.js`）。
- `proxyCollectRequest({ body, signal }, kind)` 将路由已读取的**原始 body 字符串** `POST` 到 `${COLLECT_SERVICE_URL}/api/${kind}`，并把上游 SSE 流原样透传回调用方。
- 未配置 / 上游非 2xx / 无响应体 / 网络错误 / 401 / 客户端中断 → 返回 `null` → 路由回退本地采集。**回退时调用方仍持有原始请求体**（body 读取已收敛到路由层，避免二次消费流），默认行为完全不变。

### 4.2 鉴权契约（成对配置，重点）

`server/collect-service` 与 Next 侧是**两条独立信任链**，令牌须成对：

1. 服务端设 `COLLECT_SERVICE_TOKEN` → `/api/*` 强制 Bearer 校验；
2. Next 侧设**同一个值**的 `COLLECT_SERVICE_TOKEN` → 客户端自动携带 `Authorization: Bearer <token>`。

| 配置情况 | 结果 |
|----------|------|
| 两端都未配置 | 默认开放（适合内网 / 本机；**公网务必配置令牌**） |
| 仅服务端配、客户端没带 | 上游 401 → 回退本地（可工作，但失去分流意义） |
| 仅客户端带、服务端没验 | 形同裸奔（服务端不校验） |
| 两端都配且一致 | 正确分流 + 鉴权 |

### 4.3 两层鉴权说明

Next 路由自身还有 `checkApiAccess`（`src/lib/api-guard`，令牌 + 限流，详见 `docs/architecture.md` 与 `docs/coding-style.md` §安全红线）。这是「**访问工作台 API**」的鉴权；而 `COLLECT_SERVICE_TOKEN` 是「**访问自托管采集服务**」的鉴权。二者独立，按需分别配置：即使工作台 API 开放，采集服务仍可单独加令牌；反之亦然。

---

## 5. 验证与排查

### 5.1 健康检查

```bash
curl https://your-collect-host:8787/health    # {"ok":true}
```

### 5.2 联调步骤

1. 本地起服务：`COLLECT_SERVICE_PORT=8787 npm run collect-service`；
2. Next 设 `COLLECT_SERVICE_URL=http://localhost:8787`（本机调试可不加令牌）；
3. 通过工作台发起一次采集，观察 Next 日志；未配置服务时应见本地采集日志，配置后应见上游透传。
4. 契约回归见 `tests/collect-service-client.test.mjs`（未启用直返 / 透传 / 非 2xx 回退 / 无 body 回退 / 网络错误回退 / 中断静默 / 令牌成对 / 401 回退）与 `tests/collect-service-auth.test.mjs`（`extractBearer` / `isTokenValid` 恒定时间 / `createTokenAuth` 401 与放行）。`npm test` 全量覆盖。

### 5.3 常见故障

| 现象 | 原因 | 处理 |
|------|------|------|
| 采集仍走本地 | `COLLECT_SERVICE_URL` 未设 / 服务不可达 / 401 | 核对环境变量；看 Next 日志 `采集服务代理失败，回退本地采集` |
| 401 后回退 | 两端 `COLLECT_SERVICE_TOKEN` 不一致 | 确保 Next 与服务端令牌**相同** |
| 服务启动报「无可用浏览器」 | 未探测到 Chrome / Edge | 安装浏览器或设 `PUPPETEER_EXECUTABLE_PATH` |
| 上游超时 | 采集任务重 / 网络差 | 采集服务与浏览器池已做并发槽位（2）与单批页并发（≤3）限制；可加 `AbortSignal` 超时 |

---

## 6. 安全建议

- **公网部署必须设 `COLLECT_SERVICE_TOKEN`**（恒定时间比对，避免令牌时序枚举）；未配置时 `/api/*` 完全开放。
- 反向代理开启 **HTTPS**，仅暴露 `/api` 与 `/health`，按来源 IP 限制；不要将 `/health` 之外的路径暴露到公网。
- 令牌与 `GITHUB_ZH_COOKIES` 属**敏感凭据**，勿提交进仓库；经环境变量 / 密钥管理（Vercel / EdgeOne Secrets、systemd EnvironmentFile、Docker secrets）注入。
- 服务复用 `collector-core`，同样受 `src/lib/url-guard` 的 **SSRF 防御**约束：传入 URL 须为合法公网 `http(s)`，拒绝内网 / 元数据地址。

---

> 相关代码：`server/collect-service/{index,auth}.js`、`src/lib/collect-service-client.js`、`src/app/api/{collect,batch-collect}/route.ts`、`src/lib/{collector-core,browser-resolver,browser-pool}.js`。
> W5 完整决策路径见 `docs/tasks.md`（已交付归档见 `docs/tasks-done.md`）。
