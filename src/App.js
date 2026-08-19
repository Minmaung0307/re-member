import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import MainDashboard from './MainDashboard';
import { LogOut, User } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = () => signOut(auth);

  return (
    <div style={appContainer}>
      {user ? (
        <>
          {/* Professional Header */}
          <nav style={navbarStyle}>
            <div style={navContent}>
              <div style={logoArea}>
                <h2 style={logoText}>Family<span>Vault</span></h2>
              </div>
              
              <div style={welcomeArea}>
                <span style={welcomeText}>Welcome back, <strong>{user.displayName.split(' ')[0]}</strong>! ✨</span>
              </div>

              <div style={userProfileArea}>
                <div style={profileBadge}>
                   <img src={user.photoURL} alt="p" style={avatarStyle} />
                   <span style={userNameStyle}>{user.displayName}</span>
                </div>
                <button onClick={handleLogout} style={logoutBtn}>
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </nav>

          <div style={contentBody}>
            <MainDashboard />
          </div>
        </>
      ) : (
        <div style={loginPageStyle}>
           <div style={loginCard}>
              <h1 style={{fontSize: '2.5rem', marginBottom: '10px'}}>🏠</h1>
              <h2>Family Memories</h2>
              <p style={{color: '#666', marginBottom: '20px'}}>မိသားစု အမှတ်တရများကို တစ်နေရာတည်းတွင် သိမ်းဆည်းပါ။</p>
              <button onClick={handleLogin} style={googleLoginBtn}>
                Login with Google
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

// --- Styles ---
const appContainer = {
  backgroundColor: '#f8fafc',
  minHeight: '100vh',
  fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const navbarStyle = {
  position: 'fixed',
  top: 0,
  width: '100%',
  height: '70px',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(0,0,0,0.05)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
};

const navContent = {
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 20px',
};

const logoText = {
  fontSize: '22px',
  fontWeight: '800',
  color: '#1e293b',
  margin: 0,
};

const welcomeArea = {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
};

const welcomeText = {
  fontSize: '16px',
  color: '#64748b',
};

const userProfileArea = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
};

const profileBadge = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  backgroundColor: '#fff',
  padding: '5px 12px 5px 5px',
  borderRadius: '30px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
};

const avatarStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
};

const userNameStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#334155',
};

const logoutBtn = {
  backgroundColor: '#fee2e2',
  color: '#ef4444',
  border: 'none',
  padding: '8px',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: '0.3s',
};

const contentBody = {
  paddingTop: '100px',
  paddingBottom: '50px',
};

const loginPageStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

const loginCard = {
  backgroundColor: '#fff',
  padding: '40px',
  borderRadius: '24px',
  textAlign: 'center',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  width: '350px',
};

const googleLoginBtn = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#1e293b',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
};

export default App;