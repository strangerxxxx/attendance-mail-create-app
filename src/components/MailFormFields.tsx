import type { ChangeEvent, ReactNode } from "react";
import { Form } from "react-bootstrap";

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

type MailPreviewProps = {
  text: string;
};

export function MailPreview({ text }: MailPreviewProps) {
  const rows = Math.max(4, text.split(/\r\n|\n/).length);
  return (
    <Form>
      <Form.Label htmlFor="formBodyPreview">メール本文プレビュー</Form.Label>
      <Form.Group className="mb-3" controlId="formBodyPreview">
        <Form.Control as="textarea" rows={rows} value={text} readOnly />
      </Form.Group>
    </Form>
  );
}
