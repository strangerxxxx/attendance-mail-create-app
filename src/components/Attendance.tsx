import { useState, useEffect, useMemo, type ChangeEvent } from "react";
import { Form, Button } from "react-bootstrap";
import useSettings from "./useSettings";
import { ValueItem } from "../types";
import { today } from "../utils/dateUtils";
import { buildMailtoUrl, extractMailBody, formatDateForMail } from "../utils/mailUtils";
import { EmailField, IncludeField, MailPreview } from "./MailFormFields";

type FormValues = {
  date: string;
  time: string;
  isDisableddate: boolean;
  isDisabledtime: boolean;
};

const fieldDefs: ValueItem<FormValues>[] = [
  { name: "出勤日", type: "date", field: "date", disabledField: "isDisableddate" },
  { name: "出勤時刻", type: "time", field: "time", disabledField: "isDisabledtime" },
];

function Attendance() {
  const [settingValue] = useSettings();

  const [email, setEmail] = useState(settingValue.email);
  const [formValues, setFormValues] = useState<FormValues>({
    date: today(),
    time: settingValue.starttime,
    isDisableddate: false,
    isDisabledtime: false,
  });

  useEffect(() => {
    setEmail(settingValue.email);
    setFormValues((prev) => ({ ...prev, time: settingValue.starttime }));
  }, [settingValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: !checked }));
  };

  const mailtoUrl = useMemo(() => {
    const bodyLines = fieldDefs
      .filter((item) => !formValues[item.disabledField])
      .map((item) =>
        `${item.name}:${formatDateForMail(String(formValues[item.field]))}`,
      );
    return buildMailtoUrl(email, "【勤怠管理】出勤自己報告", bodyLines);
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
            <Form.Control
              type={v.type}
              name={String(v.field)}
              disabled={formValues[v.disabledField]}
              value={String(formValues[v.field])}
              onChange={handleChange}
            />
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

export default Attendance;
