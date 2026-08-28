import React, { useState } from "react";
import { Form, Button, Container, Toast, ToastContainer, CloseButton } from "react-bootstrap";
import useSettings from "./useSettings";
import { SettingValuesType } from "../types";

type SettingFieldDef = {
  name: string;
  type: string;
  field: keyof SettingValuesType;
};

const settingFieldDefs: SettingFieldDef[] = [
  { name: "メールアドレス", type: "email", field: "email" },
  { name: "出勤時刻", type: "time", field: "starttime" },
  { name: "退勤時刻", type: "time", field: "endtime" },
  { name: "プロジェクトコード", type: "text", field: "projectcode" },
];

function Settings() {
  const [settingValue, setSettingValues] = useSettings();
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [toastKey, setToastKey] = useState(0);

  const handleChange =
    (field: keyof SettingValuesType) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSettingValues({
        ...settingValue,
        [field]: event.target.value,
      });
    };

  // useSettings の useEffect が settingValue 変更時に自動保存するため、
  // ここでは保存完了トーストの表示のみ行う
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowSavedToast(true);
    setToastKey((key) => key + 1);
  };

  return (
    <div className="Settings">
      <ToastContainer
        className="p-3"
        position="top-center"
        style={{ zIndex: 1080, marginTop: "3.5rem" }}
      >
        <Toast
          key={toastKey}
          className="text-bg-success border-0"
          show={showSavedToast}
          onClose={() => setShowSavedToast(false)}
          delay={2500}
          autohide
        >
          <Toast.Body className="d-flex align-items-center">
            <span className="me-auto">設定を保存しました</span>
            <CloseButton
              variant="white"
              aria-label="閉じる"
              onClick={() => setShowSavedToast(false)}
            />
          </Toast.Body>
        </Toast>
      </ToastContainer>
      <Container>
        <Form onSubmit={handleSubmit}>
          {settingFieldDefs.map((v) => (
            <Form.Group
              className="mb-3 mt-3 d-flex"
              controlId={`form-${v.field}`}
              key={v.field}
            >
              <Form.Label className="col-sm-2">{v.name}</Form.Label>
              <Form.Control
                type={v.type}
                name={v.field}
                value={settingValue[v.field]}
                onChange={handleChange(v.field)}
              />
            </Form.Group>
          ))}
          <Button className="mb-3" variant="primary" type="submit">
            保存
          </Button>
        </Form>
      </Container>
    </div>
  );
}

export default Settings;
