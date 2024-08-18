import { useState, useEffect } from "react";

// 設定の型定義
type SettingValuesType = {
  email: string;
  starttime: string;
  endtime: string;
  projectcode: string;
};

// 初期値の設定
const defaultSettings: SettingValuesType = {
  email: "example@example.com",
  starttime: "09:00",
  endtime: "17:30",
  projectcode: "",
};

const useSettings = () => {
  // ローカルストレージから設定値を取得
  const storedSettings = localStorage.getItem("kintaiSettingValue");
  let initialSettings: SettingValuesType;

  try {
    initialSettings = storedSettings
      ? JSON.parse(storedSettings)
      : defaultSettings;
  } catch (error) {
    console.error("Error parsing stored settings:", error);
    initialSettings = defaultSettings;
  }

  // 状態を初期化
  const [settingValue, setSettingValues] =
    useState<SettingValuesType>(initialSettings);

  useEffect(() => {
    localStorage.setItem("kintaiSettingValue", JSON.stringify(settingValue));
  }, [settingValue]);

  return [settingValue, setSettingValues] as const;
};

export default useSettings;
