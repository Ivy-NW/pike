import { Navigate, Route, Routes } from "react-router-dom";
import { ScanPage } from "./pages/ScanPage";
import { RewardRevealPage } from "./pages/RewardRevealPage";

export function App() {
  return (
    <Routes>
      <Route path="/scan/:markerId" element={<ScanPage />} />
      <Route path="/reward/:redemptionId" element={<RewardRevealPage />} />
      <Route path="*" element={<Navigate to="/scan/demo" replace />} />
    </Routes>
  );
}
