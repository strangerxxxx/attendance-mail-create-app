import type { ChangeEvent, ReactNode } from "react";
import { Button, Form } from "react-bootstrap";
import { currentTime, today } from "../utils/dateUtils";

type EmailFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function EmailField({ value, onChange }: EmailFieldProps) {
  return (
    <Form.Group className="mb-3" controlId="formEmail">
      <Form.Label>メールアドレス</Form.Label>
      <Form.Control
        type="email"
        placeholder="メールアドレスを入力"
        value={value}
        autoComplete="email"
        onChange={(event) => onChange(event.target.value)}
      />
    </Form.Group>
  );
}

type IncludeFieldProps = {
  id: string;
  label: string;
  switchName: string;
  included: boolean;
  onToggle: (event: ChangeEvent<HTMLInputElement>) => void;
  children: ReactNode;
};

export function IncludeField({
  id,
  label,
  switchName,
  included,
  onToggle,
  children,
}: IncludeFieldProps) {
  return (
    <Form.Group className="mb-3 d-flex" controlId={`form-${id}`}>
      <Form.Check
        type="switch"
        name={switchName}
        checked={included}
        onChange={onToggle}
        aria-label={`${label}をメールに含める`}
      />
      <Form.Label className="col-sm-2">{label}</Form.Label>
      {children}
    </Form.Group>
  );
}

type DateTimeFieldProps = {
  type: string;
  name: string;
  value: string;
  disabled?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** 指定したとき、現在日付または現在時刻を入力するボタンを出す */
  current?: "date" | "time";
  onApplyCurrent?: (value: string) => void;
};

export function DateTimeField({
  type,
  name,
  value,
  disabled,
  onChange,
  current,
  onApplyCurrent,
}: DateTimeFieldProps) {
  const label = current === "date" ? "現在日付" : "現在時刻";
  return (
    <div className="d-flex flex-grow-1 align-items-center">
      <Form.Control
        type={type}
        name={name}
        disabled={disabled}
        value={value}
        onChange={onChange}
      />
      {current && onApplyCurrent && (
        <Button
          type="button"
          variant="outline-secondary"
          className="ms-2 text-nowrap"
          onClick={() =>
            onApplyCurrent(current === "date" ? today() : currentTime())
          }
        >
          {label}
        </Button>
      )}
    </div>
  );
}

type MailPreviewProps = {
  text: string;
  label?: string;
  controlId?: string;
};

export function MailPreview({
  text,
  label = "メール本文プレビュー",
  controlId = "formBodyPreview",
}: MailPreviewProps) {
  const rows = Math.max(4, text.split(/\r\n|\n/).length);
  return (
    <Form>
      <Form.Label htmlFor={controlId}>{label}</Form.Label>
      <Form.Group className="mb-3" controlId={controlId}>
        <Form.Control as="textarea" rows={rows} value={text} readOnly />
      </Form.Group>
    </Form>
  );
}
