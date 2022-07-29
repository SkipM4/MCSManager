// Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>

import Router from "@koa/router";
import permission from "../../middleware/permission";
import validator from "../../middleware/validator";
import RemoteServiceSubsystem from "../../service/system_remote_service";
import RemoteRequest from "../../service/remote_command";
import { getUserUuid } from "../../service/passport_service";
import { isHaveInstanceByUuid } from "../../service/permission_service";
import { FILENAME_BLACKLIST } from "../../const";
import { $t } from "../../i18n";
const router = new Router({ prefix: "/protected_schedule" });

// 路由权限验证中间件
router.use(async (ctx, next) => {
  const instanceUuid = String(ctx.query.uuid);
  const serviceUuid = String(ctx.query.remote_uuid);
  const userUuid = getUserUuid(ctx);
  if (isHaveInstanceByUuid(userUuid, serviceUuid, instanceUuid)) {
    await next();
  } else {
    ctx.status = 403;
    ctx.body = $t("permission.forbiddenInstance");
  }
});

// [Low-level Permission]
// 获取计划任务列表
router.get(
  "/",
  permission({ level: 1 }),
  validator({ query: { remote_uuid: String, uuid: String } }),
  async (ctx) => {
    try {
      const serviceUuid = String(ctx.query.remote_uuid);
      const instanceUuid = String(ctx.query.uuid);
      const list = await new RemoteRequest(RemoteServiceSubsystem.getInstance(serviceUuid)).request(
        "schedule/list",
        {
          instanceUuid
        }
      );
      ctx.body = list;
    } catch (err) {
      ctx.body = err;
    }
  }
);

// [Low-level Permission]
// 创建计划任务
router.post(
  "/",
  permission({ level: 1 }),
  validator({
    query: { remote_uuid: String, uuid: String },
    body: { name: String, count: Number, time: String, action: String, type: Number }
  }),
  async (ctx) => {
    try {
      const serviceUuid = String(ctx.query.remote_uuid);
      const instanceUuid = String(ctx.query.uuid);
      const task = ctx.request.body;

      // 计划任务名需要文件名格式检查
      const name = String(task.name);
      FILENAME_BLACKLIST.forEach((ch) => {
        if (name.includes(ch)) throw new Error($t("router.schedule.invalidName"));
      });

      ctx.body = await new RemoteRequest(RemoteServiceSubsystem.getInstance(serviceUuid)).request(
        "schedule/register",
        {
          instanceUuid,
          name,
          count: Number(task.count),
          time: String(task.time),
          action: String(task.action),
          payload: String(task.payload),
          type: Number(task.type)
        }
      );
    } catch (err) {
      ctx.body = err;
    }
  }
);

// [Low-level Permission]
// 删除计划任务
router.delete(
  "/",
  permission({ level: 1 }),
  validator({ query: { remote_uuid: String, uuid: String } }),
  async (ctx) => {
    try {
      const serviceUuid = String(ctx.query.remote_uuid);
      const instanceUuid = String(ctx.query.uuid);
      const name = String(ctx.query.task_name);
      ctx.body = await new RemoteRequest(RemoteServiceSubsystem.getInstance(serviceUuid)).request(
        "schedule/delete",
        {
          instanceUuid,
          name
        }
      );
    } catch (err) {
      ctx.body = err;
    }
  }
);

export default router;
