import { addBusinessDays, subBusinessDays } from "date-fns";

/**
 * Date を "YYYY-MM-DD" 形式の文字列に変換する
 */
export const convertDate = (date: Date): string =>
  date
    .toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replaceAll("/", "-");

/** 今日の日付 (YYYY-MM-DD) */
export const today = (): string => convertDate(new Date());

/** 翌営業日の日付 (YYYY-MM-DD) */
export const nextBusinessDay = (): string =>
  convertDate(addBusinessDays(new Date(), 1));

/** 前営業日の日付 (YYYY-MM-DD) */
export const prevBusinessDay = (): string =>
  convertDate(subBusinessDays(new Date(), 1));

/** 前営業日の翌営業日（= 今日相当, YYYY-MM-DD） */
export const nextOfPrevBusinessDay = (): string =>
  convertDate(addBusinessDays(subBusinessDays(new Date(), 1), 1));
