import Toolbar from "../components/Toolbar/Toolbar";
import Sidebar from "../components/Sidebar/Sidebar";
import Canvas from "../components/Canvas/Canvas";
import Inspector from "../components/Inspector/Inspector";
import StatusBar from "../components/StatusBar/StatusBar";

import "../styles/AppLayout.css";

function AppLayout() {
  return (
    <div className="app-layout">
      <Toolbar />

      <main className="workspace">
        <Sidebar />

        <Canvas />

        <Inspector />
      </main>

      <StatusBar />
    </div>
  );
}

export default AppLayout;
