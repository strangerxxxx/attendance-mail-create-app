import React, { useState } from "react";
import { Form, Button, Alert, Container, CloseButton } from "react-bootstrap";
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
  const [showAlert, setShowAlert] = useState(false);

  const handleChange =
    (field: keyof SettingValuesType) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSettingValues({
        ...settingValue,
        [field]: event.target.value,
      });
    };

  // useSettings の useEffect が settingValue 変更時に自動保存するため、
  // ここでは保存完了アラートの表示のみ行う
  const handleSubmit = () => {
    setShowAlert(true);
  };

  return (
    <div className="Settings">
      <Container>
        <Alert show={showAlert} className="d-flex align-items-center" variant="success">
          <CloseButton onClick={() => setShowAlert(false)} className="me-2" />
          <p className="mb-0">設定が保存されました。</p>
        </Alert>
        <Form>
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
          <Button className="mb-3" variant="primary" onClick={handleSubmit}>
            保存
          </Button>
        </Form>
      </Container>
    </div>
  );
}

export default Settings;
