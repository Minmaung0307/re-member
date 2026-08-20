import React, { useState, useEffect } from "react";
import { auth, googleProvider, db } from "./firebase";
import {
  signInWithPopup, // ဒါလေး ပါသွားပါပြီ
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  addDoc,
  orderBy,
  deleteDoc,
  where,
} from "firebase/firestore";

import MainDashboard from "./MainDashboard";
import Chat from "./Chat";
import Workspace from "./Workspace";
import LandingPage from "./LandingPage";

import {
  LogOut,
  Users,
  Home,
  ShieldCheck,
  Palette,
  Gift,
  Search,
  X,
  Trash2,
  CheckSquare,
} from "lucide-react";

function App() {
  const [adminSearch, setAdminSearch] = useState("");
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("feed");
  const [darkMode, setDarkMode] = useState(false);

  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);

  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    location: "",
    details: "",
  });
  const [showBdayModal, setShowBdayModal] = useState(false);
  const [tempBday, setTempBday] = useState("");

  const [adminInterests, setAdminInterests] = useState({});
  const [adminBirthdays, setAdminBirthdays] = useState({});

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [showBucketList, setShowBucketList] = useState(false);
  const [goals, setGoals] = useState([]);

  const [showBucketModal, setShowBucketModal] = useState(false);
  const [bucketInput, setBucketInput] = useState("");

  const [userFamilyCode, setUserFamilyCode] = useState(null);
  const [showFamilyModal, setShowFamilyModal] = useState(false);

  const [isPaidUser, setIsPaidUser] = useState(false);

  //   အကောင့်ဝင်ခြင်းနှင့် မိသားစုကုဒ် စစ်ဆေးခြင်း Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const { getDoc } = await import("firebase/firestore");
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          // --- (၁) လူဟောင်းဖြစ်ပါက ---
          const data = docSnap.data();

          // Database ထဲက isPaid အတိုင်း သတ်မှတ်မယ်
          setIsPaidUser(data.isPaid === true);

          if (!data.birthday) setShowBdayModal(true);

          if (!data.familyCode) {
            setShowFamilyModal(true);
          } else {
            setUserFamilyCode(data.familyCode);
          }
        } else {
          // --- (၂) လူအသစ်ဖြစ်ပါက (ပထမဆုံးအကြိမ်ဝင်သူ) ---
          // အသစ်ဆောက်မှသာ isPaid: false လို့ သတ်မှတ်မယ်
          await setDoc(userRef, {
            id: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            isPaid: false, // အသစ်မို့လို့ အရင် ပိတ်ထားမယ်
            createdAt: serverTimestamp(),
          });
          setIsPaidUser(false);
          setShowFamilyModal(true);
        }

        // basic info ကို အမြဲ update လုပ်မယ် (lastSeen စတာတွေ)
        await setDoc(
          userRef,
          {
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            lastSeen: serverTimestamp(),
          },
          { merge: true },
        );

        // User List Listener (ကိုယ့်အုပ်စုကလူတွေပဲပြဖို့)
        // familyCode ရှိမှ နားထောင်မယ်
        if (docSnap.exists() && docSnap.data().familyCode) {
          onSnapshot(
            query(
              collection(db, "users"),
              where("familyCode", "==", docSnap.data().familyCode),
            ),
            (snap) => {
              setUsers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            },
          );
        }
      } else {
        // Logout ဖြစ်သွားရင် ရှင်းထုတ်မယ်
        setUserFamilyCode(null);
        setUsers([]);
        setIsPaidUser(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Posts, Events နှင့် Goals များအား Filter ခံပြီး ဆွဲယူသည့် Effect
  useEffect(() => {
    // User မရှိရင် သို့မဟုတ် ကုဒ်မရှိရင် ဘာမှမလုပ်နဲ့
    if (!user || !userFamilyCode) {
      setPosts([]);
      setEvents([]);
      setGoals([]);
      return;
    }

    let unsubPosts, unsubEvents, unsubBucket;

    try {
      // ၁။ Posts Listener
      const qPosts = query(
        collection(db, "posts"),
        where("familyCode", "==", userFamilyCode),
        orderBy("createdAt", "desc"),
      );
      unsubPosts = onSnapshot(
        qPosts,
        (snap) => {
          setPosts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        },
        (err) => {
          if (err.code !== "permission-denied") console.error(err);
        },
      );

      // ၂။ Events Listener
      const qEvents = query(
        collection(db, "events"),
        where("familyCode", "==", userFamilyCode),
      );
      unsubEvents = onSnapshot(
        qEvents,
        (snap) => {
          setEvents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        },
        (err) => {
          if (err.code !== "permission-denied") console.error(err);
        },
      );

      // ၃။ Bucket List (Goals) Listener
      const qBucket = query(
        collection(db, "bucketList"),
        where("familyCode", "==", userFamilyCode),
      );
      unsubBucket = onSnapshot(
        qBucket,
        (snap) => {
          setGoals(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        },
        (err) => {
          if (err.code !== "permission-denied") console.error(err);
        },
      );
    } catch (error) {
      console.error(error);
    }

    return () => {
      unsubPosts && unsubPosts();
      unsubEvents && unsubEvents();
      unsubBucket && unsubBucket();
    };
  }, [user, userFamilyCode]);

  // အခု Popup နဲ့ စမ်းကြည့်ပါမယ်
  const handleLogin = () => {
    signInWithPopup(auth, googleProvider)
      .then(() => console.log("Login Success"))
      .catch((err) => console.error("Login Error:", err));
  };

  const handleLogout = async () => {
    try {
      // ၁။ UI ဒေတာတွေကို အရင်ရှင်းမယ်
      // ဒီကောင်တွေ null ဖြစ်သွားတာနဲ့ useEffect ထဲက Listeners တွေ ရပ်သွားပါလိမ့်မယ်
      setUserFamilyCode(null);
      setEvents([]);
      setGoals([]);
      setUsers([]);
      setPosts([]);

      // ၂။ Firebase ကနေ မထွက်ခင် ခဏစောင့်မယ်
      // 100ms ထက် 500ms က ပိုပြီး စိတ်ချရပါတယ် (Listeners တွေ ပိတ်ချိန်ရအောင်လို့ပါ)
      setTimeout(async () => {
        await signOut(auth);
        console.log("Logged out successfully");
      }, 500);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        {/* ရိုးရိုးစာသားအစား လှပတဲ့ Spinner လေး သုံးနိုင်ပါတယ် */}
        <div style={spinnerStyle}></div>
        <p style={{ marginTop: "15px", color: "#64748b", fontWeight: "500" }}>
          အမှတ်တရများအား ပြင်ဆင်နေပါသည်...
        </p>
      </div>
    );

  // App function ရဲ့ အတွင်းထဲမှာ ထည့်ပါ
  const renderUserItem = (u) => (
    <div key={u.id} style={userItem} onClick={() => setSelectedUser(u)}>
      <div style={{ position: "relative" }}>
        <img src={u.photoURL} style={smallAvatar} alt="u" />
        {u.lastSeen && Date.now() - u.lastSeen.toMillis() < 300000 && (
          <div
            style={{
              width: "10px",
              height: "10px",
              backgroundColor: "#10b981",
              borderRadius: "50%",
              position: "absolute",
              bottom: 0,
              right: 0,
              border: "2px solid #fff",
            }}
          />
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          marginLeft: "10px",
        }}
      >
        {/* ၁။ နာမည် */}
        <span
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: darkMode ? "#fff" : "#1e293b",
          }}
        >
          {u.displayName}
        </span>

        {/* ၂။ Role (ဥပမာ - Family Member) */}
        <span
          style={{ fontSize: "11px", color: "#3b82f6", marginBottom: "2px" }}
        >
          {u.role || "Member"}
        </span>

        {/* ၃။ ဝါသနာ (အခု ဒါလေး ပြန်ထည့်လိုက်ပါပြီ) */}
        {u.interests && (
          <span
            style={{ fontSize: "10px", color: "#10b981", fontStyle: "italic" }}
          >
            🌟 {u.interests}
          </span>
        )}
      </div>
    </div>
  );

  const isAdmin = user?.email === "minmaung0307@gmail.com";

  return (
    <div
      style={{
        ...appContainer,
        backgroundColor: darkMode ? "#0f172a" : "#f8fafc",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        transition: "0.3s",
      }}
    >
      {!user ? (
        // ၁။ Login မဝင်ရသေးရင် Landing Page ပဲပြမယ်
        <LandingPage onLogin={handleLogin} />
      ) : !isPaidUser ? (
        // ၂။ Login ဝင်ပြီး ငွေမပေးရသေးရင် Verification Page ပဲပြမယ်
        <div style={pendingContainer}>
          <div style={{ fontSize: "60px", marginBottom: "20px" }}>⌛</div>
          <h2 style={{ marginBottom: "10px" }}>Payment Verification</h2>
          <p
            style={{
              maxWidth: "400px",
              lineHeight: "1.6",
              color: "#64748b",
              marginBottom: "20px",
            }}
          >
            ငွေပေးချေမှုအတွက် ကျေးဇူးတင်ပါသည်။ သင်၏အကောင့်အား Admin မှ
            အတည်ပြုပေးရန် စောင့်ဆိုင်းနေပါသည်။ ၁၂ နာရီအတွင်း အဆင်ပြေသွားပါမည်။
          </p>
          <a
            href="https://buy.stripe.com/eVq8wP5fC4PkgVPd7Q1B60f"
            target="_blank"
            rel="noreferrer"
            style={buyBtnMini}
          >
            ငွေမပေးရသေးပါက ဤနေရာတွင် ပေးချေပါ
          </a>
          <button onClick={() => signOut(auth)} style={logoutBtnSimple}>
            နောက်သို့ ပြန်ထွက်မည်
          </button>
        </div>
      ) : (
        // ၃။ ငွေပေးပြီးသား (Paid User) ဆိုရင် App တစ်ခုလုံးကို ပြမယ်
        <>
          <nav
            style={{
              ...navbarStyle,
              height: "60px",
              padding: "0 15px",
              backgroundColor: darkMode ? "#1e293b" : "#fff",
              borderBottom: `1px solid ${darkMode ? "#334155" : "#eee"}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                maxWidth: "1200px",
                margin: "0 auto",
              }}
            >
              <h2 style={{ ...logoText, fontSize: "18px" }}>
                <span style={{ color: "#c86202" }}>Re</span>
                <span style={{ color: "#06b715" }}>@</span>
                <span style={{ color: "#3b82f6" }}>Member</span>
              </h2>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <img
                  src={user.photoURL}
                  alt="p"
                  style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                />
                <button
                  onClick={handleLogout}
                  style={{ ...logoutBtn, padding: "6px" }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </nav>

          {/* Birthday Banners */}
          {users.map((u) => {
            if (!u.birthday || !u.birthday.includes("/")) return null;
            const [m, d] = u.birthday.split("/");
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const currentYear = today.getFullYear();
            let bdayDate = new Date(currentYear, parseInt(m) - 1, parseInt(d));
            bdayDate.setHours(0, 0, 0, 0);
            if (bdayDate < today) bdayDate.setFullYear(currentYear + 1);
            const diffTime = bdayDate - today;
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
              return (
                <div key={u.id} style={bdayBannerToday}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <img
                      src={u.photoURL}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        border: "2px solid #fff",
                      }}
                      alt="u"
                    />
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: "bold" }}>
                        🎉 Happy Birthday, {u.displayName}!
                      </div>
                      <div style={{ fontSize: "12px" }}>
                        ဒီနေ့ဟာ သူ့ရဲ့ မွေးနေ့ထူးမြတ်တဲ့နေ့ ဖြစ်ပါတယ်။
                        ဆုတောင်းပေးလိုက်ကြရအောင်။ 🎂
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            if (diffDays > 0 && diffDays <= 14) {
              return (
                <div key={u.id} style={bdayBannerUpcoming}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <div style={{ fontSize: "24px" }}>🎁</div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: "bold" }}>
                        Upcoming Birthday: {u.displayName}
                      </div>
                      <div style={{ fontSize: "12px" }}>
                        နောက် {diffDays} ရက်ဆိုရင် မွေးနေ့ရောက်တော့မှာပါ။
                        လက်ဆောင်အတွက် ကြိုတင်ပြင်ဆင်ထားပါဦး။ ✨
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })}

          <div style={mainLayout}>
            <div
              style={{
                ...contentBody,
                flex: activeTab === "workspace" ? "1 1 100%" : "1 1 70%",
                maxWidth: activeTab === "workspace" ? "100%" : "850px",
              }}
            >
              {activeTab === "feed" && (
                <MainDashboard
                  posts={posts}
                  setPosts={setPosts}
                  userFamilyCode={userFamilyCode}
                />
              )}
              {activeTab === "workspace" && (
                <Workspace
                  darkMode={darkMode}
                  user={user}
                  userFamilyCode={userFamilyCode}
                />
              )}

              {activeTab === "gallery" && (
                <div style={adminCardStyle}>
                  <h3 style={{ marginBottom: "20px" }}>
                    <Palette size={20} /> Memory Gallery
                  </h3>
                  <div style={galleryGrid}>
                    {posts
                      .filter((p) => p.fileUrl || p.imageUrl)
                      .map((p) => (
                        <div key={p.id} style={galleryItem}>
                          <img
                            src={p.fileUrl || p.imageUrl}
                            style={galleryImg}
                            alt="memory"
                            referrerPolicy="no-referrer"
                            onError={(e) =>
                              (e.target.parentElement.style.display = "none")
                            }
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {activeTab === "events" && (
                <div style={adminCardStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "20px",
                    }}
                  >
                    <h3>🗓️ Family Events</h3>
                    <button
                      onClick={() => setShowEventModal(true)}
                      style={postBtnMini}
                    >
                      + ပွဲသစ်ထည့်ရန်
                    </button>
                  </div>
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      style={{
                        padding: "15px",
                        borderBottom: "1px solid #eee",
                        position: "relative",
                      }}
                    >
                      <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                        {ev.title} {ev.isAnnual && "🔁"}
                      </div>
                      <div style={{ fontSize: "13px", color: "#3b82f6" }}>
                        {ev.date} | 📍 {ev.location || "No location"}
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#64748b",
                          margin: "5px 0",
                        }}
                      >
                        {ev.details}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "10px",
                        }}
                      >
                        <button
                          onClick={() => deleteDoc(doc(db, "events", ev.id))}
                          style={{
                            border: "none",
                            background: "none",
                            color: "#ef4444",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            setEditingEvent(ev);
                            setShowEditModal(true);
                          }}
                          style={{
                            border: "none",
                            background: "none",
                            color: "#3b82f6",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "admin" && (
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div style={adminCardStyle}>
                    {/* --- Dark Mode Toggle --- */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "15px",
                        backgroundColor: darkMode ? "#1e293b" : "#f1f5f9",
                        borderRadius: "15px",
                        marginBottom: "20px",
                      }}
                    >
                      <span style={{ fontWeight: "600" }}>🌙 Dark Mode</span>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        style={{
                          padding: "6px 15px",
                          borderRadius: "20px",
                          border: "none",
                          backgroundColor: darkMode ? "#3b82f6" : "#cbd5e1",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        {darkMode ? "ON" : "OFF"}
                      </button>
                    </div>

                    {/* --- SaaS Plan Info (A30, B20, C40 Concept) --- */}
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom: "20px",
                        overflowX: "auto",
                        paddingBottom: "10px",
                      }}
                    >
                      <div style={planBadge}>
                        Total Family:{" "}
                        {users.filter((u) => u.role === "Family").length}
                      </div>
                      <div style={planBadge}>
                        Total Friends:{" "}
                        {users.filter((u) => u.role === "Friend").length}
                      </div>
                      <div style={planBadge}>
                        Total Members:{" "}
                        {
                          users.filter((u) => u.role === "Member" || !u.role)
                            .length
                        }
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                        flexWrap: "wrap",
                        gap: "15px",
                      }}
                    >
                      {/* Header နှင့် Search Bar အပိုင်း */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "20px",
                          flexWrap: "wrap",
                          gap: "15px",
                        }}
                      >
                        <h3 style={{ margin: 0 }}>
                          {isAdmin
                            ? "👥 Family & Friends Management"
                            : "👤 My Profile Settings"}
                        </h3>

                        {/* လက်ရှိအုပ်စုကုဒ်ကို ပြမည့်နေရာ (အရင်ပေးထားတဲ့ ကုဒ်) */}
                        <div
                          style={{
                            backgroundColor: "#3b82f6",
                            color: "#fff",
                            padding: "8px 15px",
                            borderRadius: "10px",
                            marginBottom: "20px",
                            display: "inline-block",
                            fontSize: "12px",
                          }}
                        >
                          🏠 လက်ရှိအုပ်စု: <strong>{userFamilyCode}</strong>
                        </div>

                        {/* နာမည်ဖြင့် ရှာဖွေရန် Box */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            backgroundColor: darkMode ? "#1e293b" : "#f1f5f9",
                            padding: "8px 15px",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            width: "280px",
                          }}
                        >
                          <Search size={18} color="#64748b" />
                          <input
                            placeholder="နာမည်ဖြင့် ရှာဖွေပါ..."
                            style={{
                              border: "none",
                              background: "none",
                              outline: "none",
                              fontSize: "14px",
                              color: darkMode ? "#fff" : "#1e293b",
                              width: "100%",
                            }}
                            onChange={(e) =>
                              setAdminSearch(e.target.value.toLowerCase())
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* အုပ်စုလိုက် ခွဲခြားပြသခြင်း Logic */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "30px",
                      }}
                    >
                      {["Family", "Friend", "Member"].map((groupKey) => {
                        // လက်ရှိ Group နဲ့ ကိုက်ညီတဲ့ User တွေကို Filter လုပ်မယ်
                        const filteredGroup = users.filter((u) => {
                          const matchesRole =
                            groupKey === "Member"
                              ? !u.role || u.role === "Member"
                              : u.role === groupKey;
                          const matchesSearch = u.displayName
                            .toLowerCase()
                            .includes(adminSearch);
                          const canSee = isAdmin || u.id === user.uid; // လုံခြုံရေး logic
                          return matchesRole && matchesSearch && canSee;
                        });

                        // ရှာဖွေလို့ မတွေ့ရင် အဲ့ဒီ Group ကို ဖျောက်ထားမယ်
                        if (filteredGroup.length === 0) return null;

                        return (
                          <div key={groupKey}>
                            {/* Group ခေါင်းစဉ် (ဥပမာ - 🏠 Family) */}
                            <h4
                              style={{
                                marginBottom: "15px",
                                color: "#64748b",
                                fontSize: "15px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                borderBottom: "1px solid #f1f5f9",
                                paddingBottom: "8px",
                              }}
                            >
                              {groupKey === "Family" && "🏠 Family Members"}
                              {groupKey === "Friend" && "🤝 Friends List"}
                              {groupKey === "Member" && "👥 New / Others"}
                              <span
                                style={{
                                  fontSize: "12px",
                                  backgroundColor: "#e2e8f0",
                                  padding: "2px 8px",
                                  borderRadius: "10px",
                                  color: "#475569",
                                }}
                              >
                                {filteredGroup.length}
                              </span>
                            </h4>

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                              }}
                            >
                              {filteredGroup.map((u) => {
                                const isMe = u.id === user.uid;
                                return (
                                  <div key={u.id} style={adminUserRow}>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        flex: 1,
                                      }}
                                    >
                                      <img
                                        src={u.photoURL}
                                        style={smallAvatar}
                                        alt="u"
                                      />
                                      <div
                                        style={{
                                          fontSize: "14px",
                                          fontWeight: "600",
                                          color: darkMode ? "#fff" : "#1e293b",
                                        }}
                                      >
                                        {u.displayName} {isMe && "(Me)"}
                                      </div>
                                    </div>

                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "10px",
                                        flex: 2,
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      {isAdmin ? (
                                        <select
                                          onChange={async (e) => {
                                            const newRole = e.target.value;
                                            //   const currentCount = users.filter(
                                            //     (user) => user.role === newRole,
                                            //   ).length;

                                            //   // John's Plan Limits (A30, B20, C40)
                                            //   const limits = {
                                            //     Family: 30,
                                            //     Friend: 20,
                                            //     Member: 40,
                                            //   };

                                            //   if (currentCount >= limits[newRole]) {
                                            //     alert(
                                            //       `စိတ်မရှိပါနဲ့။ သင့်ရဲ့ Plan အရ ${newRole} အုပ်စုမှာ လူဦးရေ ${limits[newRole]} ယောက် ပြည့်နေပါပြီ။`,
                                            //     );
                                            //     e.target.value = u.role || "Member"; // မူလအတိုင်း ပြန်ထားမယ်
                                            //     return;
                                            //   }
                                            await updateDoc(
                                              doc(db, "users", u.id),
                                              { role: newRole },
                                            );
                                            alert(
                                              `${u.displayName} ကို ${newRole} အဖြစ် ပြောင်းလဲပြီးပါပြီ။`,
                                            );
                                          }}
                                          defaultValue={u.role || "Member"}
                                          style={roleSelectStyle}
                                        >
                                          <option value="Family">Family</option>
                                          <option value="Friend">Friend</option>
                                          <option value="Member">Member</option>
                                        </select>
                                      ) : (
                                        <span
                                          style={{
                                            fontSize: "12px",
                                            padding: "5px 12px",
                                            backgroundColor: "#e2e8f0",
                                            borderRadius: "10px",
                                            color: "#475569",
                                          }}
                                        >
                                          {u.role || "Member"}
                                        </span>
                                      )}

                                      <input
                                        placeholder="ဝါသနာ"
                                        style={interestInputStyle}
                                        defaultValue={u.interests || ""}
                                        onChange={(e) =>
                                          setAdminInterests({
                                            ...adminInterests,
                                            [u.id]: e.target.value,
                                          })
                                        }
                                      />

                                      <input
                                        placeholder="MM/DD/YYYY"
                                        style={{
                                          ...interestInputStyle,
                                          width: "120px",
                                        }}
                                        defaultValue={u.birthday || ""}
                                        onChange={(e) =>
                                          setAdminBirthdays({
                                            ...adminBirthdays,
                                            [u.id]: e.target.value,
                                          })
                                        }
                                      />

                                      {/* 🌟 အခု ဒီနေရာမှာ ကျွန်တော်ပေးတဲ့ ID ပြတဲ့ code ကို ထည့်လိုက်ပါ 🌟 */}
                                      <div
                                        style={{
                                          fontSize: "11px",
                                          color: "#64748b",
                                          backgroundColor: "#f1f5f9",
                                          padding: "5px 10px",
                                          borderRadius: "8px",
                                        }}
                                      >
                                        ID: {u.familyCode || "No Code"}
                                      </div>

                                      <button
                                        onClick={async () => {
                                          const finalInterest =
                                            adminInterests[u.id] !== undefined
                                              ? adminInterests[u.id]
                                              : u.interests || "";
                                          const finalBirthday =
                                            adminBirthdays[u.id] !== undefined
                                              ? adminBirthdays[u.id]
                                              : u.birthday || "";
                                          await updateDoc(
                                            doc(db, "users", u.id),
                                            {
                                              interests: finalInterest,
                                              birthday: finalBirthday,
                                            },
                                          );
                                          alert(
                                            "အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ! ✨",
                                          );
                                        }}
                                        style={saveBtnSmall}
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={sidebar}>
                    {/* Family Group */}
                    <div style={{ marginBottom: "25px" }}>
                      <h3 style={sidebarTitle}>
                        <Users size={16} /> Family
                      </h3>
                      <div style={userList}>
                        {users.filter(
                          (u) => u.id !== user.uid && u.role === "Family",
                        ).length > 0 ? (
                          users
                            .filter(
                              (u) => u.id !== user.uid && u.role === "Family",
                            )
                            .map((u) => renderUserItem(u))
                        ) : (
                          <p style={emptyText}>No family members found</p>
                        )}
                      </div>
                    </div>

                    {/* Friends Group */}
                    <div style={{ marginBottom: "25px" }}>
                      <h3 style={sidebarTitle}>
                        <Users size={16} /> Friends
                      </h3>
                      <div style={userList}>
                        {users.filter(
                          (u) => u.id !== user.uid && u.role === "Friend",
                        ).length > 0 ? (
                          users
                            .filter(
                              (u) => u.id !== user.uid && u.role === "Friend",
                            )
                            .map((u) => renderUserItem(u))
                        ) : (
                          <p style={emptyText}>No friends found</p>
                        )}
                      </div>
                    </div>

                    {/* General Members */}
                    <div>
                      <h3 style={sidebarTitle}>
                        <Users size={16} /> Members
                      </h3>
                      <div style={userList}>
                        {users.filter(
                          (u) =>
                            u.id !== user.uid &&
                            (!u.role || u.role === "Member"),
                        ).length > 0 ? (
                          users
                            .filter(
                              (u) =>
                                u.id !== user.uid &&
                                (!u.role || u.role === "Member"),
                            )
                            .map((u) => renderUserItem(u))
                        ) : (
                          <p style={emptyText}>No other members</p>
                        )}
                      </div>
                    </div>

                    {/* Bucket List */}
                    <div
                      style={{
                        marginTop: "30px",
                        padding: "15px",
                        backgroundColor: darkMode ? "#1e293b" : "#eff6ff",
                        borderRadius: "15px",
                        border: "1px dashed #3b82f6",
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 10px 0",
                          fontSize: "14px",
                          color: "#3b82f6",
                        }}
                      >
                        📝 Family Bucket List
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        {goals.map((goal) => (
                          <div
                            key={goal.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "8px",
                            }}
                          >
                            <label
                              style={{
                                fontSize: "12px",
                                display: "flex",
                                gap: "8px",
                                cursor: "pointer",
                                flex: 1,
                                textDecoration: goal.completed
                                  ? "line-through"
                                  : "none",
                                color: goal.completed ? "#94a3b8" : "inherit",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={goal.completed}
                                onChange={async () =>
                                  await updateDoc(
                                    doc(db, "bucketList", goal.id),
                                    {
                                      completed: !goal.completed,
                                    },
                                  )
                                }
                              />
                              {goal.text}
                            </label>
                            <Trash2
                              size={14}
                              color="#ef4444"
                              style={{ cursor: "pointer", opacity: 0.6 }}
                              onClick={async () => {
                                if (window.confirm("ဖျက်မှာ သေချာပါသလား?"))
                                  await deleteDoc(
                                    doc(db, "bucketList", goal.id),
                                  );
                              }}
                            />
                          </div>
                        ))}
                        <button
                          style={{
                            border: "none",
                            background: "none",
                            color: "#3b82f6",
                            fontSize: "11px",
                            cursor: "pointer",
                            textAlign: "left",
                            padding: "5px 0",
                            fontWeight: "bold",
                          }}
                          onClick={() => setShowBucketModal(true)}
                        >
                          + Add New Goal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <footer
            style={{
              textAlign: "center",
              padding: "40px 20px",
              marginBottom: "80px",
              color: darkMode ? "#94a3b8" : "#64748b",
              fontSize: "14px",
              borderTop: `1px solid ${darkMode ? "#334155" : "#f1f5f9"}`,
              marginTop: "auto",
            }}
          >
            <div style={{ marginBottom: "10px" }}>
              Re-Member - မိသားစုအမှတ်တရများ သိမ်းဆည်းရာ
            </div>
            <div style={{ fontWeight: "bold" }}>
              @MM {new Date().getFullYear()} • Built with Heart ❤️
            </div>
          </footer>

          {/* --- Bottom Navigation (Mobile Only Look) --- */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              width: "100%",
              height: "65px",
              backgroundColor: darkMode ? "#1e293b" : "#fff",
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              borderTop: `1px solid ${darkMode ? "#334155" : "#eee"}`,
              zIndex: 2000,
            }}
          >
            <button
              onClick={() => setActiveTab("feed")}
              style={activeTab === "feed" ? activeTabBtn : tabBtn}
            >
              <Home size={22} />
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              style={activeTab === "gallery" ? activeTabBtn : tabBtn}
            >
              <Palette size={22} />
            </button>
            <button
              onClick={() => setActiveTab("events")}
              style={activeTab === "events" ? activeTabBtn : tabBtn}
            >
              <Gift size={22} />
            </button>
            <button
              onClick={() => setActiveTab("workspace")}
              style={activeTab === "workspace" ? activeTabBtn : tabBtn}
            >
              <CheckSquare size={22} />
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              style={activeTab === "admin" ? activeTabBtn : tabBtn}
            >
              {isAdmin ? <ShieldCheck size={22} /> : <Users size={22} />}
            </button>
          </div>

          {showFamilyModal && (
            <div style={modalOverlay}>
              <div style={modalContentSmall}>
                <h3>🏠 မိသားစု အသိုင်းအဝိုင်း</h3>
                <p style={{ fontSize: "12px", color: "#64748b" }}>
                  ကိုယ့်မိသားစုရဲ့ သီးသန့်ကုဒ်ကို ရိုက်ထည့်ပါ (သို့မဟုတ်)
                  ကုဒ်အသစ်တစ်ခု ဖန်တီးပြီး မိသားစုဝင်တွေကို မျှဝေပါ။
                </p>
                <input
                  placeholder="ဥပမာ- CHO-FAMILY-2026"
                  style={modalInput}
                  id="familyCodeInput"
                />
                <button
                  onClick={async () => {
                    const code = document
                      .getElementById("familyCodeInput")
                      .value.trim()
                      .toUpperCase();

                    if (code) {
                      try {
                        // ၁။ Database မှာ ကုဒ်ကို သိမ်းမယ်
                        await updateDoc(doc(db, "users", user.uid), {
                          familyCode: code,
                        });

                        // ၂။ Local State ကို ချက်ချင်း Update လုပ်မယ် (existingData အစား code ကို သုံးပါ)
                        setUserFamilyCode(code);

                        // ၃။ သိမ်းပြီးရင် Modal ကို ပိတ်လိုက်မယ်
                        setShowFamilyModal(false);

                        alert("မိသားစုဝင်ရောက်မှု အောင်မြင်ပါသည်! ✨");
                      } catch (error) {
                        console.error("Error updating family code:", error);
                        alert("အမှားတစ်ခုရှိနေပါသည်။ ပြန်လည်ကြိုးစားကြည့်ပါ။");
                      }
                    } else {
                      alert("ကျေးဇူးပြု၍ မိသားစုကုဒ် တစ်ခုခု ရိုက်ထည့်ပါ။");
                    }
                  }}
                  style={postBtnFull}
                >
                  Join / Create Family
                </button>
              </div>
            </div>
          )}

          {/* Event Modal */}
          {showEventModal && (
            <div style={modalOverlay}>
              <div style={modalContentLarge}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#1e293b",
                    }}
                  >
                    🗓️ ပွဲသစ်ထည့်ရန်
                  </h3>
                  <X
                    onClick={() => setShowEventModal(false)}
                    style={{ cursor: "pointer", color: "#64748b" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>ပွဲအမည်</label>
                  <input
                    placeholder="ဥပမာ - မိသားစု ဆုံဆည်းပွဲ"
                    style={modalInputLarge}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                  />

                  <label style={labelStyle}>ရက်စွဲ (MM/DD/YYYY)</label>
                  <input
                    placeholder="08/25/2026"
                    style={modalInputLarge}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                  />

                  <label style={labelStyle}>နေရာ (Location)</label>
                  <input
                    placeholder="နေရာအတိအကျ ရေးပါ..."
                    style={modalInputLarge}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, location: e.target.value })
                    }
                  />

                  <label style={labelStyle}>အသေးစိတ်အချက်အလက်များ</label>
                  <textarea
                    placeholder="ဒီပွဲမှာ ဘာတွေလုပ်ကြမလဲ..."
                    style={modalTextArea}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, details: e.target.value })
                    }
                  />

                  <div
                    style={{ display: "flex", gap: "12px", marginTop: "10px" }}
                  >
                    <button
                      onClick={async () => {
                        // Debug လုပ်ဖို့အတွက် console မှာ ကြည့်မယ်
                        console.log(
                          "Title:",
                          newEvent.title,
                          "Date:",
                          newEvent.date,
                          "FamilyCode:",
                          userFamilyCode,
                        );

                        if (newEvent.title && newEvent.date && userFamilyCode) {
                          try {
                            await addDoc(collection(db, "events"), {
                              ...newEvent,
                              familyCode: userFamilyCode,
                              createdAt: serverTimestamp(),
                            });
                            setShowEventModal(false);
                            setNewEvent({
                              title: "",
                              date: "",
                              location: "",
                              details: "",
                            });
                            alert("ပွဲသစ်ကို သိမ်းဆည်းပြီးပါပြီ!");
                          } catch (error) {
                            console.error("Error adding event:", error);
                          }
                        } else {
                          // ဘာကြောင့် သိမ်းလို့မရတာလဲဆိုတာ အသိပေးမယ်
                          alert(
                            "ပွဲအမည်၊ ရက်စွဲ နှင့် မိသားစုကုဒ် လိုအပ်နေပါသည်။ မိသားစုကုဒ်ရှိမရှိ ပြန်စစ်ပေးပါ။",
                          );
                        }
                      }}
                      style={postBtnFull}
                    >
                      သိမ်းမည်
                    </button>
                    <button
                      onClick={() => setShowEventModal(false)}
                      style={cancelBtn}
                    >
                      ပယ်ဖျက်
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Event Modal */}
          {showEditModal && editingEvent && (
            <div style={modalOverlay}>
              <div style={modalContentLarge}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h3
                    style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}
                  >
                    🗓️ ပွဲကို ပြင်ဆင်ရန်
                  </h3>
                  <X
                    onClick={() => setShowEditModal(false)}
                    style={{ cursor: "pointer", color: "#64748b" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>ပွဲအမည်</label>
                  <input
                    defaultValue={editingEvent.title}
                    style={modalInputLarge}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        title: e.target.value,
                      })
                    }
                  />

                  <label style={labelStyle}>ရက်စွဲ (MM/DD/YYYY)</label>
                  <input
                    defaultValue={editingEvent.date}
                    style={modalInputLarge}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, date: e.target.value })
                    }
                  />

                  <label style={labelStyle}>နေရာ (Location)</label>
                  <input
                    defaultValue={editingEvent.location}
                    style={modalInputLarge}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        location: e.target.value,
                      })
                    }
                  />

                  <label style={labelStyle}>အသေးစိတ်အချက်အလက်များ</label>
                  <textarea
                    defaultValue={editingEvent.details}
                    style={modalTextArea}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        details: e.target.value,
                      })
                    }
                  />

                  <div
                    style={{ display: "flex", gap: "12px", marginTop: "10px" }}
                  >
                    <button
                      onClick={async () => {
                        const eventRef = doc(db, "events", editingEvent.id);
                        await updateDoc(eventRef, {
                          title: editingEvent.title,
                          date: editingEvent.date,
                          location: editingEvent.location || "",
                          details: editingEvent.details || "",
                        });
                        setShowEditModal(false);
                        alert("ပြင်ဆင်ပြီးပါပြီ! ✨");
                      }}
                      style={postBtnFull}
                    >
                      သိမ်းမည်
                    </button>
                    <button
                      onClick={() => setShowEditModal(false)}
                      style={cancelBtn}
                    >
                      ပယ်ဖျက်
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bucket List Modal */}
          {showBucketModal && (
            <div style={modalOverlay}>
              <div style={modalContentSmall}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "18px" }}>
                    📝 ရည်မှန်းချက်အသစ်
                  </h3>
                  <X
                    onClick={() => setShowBucketModal(false)}
                    style={{ cursor: "pointer", color: "#64748b" }}
                  />
                </div>

                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    marginBottom: "15px",
                  }}
                >
                  မိသားစုအတွက် အကောင်အထည်ဖော်ချင်တဲ့ ရည်မှန်းချက်ကို ရေးသားပါ။
                </p>

                <input
                  placeholder="ဥပမာ - ပုဂံသို့ မိသားစုခရီးထွက်ရန်..."
                  style={modalInput}
                  value={bucketInput}
                  onChange={(e) => setBucketInput(e.target.value)}
                  autoFocus
                />

                <div
                  style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                >
                  <button
                    onClick={async () => {
                      console.log(
                        "Goal:",
                        bucketInput,
                        "FamilyCode:",
                        userFamilyCode,
                      );

                      if (bucketInput.trim() && userFamilyCode) {
                        try {
                          await addDoc(collection(db, "bucketList"), {
                            text: bucketInput,
                            completed: false,
                            familyCode: userFamilyCode,
                            createdAt: serverTimestamp(),
                          });
                          setBucketInput("");
                          setShowBucketModal(false);
                        } catch (error) {
                          console.error("Error adding goal:", error);
                        }
                      } else {
                        alert(
                          "ရည်မှန်းချက်စာသား နှင့် မိသားစုကုဒ် လိုအပ်နေပါသည်။",
                        );
                      }
                    }}
                    style={postBtnFull}
                  >
                    ထည့်သွင်းမည်
                  </button>
                  <button
                    onClick={() => setShowBucketModal(false)}
                    style={cancelBtn}
                  >
                    မလုပ်တော့ပါ
                  </button>
                </div>
              </div>
            </div>
          )}

          {showBdayModal && (
            <div style={modalOverlay}>
              <div style={modalContentSmall}>
                <h3>🎂 မွေးနေ့ဖြည့်ပေးပါ</h3>
                <p style={{ fontSize: "12px", color: "#64748b" }}>
                  မွေးနေ့ရှင် Alert ပြပေးဖို့အတွက် မွေးနေ့ကို ဖြည့်ပေးဖို့
                  လိုပါတယ် (MM/DD/YYYY)
                </p>
                <input
                  placeholder="08/25/1995"
                  style={modalInput}
                  onChange={(e) => setTempBday(e.target.value)}
                />
                <button
                  onClick={async () => {
                    if (tempBday.includes("/")) {
                      const userRef = doc(db, "users", user.uid);
                      await setDoc(
                        userRef,
                        { birthday: tempBday },
                        { merge: true },
                      ); // မွေးနေ့ကို ဒီမှာ သိမ်းတာပါ
                      setShowBdayModal(false); // သိမ်းပြီးရင် Modal ပိတ်မယ်
                    } else {
                      alert(
                        "ကျေးဇူးပြု၍ MM/DD/YYYY format အတိုင်း မှန်ကန်အောင် ဖြည့်ပေးပါ (ဥပမာ- 08/25/1995)",
                      );
                    }
                  }}
                  style={postBtnFull}
                >
                  အတည်ပြုမည်
                </button>
              </div>
            </div>
          )}

          {selectedUser && (
            <Chat
              recipient={selectedUser}
              onClose={() => setSelectedUser(null)}
            />
          )}
        </>
      )}
    </div>
  );
  //    : (
  //     <div style={loginPageStyle}>
  //       <div style={loginCard}>
  //         <h1 style={{ fontSize: "2.5rem" }}>🏠</h1>
  //         <h2>Family Memories</h2>
  //         <button onClick={handleLogin} style={googleLoginBtn}>
  //           Login with Google
  //         </button>
  //       </div>
  //     </div>
  //   )
}

// --- Styles ---
const appContainer = {
  backgroundColor: "#f8fafc",
  minHeight: "100vh",
  transition: "0.3s",
  fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};
const navbarStyle = {
  height: "70px",
  backgroundColor: "#fff",
  borderBottom: "1px solid #eee",
  display: "flex",
  alignItems: "center",
  position: "fixed",
  width: "100%",
  zIndex: 1000,
};
const navContent = {
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  padding: "0 20px",
  alignItems: "center",
};
const logoText = { fontSize: "20px", fontWeight: "800" };
const userProfileArea = { display: "flex", alignItems: "center", gap: "10px" };
const avatarStyle = { width: "30px", height: "30px", borderRadius: "50%" };
const logoutBtn = {
  border: "none",
  background: "#fee2e2",
  color: "#ef4444",
  padding: "8px",
  borderRadius: "10px",
  cursor: "pointer",
};
const mainLayout = {
  display: "flex",
  flexDirection: "column", // ဖုန်းမှာ အပေါ်အောက် စီမယ်
  alignItems: "center",
  paddingTop: "70px",
  paddingBottom: "100px", // Bottom nav အတွက် နေရာချန်မယ်
  width: "100%",
  boxSizing: "border-box",
};
const contentBody = {
  width: "100%",
  maxWidth: "600px", // Feed တွေကို ဖုန်းမှာ အနေတော် ဖြစ်အောင် ကျဉ်းလိုက်တာပါ
  padding: "0 10px",
  boxSizing: "border-box",
};
const planBadge = {
  backgroundColor: "#3b82f6",
  color: "#fff",
  padding: "6px 15px",
  borderRadius: "12px",
  fontSize: "12px",
  whiteSpace: "nowrap",
  fontWeight: "600",
};
const sidebar = {
  flex: "1 1 250px",
  backgroundColor: "#fff",
  borderRadius: "24px",
  padding: "20px",
  height: "fit-content",
  position: "sticky",
  top: "90px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
};
const userList = { display: "flex", flexDirection: "column", gap: "12px" };
const userItem = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  cursor: "pointer",
  padding: "8px",
  borderRadius: "12px",
  backgroundColor: "#f8fafc",
};
const smallAvatar = { width: "35px", height: "35px", borderRadius: "50%" };
const loginPageStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "#3b82f6",
};
const loginCard = {
  backgroundColor: "#fff",
  padding: "40px",
  borderRadius: "24px",
  textAlign: "center",
  width: "300px",
};
const googleLoginBtn = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#1e293b",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  marginTop: "20px",
};

const bdayBanner = {
  backgroundColor: "#dbeafe",
  color: "#1e40af",
  padding: "12px",
  borderRadius: "12px",
  textAlign: "center",
  marginBottom: "20px",
  fontWeight: "600",
  border: "1px solid #bfdbfe",
  fontSize: "14px",
  boxShadow: "0 2px 10px rgba(59, 130, 246, 0.1)",
};

const tabBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "4px",
  padding: "10px 5px",
  fontSize: "12px",
  fontWeight: "600",
  transition: "0.3s",
  borderBottom: "3px solid transparent", // ပုံမှန်ဆိုရင် လိုင်းမပေါ်ဘူး
};
const activeTabBtn = {
  ...tabBtn,
  color: "#3b82f6",
  borderBottom: "2px solid #3b82f6",
  transform: "scale(1.1)",
};

const postBtnMini = {
  backgroundColor: "#3b82f6",
  color: "#fff",
  border: "none",
  padding: "8px 15px",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "5px",
};

const sidebarTitle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "12px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  borderBottom: "1px solid #f1f5f9",
  paddingBottom: "5px",
};

const emptyText = {
  fontSize: "12px",
  color: "#cbd5e1",
  fontStyle: "italic",
  paddingLeft: "10px",
};

const bdayBannerToday = {
  backgroundColor: "#fef3c7", // အဝါနုရောင်
  color: "#92400e",
  padding: "15px",
  borderRadius: "16px",
  marginBottom: "15px",
  border: "1px solid #fde68a",
  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
};

const bdayBannerUpcoming = {
  backgroundColor: "#ecfdf5", // အစိမ်းနုရောင်
  color: "#065f46",
  padding: "15px",
  borderRadius: "16px",
  marginBottom: "15px",
  border: "1px solid #a7f3d0",
  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
};

const adminCardStyle = {
  backgroundColor: "#fff",
  padding: "25px",
  borderRadius: "24px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
  border: "1px solid #f1f5f9",
};

const adminUserRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px",
  backgroundColor: "#f8fafc",
  borderRadius: "15px",
  border: "1px solid #f1f5f9",
};

const roleSelectStyle = {
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontSize: "13px",
  outline: "none",
  cursor: "pointer",
  backgroundColor: "#fff",
};

const galleryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  gap: "15px",
};

const galleryItem = {
  aspectRatio: "1/1",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const galleryImg = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const interestInputStyle = {
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  fontSize: "13px",
  flex: 1,
  outline: "none",
};

const saveBtnSmall = {
  backgroundColor: "#10b981",
  color: "#fff",
  border: "none",
  padding: "8px 15px",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 3000,
  backdropFilter: "blur(3px)",
};

const modalContentLarge = {
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "28px",
  width: "90%",
  maxWidth: "500px", // ပိုကျယ်လိုက်ပါပြီ
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  boxSizing: "border-box", // ဘေးဘက်တွေ မြုတ်မသွားအောင် ကာကွယ်ပေးတယ်
};

const modalInputLarge = {
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid #e2e8f0",
  marginBottom: "15px",
  outline: "none",
  fontSize: "15px",
  boxSizing: "border-box", // ဒါက အရေးကြီးဆုံးပါ
  transition: "border-color 0.2s",
  fontFamily: "inherit",
};

const modalTextArea = {
  ...modalInputLarge,
  minHeight: "120px", // အသေးစိတ်ရေးဖို့ ပိုကျယ်သွားပါပြီ
  resize: "vertical",
};

const modalContentSmall = {
  backgroundColor: "#fff",
  padding: "25px",
  borderRadius: "24px",
  width: "350px",
  boxShadow: "0 20px 25px rgba(0,0,0,0.1)",
};

const modalInput = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #eee",
  marginBottom: "10px",
  outline: "none",
  fontSize: "14px",
};

const cancelBtn = {
  flex: 1,
  padding: "12px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#f1f5f9",
  cursor: "pointer",
};

const postBtnFull = {
  flex: 2,
  padding: "12px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#3b82f6",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#64748b",
  marginBottom: "6px",
  marginLeft: "4px",
};

const scrollTopBtn = {
  position: "fixed",
  bottom: "30px",
  left: "30px", // right: '30px' အစား left: '30px' လို့ ပြောင်းလိုက်ပါ
  width: "45px",
  height: "45px",
  borderRadius: "50%",
  backgroundColor: "#3b82f6",
  color: "#fff",
  border: "none",
  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
  cursor: "pointer",
  fontSize: "20px",
  fontWeight: "bold",
  zIndex: 2000,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const searchContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  backgroundColor: "#f1f5f9",
  padding: "8px 15px",
  borderRadius: "12px",
  width: "250px",
};

const adminSearchInput = {
  border: "none",
  background: "none",
  outline: "none",
  fontSize: "14px",
  width: "100%",
};

const statsContainer = {
  display: "flex",
  gap: "15px",
  marginBottom: "25px",
  flexWrap: "wrap",
};

const statBox = {
  backgroundColor: "#fff",
  padding: "10px 20px",
  borderRadius: "12px",
  fontSize: "13px",
  fontWeight: "600",
  color: "#3b82f6",
  border: "1px solid #e2e8f0",
  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
};

const groupHeaderStyle = {
  marginBottom: "15px",
  color: "#64748b",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  borderBottom: "1px solid #f1f5f9",
  paddingBottom: "8px",
};

const countBadge = {
  backgroundColor: "#e2e8f0",
  color: "#475569",
  padding: "2px 8px",
  borderRadius: "10px",
  fontSize: "11px",
  fontWeight: "700",
};

const roleBadge = {
  fontSize: "12px",
  padding: "5px 12px",
  backgroundColor: "#e2e8f0",
  borderRadius: "10px",
  color: "#475569",
};

const spinnerStyle = {
  width: "40px",
  height: "40px",
  border: "4px solid #e2e8f0",
  borderTop: "4px solid #3b82f6",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const pendingContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  textAlign: "center",
  padding: "30px",
  // backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
  // color: darkMode ? '#f1f5f9' : '#1e293b',
  fontFamily: "sans-serif",
};

const buyBtnMini = {
  display: "inline-block",
  backgroundColor: "#3b82f6",
  color: "#fff",
  padding: "12px 25px",
  borderRadius: "15px",
  textDecoration: "none",
  fontWeight: "bold",
  margin: "20px 0",
  boxShadow: "0 4px 6px rgba(59, 130, 246, 0.2)",
};

// Logout ခလုတ်အတွက်ပါ တစ်ခါတည်း ထည့်ပေးလိုက်ပါတယ်
const logoutBtnSimple = {
  backgroundColor: "transparent",
  border: "1px solid #cbd5e1",
  color: "#64748b",
  padding: "8px 15px",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "14px",
  marginTop: "10px",
};

// Dark Mode အတွက် Card Styles များကိုလည်း variable အနေနဲ့ သုံးနိုင်ပါတယ်
// const cardBg = darkMode ? '#1e293b' : '#ffffff';
// const textColor = darkMode ? '#f8fafc' : '#1e293b';

export default App;
