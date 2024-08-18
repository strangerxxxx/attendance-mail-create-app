import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
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

  const [email, setEmail] = useState("");
  const [value, setValue] = useState({
    date: today,
    time: "",
    isDisableddate: false,
    isDisabledtime: false,
  });

  useEffect(() => {
    setEmail(settingValue.email);
    setValue((prevValue) => ({
      ...prevValue,
      time: settingValue.starttime,
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
  type ValueItem = {
    name: string;
    type: string;
    field: keyof typeof value;
    disabledField: keyof typeof value;
  };

  const values: ValueItem[] = [
    {
      name: "出勤日",
      type: "date",
      field: "date",
      disabledField: "isDisableddate",
    },
    {
      name: "出勤時刻",
      type: "time",
      field: "time",
      disabledField: "isDisabledtime",
    },
  ];

  const mailbody = () => {
    return (
      `mailto:${email}?subject=【勤怠管理】出勤自己報告&body=` +
      values
        .filter((item) => !value[item.disabledField])
        .map((item) => `${item.name}:${value[item.field]}`)
        .join("%0D%0A")
        .replaceAll("-", "/")
    );
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
            <Form.Control
              type={v.type}
              name={v.field as string}
              disabled={value[v.disabledField] as boolean}
              value={value[v.field] as string}
              onChange={handleChange}
            />
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
