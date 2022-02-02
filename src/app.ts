/*
  Copyright (C) 2022 Suwings(https://github.com/Suwings)

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  
  According to the GPL, it is forbidden to delete all copyright notices, 
  and if you modify the source code, you must open source the
  modified source code.

  版权所有 (C) 2022 Suwings(https://github.com/Suwings)

  本程序为自由软件，你可以依据 GPL 的条款（第三版或者更高），再分发和/或修改它。
  该程序以具有实际用途为目的发布，但是并不包含任何担保，
  也不包含基于特定商用或健康用途的默认担保。具体细节请查看 GPL 协议。

  根据协议，您必须保留所有版权声明，如果修改源码则必须开源修改后的源码。
  前往 https://mcsmanager.com/ 申请闭源开发授权或了解更多。
*/

// 程序启动入口文件

// 初始化版本管理器
import { initVersionManager, getVersion } from "./app/version";
initVersionManager();
const VERSION = getVersion();

// 显示产品标识
console.log(`______  _______________________  ___                                         
___   |/  /_  ____/_  ___/__   |/  /_____ _____________ _______ _____________
__  /|_/ /_  /    _____ \\__  /|_/ /_  __  /_  __ \\  __  /_  __  /  _ \\_  ___/
_  /  / / / /___  ____/ /_  /  / / / /_/ /_  / / / /_/ /_  /_/ //  __/  /    
/_/  /_/  \\____/  /____/ /_/  /_/  \\__,_/ /_/ /_/\\__,_/ _\\__, / \\___//_/     
                                                        /____/             
 + Released under the GPL-3.0 License
 + Copyright 2022 Suwings
 + Version ${VERSION}
`);

import Koa from "koa";
import { v4 } from "uuid";
import path from "path";
import koaBody from "koa-body";
import session from "koa-session";
import koaStatic from "koa-static";
import http from "http";

import { logger } from "./app/service/log";
import { middleware as protocolMiddleware } from "./app/middleware/protocol";

const BASE_PATH = __dirname;

// 装载全局配置文件
import { initSystemConfig, systemConfig } from "./app/setting";
initSystemConfig();

const app = new Koa();

app.use(
  koaBody({
    multipart: true,
    parsedMethods: ["POST", "PUT", "DELETE", "GET"]
  })
);

app.keys = [v4()];
app.use(
  session(
    {
      key: v4(),
      maxAge: 86400000,
      overwrite: true,
      httpOnly: true,
      signed: true,
      rolling: false,
      renew: false,
      secure: false
    },
    app
  )
);

// Http log and print
app.use(async (ctx, next) => {
  logger.info(`${ctx.ip} ${ctx.method} - ${ctx.URL.href}`);
  await next();
});

// Protocol middleware
app.use(protocolMiddleware);

// 静态文件路由
app.use(koaStatic(path.join(BASE_PATH, "public")));

// 装载所有路由
import { index } from "./app/index";
// Websocket 路由（暂无用）
// import SocketService from "./app/service/socket_service";
index(app);

// Error reporting
process.on("uncaughtException", function (err) {
  logger.error(`ERROR (uncaughtException):`, err);
});

// Error reporting
process.on("unhandledRejection", (reason, p) => {
  logger.error(`ERROR (unhandledRejection):`, reason, p);
});

// 启动 HTTP 服务
function startUp(port: number, host?: string) {
  const httpServer = http.createServer(app.callback());

  // 暂不需要 Socket 服务
  // SocketService.setUpSocketIO(httpServer);

  httpServer.listen(port, host);
  logger.info("================================");
  logger.info("控制面板端已启动");
  logger.info("项目参考: https://github.com/mcsmanager");
  logger.info(`访问地址: http://${host ? host : "localhost"}:${port}/`);
  logger.info(`软件公网访问需开放端口 ${port} 与守护进程端口`);
  logger.info("关闭此程序请使用 Ctrl+C 快捷键");
  logger.info("================================");


}

startUp(systemConfig.httpPort, systemConfig.httpIp);
