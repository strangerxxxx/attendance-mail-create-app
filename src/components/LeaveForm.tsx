import { useState, useEffect, useMemo, useRef, type ChangeEvent } from "react";
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
import { EmailField, IncludeField, MailPreview } from "./MailFormFields";

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

function LeaveForm({ isYesterday = false }: Props) {
  const [settingValue] = useSettings();
  const nextWorkId = useRef(1);

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

  const [formGroups, setFormGroups] = useState<WorkGroup<WorkValues>[]>([
    {
      id: 0,
      workValues: {
        workclass: settingValue.projectcode,
        workstarttime: settingValue.starttime,
        workendtime: settingValue.endtime,
      },
    },
  ]);

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
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: !checked }));
  };

  const workHandleChange = (
    groupId: number,
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
        id: nextWorkId.current++,
        workValues: {
          workclass: settingValue.projectcode,
          workstarttime: settingValue.starttime,
          workendtime: settingValue.endtime,
        },
      },
    ]);
  };

  const removeFormGroup = (id: number) => {
    setFormGroups((prev) => (prev.length <= 1 ? prev : prev.filter((group) => group.id !== id)));
  };

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
    return buildMailtoUrl(email, "【勤怠管理】退勤報告", bodyLines);
  }, [email, formValues, formGroups]);

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
                  name={v.field}
                  value={group.workValues[v.field]}
                  onChange={(e) => workHandleChange(group.id, e)}
                />
              </Form.Group>
            ))}
            {formGroups.length > 1 && (
              <Button
                type="button"
                variant="danger"
                onClick={() => removeFormGroup(group.id)}
                className="mb-3"
              >
                作業区分削除
              </Button>
            )}
          </Container>
        ))}
      </Form>

      <Button className="mb-3" type="button" onClick={addFormGroup} variant="secondary">
        作業区分追加
      </Button>

      <Button className="mb-3 ms-2" href={mailtoUrl} variant="primary">
        メール作成
      </Button>

      <MailPreview text={extractMailBody(mailtoUrl)} />
    </div>
  );
}

export default LeaveForm;
