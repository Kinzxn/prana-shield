import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import WardOverview from "./pages/WardOverview";
import PatchDetail from "./pages/PatchDetail";
import Environmental from "./pages/Environmental";
import MeshNetwork from "./pages/MeshNetwork";
import AlertsDrawer from "./components/AlertsDrawer";
import SimulationEngine from "./components/SimulationEngine";

export default function App() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <SimulationEngine />
      <Layout>
        <Routes>
          <Route path="/" element={<WardOverview />} />
          <Route path="/patch/:patchId" element={<PatchDetail />} />
          <Route path="/environment" element={<Environmental />} />
          <Route path="/mesh" element={<MeshNetwork />} />
        </Routes>
      </Layout>
      <AlertsDrawer />
    </div>
  );
}
