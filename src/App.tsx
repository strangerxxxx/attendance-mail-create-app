import "bootstrap/dist/css/bootstrap.min.css";
import { HashRouter, Routes, Route } from "react-router-dom";

import Main from "./components/Main";
import MyNavbar from "./components/MyNavbar";
import Settings from "./components/Settings";
import NotFound from "./components/NotFound";

function App() {
  return (
    <HashRouter>
      <MyNavbar />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
