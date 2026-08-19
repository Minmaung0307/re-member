import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from './firebase';
import { 
  signInWithPopup,      // ဒါလေး ပါသွားပါပြီ
  signInWithRedirect, 
  getRedirectResult, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, onSnapshot, serverTimestamp, updateDoc, addDoc, orderBy, deleteDoc } from 'firebase/firestore';

import MainDashboard from './MainDashboard';
import Chat from './Chat';

import { 
  LogOut, 
  Users, 
  Home, 
  ShieldCheck,
  Palette, 
  Gift, 
  Search,
  X
} from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]); 
  const [events, setEvents] = useState([]);

  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", location: "", details: "" });
  const [showBdayModal, setShowBdayModal] = useState(false);
  const [tempBday, setTempBday] = useState("");
  const [adminInterests, setAdminInterests] = useState({}); 

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null); 

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
          const { getDoc } = await import('firebase/firestore');
          const docSnap = await getDoc(userRef);
          
          // ၂။ အကယ်၍ user က အသစ်ဖြစ်နေရင် သို့မဟုတ် မွေးနေ့ မရှိသေးရင် Modal ပြမယ်
          if (!docSnap.exists() || !docSnap.data().birthday) {
            setShowBdayModal(true); // ဒီမှာ Modal ကို ပွင့်ခိုင်းလိုက်တာပါ
          }

          // ၃။ အခြေခံ ဒေတာတွေကို အရင် Update လုပ်မယ် (Birthday မပါသေးဘဲ)
          const userData = {
            id: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastSeen: serverTimestamp()
          };

          await setDoc(userRef, userData, { merge: true });

          // ၄။ User စာရင်းကို အမြဲစောင့်ကြည့်မယ်
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

  // posts နဲ့ events တွေကို database ကနေ အမြဲစောင့်ကြည့်ဖို့
  useEffect(() => {
      // Posts ဆွဲယူခြင်း
      const unsubPosts = onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), (snap) => {
          setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      // Events ဆွဲယူခြင်း
      const unsubEvents = onSnapshot(collection(db, "events"), (snap) => {
          setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => { unsubPosts(); unsubEvents(); };
  }, []);

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
        <span style={{fontSize: '14px', fontWeight: '600'}}>{u.displayName}</span>
        <span style={{fontSize: '10px', color: '#10b981'}}>{u.interests ? `🌟 ${u.interests}` : ''}</span>
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
              <div style={{display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '5px'}}>
                  <button onClick={() => setActiveTab('feed')} style={activeTab === 'feed' ? activeTabBtn : tabBtn}><Home size={18}/> Feed</button>
                  <button onClick={() => setActiveTab('gallery')} style={activeTab === 'gallery' ? activeTabBtn : tabBtn}><Palette size={18}/> Gallery</button>
                  <button onClick={() => setActiveTab('events')} style={activeTab === 'events' ? activeTabBtn : tabBtn}><Gift size={18}/> Events</button>
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
          {/* ဘယ်ဘက်ခြမ်း - Content ဧရိယာ (Feed သို့မဟုတ် Admin သို့မဟုတ် Gallery) */}
          <div style={contentBody}>
              {/* ၁။ Feed Tab - Dashboard ကို ဒီမှာပဲပြမယ် */}
              {activeTab === 'feed' && <MainDashboard posts={posts} />}

              {/* ၂။ Admin Tab - Management ကို ဒီမှာပြမယ် */}
              {activeTab === 'admin' && (
                <div style={adminCardStyle}>
                    <h3>👥 Family & Friends Management</h3>
                    {users.map(u => (
                        <div key={u.id} style={adminUserRow}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px', flex: 1}}>
                                <img src={u.photoURL} style={smallAvatar} alt="u" />
                                <div style={{fontSize: '14px', fontWeight: '600'}}>{u.displayName}</div>
                            </div>

                            <div style={{display: 'flex', gap: '10px', flex: 2, alignItems: 'center'}}>
                                <select 
                                    onChange={async (e) => await updateDoc(doc(db, "users", u.id), { role: e.target.value })}
                                    defaultValue={u.role || "Member"}
                                    style={roleSelectStyle}
                                >
                                    <option value="Family">Family</option>
                                    <option value="Friend">Friend</option>
                                    <option value="Member">Member</option>
                                </select>

                                <input 
                                    placeholder="ဝါသနာ (ဥပမာ- ခွေးချစ်သူ)" 
                                    style={interestInputStyle}
                                    defaultValue={u.interests || ""}
                                    onChange={(e) => setAdminInterests({...adminInterests, [u.id]: e.target.value})}
                                />
                                
                                <button 
                                    onClick={async () => {
                                        const val = adminInterests[u.id] || u.interests;
                                        await updateDoc(doc(db, "users", u.id), { interests: val });
                                        alert("သိမ်းဆည်းပြီးပါပြီ! ✨");
                                    }}
                                    style={saveBtnSmall}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

              {/* ၃။ Gallery Tab - (အမှတ်တရပုံများ Grid နဲ့ကြည့်ရန်) */}
              {activeTab === 'gallery' && (
                  <div style={adminCardStyle}>
                      <h3 style={{marginBottom: '20px'}}><Palette size={20} /> Memory Gallery</h3>
                      <div style={galleryGrid}>
                          {posts.filter(p => (p.fileUrl || p.imageUrl)).map(p => (
                            <div key={p.id} style={galleryItem}>
                                <img 
                                    src={p.fileUrl || p.imageUrl} 
                                    style={galleryImg} 
                                    alt="memory" 
                                    referrerPolicy="no-referrer"
                                    onError={(e) => e.target.parentElement.style.display = 'none'} // ပုံပျက်နေရင် အဲ့ဒီ box ကို ဖျောက်ထားလိုက်မယ်
                                />
                            </div>
                        ))}
                      </div>
                  </div>
              )}

              {activeTab === 'events' && (
                <div style={adminCardStyle}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                        <h3>🗓️ Family Events</h3>
                        {/* ဒီနေရာမှာ prompt တွေဖြုတ်ပြီး setShowEventModal(true) ပဲ ထည့်ပါမယ် */}
                        <button 
                            onClick={() => setShowEventModal(true)} 
                            style={postBtnMini}
                        >
                            + ပွဲသစ်ထည့်ရန်
                        </button>
                    </div>
                    
                    {events.map(ev => (
                        <div key={ev.id} style={{padding: '15px', borderBottom: '1px solid #eee', position: 'relative'}}>
                            <div style={{fontWeight: 'bold', fontSize: '16px'}}>{ev.title} {ev.isAnnual && "🔁"}</div>
                            <div style={{fontSize: '13px', color: '#3b82f6'}}>{ev.date} | 📍 {ev.location || 'No location'}</div>
                            <p style={{fontSize: '13px', color: '#64748b', margin: '5px 0'}}>{ev.details}</p>
                            
                            <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                                <button onClick={() => deleteDoc(doc(db, "events", ev.id))} style={{border: 'none', background: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer'}}>Delete</button>
                                
                                {/* Edit ခလုတ်ကိုလည်း prompt မသုံးချင်ရင် နောက်ပိုင်းမှာ Modal ပြောင်းလို့ရပါတယ် */}
                                <button 
                                  onClick={() => {
                                      setEditingEvent(ev); // လက်ရှိပွဲရဲ့ data ကို သိမ်းမယ်
                                      setShowEditModal(true); // Edit Modal ကို ဖွင့်မယ်
                                  }} 
                                  style={{border: 'none', background: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer'}}
                              >
                                  Edit
                              </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* ညာဘက်ခြမ်း - Sidebar (ဘယ် Tab ရောက်ရောက် အမြဲပြနေမယ်) */}
          <div style={sidebar}>
              {/* Family Group */}
              <div style={{ marginBottom: '25px' }}>
                  <h3 style={sidebarTitle}><Users size={16} /> Family</h3>
                  <div style={userList}>
                      {users.filter(u => u.id !== user.uid && u.role === 'Family').length > 0 ? (
                          users.filter(u => u.id !== user.uid && u.role === 'Family').map(u => renderUserItem(u))
                      ) : (
                          <p style={emptyText}>No family members found</p>
                      )}
                  </div>
              </div>

              {/* Friends Group */}
              <div style={{ marginBottom: '25px' }}>
                  <h3 style={sidebarTitle}><Users size={16} /> Friends</h3>
                  <div style={userList}>
                      {users.filter(u => u.id !== user.uid && u.role === 'Friend').length > 0 ? (
                          users.filter(u => u.id !== user.uid && u.role === 'Friend').map(u => renderUserItem(u))
                      ) : (
                          <p style={emptyText}>No friends found</p>
                      )}
                  </div>
              </div>

              {/* General Members */}
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

          {/* Event Modal */}
          {showEventModal && (
            <div style={modalOverlay}>
                <div style={modalContentLarge}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                        <h3 style={{margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b'}}>🗓️ ပွဲသစ်ထည့်ရန်</h3>
                        <X onClick={() => setShowEventModal(false)} style={{cursor: 'pointer', color: '#64748b'}} />
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <label style={labelStyle}>ပွဲအမည်</label>
                        <input placeholder="ဥပမာ - မိသားစု ဆုံဆည်းပွဲ" style={modalInputLarge} onChange={(e)=>setNewEvent({...newEvent, title: e.target.value})} />
                        
                        <label style={labelStyle}>ရက်စွဲ (MM/DD/YYYY)</label>
                        <input placeholder="08/25/2026" style={modalInputLarge} onChange={(e)=>setNewEvent({...newEvent, date: e.target.value})} />
                        
                        <label style={labelStyle}>နေရာ (Location)</label>
                        <input placeholder="နေရာအတိအကျ ရေးပါ..." style={modalInputLarge} onChange={(e)=>setNewEvent({...newEvent, location: e.target.value})} />
                        
                        <label style={labelStyle}>အသေးစိတ်အချက်အလက်များ</label>
                        <textarea placeholder="ဒီပွဲမှာ ဘာတွေလုပ်ကြမလဲ..." style={modalTextArea} onChange={(e)=>setNewEvent({...newEvent, details: e.target.value})} />
                        
                        <div style={{display: 'flex', gap: '12px', marginTop: '10px'}}>
                            <button onClick={async () => {
                                if(newEvent.title && newEvent.date) {
                                    await addDoc(collection(db, "events"), { ...newEvent, createdAt: serverTimestamp() });
                                    setShowEventModal(false);
                                    setNewEvent({ title: "", date: "", location: "", details: "" });
                                } else {
                                    alert("ပွဲအမည်နဲ့ ရက်စွဲကို ဖြည့်ပေးပါဦးခင်ဗျာ");
                                }
                            }} style={postBtnFull}>သိမ်းမည်</button>
                            <button onClick={() => setShowEventModal(false)} style={cancelBtn}>ပယ်ဖျက်</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Edit Event Modal */}
        {showEditModal && editingEvent && (
            <div style={modalOverlay}>
                <div style={modalContentLarge}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                        <h3 style={{margin: 0, fontSize: '20px', fontWeight: '700'}}>🗓️ ပွဲကို ပြင်ဆင်ရန်</h3>
                        <X onClick={() => setShowEditModal(false)} style={{cursor: 'pointer', color: '#64748b'}} />
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <label style={labelStyle}>ပွဲအမည်</label>
                        <input 
                            defaultValue={editingEvent.title} 
                            style={modalInputLarge} 
                            onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})} 
                        />
                        
                        <label style={labelStyle}>ရက်စွဲ (MM/DD/YYYY)</label>
                        <input 
                            defaultValue={editingEvent.date} 
                            style={modalInputLarge} 
                            onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})} 
                        />
                        
                        <label style={labelStyle}>နေရာ (Location)</label>
                        <input 
                            defaultValue={editingEvent.location} 
                            style={modalInputLarge} 
                            onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})} 
                        />
                        
                        <label style={labelStyle}>အသေးစိတ်အချက်အလက်များ</label>
                        <textarea 
                            defaultValue={editingEvent.details} 
                            style={modalTextArea} 
                            onChange={(e) => setEditingEvent({...editingEvent, details: e.target.value})} 
                        />
                        
                        <div style={{display: 'flex', gap: '12px', marginTop: '10px'}}>
                            <button onClick={async () => {
                                const eventRef = doc(db, "events", editingEvent.id);
                                await updateDoc(eventRef, {
                                    title: editingEvent.title,
                                    date: editingEvent.date,
                                    location: editingEvent.location || "",
                                    details: editingEvent.details || ""
                                });
                                setShowEditModal(false);
                                alert("ပြင်ဆင်ပြီးပါပြီ! ✨");
                            }} style={postBtnFull}>သိမ်းမည်</button>
                            <button onClick={() => setShowEditModal(false)} style={cancelBtn}>ပယ်ဖျက်</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {showBdayModal && (
            <div style={modalOverlay}>
                <div style={modalContentSmall}>
                    <h3>🎂 မွေးနေ့ဖြည့်ပေးပါ</h3>
                    <p style={{fontSize: '12px', color: '#64748b'}}>မွေးနေ့ရှင် Alert ပြပေးဖို့အတွက် မွေးနေ့ကို ဖြည့်ပေးဖို့ လိုပါတယ် (MM/DD/YYYY)</p>
                    <input 
                        placeholder="08/25/1995" 
                        style={modalInput} 
                        onChange={(e) => setTempBday(e.target.value)} 
                    />
                    <button onClick={async () => {
                      if(tempBday.includes('/')) {
                          const userRef = doc(db, "users", user.uid);
                          await setDoc(userRef, { birthday: tempBday }, { merge: true }); // မွေးနေ့ကို ဒီမှာ သိမ်းတာပါ
                          setShowBdayModal(false); // သိမ်းပြီးရင် Modal ပိတ်မယ်
                      } else {
                          alert("ကျေးဇူးပြု၍ MM/DD/YYYY format အတိုင်း မှန်ကန်အောင် ဖြည့်ပေးပါ (ဥပမာ- 08/25/1995)");
                      }
                  }} style={postBtnFull}>အတည်ပြုမည်</button>
                </div>
            </div>
        )}

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

const postBtnMini = {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
};

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

const adminCardStyle = {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    border: '1px solid #f1f5f9'
};

const adminUserRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '15px',
    border: '1px solid #f1f5f9'
};

const roleSelectStyle = {
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
    backgroundColor: '#fff'
};

const galleryGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '15px'
};

const galleryItem = {
    aspectRatio: '1/1',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
};

const galleryImg = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
};

const interestInputStyle = {
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    flex: 1,
    outline: 'none'
};

const saveBtnSmall = {
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
};

const modalOverlay = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 3000,
    backdropFilter: 'blur(3px)'
};

const modalContentLarge = {
    backgroundColor: '#fff', 
    padding: '30px', 
    borderRadius: '28px',
    width: '90%', 
    maxWidth: '500px', // ပိုကျယ်လိုက်ပါပြီ
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    boxSizing: 'border-box' // ဘေးဘက်တွေ မြုတ်မသွားအောင် ကာကွယ်ပေးတယ်
};

const modalInputLarge = {
    width: '100%', 
    padding: '14px', 
    borderRadius: '14px',
    border: '1px solid #e2e8f0', 
    marginBottom: '15px', 
    outline: 'none', 
    fontSize: '15px',
    boxSizing: 'border-box', // ဒါက အရေးကြီးဆုံးပါ
    transition: 'border-color 0.2s',
    fontFamily: 'inherit'
};

const modalTextArea = {
    ...modalInputLarge,
    minHeight: '120px', // အသေးစိတ်ရေးဖို့ ပိုကျယ်သွားပါပြီ
    resize: 'vertical'
};

const modalContentSmall = {
    backgroundColor: '#fff', padding: '25px', borderRadius: '24px',
    width: '350px', boxShadow: '0 20px 25px rgba(0,0,0,0.1)'
};

const modalInput = {
    width: '100%', padding: '12px', borderRadius: '12px',
    border: '1px solid #eee', marginBottom: '10px', outline: 'none', fontSize: '14px'
};

const cancelBtn = {
    flex: 1, padding: '12px', borderRadius: '12px',
    border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer'
};

const postBtnFull = {
    flex: 2, padding: '12px', borderRadius: '12px',
    border: 'none', backgroundColor: '#3b82f6', color: '#fff',
    fontWeight: 'bold', cursor: 'pointer'
};

const labelStyle = {
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    marginBottom: '6px',
    marginLeft: '4px'
};

export default App;