import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Portal from './Portal';
import FamilyVault from './FamilyVault';

function App() {
  const hostname = window.location.hostname;
  const isRememberSite = hostname === 'remember.mmusa.org';

  return (
    <Router>
      <Routes>
        {isRememberSite ? (
          // remember.mmusa.org အတွက်
          <Route path="/*" element={<FamilyVault />} />
        ) : (
          // mmusa.org အတွက်
          <>
            <Route path="/" element={<Portal />} />
            <Route path="/family/*" element={<FamilyVault />} />
            {/* လမ်းကြောင်းမှားရင် Portal ဆီ ပို့မယ် */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;