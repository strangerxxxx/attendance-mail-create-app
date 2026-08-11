import React, { useState, useEffect, useMemo } from "react";
import { Form, Button, Container } from "react-bootstrap";
import useSettings from "./useSettings";
import { ValueItem, WorkValueItem, WorkGroup } from "../types";
import {
  today,
  nextBusinessDay,
  prevBusinessDay,
  nextOfPrevBusinessDay,
} from "../utils/dateUtils";
import {
  buildMailtoUrl,
  extractMailBody,
  formatDateForMail,
} from "../utils/mailUtils";

type FormValues = {
  date: string;
  time: string;
  nextstarttime: string;
  nextendtime: string;
  nextdate: string;
  cause: string;
  reason: string;
  isDisableddate: boolean;
  isDisabledtime: boolean;
  isDisablednextdate: boolean;
  isDisablednextstarttime: boolean;
  isDisablednextendtime: boolean;
  isDisabledcause: boolean;
  isDisabledreason: boolean;
};

type WorkValues = {
  workclass: string;
  workstarttime: string;
  workendtime: string;
};

type Props = {
  /** true のとき前営業日基準で日付を設定する */
  isYesterday?: boolean;
};

function LeaveForm({ isYesterday = false }: Props) {
  const [settingValue] = useSettings();

  const baseDate = isYesterday ? prevBusinessDay() : today();
  const baseNextDate = isYesterday ? nextOfPrevBusinessDay() : nextBusinessDay();

  const [email, setEmail] = useState(settingValue.email);
  const [formValues, setFormValues] = useState<FormValues>({
    date: baseDate,
    time: settingValue.endtime,
    nextstarttime: settingValue.starttime,
    nextendtime: settingValue.endtime,
    nextdate: baseNextDate,
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

  const defaultWorkValues: WorkValues = {
    workclass: settingValue.projectcode,
    workstarttime: settingValue.starttime,
    workendtime: settingValue.endtime,
  };

  const [formGroups, setFormGroups] = useState<WorkGroup<WorkValues>[]>([
    { id: Date.now(), workValues: defaultWorkValues },
  ]);

  // 設定変更時にメールアドレスと時刻を同期する
  useEffect(() => {
    setEmail(settingValue.email);
    setFormValues((prev) => ({
      ...prev,
      time: settingValue.endtime,
      nextstarttime: settingValue.starttime,
      nextendtime: settingValue.endtime,
    }));
  }, [settingValue]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    // スイッチ ON = フィールド有効 (isDisabled = false)
    setFormValues((prev) => ({ ...prev, [name]: !checked }));
  };

  const workHandleChange = (
    groupId: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, workValues: { ...group.workValues, [name]: value } }
          : group,
      ),
    );
  };

  const addFormGroup = () => {
    setFormGroups((prev) => [
      ...prev,
      {
        id: Date.now(),
        workValues: {
          workclass: settingValue.projectcode,
          workstarttime: settingValue.starttime,
          workendtime: settingValue.endtime,
        },
      },
    ]);
  };

  const removeFormGroup = (id: number) => {
    setFormGroups((prev) => prev.filter((group) => group.id !== id));
  };

  const fieldDefs: ValueItem<FormValues>[] = [
    { name: "退勤日", type: "date", field: "date", disabledField: "isDisableddate" },
    { name: "退勤時刻", type: "time", field: "time", disabledField: "isDisabledtime" },
    { name: "翌出勤日", type: "date", field: "nextdate", disabledField: "isDisablednextdate" },
    { name: "翌出勤時刻", type: "time", field: "nextstarttime", disabledField: "isDisablednextstarttime" },
    { name: "翌退勤時刻", type: "time", field: "nextendtime", disabledField: "isDisablednextendtime" },
    { name: "事由", type: "text", field: "cause", disabledField: "isDisabledcause" },
    { name: "内容", type: "text", field: "reason", disabledField: "isDisabledreason" },
  ];

  const workFieldDefs: WorkValueItem<WorkValues>[] = [
    { name: "作業区分", type: "text", field: "workclass" },
    { name: "作業区分開始時刻", type: "time", field: "workstarttime" },
    { name: "作業区分終了時刻", type: "time", field: "workendtime" },
  ];

  const mailtoUrl = useMemo(() => {
    const bodyLines = [
      ...fieldDefs
        .filter((item) => !formValues[item.disabledField])
        .map((item) =>
          `${item.name}:${formatDateForMail(String(formValues[item.field]))}`,
        ),
      ...formGroups.flatMap((group) =>
        workFieldDefs.map(
          (item) => `${item.name}:${group.workValues[item.field]}`,
        ),
      ),
    ];
    return buildMailtoUrl(
      email,
      "【勤怠管理】退勤報告",
      bodyLines,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, formValues, formGroups]);

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

        {formGroups.map((group) => (
          <Container key={group.id} className="border rounded mb-3">
            {workFieldDefs.map((v) => (
              <Form.Group
                className="mb-3 mt-3 d-flex"
                controlId={`form-${group.id}-${v.field}`}
                key={`${group.id}-${v.field}`}
              >
                <Form.Label className="col-sm-2">{v.name}</Form.Label>
                <Form.Control
                  type={v.type}
                  name={v.field as string}
                  value={group.workValues[v.field]}
                  onChange={(e) => workHandleChange(group.id, e)}
                />
              </Form.Group>
            ))}
            <Button
              variant="danger"
              onClick={() => removeFormGroup(group.id)}
              className="mb-3"
            >
              作業区分削除
            </Button>
          </Container>
        ))}
      </Form>

      <Button className="mb-3" onClick={addFormGroup} variant="secondary">
        作業区分追加
      </Button>

      <Button className="mb-3 ms-2" href={mailtoUrl} variant="primary">
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

export default LeaveForm;
