const LINE_BREAK = "%0D%0A";

/**
 * mailto: URL を組み立てる
 * @param email 宛先メールアドレス
 * @param subject メール件名
 * @param bodyLines 本文の各行（配列で渡すと改行で結合される）
 * @returns mailto: URL 文字列
 */
export const buildMailtoUrl = (
  email: string,
  subject: string,
  bodyLines: string[],
): string => {
  const body = bodyLines.join(LINE_BREAK);
  return `mailto:${email}?subject=${subject}&body=${body}`;
};

/**
 * mailto: URL からプレビュー用の本文テキストを取り出す
 */
export const extractMailBody = (mailtoUrl: string): string => {
  const marker = "body=";
  const idx = mailtoUrl.indexOf(marker);
  if (idx === -1) return "";
  return mailtoUrl.slice(idx + marker.length).replaceAll(LINE_BREAK, "\r\n");
};

/**
 * "YYYY-MM-DD" 形式の日付文字列を "YYYY/MM/DD" に変換する
 * （メール本文用）
 */
export const formatDateForMail = (value: string): string =>
  value.replaceAll("-", "/");
