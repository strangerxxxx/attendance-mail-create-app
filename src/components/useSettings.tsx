import { useState } from "react";
import { SettingValuesType } from "../types";

const STORAGE_KEY = "kintaiSettingValue";

const defaultSettings: SettingValuesType = {
  email: "example@example.com",
  starttime: "09:00",
  endtime: "17:30",
  projectcode: "",
};

const loadSettings = (): SettingValuesType => {
  try {
    const storedSettings = localStorage.getItem(STORAGE_KEY);
    if (!storedSettings) return defaultSettings;

    const parsed = JSON.parse(storedSettings) as Partial<SettingValuesType>;
    return { ...defaultSettings, ...parsed };
  } catch (error) {
    console.error("設定値の読み込みに失敗しました:", error);
    return defaultSettings;
  }
};

const useSettings = () => {
  const [settingValue, setSettingValues] =
    useState<SettingValuesType>(loadSettings);

  const saveSettings = (values: SettingValuesType = settingValue) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    setSettingValues(values);
  };

  return [settingValue, setSettingValues, saveSettings] as const;
};

export default useSettings;
