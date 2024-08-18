import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { addBusinessDays } from "date-fns";
import applications from "./Applications.json";
import useSettings from "./useSettings";

function Attendance() {
  const [settingValue] = useSettings();

  const convertDate = (date: Date) =>
    date
      .toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replaceAll("/", "-");

  const today = convertDate(new Date());
  const tomorrow = convertDate(addBusinessDays(new Date(), 1));

  const [email, setEmail] = useState("");
  const [value, setValue] = useState({
    date: today,
    enddate: tomorrow,
    time: "",
    endtime: "",
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

  useEffect(() => {
    setEmail(settingValue.email);
    setValue((prevValue) => ({
      ...prevValue,
      time: settingValue.starttime,
      endtime: settingValue.endtime,
    }));
  }, [settingValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValue((prevValue) => ({ ...prevValue, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setValue((prevValue) => ({ ...prevValue, [name]: !checked }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const selectedApplication = applications.find(
      (app) => app.name === selectedName
    );
    setValue((prevValue) => ({
      ...prevValue,
      class: selectedName,
      cause: selectedApplication?.cause || "",
      reason: selectedApplication?.reason || "",
    }));
  };

  type ValueItem = {
    name: string;
    type: string;
    field: keyof typeof value;
    disabledField: keyof typeof value;
    options?: string[];
  };
  const classes = applications.map((item) => item.name);

  const values: ValueItem[] = [
    {
      name: "対象日",
      type: "date",
      field: "date",
      disabledField: "isDisableddate",
    },
    {
      name: "終了日",
      type: "date",
      field: "enddate",
      disabledField: "isDisabledenddate",
    },
    {
      name: "出勤時刻",
      type: "time",
      field: "time",
      disabledField: "isDisabledtime",
    },
    {
      name: "退勤時刻",
      type: "time",
      field: "endtime",
      disabledField: "isDisabledendtime",
    },
    {
      name: "法定分を除く休憩時間",
      type: "time",
      field: "breaktime",
      disabledField: "isDisabledbreaktime",
    },
    {
      name: "勤務区分",
      type: "select",
      field: "class",
      disabledField: "isDisabledclass",
      options: classes,
    },
    {
      name: "事由",
      type: "text",
      field: "cause",
      disabledField: "isDisabledcause",
    },
    {
      name: "内容",
      type: "text",
      field: "reason",
      disabledField: "isDisabledreason",
    },
  ];

  const mailbody = () => {
    const bodyContent = values
      .filter((item) => !value[item.disabledField])
      .map((item) => `${item.name}:${value[item.field]}`)
      .join("%0D%0A")
      .replaceAll("-", "/");

    return `mailto:${email}?subject=【勤怠管理】随時申請&body=${bodyContent}`;
  };

  return (
    <div className="Attendance">
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

        {values.map((v, index) => (
          <Form.Group
            className="mb-3 d-flex"
            controlId={`form${index}`}
            key={index}
          >
            <Form.Check
              type="switch"
              name={v.disabledField as string}
              checked={!value[v.disabledField] as boolean}
              onChange={handleCheckboxChange}
            />
            <Form.Label className="col-sm-2">{v.name}</Form.Label>
            {v.type === "select" ? (
              <Form.Select
                name={v.field as string}
                disabled={value[v.disabledField] as boolean}
                value={value[v.field] as string}
                onChange={handleSelectChange}
              >
                {v.options?.map((option, idx) => (
                  <option key={idx} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
            ) : (
              <Form.Control
                type={v.type}
                name={v.field as string}
                disabled={value[v.disabledField] as boolean}
                value={value[v.field] as string}
                onChange={handleChange}
              />
            )}
          </Form.Group>
        ))}
      </Form>

      <Button className="mb-3" href={mailbody()} variant="primary">
        メール作成
      </Button>

      <Form>
        <Form.Label className="col-sm-2">メール本文プレビュー</Form.Label>
        <Form.Group className="mb-3" controlId="formBody">
          <Form.Control
            as="textarea"
            type="text"
            key="body"
            rows={mailbody().split("%0D%0A").length}
            value={mailbody()
              .replaceAll("%0D%0A", "\r\n")
              .slice(mailbody().indexOf("body=") + 5)}
            disabled
          />
        </Form.Group>
      </Form>
    </div>
  );
}

export default Attendance;
