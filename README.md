# 勤怠管理メール作成アプリ

自社用出退勤メール作成アプリ

## 技術スタック

- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/) 5
- [Vite](https://vitejs.dev/) 6
- [React Bootstrap](https://react-bootstrap.netlify.app/) 2
- [React Router](https://reactrouter.com/) 7
- [date-fns](https://date-fns.org/) 3

## セットアップ

```bash
npm install
```

## 開発サーバー起動

```bash
npm start
```

ブラウザで [http://localhost:5173](http://localhost:5173) を開きます。

## ビルド

```bash
npm run build
```

`dist/` フォルダーに本番用ファイルが生成されます。

## ビルド結果のプレビュー

```bash
npm run preview
```

## プロジェクト構成

```
src/
├── components/
│   ├── Application.tsx      # 随時申請フォーム
│   ├── Applications.json    # 申請区分マスタデータ
│   ├── Attendance.tsx       # 出勤報告フォーム
│   ├── LeaveForm.tsx        # 退勤報告フォーム（前営業日モード兼用）
│   ├── Main.tsx             # タブ切り替えコンテナ
│   ├── MyNavbar.tsx         # ナビゲーションバー
│   ├── NotFound.tsx         # 404ページ
│   ├── Settings.tsx         # 設定画面
│   └── useSettings.tsx      # 設定値管理カスタムフック
├── utils/
│   ├── dateUtils.ts         # 日付フォーマット・営業日計算
│   └── mailUtils.ts         # mailto URL 組み立て
└── types.ts                 # 共通型定義
```
