import React, { useState } from "react";
import { Form, Button, Alert, Container, CloseButton } from "react-bootstrap";
import useSettings from "./useSettings";

function Settings() {
  // 設定の型定義
  type SettingValuesType = {
    email: string;
    starttime: string;
    endtime: string;
    projectcode: string;
  };

  // 設定アイテムの型定義
  type SettingValueItem = {
    name: string;
    type: string;
    field: keyof SettingValuesType;
  };

  // カスタムフックを使用して設定値を取得
  const [settingValue, setSettingValues] = useSettings();

  // 設定アイテムの定義
  const settingValues: SettingValueItem[] = [
    { name: "メールアドレス", type: "email", field: "email" },
    { name: "出勤時刻", type: "time", field: "starttime" },
    { name: "退勤時刻", type: "time", field: "endtime" },
    { name: "プロジェクトコード", type: "text", field: "projectcode" },
  ];

  const [show, setShow] = useState(false);

  const handleSubmit = () => {
    localStorage.setItem("kintaiSettingValue", JSON.stringify(settingValue));
    setShow(true);
  };

  const handleChange =
    (field: keyof SettingValuesType) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSettingValues({
        ...settingValue,
        [field]: event.target.value,
      });
    };

  return (
    <div className="Settings">
      <Container>
        <Alert show={show} className="d-flex" variant="success">
          <CloseButton onClick={() => setShow(false)} />
          <p>設定が保存されました。</p>
        </Alert>
        <Form>
          {settingValues.map((v, index) => (
            <Form.Group
              className="mb-3 mt-3 d-flex"
              controlId={`form${index}`}
              key={index}
            >
              <Form.Label className="col-sm-2">{v.name}</Form.Label>
              <Form.Control
                type={v.type}
                name={v.field as string}
                value={settingValue[v.field]}
                onChange={handleChange(v.field)}
              />
            </Form.Group>
          ))}
          <Button className="mb-3" variant="primary" onClick={handleSubmit}>
            保存
          </Button>
        </Form>
      </Container>
    </div>
  );
}

export default Settings;
