import React, { useState, useEffect } from "react";
import { auth, googleProvider, db, storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
  or,
  and,
  getDocs,
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
  Edit,
  Palette,
  Gift,
  Search,
  X,
  Trash2,
  CheckSquare,
} from "lucide-react";

function App() {
  const moods = [
    // ပျော်ရွှင်ခြင်း (Happy)
    "😊",
    "🥰",
    "🤩",
    "🥳",
    "😎",
    // အနားယူခြင်း/ ပျင်းခြင်း (Relax/Bored)
    "😌",
    "😴",
    "☕",
    "🧘",
    "😑",
    // အလုပ်များခြင်း/ ကြိုးစားခြင်း (Productive/Busy)
    "🏃‍♂️",
    "👨‍💻",
    "📚",
    "💪",
    "✨",
    // စားချင်သောက်ချင်ခြင်း (Foodie)
    "😋",
    "🤤",
    "🥘",
    "🍕",
    "🍦",
    // ဝမ်းနည်းခြင်း/ စိတ်ပူခြင်း (Sad/Anxious)
    "😢",
    "🥺",
    "😰",
    "😱",
    "😡",
    // ကျန်းမာရေး/ အားနာခြင်း (Health/Grateful)
    "🤒",
    "🤕",
    "🙏",
    "🫂",
  ];
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

  const [connections, setConnections] = useState([]); // လက်ခံပြီးသား သူငယ်ချင်းများ
  const [pendingRequests, setPendingRequests] = useState([]); // ကိုယ့်ဆီလာထားတဲ့ Request များ
  const [searchEmail, setSearchSearchEmail] = useState(""); // ရှာဖွေမည့် Email
  const [allUsers, setAllUsers] = useState([]);

  const [unreadCounts, setUnreadMessages] = useState({});
  const [eventFile, setEventFile] = useState(null);

  const [fridgeNote, setFridgeNote] = useState("");
  const [fridgeNotes, setFridgeNotes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [allNotes, setAllNotes] = useState([]);
  const [viewImage, setViewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showFamily, setShowFamily] = useState(true);
  const [showFriends, setShowFriends] = useState(true);
  const [showConnections, setShowConnections] = useState(true);

  const [userFamilyId, setUserFamilyId] = useState(null);
  const [isFamilyOwner, setIsFamilyOwner] = useState(false);

  //   အကောင့်ဝင်ခြင်းနှင့် မိသားစုကုဒ် စစ်ဆေးခြင်း Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const { getDoc } = await import("firebase/firestore");
        const docSnap = await getDoc(userRef);

        let finalFamilyCode = null;

        if (docSnap.exists()) {
          // --- (၁) လူဟောင်းဖြစ်ပါက ---
          const data = docSnap.data();
          setUserFamilyId(data.familyId || null);
          setUserFamilyCode(data.familyCode || "");
          setIsFamilyOwner(data.isFamilyOwner === true);

          // isPaid status ကို db အတိုင်းယူမယ် (မရှိသေးရင် false လို့ ယူဆမယ်)
          const paidStatus = data.isPaid || false;
          setIsPaidUser(paidStatus);

          // လူဟောင်းဖြစ်ပေမယ့် db မှာ isPaid field လုံးဝမပါသေးရင် ထည့်ပေးမယ်
          if (data.isPaid === undefined) {
            await setDoc(userRef, { isPaid: false }, { merge: true });
          }

          if (!data.birthday) setShowBdayModal(true);
          if (!data.familyCode) {
            setShowFamilyModal(true);
          } else {
            setUserFamilyCode(data.familyCode);
          }
        } else {
          // --- (၂) လူအသစ်ဖြစ်ပါက ---
          await setDoc(
            userRef,
            {
              id: currentUser.uid,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              email: currentUser.email.toLowerCase(), // စနစ်တကျ တစ်ကြောင်းတည်းသိမ်းပါ
              isPaid: false, // အသစ်ဆိုရင် default ပိတ်ထားမယ်
              createdAt: serverTimestamp(),
              lastSeen: serverTimestamp(),
            },
            { merge: true },
          );

          setIsPaidUser(false);
          setShowFamilyModal(true);
        }

        // Basic Info (DisplayName, Photo, LastSeen) ကို အမြဲ Update လုပ်မယ်
        await setDoc(
          userRef,
          {
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            lastSeen: serverTimestamp(),
          },
          { merge: true },
        );

        // --- (၃) User List Listener ---
        // လူဟောင်းရော လူသစ်ရောအတွက် familyCode ရှိရင် Listener စဖွင့်မယ်
        if (finalFamilyCode || userFamilyCode) {
          const targetCode = finalFamilyCode || userFamilyCode;
          onSnapshot(
            query(
              collection(db, "users"),
              where("familyCode", "==", targetCode),
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
  }, [userFamilyCode]); // userFamilyCode ပြောင်းရင် list ပြန်ဆွဲဖို့ dependency ထည့်ထားပါတယ်

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

  useEffect(() => {
    if (!user) return;
    // အက်ပ်ထဲက လူအားလုံးကို ဆွဲယူထားမယ် (Email နဲ့ ရှာတွေ့နိုင်ဖို့)
    const unsubAll = onSnapshot(collection(db, "users"), (snap) => {
      setAllUsers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubAll();
  }, [user]);

  //   Chat Noti (စာအသစ်ရှိမရှိ နားထောင်ခြင်း)
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "messages"),
      where("receiverId", "==", user.uid),
      where("isRead", "==", false),
    );
    const unsub = onSnapshot(q, (snap) => {
      let counts = {};
      snap.docs.forEach((doc) => {
        const senderId = doc.data().senderId;
        counts[senderId] = (counts[senderId] || 0) + 1;
      });
      setUnreadMessages(counts);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // ၁။ Pending Requests ကို and() ဖြင့် အုပ်ပေးပါ
    const qPending = query(
      collection(db, "connections"),
      and(
        where("receiverId", "==", user.uid),
        where("status", "==", "pending"),
      ),
    );
    const unsubPending = onSnapshot(qPending, (snap) => {
      setPendingRequests(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });

    // ၂။ Accepted Connections ကို and() နှင့် or() တွဲသုံးပြီး ပြင်ပါ
    const qAccepted = query(
      collection(db, "connections"),
      and(
        where("status", "==", "accepted"),
        or(
          where("requesterId", "==", user.uid),
          where("receiverId", "==", user.uid),
        ),
      ),
    );

    const unsubAccepted = onSnapshot(
      qAccepted,
      (snap) => {
        setConnections(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        if (error.code === "permission-denied") return;
        console.error("Connections Error:", error);
      },
    );

    return () => {
      unsubPending();
      unsubAccepted();
    };
  }, [user]);

  // Firestore ကနေ Fridge Notes တွေကို နားထောင်မယ်
  useEffect(() => {
    if (!userFamilyCode) return;

    // ၁။ Family Fridge (စာတိုများ) ကို ဆွဲယူခြင်း
    const qFridge = query(
      collection(db, "fridgeNotes"),
      where("familyCode", "==", userFamilyCode),
      orderBy("createdAt", "desc"),
    );
    const unsubFridge = onSnapshot(qFridge, (snap) => {
      setFridgeNotes(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // ၂။ Shopping List (ဈေးဝယ်စာရင်း) ကို ဆွဲယူခြင်း
    const qShopping = query(
      collection(db, "shoppingList"),
      where("familyCode", "==", userFamilyCode),
    );
    const unsubShopping = onSnapshot(qShopping, (snap) => {
      setShoppingList(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubFridge();
      unsubShopping();
    };
  }, [userFamilyCode]);

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
          Preparing your memories...
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

        <span
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: darkMode ? "#fff" : "#1e293b",
          }}
        >
          {u.displayName}{" "}
          {u.mood && (
            <span title="Current Mood" style={{ marginLeft: "5px" }}>
              {u.mood}
            </span>
          )}
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

      {/* စာအသစ်ရှိရင် ပြမည့် Badge */}
      {unreadCounts[u.id] > 0 && (
        <div
          style={{
            backgroundColor: "#ef4444",
            color: "white",
            borderRadius: "50%",
            width: "20px",
            height: "20px",
            fontSize: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            marginLeft: "auto", // ညာဘက်အစွန်ကို ပို့ပေးမယ်
          }}
        >
          {unreadCounts[u.id]}
        </div>
      )}
    </div>
  );

  const handleFridgePost = async () => {
    if (!fridgeNote.trim()) return;
    await addDoc(collection(db, "fridgeNotes"), {
      text: fridgeNote,
      userName: user.displayName,
      familyCode: userFamilyCode,
      createdAt: serverTimestamp(),
    });
    setFridgeNote("");
  };

  const handleDeleteFridgeNote = async (id) => {
    if (window.confirm("ဤစာတိုကို ဖျက်မှာ သေချာပါသလား?")) {
      try {
        await deleteDoc(doc(db, "fridgeNotes", id));
      } catch (error) {
        console.error("Error deleting note: ", error);
      }
    }
  };

  const updateFamilyCode = async (newCode) => {
    if (newCode.length < 8) {
      alert("For security, the code must be at least 8 characters long.");
      return;
    }

    if (!userFamilyId) {
      alert("Family ID (FID) not found.");
      return;
    }

    try {
      // ၁။ Families collection ထဲက code ကို အရင်ပြင်မယ်
      await updateDoc(doc(db, "families", userFamilyId), { code: newCode });

      // ၂။ ကိုယ့်ရဲ့ User Profile ထဲက familyCode ကိုပါ ပြင်မယ်
      await updateDoc(doc(db, "users", user.uid), { familyCode: newCode });

      setUserFamilyCode(newCode); // UI မှာ ချက်ချင်း ပြောင်းသွားစေရန်
      alert("Family Code changed successfully. ✨");
    } catch (error) {
      console.error("Update Code Error:", error);
      alert("Unable to change the code.");
    }
  };

  // ၁။ သူငယ်ချင်းအသစ် ရှာပြီး Request ပို့မယ်
  const handleAddFriend = async () => {
    // ၁။ ရိုက်လိုက်တဲ့ Email ကို နေရာလွတ်တွေဖြတ်ပြီး စာလုံးအသေး (lowercase) ပြောင်းမယ်
    const targetEmail = searchEmail.trim().toLowerCase();

    // အကယ်၍ ဘာမှမရိုက်ထားရင် ဘာမှမလုပ်ဘူး
    if (!targetEmail) return;

    try {
      // ၂။ Firestore မှာ အဲ့ဒီ Email နဲ့လူရှိလား ရှာမယ်
      const q = query(
        collection(db, "users"),
        where("email", "==", targetEmail),
      );
      const snap = await getDocs(q);

      // ၃။ ရှာမတွေ့ရင် (တစ်ခါမှ Login မဝင်ဖူးတဲ့လူဆိုရင် ရှာမတွေ့ပါဘူး)
      if (snap.empty) {
        alert(
          "No user was found with this email address. Please check the spelling and try again. The other person must have logged into the app at least once.",
        );
        return;
      }

      const targetUser = snap.docs[0].data();

      // ၄။ ကိုယ့် Email ကိုယ် ပြန်ရှာမိတာလား စစ်မယ်
      if (targetUser.id === user.uid) {
        alert("You can't add yourself as a friend.");
        return;
      }

      // ၅။ Connection Request (သူငယ်ချင်းတောင်းဆိုချက်) ပို့မယ်
      await addDoc(collection(db, "connections"), {
        requesterId: user.uid,
        requesterName: user.displayName,
        receiverId: targetUser.id,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      alert(
        "Request sent! The person will appear in the Sidebar once they accept the request.",
      );
      setSearchSearchEmail(""); // ရိုက်ထားတဲ့ Email အကွက်ကို ပြန်ရှင်းမယ်
    } catch (error) {
      console.error("Error in handleAddFriend:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  // ၂။ Request ကို လက်ခံမယ်
  const acceptFriend = async (requestId) => {
    await updateDoc(doc(db, "connections", requestId), { status: "accepted" });
  };

  // ၃။ Connection ကို ပယ်ဖျက်မယ် (Unfriend)
  const removeFriend = async (connectionId) => {
    if (window.confirm("Are you sure you want to disconnect from this person?")) {
      await deleteDoc(doc(db, "connections", connectionId));
    }
  };

  // --- 🌟 မွေးနေ့ရှင်များကို စစ်ထုတ်ခြင်း မွေးနေ့ Logic အသစ် 🌟 ---
  const todayBDays = [];
  const upcomingBDays = [];

  users.forEach((u) => {
    if (!u.birthday || !u.birthday.includes("/")) return;

    const [m, d] = u.birthday.split("/");

    // ၁။ ဒီနေ့ရက်စွဲကိုယူပြီး အချိန်ကို ၀ နာရီ (Midnight) သတ်မှတ်မယ်
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ၂။ ဒီနှစ်ထဲက မွေးနေ့ရက်စွဲကိုတည်ဆောက်ပြီး အချိန်ကို ၀ နာရီ (Midnight) သတ်မှတ်မယ်
    let bdayDate = new Date(today.getFullYear(), parseInt(m) - 1, parseInt(d));
    bdayDate.setHours(0, 0, 0, 0);

    // ၃။ အကယ်၍ မွေးနေ့ရက်စွဲက 'ယနေ့' ထက် စောနေမှသာ (မွေးနေ့ကျော်သွားမှသာ) နောက်နှစ်ကို ရွှေ့မယ်
    // (ဒီနေ့က မွေးနေ့ဆိုရင် today နဲ့ bdayDate က တူနေမှာဖြစ်လို့ ဒီအထဲ မဝင်တော့ပါဘူး)
    if (bdayDate < today) {
      bdayDate.setFullYear(today.getFullYear() + 1);
    }

    // ၄။ ရက်ခြားနားချက်ကို တွက်မယ်
    const diffTime = bdayDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || diffDays === 365 || diffDays === 366) {
      todayBDays.push(u);
    } else if (diffDays > 0 && diffDays <= 14) {
      upcomingBDays.push({ ...u, daysLeft: diffDays });
    }
  });

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
            Thank you for your payment. Your account is awaiting approval from the Admin. It will be approved within 12 hours.
          </p>
          <a
            href="https://buy.stripe.com/dRmeVd9vS0z4493ebU1B60g"
            target="_blank"
            rel="noreferrer"
            style={buyBtnMini}
          >
            If you haven't made the payment yet, please pay here.
          </a>
          <button onClick={() => signOut(auth)} style={logoutBtnSimple}>
            Go Back
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
            <div style={navContent}>
              <h2 style={{ ...logoText, fontSize: "18px" }}>
                <span style={{ color: "#c86202" }}>Re</span>
                <span style={{ color: "#06b715" }}>@</span>
                <span style={{ color: "#3b82f6" }}>Member</span>
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  paddingRight: "25px",
                }}
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

          {/* 🌟 ဤနေရာတွင် မွေးနေ့ Banner ကုဒ်များကို ပြန်ထည့်ပါ 🌟 */}
          <div
            style={{
              width: "100%",
              maxWidth: "1200px",
              margin: "80px auto 0",
              padding: "0 15px",
            }}
          >
            {/* ဒီနေ့ မွေးနေ့ရှင်များ */}
            {todayBDays.length > 0 && (
              <div style={bdayBannerToday}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "15px" }}
                >
                  <div style={{ display: "flex" }}>
                    {todayBDays.map((u, index) => (
                      <img
                        key={u.id}
                        src={u.photoURL}
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          border: "2px solid #fff",
                          marginLeft: index === 0 ? 0 : "-15px",
                        }}
                        alt="u"
                      />
                    ))}
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <strong style={{ color: "#92400e" }}>
                      🎉 Happy Birthday!
                    </strong>
                    <div style={{ fontSize: "13px" }}>
                      Today is {todayBDays.map((u) => u.displayName).join(", ")}{" "}
                      birthday! Let's send our best wishes! 🎂
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* မကြာမီ မွေးနေ့ရှိသူများ */}
            {upcomingBDays.length > 0 && (
              <div style={bdayBannerUpcoming}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "15px" }}
                >
                  <span style={{ fontSize: "24px" }}>🎁</span>
                  <div style={{ textAlign: "left" }}>
                    <strong style={{ color: "#065f46" }}>
                      Upcoming Birthdays
                    </strong>
                    <div style={{ fontSize: "13px" }}>
                      {upcomingBDays.map((u, i) => (
                        <span key={u.id}>
                          {u.displayName} (
                          {u.daysLeft === 1
                            ? "မနက်ဖြန်"
                            : `${u.daysLeft} ရက်အလို`}
                          ){i < upcomingBDays.length - 1 ? "၊ " : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

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
                  darkMode={darkMode}
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
                  <h3
                    style={{
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Palette size={20} /> Memory Gallery
                  </h3>
                  <div style={galleryGrid}>
                    {posts.map((post) => {
                      // ၁။ အရင်တင်ထားတဲ့ ပုံတစ်ပုံချင်းစီရော၊ အခုတင်တဲ့ ပုံအများကြီးရော အကုန်အလုပ်လုပ်အောင် Array တစ်ခုအရင်ဆောက်မယ်
                      const allMedia =
                        post.media ||
                        (post.fileUrl || post.imageUrl
                          ? [
                              {
                                url: post.fileUrl || post.imageUrl,
                                type: "image",
                              },
                            ]
                          : []);

                      return allMedia.map((item, index) => (
                        <div
                          key={`${post.id}-${index}`}
                          style={{
                            ...galleryItem,
                            position: "relative",
                            cursor: "pointer",
                            overflow: "hidden",
                          }}
                          onClick={() => setViewImage(item.url)} // နှိပ်လိုက်ရင် ပုံကြီးပြမယ့် Lightbox logic
                        >
                          {/* ၂။ ဗီဒီယိုဖြစ်ဖြစ် ပုံဖြစ်ဖြစ် Gallery မှာ Thumbnail အနေနဲ့ပြမယ် */}
                          {item.type === "video" ? (
                            <div
                              style={{
                                position: "relative",
                                width: "100%",
                                height: "100%",
                              }}
                            >
                              <video src={item.url} style={galleryImg} />
                              <div style={playIconOverlay}>▶️</div>
                            </div>
                          ) : (
                            <img
                              src={item.url}
                              style={galleryImg}
                              alt="memory"
                              referrerPolicy="no-referrer"
                              onError={(e) =>
                                (e.target.parentElement.style.display = "none")
                              }
                            />
                          )}

                          {/* ၃။ အသုံးဝင်မယ့် Overlay - ဘယ်သူတင်ထားတာလဲဆိုတာကို ပုံပေါ်မှာပြမယ် */}
                          <div style={galleryInfoOverlay}>
                            <img
                              src={post.userImage}
                              style={tinyAvatar}
                              alt="u"
                            />
                            <span style={tinyText}>{post.userName}</span>
                          </div>
                        </div>
                      ));
                    })}
                  </div>

                  {/* ၄။ Gallery ထဲမှာ ပုံမရှိရင် ပြမယ့် စာသား */}
                  {posts.filter((p) => p.media || p.fileUrl || p.imageUrl)
                    .length === 0 && (
                    <p
                      style={{
                        textAlign: "center",
                        color: "#64748b",
                        padding: "20px",
                      }}
                    >
                      Gallery ထဲမှာ အမှတ်တရပုံများ မရှိသေးပါ
                    </p>
                  )}
                </div>
              )}

              {activeTab === "events" && (
                <div style={adminCardStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>🗓️ Family Events</h3>
                    <button
                      onClick={() => setShowEventModal(true)}
                      style={postBtnMini}
                    >
                      + Add Event
                    </button>
                  </div>

                  <div style={eventListGrid}>
                    {events.map((ev) => (
                      <div key={ev.id} style={eventCard}>
                        {/* ၁။ ပုံပြသခြင်း (Field နာမည် ၂ မျိုးလုံးကို စစ်ပေးထားပါတယ်) */}
                        <div style={eventImageWrapper}>
                          {ev.imageUrl || ev.image ? (
                            <img
                              src={ev.imageUrl || ev.image}
                              style={eventCardImg}
                              alt="event"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                // ပုံအဟောင်းတွေ လင့်ခ်ပျက်နေရင် Placeholder အစား Gradient ပြောင်းခိုင်းလိုက်တာပါ
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}

                          {/* ပုံမရှိတဲ့အခါ သို့မဟုတ် ပုံပျက်နေတဲ့အခါ ပြမည့် ပုံစံလှလှလေး */}
                          <div
                            style={{
                              ...eventCardImg,
                              display:
                                ev.imageUrl || ev.image ? "none" : "flex", // ပုံရှိရင် ဖျောက်ထားမယ်
                              background:
                                "linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)",
                              justifyContent: "center",
                              alignItems: "center",
                              color: "#818cf8",
                              fontSize: "40px",
                            }}
                          >
                            🗓️
                          </div>
                          {/* ၂။ Edit/Delete Icons (ပုံပေါ်မှာ Floating ပုံစံတင်ထားပါတယ်) */}
                          <div style={eventActionsOverlay}>
                            <button
                              onClick={() => {
                                setEditingEvent(ev);
                                setShowEditModal(true);
                              }}
                              style={iconActionBtn}
                              title="Edit"
                            >
                              <Edit size={14} color="#3b82f6" />
                            </button>
                            <button
                              onClick={() =>
                                deleteDoc(doc(db, "events", ev.id))
                              }
                              style={iconActionBtn}
                              title="Cancel"
                            >
                              <Trash2 size={14} color="#ef4444" />
                            </button>
                          </div>
                        </div>

                        <div style={{ padding: "15px" }}>
                          <div
                            style={{
                              fontWeight: "bold",
                              fontSize: "17px",
                              color: "#1e293b",
                              marginBottom: "5px",
                            }}
                          >
                            {ev.title}
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#3b82f6",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            📅 {ev.date}
                          </div>
                          {ev.location && (
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#64748b",
                                marginTop: "4px",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              📍 {ev.location}
                            </div>
                          )}
                          <p
                            style={{
                              fontSize: "13px",
                              color: "#475569",
                              marginTop: "10px",
                              lineHeight: "1.4",
                              minHeight: "40px",
                            }}
                          >
                            {ev.details}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
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

                    {/* Admin/Profile Tab အတွင်း Mood Picker အပိုင်း */}
                    <div
                      style={{
                        ...moodCardStyle,
                        // Error တက်နေတဲ့ darkMode ကို ဒီမှာပဲ တိုက်ရိုက်စစ်ပါမယ်
                        backgroundColor: darkMode ? "#1e293b" : "#f8fafc",
                        border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "15px",
                        }}
                      >
                        <h4
                          style={{
                            margin: 0,
                            fontSize: "15px",
                            fontWeight: "700",
                            color: darkMode ? "#fff" : "#1e293b",
                          }}
                        >
                          💡 How are you feeling today?
                        </h4>
                        <button
                          onClick={() =>
                            updateDoc(doc(db, "users", user.uid), {
                              mood: "",
                            })
                          }
                          style={{
                            border: "none",
                            background: "none",
                            color: "#64748b",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          Clear
                        </button>
                      </div>

                      <div style={moodGridStyle}>
                        {moods.map((m) => {
                          // လက်ရှိ Login ဝင်ထားတဲ့ user ရဲ့ data ကို ယူမယ်
                          const me = users.find((obj) => obj.id === user.uid);

                          return (
                            <div
                              key={m}
                              onClick={async () => {
                                await updateDoc(doc(db, "users", user.uid), {
                                  mood: m,
                                });
                              }}
                              style={{
                                ...moodItemStyle,
                                // 'u' အစား 'me' ကို သုံးလိုက်ပါပြီ
                                backgroundColor:
                                  me?.mood === m
                                    ? "#3b82f6"
                                    : darkMode
                                      ? "#334155"
                                      : "#fff",
                                color: me?.mood === m ? "#fff" : "inherit",
                                border: `1px solid ${me?.mood === m ? "#3b82f6" : darkMode ? "#475569" : "#f1f5f9"}`,
                              }}
                            >
                              {m}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 🌟 ဤနေရာတွင် မိသားစုကုဒ် ပြောင်းလဲရန် Box 🌟 */}
                    {isFamilyOwner && (
                      <div
                        style={{
                          ...ownerSettingCard,
                          backgroundColor: darkMode ? "#1e293b" : "#f0fdf4",
                          border: `1px solid ${darkMode ? "#334155" : "#bbf7d0"}`,
                          padding: "20px",
                          borderRadius: "20px",
                          marginBottom: "20px",
                        }}
                      >
                        <h4
                          style={{
                            margin: "0 0 10px 0",
                            color: darkMode ? "#fff" : "#166534",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          🔐 Change Family Code (Owner Only)
                        </h4>
                        <p
                          style={{
                            fontSize: "11px",
                            color: darkMode ? "#94a3b8" : "#64748b",
                            marginBottom: "10px",
                          }}
                        >
                          လက်ရှိကုဒ် -{" "}
                          <strong style={{ color: darkMode ? "#fff" : "#000" }}>
                            {userFamilyCode}
                          </strong>
                        </p>

                        <div style={{ display: "flex", gap: "10px" }}>
                          <input
                            id="newFamilyCodeInput"
                            placeholder="ကုဒ်အသစ် (၈ လုံး)"
                            style={{
                              ...modalInputSmall,
                              flex: 1,
                              backgroundColor: darkMode ? "#334155" : "#fff",
                              color: darkMode ? "#fff" : "#000",
                              border: `1px solid ${darkMode ? "#475569" : "#e2e8f0"}`,
                            }}
                          />
                          <button
                            onClick={() => {
                              const inputEl =
                                document.getElementById("newFamilyCodeInput");
                              const newCode = inputEl.value
                                .trim()
                                .toUpperCase();
                              updateFamilyCode(newCode);
                              inputEl.value = "";
                            }}
                            style={saveBtnSmall}
                          >
                            ပြောင်းမည်
                          </button>
                        </div>
                      </div>
                    )}

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
                          🏠 Current Code: <strong>{userFamilyCode}</strong>
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
                            placeholder="Search by Name..."
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
                                        placeholder="Interest/Hobby"
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

                                      {/* ID ကို ရိုက်ထည့်လို့ရအောင် Input အဖြစ် ပြောင်းလဲထားသော code */}
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "5px",
                                          fontSize: "11px",
                                          color: "#64748b",
                                          backgroundColor: "#f1f5f9",
                                          padding: "2px 10px",
                                          borderRadius: "8px",
                                          border: "1px solid #e2e8f0",
                                        }}
                                      >
                                        <span>ID:</span>
                                        <input
                                          placeholder="Code"
                                          defaultValue={u.familyCode || ""}
                                          style={{
                                            width: "60px",
                                            border: "none",
                                            background: "none",
                                            fontSize: "11px",
                                            fontWeight: "bold",
                                            outline: "none",
                                            color: "#3b82f6",
                                            padding: "0",
                                          }}
                                          onChange={(e) =>
                                            setAdminBirthdays({
                                              ...adminBirthdays,
                                              [`${u.id}_code`]: e.target.value,
                                            })
                                          }
                                        />
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

                                          // 🌟 အသစ်ထည့်လိုက်သော code: ရိုက်ထည့်လိုက်တဲ့ ID ကို ယူမယ်
                                          const finalFamilyCode =
                                            adminBirthdays[`${u.id}_code`] !==
                                            undefined
                                              ? adminBirthdays[`${u.id}_code`]
                                              : u.familyCode || "";

                                          await updateDoc(
                                            doc(db, "users", u.id),
                                            {
                                              interests: finalInterest,
                                              birthday: finalBirthday,
                                              familyCode: finalFamilyCode, // 🌟 ဤစာကြောင်းကို ထည့်ပေးပါ
                                            },
                                          );
                                          alert(
                                            "အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ! ✨",
                                          );

                                          // ကုဒ်ပြောင်းသွားရင် အုပ်စုတွေ အလိုလိုကွဲသွားအောင် refresh တစ်ချက်လုပ်ပေးတာ ပိုကောင်းပါတယ်
                                          if (
                                            adminBirthdays[`${u.id}_code`] !==
                                            undefined
                                          ) {
                                            window.location.reload();
                                          }
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
                    {/* --- ၁။ သူငယ်ချင်း ရှာဖွေရန် Box --- */}
                    <div style={{ marginBottom: "20px" }}>
                      <h4 style={sidebarTitle}>
                        <Search size={14} /> Find Connection
                      </h4>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <input
                          placeholder="Search by Email ..."
                          value={searchEmail}
                          onChange={(e) => setSearchSearchEmail(e.target.value)}
                          style={modalInputSmall}
                        />
                        <button onClick={handleAddFriend} style={saveBtnSmall}>
                          Add
                        </button>
                      </div>
                    </div>

                    {/* --- ၂။ Incoming Requests (Request လာထားရင် ပြမယ်) --- */}
                    {pendingRequests.length > 0 && (
                      <div
                        style={{
                          marginBottom: "20px",
                          backgroundColor: "#fff7ed",
                          padding: "10px",
                          borderRadius: "12px",
                        }}
                      >
                        <h4 style={{ ...sidebarTitle, color: "#c2410c" }}>
                          Pending Requests
                        </h4>
                        {pendingRequests.map((req) => (
                          <div
                            key={req.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "5px",
                            }}
                          >
                            <span style={{ fontSize: "12px" }}>
                              {req.requesterName}
                            </span>
                            <button
                              onClick={() => acceptFriend(req.id)}
                              style={saveBtnSmall}
                            >
                              Accept
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* --- ၃။ External Connections (တခြားအိမ်က ချိတ်ထားသူများ) --- */}
                    <div style={{ marginBottom: "15px" }}>
                      <h3
                        style={{
                          ...sidebarTitle,
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                        onClick={() => setShowConnections(!showConnections)}
                      >
                        <span>
                          <Users size={16} /> Connections
                        </span>
                        <span>{showConnections ? "−" : "+"}</span>
                      </h3>
                      {showConnections && (
                        <div style={userList}>
                          {/* လက်ရှိရှိနေတဲ့ connections filter code ကို ဒီမှာထည့်ပါ */}
                          {connections.map((conn) => {
                            const friendId =
                              conn.requesterId === user.uid
                                ? conn.receiverId
                                : conn.requesterId;
                            const friend = allUsers.find(
                              (u) => u.id === friendId,
                            );
                            return friend ? renderUserItem(friend) : null;
                          })}
                        </div>
                      )}
                    </div>

                    {/* Family Group */}
                    <div style={{ marginBottom: "15px" }}>
                      <h3
                        style={{
                          ...sidebarTitle,
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                        onClick={() => setShowFamily(!showFamily)}
                      >
                        <span>
                          <Users size={16} /> Family
                        </span>
                        <span>{showFamily ? "−" : "+"}</span>
                      </h3>
                      {showFamily && (
                        <div style={userList}>
                          {users
                            .filter(
                              (u) => u.id !== user.uid && u.role === "Family",
                            )
                            .map((u) => renderUserItem(u))}
                        </div>
                      )}
                    </div>

                    {/* Friends Group */}
                    <div style={{ marginBottom: "15px" }}>
                      <h3
                        style={{
                          ...sidebarTitle,
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                        onClick={() => setShowFriends(!showFriends)}
                      >
                        <span>
                          <Users size={16} /> Friends
                        </span>
                        <span>{showFriends ? "−" : "+"}</span>
                      </h3>
                      {showFriends && (
                        <div style={userList}>
                          {users
                            .filter(
                              (u) => u.id !== user.uid && u.role === "Friend",
                            )
                            .map((u) => renderUserItem(u))}
                        </div>
                      )}
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
                                if (
                                  window.confirm(
                                    "Are you sure you want to delete this?",
                                  )
                                )
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

                    {/* --- ၁။ Family Fridge Card --- */}
                    <div
                      style={{
                        ...fridgeCardStyle,
                        marginBottom: "20px",
                        marginTop: "30px",
                        padding: "15px",
                        backgroundColor: darkMode ? "#1e293b" : "#eff6ff",
                        borderRadius: "15px",
                        border: "1px dashed #3b82f6",
                      }}
                    >
                      <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
                        📌 Family Fridge
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          gap: "5px",
                          marginBottom: "10px",
                        }}
                      >
                        <input
                          placeholder="Leave a Short Note..."
                          style={modalInputSmall}
                          value={fridgeNote}
                          onChange={(e) => setFridgeNote(e.target.value)}
                        />
                        <button onClick={handleFridgePost} style={saveBtnSmall}>
                          Post
                        </button>
                      </div>

                      {/* 🌟 ဤနေရာသည် စာတိုများကို ပြန်ပြမည့်နေရာဖြစ်သည် 🌟 */}
                      <div
                        style={{
                          maxHeight: "150px",
                          overflowY: "auto",
                          marginTop: "10px",
                        }}
                      >
                        {fridgeNotes.length > 0 ? (
                          fridgeNotes.map((n) => (
                            <div
                              key={n.id}
                              style={{
                                ...noteStyle,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "5px 0",
                              }}
                            >
                              <div style={{ flex: 1, fontSize: "12px" }}>
                                <strong>{n.userName}:</strong> {n.text}
                              </div>

                              {/* ဖျက်ရန် အမှိုက်ပုံးပုံလေး */}
                              <Trash2
                                size={14}
                                color="#ef4444"
                                style={{
                                  cursor: "pointer",
                                  opacity: 0.7,
                                  marginLeft: "10px",
                                }}
                                onClick={() => handleDeleteFridgeNote(n.id)}
                              />
                            </div>
                          ))
                        ) : (
                          <p style={{ fontSize: "11px", color: "#999" }}>
                            No Short Notes
                          </p>
                        )}
                      </div>
                    </div>

                    {/* --- ၂။ Shopping List Card --- */}
                    <div style={{ ...shoppingCardStyle, marginBottom: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <h4 style={{ margin: 0, fontSize: "14px" }}>
                          🛒 Shopping List
                        </h4>
                        <button
                          onClick={() => {
                            const item = prompt("Item Name:");
                            if (item)
                              addDoc(collection(db, "shoppingList"), {
                                text: item,
                                isBought: false,
                                familyCode: userFamilyCode,
                                createdAt: serverTimestamp(),
                              });
                          }}
                          style={saveBtnSmall}
                        >
                          + Item
                        </button>
                      </div>

                      {/* 🌟 ဤနေရာသည် ဈေးဝယ်စာရင်းကို ပြန်ပြမည့်နေရာဖြစ်သည် 🌟 */}
                      <div>
                        {shoppingList.length > 0 ? (
                          shoppingList.map((item) => (
                            <div
                              key={item.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "12px",
                                marginBottom: "5px",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={item.isBought}
                                onChange={() =>
                                  updateDoc(doc(db, "shoppingList", item.id), {
                                    isBought: !item.isBought,
                                  })
                                }
                              />
                              <span
                                style={{
                                  textDecoration: item.isBought
                                    ? "line-through"
                                    : "none",
                                  flex: 1,
                                }}
                              >
                                {item.text}
                              </span>
                              <Trash2
                                size={12}
                                color="#ef4444"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  deleteDoc(doc(db, "shoppingList", item.id))
                                }
                              />
                            </div>
                          ))
                        ) : (
                          <p style={{ fontSize: "11px", color: "#999" }}>
                            No Item List
                          </p>
                        )}
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
              Re-Member - A Place to Preserve Family Memories
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
                <h3>🏠 Family Community</h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginBottom: "15px",
                  }}
                >
                  Enter the code to join the family. If you don't have a code yet,create a new code (at least 8 characters).
                </p>
                <input
                  placeholder="At least 8 characters (e.g., MyFamily2026)"
                  style={modalInput}
                  id="familyCodeInput"
                />
                <button
                  onClick={async () => {
                    const code = document
                      .getElementById("familyCodeInput")
                      .value.trim()
                      .toUpperCase();

                    if (code.length < 8) {
                      alert(
                        "For security, the code must be at least 8 characters long.",
                      );
                      return;
                    }

                    try {
                      const {
                        getDocs,
                        query,
                        where,
                        collection,
                        serverTimestamp,
                        setDoc,
                      } = await import("firebase/firestore");

                      // ၁။ Database မှာ ဒီကုဒ် ရှိပြီးသားလား အရင်စစ်မယ်
                      const familiesRef = collection(db, "families");
                      const q = query(familiesRef, where("code", "==", code));
                      const querySnapshot = await getDocs(q);

                      let familyId;
                      let isOwner = false;

                      if (!querySnapshot.empty) {
                        // (က) ကုဒ် ရှိပြီးသားဆိုရင် - Join လုပ်ရုံပဲ (Owner မဟုတ်ဘူး)
                        familyId = querySnapshot.docs[0].id;
                        isOwner = false;
                      } else {
                        // (ခ) ကုဒ် မရှိသေးရင် - အိမ်အသစ်ဆောက်မယ် (ပထမဆုံးလူမို့လို့ Owner ဖြစ်မယ်)
                        familyId = `FID_${Date.now()}`;
                        isOwner = true;
                        await setDoc(doc(db, "families", familyId), {
                          code: code,
                          ownerId: user.uid,
                          createdAt: serverTimestamp(),
                        });
                      }

                      // ၂။ User Profile မှာ အချက်အလက်တွေကို "အလိုလို" သိမ်းမယ်
                      await updateDoc(doc(db, "users", user.uid), {
                        familyId: familyId,
                        familyCode: code,
                        isFamilyOwner: isOwner, // 🌟 ဒီစာကြောင်းက ဝယ်သူကို Owner အလိုလို ဖြစ်စေတာပါ
                      });

                      // ၃။ UI ကို Update လုပ်မယ်
                      setUserFamilyId(familyId);
                      setUserFamilyCode(code);
                      setIsFamilyOwner(isOwner);
                      setShowFamilyModal(false);

                      alert(
                        isOwner
                          ? "New family community created successfully! 🏠"
                          : "You have joined the family community! ✨",
                      );
                    } catch (error) {
                      console.error(error);
                      alert("Something went wrong. Please try again.");
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
                    🗓️ Add Event
                  </h3>
                  <X
                    onClick={() => setShowEventModal(false)}
                    style={{ cursor: "pointer", color: "#64748b" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Event Name</label>
                  <input
                    placeholder="Example: Family Reunion"
                    style={modalInputLarge}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                  />

                  <label style={labelStyle}>Date (MM/DD/YYYY)</label>
                  <input
                    placeholder="08/25/2026"
                    style={modalInputLarge}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                  />

                  <label style={labelStyle}>Place (Location)</label>
                  <input
                    placeholder="Enter the exact location...."
                    style={modalInputLarge}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, location: e.target.value })
                    }
                  />

                  <label style={labelStyle}>Details</label>
                  <textarea
                    placeholder="What will we do at this event?..."
                    style={modalTextArea}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, details: e.target.value })
                    }
                  />

                  <label style={labelStyle}>Event Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEventFile(e.target.files[0])}
                    style={modalInputLarge}
                  />
                  {eventFile && (
                    <p style={{ fontSize: "12px", color: "#3b82f6" }}>
                      📍 {eventFile.name} has been seleted.
                    </p>
                  )}

                  <div
                    style={{ display: "flex", gap: "12px", marginTop: "10px" }}
                  >
                    <button
                      onClick={async () => {
                        if (newEvent.title && newEvent.date && userFamilyCode) {
                          try {
                            setUploading(true); // Loading စတင်မည်
                            let eventImgUrl = "";

                            // ပုံရွေးထားလျှင် Storage သို့ အရင်တင်မည်
                            if (eventFile) {
                              const storageRef = ref(
                                storage,
                                `events/${Date.now()}_${eventFile.name}`,
                              );
                              const snapshot = await uploadBytes(
                                storageRef,
                                eventFile,
                              );
                              eventImgUrl = await getDownloadURL(snapshot.ref);
                            }

                            await addDoc(collection(db, "events"), {
                              ...newEvent,
                              imageUrl: eventImgUrl, // image နေရာတွင် imageUrl ဟု နာမည်ပေးခြင်းက ပိုစနစ်ကျပါသည်
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
                            setEventFile(null); // ပုံကို Reset လုပ်မည်
                            setUploading(false);
                            alert("New event saved successfully!");
                          } catch (error) {
                            console.error("Error adding event:", error);
                            setUploading(false);
                          }
                        } else {
                          alert(
                            "Event name, date, and family code are required.",
                          );
                        }
                      }}
                      style={postBtnFull}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowEventModal(false)}
                      style={cancelBtn}
                    >
                      Cancel
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
                    🗓️ Edit Event
                  </h3>
                  <X
                    onClick={() => setShowEditModal(false)}
                    style={{ cursor: "pointer", color: "#64748b" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Event Name</label>
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

                  <label style={labelStyle}>Date (MM/DD/YYYY)</label>
                  <input
                    defaultValue={editingEvent.date}
                    style={modalInputLarge}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, date: e.target.value })
                    }
                  />

                  <label style={labelStyle}>Place (Location)</label>
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

                  <label style={labelStyle}>Details</label>
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

                  <label style={labelStyle}>Change/Skip the cover image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEventFile(e.target.files[0])}
                    style={modalInputLarge}
                  />
                  {eventFile && (
                    <p style={{ fontSize: "11px", color: "#3b82f6" }}>
                      📍 {eventFile.name}
                    </p>
                  )}

                  <div
                    style={{ display: "flex", gap: "12px", marginTop: "10px" }}
                  >
                    <button
                      onClick={async () => {
                        if (!editingEvent.title || !editingEvent.date) {
                          alert("Please enter a title and date");
                          return;
                        }

                        try {
                          setUploading(true);
                          let finalImageUrl =
                            editingEvent.imageUrl || editingEvent.image || "";

                          // ၁။ ပုံအသစ် ရွေးထားတယ်ဆိုရင် အရင်တင်မယ်
                          if (eventFile) {
                            const storageRef = ref(
                              storage,
                              `events/${Date.now()}_${eventFile.name}`,
                            );
                            const snapshot = await uploadBytes(
                              storageRef,
                              eventFile,
                            );
                            finalImageUrl = await getDownloadURL(snapshot.ref);
                          }

                          // ၂။ Firestore မှာ သွားပြင်မယ်
                          const eventRef = doc(db, "events", editingEvent.id);
                          await updateDoc(eventRef, {
                            title: editingEvent.title,
                            date: editingEvent.date,
                            location: editingEvent.location || "",
                            details: editingEvent.details || "",
                            imageUrl: finalImageUrl, // ပုံအသစ်ရှိရင် အသစ်၊ မရှိရင် အဟောင်းအတိုင်း သိမ်းမယ်
                          });

                          setShowEditModal(false);
                          setEditingEvent(null);
                          setEventFile(null);
                          setUploading(false);
                          alert("Edited! ✨");
                        } catch (error) {
                          console.error(error);
                          setUploading(false);
                        }
                      }}
                      style={postBtnFull}
                    >
                      {uploading ? "Please wait..." : "Saving changes"}
                    </button>
                    <button
                      onClick={() => setShowEditModal(false)}
                      style={cancelBtn}
                    >
                      Cancel
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
                  <h3 style={{ margin: 0, fontSize: "18px" }}>📝 New Goal</h3>
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
                  Describe a goal you want to achieve for your family.
                </p>

                <input
                  placeholder="Example: A family trip to Bagan..."
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
                        alert("Goal description and family code are required.");
                      }
                    }}
                    style={postBtnFull}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowBucketModal(false)}
                    style={cancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {showBdayModal && (
            <div style={modalOverlay}>
              <div style={modalContentSmall}>
                <h3>🎂 Please enter your birthday.</h3>
                <p style={{ fontSize: "12px", color: "#64748b" }}>
                  Your birthday is needed to show birthday alerts. (MM/DD/YYYY)
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
                        "Please enter a valid date in MM/DD/YYYY format (for example, 08/25/1995).",
                      );
                    }
                  }}
                  style={postBtnFull}
                >
                  Comfirm
                </button>
              </div>
            </div>
          )}

          {/* ပုံကြီးချဲ့ကြည့်ရန် Lightbox Overlay */}
          {viewImage && (
            <div style={lightboxOverlay} onClick={() => setViewImage(null)}>
              <div
                style={{
                  position: "relative",
                  maxWidth: "90%",
                  maxHeight: "90%",
                }}
              >
                <img
                  src={viewImage}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "12px",
                    boxShadow: "0 0 20px rgba(0,0,0,0.5)",
                  }}
                  alt="enlarged"
                />
                <div
                  style={{
                    position: "absolute",
                    top: "-40px",
                    right: "0",
                    color: "#fff",
                    fontSize: "30px",
                    cursor: "pointer",
                  }}
                >
                  ×
                </div>
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
  padding: "0 10px",
  alignItems: "center",
};

const logoText = { fontSize: "20px", fontWeight: "800" };

const logoutBtn = {
  padding: "6px 12px",
  fontSize: "12px", // 👈 စာလုံးနည်းနည်း သေးလိုက်ပါ
  backgroundColor: "#fee2e2",
  color: "#ef4444",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "5px",
};
const mainLayout = {
  display: "flex",
  flexDirection: "column", // ဖုန်းမှာ အပေါ်အောက် စီမယ်
  alignItems: "center",
  paddingTop: "10px",
  paddingBottom: "100px", // Bottom nav အတွက် နေရာချန်မယ်
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
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
  backgroundColor: "#fef3c7",
  color: "#92400e",
  padding: "15px",
  borderRadius: "16px",
  marginBottom: "10px",
  // Header အောက်ကနေ လွတ်သွားအောင် ဒီစာကြောင်းကို ထည့်ပါ
  // marginTop: '80px',
  border: "1px solid #fde68a",
  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
  width: "90%", // ဖုန်းမှာ ဘေးဘောင်တွေနဲ့ လှအောင်
  maxWidth: "600px",
  marginLeft: "auto",
  marginRight: "auto",
};

const bdayBannerUpcoming = {
  backgroundColor: "#ecfdf5",
  color: "#065f46",
  padding: "15px",
  borderRadius: "16px",
  marginBottom: "15px",
  // Header အောက်ကနေ လွတ်သွားအောင် ဒီစာကြောင်းကို ထည့်ပါ
  // marginTop: '80px',
  border: "1px solid #a7f3d0",
  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
  width: "90%",
  maxWidth: "600px",
  marginLeft: "auto",
  marginRight: "auto",
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
  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", // ဖုန်းမှာ ၃ လုံးစီလောက် ပေါ်မယ်
  gap: "10px",
  maxHeight: "70vh", // အမြင့်ကို ကန့်သတ်ပြီး scroll ဆွဲခိုင်းမယ်
  overflowY: "auto",
  padding: "10px",
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

const modalInputSmall = {
  flex: 1,
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  fontSize: "13px",
  outline: "none",
};

const galleryInfoOverlay = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
  padding: "8px",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  opacity: 1, // ဖုန်းမှာ အမြဲမြင်နေရအောင် ၁ ထားပါ
};

const tinyAvatar = {
  width: "18px",
  height: "18px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "1px solid #fff",
};

const tinyText = {
  color: "#fff",
  fontSize: "10px",
  fontWeight: "500",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const playIconOverlay = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  fontSize: "20px",
  background: "rgba(255,255,255,0.3)",
  borderRadius: "50%",
  padding: "5px",
};

const moodGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(45px, 1fr))", // အကွက်လေးတွေကို ညီအောင်စီမယ်
  gap: "10px",
  padding: "5px",
};

const moodItemStyle = {
  fontSize: "22px",
  cursor: "pointer",
  padding: "8px",
  borderRadius: "12px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  transition: "0.2s",
  border: "1px solid #f1f5f9",
};

const moodCardStyle = {
  padding: "20px",
  borderRadius: "24px",
  marginBottom: "20px",

  boxSizing: "border-box",
};

const fridgeCardStyle = {
  backgroundColor: "#fff9c4",
  padding: "15px",
  borderRadius: "15px",
  marginBottom: "20px",
  border: "1px solid #f0e68c",
  boxShadow: "2px 2px 5px rgba(0,0,0,0.05)",
};

const shoppingCardStyle = {
  backgroundColor: "#f0fdf4",
  padding: "15px",
  borderRadius: "15px",
  marginBottom: "15px",
  border: "1px solid #bbf7d0",
};

const noteStyle = {
  fontSize: "12px",
  borderBottom: "1px solid rgba(0,0,0,0.05)",
  padding: "4px 0",
  color: "#444",
};

const lightboxOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.85)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 5000,
};

const eventListGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
  gap: "20px",
};
const eventCard = {
  backgroundColor: "#fff",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  border: "1px solid #f1f5f9",
  position: "relative",
};
const eventImageWrapper = {
  position: "relative",
  width: "100%",
  height: "140px",
};
const eventCardImg = {
  width: "100%",
  height: "180px",
  objectFit: "contain",
  backgroundColor: "#f8fafc",
  display: "block",
};
const eventActionsOverlay = {
  position: "absolute",
  top: "10px",
  right: "10px",
  display: "flex",
  gap: "8px",
};
const iconActionBtn = {
  backgroundColor: "rgba(255,255,255,0.9)",
  border: "none",
  width: "28px",
  height: "28px",
  borderRadius: "8px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};

const eventDeleteBtn = {
  marginTop: "15px",
  padding: "5px 10px",
  border: "1px solid #fee2e2",
  backgroundColor: "#fff",
  color: "#ef4444",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "12px",
};

const ownerSettingCard = {
  padding: "20px",
  borderRadius: "24px",
  marginBottom: "20px",
  boxSizing: "border-box",
  boxShadow: "0 4px 10px rgba(0,0,0,0.02)",
};

export default App;
