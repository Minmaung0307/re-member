import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from './firebase';
import { 
  signInWithPopup,      // ဒါလေး ပါသွားပါပြီ
  signInWithRedirect, 
  getRedirectResult, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  collection, 
  query, 
  onSnapshot, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

import MainDashboard from './MainDashboard';
import Chat from './Chat';

import { 
  LogOut, 
  Users, 
  Home, 
  ShieldCheck 
} from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    console.log("App Started...");
    getRedirectResult(auth).catch((err) => console.error(err));

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("User State Changed:", currentUser ? "Logged In" : "Logged Out");
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const syncUserAndFetchList = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        
        // ၁။ User data ရှိမရှိ အရင်စစ်မယ်
        const { getDoc } = await import('firebase/firestore'); // getDoc ကိုသုံးဖို့ import လုပ်ထားရမယ်
        const docSnap = await getDoc(userRef);
        
        let birthday = "";

        // ၂။ အကယ်၍ user က အသစ်ဖြစ်နေရင် သို့မဟုတ် မွေးနေ့ မရှိသေးရင် မေးမယ်
        if (!docSnap.exists() || !docSnap.data().birthday) {
          birthday = prompt("မွေးနေ့ထည့်ပါ (MM/DD/YYYY) ဥပမာ- 08/25/1995");
        }

        // ၃။ ဒေတာတွေကို Update လုပ်မယ်
        const userData = {
          id: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          lastSeen: serverTimestamp()
        };

        if (birthday) {
          userData.birthday = birthday; // မွေးနေ့ရှိမှ ထည့်ပေါင်းမယ်
        }

        await setDoc(userRef, userData, { merge: true });

        // ၄။ User စာရင်းကို ဆွဲထုတ်မယ်
        const q = query(collection(db, "users"));
        const unsubUsers = onSnapshot(q, (snapshot) => {
          setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return unsubUsers;
      }
    };

    let unsub;
    syncUserAndFetchList().then(cleanup => {
      unsub = cleanup;
    });

    return () => unsub && unsub();
  }, [user]);

  // အခု Popup နဲ့ စမ်းကြည့်ပါမယ်
  const handleLogin = () => {
    signInWithPopup(auth, googleProvider)
      .then(() => console.log("Login Success"))
      .catch((err) => console.error("Login Error:", err));
  };

  const handleLogout = () => signOut(auth);

  if (loading) return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Loading...</div>;

  // App function ရဲ့ အတွင်းထဲမှာ ထည့်ပါ
  const renderUserItem = (u) => (
    <div key={u.id} style={userItem} onClick={() => setSelectedUser(u)}>
      <div style={{ position: 'relative' }}>
        <img src={u.photoURL} style={smallAvatar} alt="u" />
        {/* Online ဖြစ်နေရင် အစိမ်းစက် */}
        {u.lastSeen && Date.now() - u.lastSeen.toMillis() < 300000 && (
          <div style={{ width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%', position: 'absolute', bottom: 0, right: 0, border: '2px solid #fff' }} />
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: '10px' }}>
        <span style={{ fontSize: '14px', fontWeight: '600' }}>{u.displayName}</span>
        <span style={{ fontSize: '11px', color: u.role === 'Family' ? '#3b82f6' : '#64748b' }}>
          {u.role || 'Member'}
        </span>
      </div>
      
      {/* စာအသစ်ရှိရင် အနီရောင်စက်လေး ပြချင်ရင် (ဥပမာပြထားခြင်း) */}
      {u.hasNewMessage && (
        <div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }} />
      )}
    </div>
  );

  return (
    <div style={appContainer}>
      {user ? (
        <>
          <nav style={navbarStyle}>
            <div style={navContent}>
              <h2 style={logoText}>Re<span>Member</span></h2>
              <div style={{display: 'flex', gap: '15px'}}>
                  <button onClick={() => setActiveTab('feed')} style={activeTab === 'feed' ? activeTabBtn : tabBtn}><Home size={18}/> Feed</button>
                  <button onClick={() => setActiveTab('admin')} style={activeTab === 'admin' ? activeTabBtn : tabBtn}><ShieldCheck size={18}/> Admin</button>
              </div>
              <div style={userProfileArea}>
                <img src={user.photoURL} alt="p" style={avatarStyle} />
                <button onClick={handleLogout} style={logoutBtn}><LogOut size={18} /></button>
              </div>
            </div>
          </nav>

          {/* Birthday Alert Banner (ယနေ့ နှင့် ကြိုတင်အသိပေးချက်) */}
          {users.map(u => {
              if (!u.birthday || !u.birthday.includes('/')) return null;

              // ၁။ MM/DD/YYYY ကို ခွဲထုတ်ပြီး Date Object တည်ဆောက်ခြင်း
              const [m, d] = u.birthday.split('/');
              const today = new Date();
              today.setHours(0, 0, 0, 0); // အချိန်ကို ၀ အထိ လျှော့ချထားမယ် (ရက်ပဲ စစ်ဖို့)

              const currentYear = today.getFullYear();
              let bdayDate = new Date(currentYear, parseInt(m) - 1, parseInt(d));

              // ၂။ မွေးနေ့နဲ့ ယနေ့ကြား ရက်ခြားနားချက်ကို တွက်ချက်ခြင်း
              const diffTime = bdayDate - today;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              // အကယ်၍ ဒီနေ့ မွေးနေ့ဖြစ်လျှင်
              if (diffDays === 0) {
                  return (
                      <div key={u.id} style={bdayBannerToday}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                              <img src={u.photoURL} style={{width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #fff'}} alt="u" />
                              <div style={{textAlign: 'left'}}>
                                  <div style={{fontWeight: 'bold'}}>🎉 Happy Birthday, {u.displayName}!</div>
                                  <div style={{fontSize: '12px'}}>ဒီနေ့ဟာ သူ့ရဲ့ မွေးနေ့ထူးမြတ်တဲ့နေ့ ဖြစ်ပါတယ်။ ဆုတောင်းပေးလိုက်ကြရအောင်။ 🎂</div>
                              </div>
                          </div>
                      </div>
                  );
              }

              // အကယ်၍ နောက် ၁ ရက် မှ ၁၄ ရက် (၂ ပတ်) အတွင်း မွေးနေ့ရှိလျှင်
              if (diffDays > 0 && diffDays <= 14) {
                  return (
                      <div key={u.id} style={bdayBannerUpcoming}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                              <div style={{fontSize: '24px'}}>🎁</div>
                              <div style={{textAlign: 'left'}}>
                                  <div style={{fontWeight: 'bold'}}>Upcoming Birthday: {u.displayName}</div>
                                  <div style={{fontSize: '12px'}}>နောက် {diffDays} ရက်ဆိုရင် မွေးနေ့ရောက်တော့မှာပါ။ လက်ဆောင်အတွက် ကြိုတင်ပြင်ဆင်ထားပါဦး။ ✨</div>
                              </div>
                          </div>
                      </div>
                  );
              }

              return null;
          })}

          <div style={mainLayout}>
            <div style={contentBody}>
              <MainDashboard />
            </div>
            {activeTab === 'admin' && (
              <div style={{backgroundColor: '#fff', padding: '20px', borderRadius: '20px', marginBottom: '20px'}}>
                  <h3>👥 Family & Friends Management</h3>
                  {users.map(u => (
                      <div key={u.id} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee'}}>
                          <span>{u.displayName}</span>
                          <select 
                              onChange={async (e) => {
                                  await updateDoc(doc(db, "users", u.id), { role: e.target.value });
                              }}
                              defaultValue={u.role || "Member"}
                              style={{padding: '5px', borderRadius: '8px'}}
                          >
                              <option value="Family">Family</option>
                              <option value="Friend">Friend</option>
                              <option value="Member">Member</option>
                          </select>
                      </div>
                  ))}
              </div>
          )}
            <div style={sidebar}>
              {/* ၁။ Family Group */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={sidebarTitle}><Users size={16} /> Family</h3>
                <div style={userList}>
                  {users.filter(u => u.id !== user.uid && u.role === 'Family').length > 0 ? (
                    users.filter(u => u.id !== user.uid && u.role === 'Family').map(u => renderUserItem(u))
                  ) : (
                    <p style={emptyText}>No family added</p>
                  )}
                </div>
              </div>

              {/* ၂။ Friends Group */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={sidebarTitle}><Users size={16} /> Friends</h3>
                <div style={userList}>
                  {users.filter(u => u.id !== user.uid && u.role === 'Friend').length > 0 ? (
                    users.filter(u => u.id !== user.uid && u.role === 'Friend').map(u => renderUserItem(u))
                  ) : (
                    <p style={emptyText}>No friends added</p>
                  )}
                </div>
              </div>

              {/* ၃။ General Members Group */}
              <div>
                <h3 style={sidebarTitle}><Users size={16} /> Members</h3>
                <div style={userList}>
                  {users.filter(u => u.id !== user.uid && (!u.role || u.role === 'Member')).length > 0 ? (
                    users.filter(u => u.id !== user.uid && (!u.role || u.role === 'Member')).map(u => renderUserItem(u))
                  ) : (
                    <p style={emptyText}>No other members</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {selectedUser && (
            <Chat recipient={selectedUser} onClose={() => setSelectedUser(null)} />
          )}
        </>
      ) : (
        <div style={loginPageStyle}>
           <div style={loginCard}>
              <h1 style={{fontSize: '2.5rem'}}>🏠</h1>
              <h2>Family Memories</h2>
              <button onClick={handleLogin} style={googleLoginBtn}>Login with Google</button>
           </div>
        </div>
      )}
    </div>
  );
}

// --- Styles ---
const appContainer = { backgroundColor: '#f8fafc', minHeight: '100vh' };
const navbarStyle = { height: '70px', backgroundColor: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', position: 'fixed', width: '100%', zIndex: 1000 };
const navContent = { width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '0 20px', alignItems: 'center' };
const logoText = { fontSize: '20px', fontWeight: '800' };
const userProfileArea = { display: 'flex', alignItems: 'center', gap: '10px' };
const avatarStyle = { width: '30px', height: '30px', borderRadius: '50%' };
const logoutBtn = { border: 'none', background: '#fee2e2', color: '#ef4444', padding: '8px', borderRadius: '10px', cursor: 'pointer' };
const mainLayout = { display: 'flex', maxWidth: '1200px', margin: '0 auto', paddingTop: '90px', gap: '20px', paddingLeft: '15px', paddingRight: '15px' };
const contentBody = { flex: 2 };
const sidebar = { flex: 0.8, backgroundColor: '#fff', borderRadius: '20px', padding: '20px', height: 'fit-content', position: 'sticky', top: '90px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' };
const userList = { display: 'flex', flexDirection: 'column', gap: '12px' };
const userItem = { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: '#f8fafc' };
const smallAvatar = { width: '35px', height: '35px', borderRadius: '50%' };
const loginPageStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#3b82f6' };
const loginCard = { backgroundColor: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center', width: '300px' };
const googleLoginBtn = { width: '100%', padding: '12px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', marginTop: '20px' };

const bdayBanner = {
  backgroundColor: '#dbeafe',
  color: '#1e40af',
  padding: '12px',
  borderRadius: '12px',
  textAlign: 'center',
  marginBottom: '20px',
  fontWeight: '600',
  border: '1px solid #bfdbfe',
  fontSize: '14px',
  boxShadow: '0 2px 10px rgba(59, 130, 246, 0.1)'
};

const tabBtn = { 
    background: 'none', border: 'none', cursor: 'pointer', display: 'flex', 
    alignItems: 'center', gap: '5px', color: '#64748b', fontWeight: '600', fontSize: '14px' 
};
const activeTabBtn = { ...tabBtn, color: '#3b82f6', borderBottom: '2px solid #3b82f6' };

const sidebarTitle = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  borderBottom: '1px solid #f1f5f9',
  paddingBottom: '5px'
};

const emptyText = {
  fontSize: '12px',
  color: '#cbd5e1',
  fontStyle: 'italic',
  paddingLeft: '10px'
};

const bdayBannerToday = {
    backgroundColor: '#fef3c7', // အဝါနုရောင်
    color: '#92400e',
    padding: '15px',
    borderRadius: '16px',
    marginBottom: '15px',
    border: '1px solid #fde68a',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
};

const bdayBannerUpcoming = {
    backgroundColor: '#ecfdf5', // အစိမ်းနုရောင်
    color: '#065f46',
    padding: '15px',
    borderRadius: '16px',
    marginBottom: '15px',
    border: '1px solid #a7f3d0',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
};

export default App;