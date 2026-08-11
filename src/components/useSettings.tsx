import { useState, useEffect } from "react";
import { SettingValuesType } from "../types";

const defaultSettings: SettingValuesType = {
  email: "example@example.com",
  starttime: "09:00",
  endtime: "17:30",
  projectcode: "",
};

const useSettings = () => {
  const storedSettings = localStorage.getItem("kintaiSettingValue");
  let initialSettings: SettingValuesType;

  try {
    initialSettings = storedSettings
      ? JSON.parse(storedSettings)
      : defaultSettings;
  } catch (error) {
    console.error("設定値の読み込みに失敗しました:", error);
    initialSettings = defaultSettings;
  }

  const [settingValue, setSettingValues] =
    useState<SettingValuesType>(initialSettings);

  useEffect(() => {
    localStorage.setItem("kintaiSettingValue", JSON.stringify(settingValue));
  }, [settingValue]);

  return [settingValue, setSettingValues] as const;
};

export default useSettings;
