// Copyright (C) 2022 MCSManager Team <mcsmanager-dev@outlook.com>

// 全局配置初始化

import SystemConfig from "./entity/setting";
import StorageSystem from "./common/system_storage";
import GlobalVariable from "./common/global_variable";

let systemConfig: SystemConfig = null;

// 系统持久化配置表
export function initSystemConfig() {
  systemConfig = StorageSystem.load("SystemConfig", SystemConfig, "config");
  if (!systemConfig) {
    systemConfig = new SystemConfig();
    StorageSystem.store("SystemConfig", "config", systemConfig);
  }
}

export function saveSystemConfig(_systemConfig: SystemConfig) {
  StorageSystem.store("SystemConfig", "config", _systemConfig);
}

export { systemConfig };
