import { useState, useEffect, useMemo, type ChangeEvent } from "react";
import { Form, Button } from "react-bootstrap";
import useSettings from "./useSettings";
import { ValueItem } from "../types";
import { today, nextBusinessDay } from "../utils/dateUtils";
import { buildMailtoUrl, extractMailBody, formatDateForMail } from "../utils/mailUtils";
import { EmailField, IncludeField, MailPreview } from "./MailFormFields";
import applications from "./Applications.json";
import { WORK_APPLICATION_CLASS } from "../utils/workApplication";

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

const causeAndReasonForClass = (
  className: string,
  workcause: string,
  workreason: string,
) => {
  if (className === WORK_APPLICATION_CLASS) {
    return { cause: workcause, reason: workreason };
  }
  const selected = applications.find((app) => app.name === className);
  return {
    cause: selected?.cause ?? "",
    reason: selected?.reason ?? "",
  };
};

function Application() {
  const [settingValue] = useSettings();
  const initialClass = applications[0].name;

  const [email, setEmail] = useState(settingValue.email);
  const [formValues, setFormValues] = useState<FormValues>({
    date: today(),
    enddate: nextBusinessDay(),
    time: settingValue.starttime,
    endtime: settingValue.endtime,
    breaktime: "00:00",
    class: initialClass,
    ...causeAndReasonForClass(
      initialClass,
      settingValue.workcause,
      settingValue.workreason,
    ),
    isDisableddate: false,
    isDisabledenddate: true,
    isDisabledtime: true,
    isDisabledendtime: true,
    isDisabledbreaktime: true,
    isDisabledclass: false,
    isDisabledcause: false,
    isDisabledreason: false,
  });

  useEffect(() => {
    setEmail(settingValue.email);
    setFormValues((prev) => ({
      ...prev,
      time: settingValue.starttime,
      endtime: settingValue.endtime,
      ...(prev.class === WORK_APPLICATION_CLASS
        ? causeAndReasonForClass(
            prev.class,
            settingValue.workcause,
            settingValue.workreason,
          )
        : {}),
    }));
  }, [settingValue]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: !checked }));
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setFormValues((prev) => ({
      ...prev,
      class: selectedName,
      ...causeAndReasonForClass(
        selectedName,
        settingValue.workcause,
        settingValue.workreason,
      ),
    }));
  };

  const mailtoUrl = useMemo(() => {
    const bodyLines = fieldDefs
      .filter((item) => !formValues[item.disabledField])
      .map((item) =>
        `${item.name}:${formatDateForMail(String(formValues[item.field]))}`,
      );
    return buildMailtoUrl(email, "【勤怠管理】随時申請", bodyLines);
  }, [email, formValues]);

  return (
    <div>
      <Form>
        <EmailField value={email} onChange={setEmail} />

        {fieldDefs.map((v) => (
          <IncludeField
            key={v.field}
            id={String(v.field)}
            label={v.name}
            switchName={String(v.disabledField)}
            included={!formValues[v.disabledField]}
            onToggle={handleCheckboxChange}
          >
            {v.type === "select" ? (
              <Form.Select
                name={String(v.field)}
                disabled={formValues[v.disabledField]}
                value={String(formValues[v.field])}
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
                name={String(v.field)}
                disabled={formValues[v.disabledField]}
                value={String(formValues[v.field])}
                onChange={handleChange}
              />
            )}
          </IncludeField>
        ))}
      </Form>

      <Button className="mb-3" href={mailtoUrl} variant="primary">
        メール作成
      </Button>

      <MailPreview text={extractMailBody(mailtoUrl)} />
    </div>
  );
}

export default Application;
