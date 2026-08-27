import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Portal from './Portal';
import FamilyVault from './FamilyVault'; // သင်၏ ၄၁၄၆ လိုင်းရှိသော ကုဒ်ကြီး

function App() {
  // 🌟 လက်ရှိရောက်နေတဲ့ လိပ်စာ (Hostname) ကို စစ်ဆေးမယ်
  const hostname = window.location.hostname;

  // ၁။ အကယ်၍ လိပ်စာက remember.mmusa.org ဖြစ်နေရင် Portal မပြဘဲ App ကို တန်းပြမယ်
  if (hostname === 'remember.mmusa.org') {
    return <FamilyVault />;
  }

  // ၂။ မဟုတ်ရင် (mmusa.org ဆိုရင်) ပုံမှန် Portal Router အတိုင်းသွားမယ်
  return (
    <Router>
      <Routes>
        {/* mmusa.org မှာ Portal ကိုပြမယ် */}
        <Route path="/" element={<Portal />} />
        
        {/* လိုအပ်ရင် mmusa.org/family လို့ ရိုက်ရင်လည်း App ပွင့်အောင် ထားနိုင်တယ် */}
        <Route path="/family/*" element={<FamilyVault />} />
      </Routes>
    </Router>
  );
}

export default App;