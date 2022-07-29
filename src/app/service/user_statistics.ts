// Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>

import axios from "axios";

const st = new Date().toLocaleDateString();

// 此功能模块用于 MCSManager 用户数据统计，目的是了解现有日活数量与安装数量。
// 用户统计将不会发送任何隐私数据，用户数据，系统信息等。
// 详情参考：https://mcsmanager.com/agreement.html
async function statistics() {
  return await axios.get("http://statistics.mcsmanager.com/", {
    params: {
      st
    },
    timeout: 1000 * 10
  });
}

// 请求 24 小时内只有一次算有效统计，重复请求忽略不计
// 这里设置为 24 小时请求一次
setTimeout(async () => {
  try {
    return await statistics();
  } catch (error) {
    // ignore
  }
}, 1000 * 60 * 60 * 24);

// 面板启动时进行统计一次
statistics()
  .then(() => {})
  .catch(() => {});
