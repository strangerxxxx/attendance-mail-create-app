import { formatDateForMail } from "./mailUtils";

/** 随時申請で作成する勤務区分 */
export const WORK_APPLICATION_CLASS = "勤務申請";

/** 随時申請メールの件名 */
export const WORK_APPLICATION_SUBJECT = "【勤怠管理】随時申請";

/** 作業区分の間隔から法定分として除く時間（分） */
const STATUTORY_BREAK_MINUTES = 30;

export type WorkSpan = {
  start: string;
  end: string;
};

export type WorkApplicationSchedule = {
  startTime: string;
  endTime: string;
  /** 法定分を除く休憩時間。30分を超える間隔が無い場合は null */
  extraBreak: string | null;
};

type MinutesSpan = {
  start: number;
  end: number;
};

const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

export const parseTimeToMinutes = (value: string): number | null => {
  const match = TIME_PATTERN.exec(value);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return hours * 60 + minutes;
};

export const formatMinutesAsTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const toSpans = (works: WorkSpan[]): MinutesSpan[] =>
  works.flatMap((work) => {
    const start = parseTimeToMinutes(work.start);
    const end = parseTimeToMinutes(work.end);
    if (start === null || end === null || end < start) return [];
    return [{ start, end }];
  });

/**
 * 作業区分を時刻順にまとめ、出勤時刻・退勤時刻と法定分を除く休憩時間を求める。
 * 出勤時刻は最も早い開始時刻、退勤時刻は最も遅い終了時刻。
 * 重ならない作業区分の間隔ごとに、30分を超えた分を合算する。
 * どの間隔も30分以内なら休憩時間は不要。
 */
export const buildWorkApplicationSchedule = (
  works: WorkSpan[],
): WorkApplicationSchedule | null => {
  const spans = toSpans(works).sort(
    (a, b) => a.start - b.start || a.end - b.end,
  );
  if (spans.length === 0) return null;

  const merged: MinutesSpan[] = [];
  for (const span of spans) {
    const last = merged[merged.length - 1];
    if (!last || span.start > last.end) {
      merged.push({ ...span });
    } else {
      last.end = Math.max(last.end, span.end);
    }
  }

  let extraBreakMinutes = 0;
  for (let index = 1; index < merged.length; index += 1) {
    const gap = merged[index].start - merged[index - 1].end;
    if (gap > STATUTORY_BREAK_MINUTES) {
      extraBreakMinutes += gap - STATUTORY_BREAK_MINUTES;
    }
  }

  return {
    startTime: formatMinutesAsTime(merged[0].start),
    endTime: formatMinutesAsTime(merged[merged.length - 1].end),
    extraBreak:
      extraBreakMinutes > 0 ? formatMinutesAsTime(extraBreakMinutes) : null,
  };
};

/** 退勤報告の作業区分から、随時申請（勤務申請）の本文行を作る */
export const buildWorkApplicationBodyLines = (params: {
  date: string;
  works: WorkSpan[];
  cause: string;
  reason: string;
}): string[] => {
  const schedule = buildWorkApplicationSchedule(params.works);
  const lines = [`対象日:${formatDateForMail(params.date)}`];

  if (schedule) {
    lines.push(`出勤時刻:${schedule.startTime}`);
    lines.push(`退勤時刻:${schedule.endTime}`);
    if (schedule.extraBreak) {
      lines.push(`法定分を除く休憩時間:${schedule.extraBreak}`);
    }
  }

  lines.push(`勤務区分:${WORK_APPLICATION_CLASS}`);
  lines.push(`事由:${params.cause}`);
  lines.push(`内容:${params.reason}`);
  return lines;
};
