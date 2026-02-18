import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import { BlastProvider } from "@/context/BlastContext";
import { useEffect } from "react";
import { trackPageView } from "@/utils/analytics";

function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);
  return null;
}

export default function App() {
  return (
    <BlastProvider>
      <Router>
        <AnalyticsTracker />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
        </Routes>
      </Router>
    </BlastProvider>
  );
}
