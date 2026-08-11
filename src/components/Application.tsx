import React, { useState, useEffect, useMemo } from "react";
import { Form, Button } from "react-bootstrap";
import useSettings from "./useSettings";
import { ValueItem } from "../types";
import { today, nextBusinessDay } from "../utils/dateUtils";
import { buildMailtoUrl, extractMailBody, formatDateForMail } from "../utils/mailUtils";
import applications from "./Applications.json";

type FormValues = {
  date: string;
  enddate: string;
  time: string;
  endtime: string;
  breaktime: string;
  class: string;
  cause: string;
  reason: string;
  isDisableddate: boolean;
  isDisabledenddate: boolean;
  isDisabledtime: boolean;
  isDisabledendtime: boolean;
  isDisabledbreaktime: boolean;
  isDisabledclass: boolean;
  isDisabledcause: boolean;
  isDisabledreason: boolean;
};

function Application() {
  const [settingValue] = useSettings();

  const [email, setEmail] = useState(settingValue.email);
  const [formValues, setFormValues] = useState<FormValues>({
    date: today(),
    enddate: nextBusinessDay(),
    time: settingValue.starttime,
    endtime: settingValue.endtime,
    breaktime: "00:00",
    class: applications[0].name,
    cause: applications[0].cause,
    reason: applications[0].reason,
    isDisableddate: false,
    isDisabledenddate: true,
    isDisabledtime: true,
    isDisabledendtime: true,
    isDisabledbreaktime: true,
    isDisabledclass: false,
    isDisabledcause: false,
    isDisabledreason: false,
  });

  // 設定変更時にメールアドレスと時刻を同期する
  useEffect(() => {
    setEmail(settingValue.email);
    setFormValues((prev) => ({
      ...prev,
      time: settingValue.starttime,
      endtime: settingValue.endtime,
    }));
  }, [settingValue]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    // スイッチ ON = フィールド有効 (isDisabled = false)
    setFormValues((prev) => ({ ...prev, [name]: !checked }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const selected = applications.find((app) => app.name === selectedName);
    setFormValues((prev) => ({
      ...prev,
      class: selectedName,
      cause: selected?.cause ?? "",
      reason: selected?.reason ?? "",
    }));
  };

  const classes = applications.map((item) => item.name);

  const fieldDefs: ValueItem<FormValues>[] = [
    { name: "対象日", type: "date", field: "date", disabledField: "isDisableddate" },
    { name: "終了日", type: "date", field: "enddate", disabledField: "isDisabledenddate" },
    { name: "出勤時刻", type: "time", field: "time", disabledField: "isDisabledtime" },
    { name: "退勤時刻", type: "time", field: "endtime", disabledField: "isDisabledendtime" },
    { name: "法定分を除く休憩時間", type: "time", field: "breaktime", disabledField: "isDisabledbreaktime" },
    { name: "勤務区分", type: "select", field: "class", disabledField: "isDisabledclass", options: classes },
    { name: "事由", type: "text", field: "cause", disabledField: "isDisabledcause" },
    { name: "内容", type: "text", field: "reason", disabledField: "isDisabledreason" },
  ];

  const mailtoUrl = useMemo(() => {
    const bodyLines = fieldDefs
      .filter((item) => !formValues[item.disabledField])
      .map((item) =>
        `${item.name}:${formatDateForMail(String(formValues[item.field]))}`,
      );
    return buildMailtoUrl(email, "【勤怠管理】随時申請", bodyLines);
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
            {v.type === "select" ? (
              <Form.Select
                name={v.field as string}
                disabled={isDisabled}
                value={formValues[v.field] as string}
                onChange={handleSelectChange}
              >
                {v.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
            ) : (
              <Form.Control
                type={v.type}
                name={v.field as string}
                disabled={isDisabled}
                value={formValues[v.field] as string}
                onChange={handleChange}
              />
            )}
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

export default Application;
