/** 設定値の型 */
export type SettingValuesType = {
  email: string;
  starttime: string;
  endtime: string;
  projectcode: string;
};

/** フォームフィールド定義の共通型 */
export type ValueItem<T extends Record<string, unknown>> = {
  /** ラベル名 */
  name: string;
  /** input の type 属性 */
  type: string;
  /** 値を読み書きするフィールドキー */
  field: keyof T;
  /** 有効/無効フラグのフィールドキー */
  disabledField: keyof T;
  /** select の選択肢（type === "select" のとき使用） */
  options?: string[];
};

/** 作業区分フィールド定義の型 */
export type WorkValueItem<T extends Record<string, unknown>> = {
  /** ラベル名 */
  name: string;
  /** input の type 属性 */
  type: string;
  /** 値を読み書きするフィールドキー */
  field: keyof T;
};

/** 作業区分グループの型 */
export type WorkGroup<T extends Record<string, unknown>> = {
  id: number;
  workValues: T;
};
