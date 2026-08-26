import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ကျွန်တော်တို့ နေရာရွှေ့ထားတဲ့ ဖိုင်တွေကို Import ပြန်လုပ်မယ်
import Portal from './Portal';
import FamilyVault from './FamilyVault'; // ၄၁၄၆ လိုင်းရှိတဲ့ ကုဒ်ကြီးက ဒီထဲရောက်သွားပါပြီ

function App() {
  return (
    <Router>
      <Routes>
        {/* mmusa.org ကိုဝင်ရင် Portal (Showcase) ပေါ်မယ် */}
        <Route path="/" element={<Portal />} />

        {/* mmusa.org/family ကိုသွားရင် မိသားစု App ပွင့်မယ် */}
        <Route path="/family/*" element={<FamilyVault />} />

        {/* အခြား app များရှိရင် ဒီမှာ ထပ်တိုးရုံပါပဲ */}
        {/* <Route path="/donate" element={<DonateApp />} /> */}
      </Routes>
    </Router>
  );
}

export default App;