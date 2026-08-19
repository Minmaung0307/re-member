import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import MainDashboard from './MainDashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
      {user ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', background: '#fff', alignItems: 'center' }}>
          <h3>Welcome, {user.displayName}! ❤️</h3>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={user.photoURL} alt="profile" style={{ borderRadius: '50%', width: '30px', marginRight: '10px' }} />
            <p>{user.email}</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
        </div>
          
          {/* ဒီနေရာမှာ နောက်ထပ် Feature တွေ ထည့်သွားမယ် */}
          <MainDashboard /> 
        </div>
      ) : (
        <div>
          <h1>Family & Friends Memories</h1>
          <p>မှတ်တမ်းလေးတွေကို သိမ်းထားဖို့ Login ဝင်ပေးပါ</p>
          <button onClick={handleLogin} style={buttonStyle}>Login with Google</button>
        </div>
      )}
    </div>
  );
}

const MainDashboard = () => (
  <div style={{ marginTop: '20px', padding: '20px', borderTop: '1px solid #ccc' }}>
    <h3>သင်၏ Feed (Coming Soon...)</h3>
  </div>
);

const buttonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: '#4285F4',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

export default App;