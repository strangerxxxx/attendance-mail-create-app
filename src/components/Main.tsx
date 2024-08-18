import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import Attendance from "./Attendance";
import Leave from "./Leave";
import Application from "./Application";
import ToggleButton from "react-bootstrap/ToggleButton";
import ButtonGroup from "react-bootstrap/ButtonGroup";
const components = [
  {
    name: "出勤報告",
    appName: Attendance,
    id: "1",
  },
  {
    name: "退勤報告",
    appName: Leave,
    id: "2",
  },
  {
    name: "随時申請",
    appName: Application,
    id: "3",
  },
];
function Main() {
  const [radioValue, setRadioValue] = useState(components[0].id);
  return (
    <div className="Main">
      <Container>
        <ButtonGroup className="mt-3 mb-3">
          {components.map((v, index) => (
            <ToggleButton
              key={index}
              id={v.id}
              type="radio"
              value={v.id}
              checked={radioValue === v.id}
              onChange={(e) => setRadioValue(e.currentTarget.value)}
            >
              {v.name}
            </ToggleButton>
          ))}
        </ButtonGroup>
        {components.map((v) => {
          if (v.id === radioValue) {
            const Component = v.appName;
            return <Component key={v.id} />;
          }
          return null;
        })}
      </Container>
    </div>
  );
}

export default Main;
