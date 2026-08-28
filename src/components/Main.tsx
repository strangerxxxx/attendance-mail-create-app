import { useState } from "react";
import { Container } from "react-bootstrap";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Attendance from "./Attendance";
import LeaveForm from "./LeaveForm";
import Application from "./Application";

type TabDef = {
  id: string;
  name: string;
};

const tabs: TabDef[] = [
  { id: "1", name: "出勤報告" },
  { id: "2", name: "退勤報告" },
  { id: "3", name: "随時申請" },
  { id: "4", name: "退勤報告(前営業日)" },
];

function renderTab(id: string) {
  switch (id) {
    case "1": return <Attendance />;
    case "2": return <LeaveForm />;
    case "3": return <Application />;
    case "4": return <LeaveForm isYesterday />;
    default:  return null;
  }
}

function Main() {
  const [activeId, setActiveId] = useState(tabs[0].id);

  return (
    <div className="Main">
      <Container>
        <ButtonGroup className="mt-3 mb-3">
          {tabs.map((tab) => (
            <ToggleButton
              key={tab.id}
              id={`tab-${tab.id}`}
              type="radio"
              name="report-type"
              variant="outline-primary"
              value={tab.id}
              checked={activeId === tab.id}
              onChange={(e) => setActiveId(e.currentTarget.value)}
            >
              {tab.name}
            </ToggleButton>
          ))}
        </ButtonGroup>
        {/* key にアクティブなタブ ID を渡すことで、タブ切り替え時に必ず再マウントされる */}
        <div key={activeId}>
          {renderTab(activeId)}
        </div>
      </Container>
    </div>
  );
}

export default Main;
