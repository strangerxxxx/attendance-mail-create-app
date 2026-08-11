import React, { useState, useEffect, useMemo } from "react";
import { Form, Button } from "react-bootstrap";
import useSettings from "./useSettings";
import { ValueItem } from "../types";
import { today } from "../utils/dateUtils";
import { buildMailtoUrl, extractMailBody, formatDateForMail } from "../utils/mailUtils";

type FormValues = {
  date: string;
  time: string;
  isDisableddate: boolean;
  isDisabledtime: boolean;
};

function Attendance() {
  const [settingValue] = useSettings();

  const [email, setEmail] = useState(settingValue.email);
  const [formValues, setFormValues] = useState<FormValues>({
    date: today(),
    time: settingValue.starttime,
    isDisableddate: false,
    isDisabledtime: false,
  });

  // 設定変更時にメールアドレスと出勤時刻を同期する
  useEffect(() => {
    setEmail(settingValue.email);
    setFormValues((prev) => ({ ...prev, time: settingValue.starttime }));
  }, [settingValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    // スイッチ ON = フィールド有効 (isDisabled = false)
    setFormValues((prev) => ({ ...prev, [name]: !checked }));
  };

  const fieldDefs: ValueItem<FormValues>[] = [
    { name: "出勤日", type: "date", field: "date", disabledField: "isDisableddate" },
    { name: "出勤時刻", type: "time", field: "time", disabledField: "isDisabledtime" },
  ];

  const mailtoUrl = useMemo(() => {
    const bodyLines = fieldDefs
      .filter((item) => !formValues[item.disabledField])
      .map((item) =>
        `${item.name}:${formatDateForMail(String(formValues[item.field]))}`,
      );
    return buildMailtoUrl(email, "【勤怠管理】出勤自己報告", bodyLines);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, formValues]);

  const previewText = extractMailBody(mailtoUrl);

  return (
    <div>
      <Form>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>メールアドレス</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        {fieldDefs.map((v) => {
          const isDisabled = formValues[v.disabledField] as boolean;
          return (
          <Form.Group
            className="mb-3 d-flex"
            controlId={`form-${v.field}`}
            key={v.field}
          >
            <Form.Check
              type="switch"
              name={v.disabledField as string}
              checked={!isDisabled}
              onChange={handleCheckboxChange}
            />
            <Form.Label className="col-sm-2">{v.name}</Form.Label>
            <Form.Control
              type={v.type}
              name={v.field as string}
              disabled={isDisabled}
              value={formValues[v.field] as string}
              onChange={handleChange}
            />
          </Form.Group>
          );
        })}
      </Form>

      <Button className="mb-3" href={mailtoUrl} variant="primary">
        メール作成
      </Button>

      <Form>
        <Form.Label>メール本文プレビュー</Form.Label>
        <Form.Group className="mb-3" controlId="formBodyPreview">
          <Form.Control
            as="textarea"
            rows={previewText.split("\r\n").length}
            value={previewText}
            readOnly
          />
        </Form.Group>
      </Form>
    </div>
  );
}

export default Attendance;
