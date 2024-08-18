import React, { useState, useEffect } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { addBusinessDays } from "date-fns";
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
    time: "",
    nextstarttime: "",
    nextendtime: "",
    nextdate: tomorrow,
    cause: "プロジェクト業務",
    reason: "プロジェクト業務のため",
    isDisableddate: false,
    isDisabledtime: false,
    isDisablednextdate: false,
    isDisablednextstarttime: false,
    isDisablednextendtime: false,
    isDisabledcause: true,
    isDisabledreason: true,
  });

  const [workvalue] = useState({
    workclass: settingValue.projectcode,
    workstarttime: settingValue.starttime,
    workendtime: settingValue.endtime,
  });

  const [formGroups, setFormGroups] = useState<
    { id: number; workValues: typeof workvalue }[]
  >([{ id: Date.now(), workValues: workvalue }]);

  useEffect(() => {
    setEmail(settingValue.email);
    setValue((prevValue) => ({
      ...prevValue,
      time: settingValue.endtime,
      nextstarttime: settingValue.starttime,
      nextendtime: settingValue.endtime,
    }));
  }, [settingValue]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setValue((prevValue) => ({ ...prevValue, [name]: value }));
  };

  const workHandleChange = (
    groupId: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId
          ? { ...group, workValues: { ...group.workValues, [name]: value } }
          : group
      )
    );
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setValue((prevValue) => ({ ...prevValue, [name]: !checked }));
  };

  const addFormGroup = () => {
    setFormGroups((prevGroups) => [
      ...prevGroups,
      { id: Date.now(), workValues: workvalue },
    ]);
  };

  const removeFormGroup = (id: number) => {
    setFormGroups((prevGroups) =>
      prevGroups.filter((group) => group.id !== id)
    );
  };

  type ValueItem = {
    name: string;
    type: string;
    field: keyof typeof value;
    disabledField: keyof typeof value;
    options?: string[];
  };

  const values: ValueItem[] = [
    {
      name: "退勤日",
      type: "date",
      field: "date",
      disabledField: "isDisableddate",
    },
    {
      name: "退勤時刻",
      type: "time",
      field: "time",
      disabledField: "isDisabledtime",
    },
    {
      name: "翌出勤日",
      type: "date",
      field: "nextdate",
      disabledField: "isDisablednextdate",
    },
    {
      name: "翌出勤時刻",
      type: "time",
      field: "nextstarttime",
      disabledField: "isDisablednextstarttime",
    },
    {
      name: "翌退勤時刻",
      type: "time",
      field: "nextendtime",
      disabledField: "isDisablednextendtime",
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

  type WorkValueItem = {
    name: string;
    type: string;
    field: keyof typeof workvalue;
    init: string;
  };

  type WorkValuesType = WorkValueItem[];
  const workvalues: WorkValuesType = [
    {
      name: "作業区分",
      type: "text",
      field: "workclass",
      init: settingValue.projectcode,
    },
    {
      name: "作業区分開始時刻",
      type: "time",
      field: "workstarttime",
      init: settingValue.starttime,
    },
    {
      name: "作業区分終了時刻",
      type: "time",
      field: "workendtime",
      init: settingValue.endtime,
    },
  ];

  const mailbody = () => {
    const lineBreak = "%0D%0A";

    const body = `mailto:${email}?subject=【勤怠管理】退勤報告&body=`;

    const formattedValues = values
      .filter((item) => !value[item.disabledField])
      .map((item) => `${item.name}:${value[item.field]}`)
      .join(lineBreak)
      .replaceAll("-", "/");

    const formattedGroups = formGroups
      .map((group) =>
        workvalues
          .map((item) => `${item.name}:${group.workValues[item.field]}`)
          .join(lineBreak)
      )
      .join(lineBreak);

    return body + formattedValues + lineBreak + formattedGroups;
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
        {formGroups.map((group) => (
          <Container key={group.id} className="border rounded mb-3">
            {workvalues.map((v, index) => (
              <Form.Group
                className="mb-3 mt-3 d-flex"
                controlId={`form${group.id}-${index}`}
                key={`${group.id}-${index}`}
              >
                <Form.Label className="col-sm-2">{v.name}</Form.Label>
                <Form.Control
                  type={v.type}
                  name={v.field as string}
                  value={group.workValues[v.field] as string}
                  onChange={(e) => workHandleChange(group.id, e)}
                />
              </Form.Group>
            ))}
            <Button
              variant="danger"
              onClick={() => removeFormGroup(group.id)}
              className="ml-2 mb-3"
            >
              作業区分削除
            </Button>
          </Container>
        ))}
      </Form>

      <Button className="mb-3" onClick={addFormGroup} variant="secondary">
        作業区分追加
      </Button>

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
