import React, { useState, useEffect } from "react";
import { db, storage, auth } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import {
  Link as LinkIcon,
  Image,
  Music,
  Send,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  X,
  Search,
} from "lucide-react";

const MainDashboard = ({ posts, setPosts, userFamilyCode }) => {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  // const [posts, setPosts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [commentText, setCommentText] = useState({});

  // Postcard States
  const [showPostcardEditor, setShowPostcardEditor] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#ffcfdf");
  const [postcardMessage, setPostcardMessage] = useState("");

  const [postcardImage, setPostcardImage] = useState(null);
  const [postcardAudio, setPostcardAudio] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [externalUrl, setExternalUrl] = useState(""); // Online Link အတွက်
  const [selectedStyle, setSelectedStyle] = useState("white"); // Post
  const [searchQuery, setSearchQuery] = useState("");

  const [lastVisible, setLastVisible] = useState(null);
  const [loadingMore, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const cardStyles = [
    "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
    "linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
    "#ffffff",
  ];

  const [selectedFont, setSelectedFont] = useState("cursive"); // Font ရွေးဖို့
  const fonts = [
    { name: "Cursive", family: "cursive" },
    { name: "Modern", family: "sans-serif" },
    { name: "Classic", family: "serif" },
    { name: "Elegant", family: "Georgia" },
    { name: "Bold", family: "Impact" },
  ];

  const colors = [
    "#ffcfdf",
    "#ffdb58",
    "#a7f3d0",
    "#bae6fd",
    "#c7d2fe",
    "#fecaca",
    "#fde68a",
    "#ddd6fe",
    "#fbcfe8",
    "#fbbf24",
    "#34d399",
    "#60a5fa",
    "#818cf8",
    "#f472b6",
    "#fb7185",
    "#a78bfa",
    "#2dd4bf",
    "#fb923c",
    "#4ade80",
    "#22d3ee",
  ];

  const [selectedFiles, setSelectedFiles] = useState([]); // ပုံ/ဗီဒီယို/အသံ အစုံအတွက်
  const [previewUrls, setPreviewUrls] = useState([]); // Preview ပြရန်
  const [viewImage, setViewImage] = useState(null); // ပုံကြီးချဲ့ကြည့်ရန် (Lightbox)

  // Postcard အတွက် အွန်လိုင်း အသင့်သုံးပုံများ
  const postcardTemplates = [
    {
      name: "မွေးနေ့",
      url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500",
    },
    {
      name: "သင်္ကြန်",
      url: "https://plus.unsplash.com/premium_photo-1661962358117-9154f2482329?w=500",
    },
    {
      name: "ပွဲလမ်း",
      url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500",
    },
    {
      name: "ချစ်သူများနေ့",
      url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500",
    },
    {
      name: "Cake",
      url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800",
    },
  ];

  // ၁။ ပထမဆုံးအကြိမ် Post ၁၀ ခုပဲ ဆွဲမယ်
  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(10),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]); // နောက်ဆုံး post ကို သိမ်းမယ်
    });
    return () => unsubscribe();
  }, []);

  // ၂။ နောက်ထပ် ၁၀ ခု ထပ်ဆွဲမယ့် function
  const fetchMorePosts = async () => {
    if (!lastVisible) return;
    setLoading(true);

    const nextQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      startAfter(lastVisible),
      limit(10),
    );

    const querySnapshot = await getDocs(nextQuery);
    const newPosts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setPosts([...posts, ...newPosts]); // ရှိပြီးသား post တွေနဲ့ အသစ်တွေကို ပေါင်းမယ်
    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setLoading(false);
  };

  // ၁။ Like Function
  const handleReaction = async (postId, emoji) => {
    const postRef = doc(db, "posts", postId);

    // User တစ်ယောက်က reaction တစ်ခုပဲ ပေးလို့ရအောင် map style နဲ့ သိမ်းမယ်
    // { "uid1": "❤️", "uid2": "🎂" } ဆိုတဲ့ ပုံစံမျိုး သိမ်းမှာပါ
    await updateDoc(postRef, {
      [`reactions.${auth.currentUser.uid}`]: emoji,
    });
  };

  // ၂။ Comment Function
  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      comments: arrayUnion({
        text: commentText[postId],
        userName: auth.currentUser.displayName,
        userImage: auth.currentUser.photoURL,
        createdAt: new Date().toISOString(),
      }),
    });
    setCommentText({ ...commentText, [postId]: "" });
  };

  // ၃။ Delete Function (အစက်သုံးစက် menu အတွက်)
  const handleDelete = async (postId, postUid, postUserName) => {
    // ပိုင်ရှင် ဟုတ်မဟုတ် စစ်ဆေးခြင်း (UID သို့မဟုတ် အမည်ဖြင့်)
    const isOwner =
      postUid === auth.currentUser.uid ||
      postUserName === auth.currentUser.displayName;

    if (!isOwner) {
      alert("ကိုယ်ပိုင် Post ကိုသာ ဖျက်လို့ရပါတယ်။");
      return;
    }

    if (window.confirm("ဒီ Post ကို ဖျက်မှာ သေချာပါသလား?")) {
      try {
        await deleteDoc(doc(db, "posts", postId));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const onFileChange = (e) => {
    const files = Array.from(e.target.files);
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB ကို Byte အဖြစ် ပြောင်းလဲခြင်း
    
    // 5MB ထက် ကျော်တဲ့ ဖိုင်ရှိမရှိ စစ်မယ်
    const oversizedFiles = files.filter(f => f.size > MAX_SIZE);

    if (oversizedFiles.length > 0) {
        alert(
            `⚠️ ဖိုင်အရွယ်အစား ကန့်သတ်ချက် ကျော်လွန်နေပါသည်။\n\n` +
            `ဖိုင်တစ်ခုချင်းစီကို 5MB ထက်မကျော်ရပါ။\n` +
            `ကျော်လွန်နေသောဖိုင်များ- ${oversizedFiles.map(f => f.name).join(", ")}`
        );
        e.target.value = null; // Input ကို ပြန်ရှင်းပစ်မယ်
        setSelectedFiles([]);
        setPreviewUrls([]);
        return;
    }

    // 5MB ထက် မကျော်မှသာ ရှေ့ဆက်မယ်
    setSelectedFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(previews);
};

  // ၄။ Postcard တင်ခြင်း
  const handlePostcardUpload = async () => {
    if (!postcardMessage.trim()) return;
    setUploading(true);

    let imgUrl = "";
    let audUrl = "";

    try {
      // ပုံကို တင်ခြင်း
      if (postcardImage) {
        const imgRef = ref(
          storage,
          `postcards/images/${Date.now()}_${postcardImage.name}`,
        );
        const snapshot = await uploadBytes(imgRef, postcardImage);
        imgUrl = await getDownloadURL(snapshot.ref);
      }

      // အသံကို တင်ခြင်း
      if (postcardAudio) {
        const audRef = ref(
          storage,
          `postcards/audio/${Date.now()}_${postcardAudio.name}`,
        );
        const snapshot = await uploadBytes(audRef, postcardAudio);
        audUrl = await getDownloadURL(snapshot.ref);
      }

      // Firestore ထဲမှာ သိမ်းခြင်း
      await addDoc(collection(db, "posts"), {
        caption: postcardMessage,
        fileUrl: selectedColor, // နောက်ခံအရောင်
        postcardImg: imgUrl, // ပူးတွဲပုံ
        postcardAud: audUrl, // ပူးတွဲအသံ
        fileType: "postcard",
        userName: auth.currentUser.displayName,
        userImage: auth.currentUser.photoURL,
        uid: auth.currentUser.uid,
        postcardFont: selectedFont,
        reactions: {},
        comments: [],
        createdAt: serverTimestamp(),
        // familyCode: auth.currentUser.familyCode,
        familyCode: userFamilyCode,
      });

      // Form ကို Reset လုပ်ခြင်း
      setPostcardMessage("");
      setPostcardImage(null);
      setPostcardAudio(null);
      setShowPostcardEditor(false);
      setUploading(false);
      alert("Birthday postcard uploaded successfully! ✨");
    } catch (error) {
      console.error(error);
      alert("Error: Unable to upload. Please try again.");
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    // selectedFiles က state အသစ်ဖြစ်ရပါမယ် (array ပုံစံ)
    // externalUrl က online link အတွက်
    if (!selectedFiles.length && !externalUrl && !caption) return;

    setUploading(true);
    let uploadedMedia = [];

    try {
      // ၁။ Online Link ကိုအရင်စစ်မယ် (ပုံ၊ ဗီဒီယို သို့မဟုတ် အသံ ဖြစ်နိုင်သည်)
      if (externalUrl) {
        let linkType = "image"; // default
        const urlLower = externalUrl.toLowerCase();

        if (urlLower.match(/\.(mp4|mov|wmv|avi|mkv)$/)) {
          linkType = "video";
        } else if (urlLower.match(/\.(mp3|wav|ogg|m4a)$/)) {
          linkType = "audio";
        }

        uploadedMedia.push({
          url: externalUrl,
          type: linkType,
          isExternal: true,
        });
      }

      // ၂။ စက်ထဲကရွေးထားတဲ့ File များကို Upload တင်မယ် (ပုံ၊ ဗီဒီယို၊ အသံ အစုံရသည်)
      for (const f of selectedFiles) {
        // file type ကို စစ်မယ် (image, video, audio)
        const fileType = f.type.split("/")[0];
        const storageRef = ref(storage, `media/${Date.now()}_${f.name}`);

        await uploadBytes(storageRef, f);
        const url = await getDownloadURL(storageRef);

        uploadedMedia.push({
          url: url,
          type: fileType,
        });
      }

      // ၃။ Firestore ထဲကို Data ထည့်မယ်
      await addDoc(collection(db, "posts"), {
        caption: caption,
        media: uploadedMedia, // အခု media array နဲ့သိမ်းမှ grid နဲ့ပြလို့ရမှာပါ
        layoutStyle: selectedStyle,
        userName: auth.currentUser.displayName,
        userImage: auth.currentUser.photoURL,
        uid: auth.currentUser.uid,
        familyCode: userFamilyCode,
        likes: [],
        comments: [],
        reactions: {},
        createdAt: serverTimestamp(),
      });

      // ၄။ အောင်မြင်ရင် အကုန် Reset ပြန်လုပ်မယ်
      setCaption("");
      setSelectedFiles([]); // array ကို ရှင်းမယ်
      setExternalUrl("");
      setUploading(false);
      alert("Memory uploaded successfully! ✨");
    } catch (error) {
      console.error("Upload Error: ", error);
      setUploading(false);
      alert("Upload failed. Please try again.");
    }
  };

  return (
    // <div style={feedWrapper}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 15px" }}>
      {/* --- ၁။ Search Bar (သီးသန့်ခွဲထုတ်ထားသည်) --- */}
      <div style={{ marginBottom: "25px" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        backgroundColor: "#fff",
        padding: "12px 20px",
        borderRadius: "30px", // ပိုပြီး Apple Style ဆန်အောင် ဝိုင်းလိုက်သည်
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        border: "1px solid #f1f5f9",
      }}>
        <Search size={18} color="#64748b" />
        <input
          type="text"
          placeholder="Search memories (e.g., by name or text)..."
          style={{
            border: "none",
            outline: "none",
            width: "100%",
            fontSize: "15px", 
            background: "transparent"
          }}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>

      {/* --- File / Postcard တင်မည် (Collapsed Input) --- */}
      {/* --- Post Creator Section --- */}
<div style={{ marginBottom: "30px" }}>
  {!isCreating ? (
    /* (က) ချုံ့ထားသည့်ပုံစံ - Minimized State */
    <div 
      onClick={() => setIsCreating(true)}
      style={{
        display: "flex", alignItems: "center", gap: "15px", backgroundColor: "#fff",
        padding: "12px 20px", borderRadius: "30px", cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9"
      }}
    >
      <img src={auth.currentUser?.photoURL} style={{ width: "35px", height: "35px", borderRadius: "50%" }} alt="me" />
      <div style={{ flex: 1, color: "#94a3b8", fontSize: "15px" }}>
        ဘာတွေမျှဝေချင်လဲ၊ {auth.currentUser?.displayName.split(" ")[0]}...
      </div>
      <Image color="#10b981" size={22} />
    </div>
  ) : (
    /* (ခ) ပွင့်လာသည့်ပုံစံ - Expanded Input Card */
    <div style={{ ...inputCardStyle, position: "relative", animation: "fadeIn 0.3s ease", backgroundColor: "#fff", padding: "20px", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems: "center" }}>
        <h4 style={{ margin: 0, color: "#1e293b" }}>အမှတ်တရအသစ် ဖန်တီးပါ</h4>
        <X onClick={() => setIsCreating(false)} style={{ cursor: "pointer", color: "#64748b" }} size={20} />
      </div>

      {/* အပိုင်း (၁) - Avatar နှင့် စာသားရိုက်ရန်နေရာ */}
      <div style={{ ...inputHeader, display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "15px" }}>
        <img src={auth.currentUser?.photoURL} style={{ ...smallAvatar, width: "40px", height: "40px", borderRadius: "50%" }} alt="me" />
        <textarea
          placeholder="ဒီနေ့အတွက် ဘာတွေထူးခြားလဲ..."
          style={{ 
            width: "100%", minHeight: "100px", border: "none", outline: "none", 
            fontSize: "16px", fontFamily: "inherit", resize: "none", padding: "5px" 
          }}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </div>

      {/* Preview Images */}
      {previewUrls.length > 0 && (
        <div style={{ display: "flex", gap: "10px", overflowX: "auto", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "10px", marginBottom: "15px" }}>
          {previewUrls.map((url, i) => (
            <div key={i} style={{ position: "relative", flexShrink: 0 }}>
              <img src={url} style={{ width: "80px", height: "80px", borderRadius: "10px", objectFit: "cover" }} alt="preview" />
              <X
                size={16}
                style={{ position: "absolute", top: -5, right: -5, background: "#ef4444", color: "#fff", borderRadius: "50%", cursor: "pointer", padding: "2px" }}
                onClick={() => {
                  const newFiles = [...selectedFiles]; newFiles.splice(i, 1); setSelectedFiles(newFiles);
                  const newUrls = [...previewUrls]; newUrls.splice(i, 1); setPreviewUrls(newUrls);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* အပိုင်း (၂) - Online Link ထည့်ရန်နေရာ */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f1f5f9", padding: "10px 15px", borderRadius: "12px", marginBottom: "15px" }}>
        <LinkIcon size={16} color="#64748b" />
        <input
          style={{ border: "none", background: "none", outline: "none", fontSize: "13px", width: "100%" }}
          placeholder="လင့်ခ် (URL) ထည့်သွင်းရန်..."
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
        />
      </div>

      {/* အပိုင်း (၃) - နောက်ခံအရောင်ရွေးရန် */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Choose Style:</span>
        {cardStyles.map((s) => (
          <div
            key={s}
            onClick={() => setSelectedStyle(s)}
            style={{
              width: "22px", height: "22px", borderRadius: "50%", background: s, cursor: "pointer",
              border: selectedStyle === s ? "2px solid #3b82f6" : "1px solid #ddd",
              boxShadow: selectedStyle === s ? "0 0 5px rgba(59,130,246,0.5)" : "none"
            }}
          />
        ))}
      </div>

      {/* အပိုင်း (၄) - ခလုတ်များ */}
      <div style={{ ...inputActions, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "15px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", padding: "8px 12px", borderRadius: "8px", backgroundColor: "#f1f5f9", fontSize: "14px" }}>
            <Image size={20} color="#10b981" />
            <span>ပုံ/ဗီဒီယို</span>
            <input type="file" hidden multiple accept="image/*,video/*,audio/*" onChange={onFileChange} />
          </label>
          <button onClick={() => setShowPostcardEditor(true)} style={{ ...postcardBtn, display: "flex", alignItems: "center", gap: "5px", border: "none", background: "#fef2f2", color: "#ef4444", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>
            🎨 Postcard
          </button>
        </div>

        <button
          onClick={() => { handleUpload(); setIsCreating(false); }}
          disabled={(!selectedFiles.length && !externalUrl && !caption) || uploading}
          style={{ 
            backgroundColor: (selectedFiles.length || externalUrl || caption) ? "#3b82f6" : "#e2e8f0",
            color: "#fff", border: "none", padding: "10px 25px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer"
          }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  )}
</div>

{/* --- Postcard Editor Modal --- */}
{showPostcardEditor && (
  <div style={{ ...modalOverlay, display: "flex", justifyContent: "center", alignItems: "center", position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 3000 }}>
    <div style={{ ...modalContent, backgroundColor: "#fff", padding: "25px", borderRadius: "24px", width: "90%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>မွေးနေ့ဆုတောင်းကတ် ဖန်တီးပါ</h3>
        <X onClick={() => { setShowPostcardEditor(false); setPostcardImage(null); setPostcardAudio(null); }} style={{ cursor: "pointer", color: "#64748b" }} />
      </div>

      {/* Preview Box */}
      <div style={{ ...previewBox, backgroundColor: selectedColor, position: "relative", overflow: "hidden", height: "250px", borderRadius: "18px", marginBottom: "20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        {postcardImage && (
          <img
            src={typeof postcardImage === 'string' ? postcardImage : URL.createObjectURL(postcardImage)}
            style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: 0.5, zIndex: 0 }}
            alt="preview"
          />
        )}
        <textarea
          placeholder="ဆုတောင်းစကား ရေးသားပါ..."
          style={{ ...postcardTextArea, zIndex: 1, width: "80%", background: "none", border: "none", outline: "none", color: "#fff", fontSize: "20px", textAlign: "center", fontWeight: "bold", textShadow: "1px 1px 4px rgba(0,0,0,0.5)" }}
          value={postcardMessage}
          onChange={(e) => setPostcardMessage(e.target.value)}
        />
      </div>

      {/* Template Selection */}
      <div style={{ marginBottom: "20px" }}>
        <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", display: "block", marginBottom: "10px" }}>Templates:</span>
        <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "5px" }}>
          {postcardTemplates.map((t) => (
            <img
              key={t.url}
              src={t.url}
              onClick={() => setPostcardImage(t.url)}
              style={{ width: "80px", height: "50px", borderRadius: "10px", cursor: "pointer", objectFit: "cover", border: postcardImage === t.url ? "3px solid #3b82f6" : "2px solid #f1f5f9" }}
              alt="template"
            />
          ))}
        </div>
      </div>

      {/* Font & Style Controls */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "20px" }}>
        {fonts.map((f) => (
          <button
            key={f.name}
            onClick={() => setSelectedFont(f.family)}
            style={{
              padding: "6px 15px", borderRadius: "20px", border: selectedFont === f.family ? "2px solid #3b82f6" : "1px solid #e2e8f0",
              backgroundColor: selectedFont === f.family ? "#eff6ff" : "#fff", color: selectedFont === f.family ? "#3b82f6" : "#64748b",
              fontFamily: f.family, cursor: "pointer", whiteSpace: "nowrap"
            }}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* Media Upload Buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginBottom: "20px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", backgroundColor: "#f8fafc", cursor: "pointer", border: "1px solid #e2e8f0", fontSize: "14px" }}>
          <Image size={20} color="#3b82f6" /> 
          <span>ပုံထည့်မည်</span>
          <input type="file" hidden accept="image/*" onChange={(e) => setPostcardImage(e.target.files[0])} />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", backgroundColor: "#f8fafc", cursor: "pointer", border: "1px solid #e2e8f0", fontSize: "14px" }}>
          <Music size={20} color="#8b5cf6" /> 
          <span>သီချင်းထည့်မည်</span>
          <input type="file" hidden accept="audio/*" onChange={(e) => setPostcardAudio(e.target.files[0])} />
        </label>
      </div>

      {/* Selected File Names */}
      {(postcardImage || postcardAudio) && (
        <div style={{ textAlign: "center", fontSize: "12px", color: "#3b82f6", marginBottom: "15px", padding: "10px", backgroundColor: "#f0f7ff", borderRadius: "10px" }}>
          {postcardImage && typeof postcardImage !== 'string' && <div>🖼️ {postcardImage.name}</div>}
          {postcardAudio && <div>🎵 {postcardAudio.name}</div>}
        </div>
      )}

      {/* Background Colors */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "25px", flexWrap: "wrap" }}>
        {colors.map((c) => (
          <div
            key={c}
            onClick={() => setSelectedColor(c)}
            style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: c, border: selectedColor === c ? "3px solid #3b82f6" : "2px solid #fff", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
          />
        ))}
      </div>

      <button
        onClick={handlePostcardUpload}
        style={{ width: "100%", padding: "14px", borderRadius: "15px", border: "none", backgroundColor: "#3b82f6", color: "#fff", fontWeight: "bold", fontSize: "16px", cursor: "pointer" }}
        disabled={uploading}
      >
        {uploading ? "Uploading, wait..." : "Postcard Upload"}
      </button>
    </div>
  </div>
)}

      {/* --- Posts Feed Grid System --- */}
<div style={postGridContainer}>
  {posts
    .filter(
      (p) =>
        p.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.userName?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .map((post) => (
      <div
        key={post.id}
        style={modernPostCard}
      >
        {/* ၁။ Header အပိုင်း (User Info + Trash Icon) */}
      <div style={postHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src={post.userImage} style={avatarStyle} alt="u" />
          <div>
            <h4 style={userNameStyle}>{post.userName}</h4>
            <span style={dateStyle}>
              {post.createdAt ? post.createdAt.toDate().toLocaleString() : "Now"}
            </span>
          </div>
        </div>

        {/* အမှိုက်ပုံးကို ညာဘက်အစွန်မှာ သပ်သပ်ရပ်ရပ် ထားမယ် */}
        {(post.uid === auth.currentUser.uid) && (
          <div onClick={() => handleDelete(post.id, post.uid, post.userName)} style={deleteBtnBox}>
            <Trash2 size={18} color="#ef4444" />
          </div>
        )}
      </div>

        {/* --- Content Area --- */}
        <div style={{ padding: "0 0 15px 0" }}>
        <PostItem post={post} setViewImage={setViewImage} LinkIcon={LinkIcon} />
      </div>

        {/* --- Interaction Bar (Reactions & Comments) --- */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#fff"
          }}
        >
          <div style={{ display: "flex", gap: "20px" }}>
            {/* Reaction Button */}
            <div style={{ position: "relative" }}>
              <button
                style={{ display: "flex", alignItems: "center", gap: "6px", border: "none", background: "none", cursor: "pointer", color: "#64748b", fontWeight: "700", fontSize: "14px" }}
                onClick={() => setShowEmojiPicker(post.id)}
              >
                <span style={{ fontSize: "20px" }}>
                  {post.reactions?.[auth.currentUser.uid] || "❤️"}
                </span>
                <span>React</span>
              </button>

              {showEmojiPicker === post.id && (
                <div style={{ ...emojiPopupStyle, bottom: "45px", left: "0" }} onMouseLeave={() => setShowEmojiPicker(null)}>
                  <div style={emojiGroup}>
                    {["❤️", "💖", "🥰", "🙏", "👏", "😂", "🥳", "🤣", "🎂", "🎉", "🔥", "✨", "🫂", "😮", "👍", "👌"].map((emoji) => (
                      <span
                        key={emoji}
                        onClick={() => { handleReaction(post.id, emoji); setShowEmojiPicker(null); }}
                        style={emojiIconStyle}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Comment Count Display */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontWeight: "700", fontSize: "14px" }}>
              <MessageCircle size={20} />
              <span>{post.comments?.length || 0}</span>
            </div>
          </div>

          {/* Reaction Summary (Right side) */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#f8fafc", padding: "4px 10px", borderRadius: "20px" }}>
              {post.reactions && Object.values(post.reactions).slice(0, 3).map((r, i) => (
                <span key={i} style={{ fontSize: "12px" }}>{r}</span>
              ))}
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                {post.reactions ? Object.keys(post.reactions).length : 0}
              </span>
          </div>
        </div>

        {/* --- Comments Section --- */}
        <div style={{ padding: "15px 20px", backgroundColor: "#fcfdfe" }}>
          {post.comments?.slice(0, 3).map((c, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
              <img src={c.userImage} style={{ width: "30px", height: "30px", borderRadius: "50%" }} alt="u" />
              <div style={{ backgroundColor: "#f1f5f9", padding: "8px 12px", borderRadius: "18px", fontSize: "13px", maxWidth: "85%" }}>
                <strong style={{ color: "#1e293b" }}>{c.userName}</strong>
                <span style={{ marginLeft: "6px", color: "#475569" }}>{c.text}</span>
              </div>
            </div>
          ))}
          
          {/* Comment Input */}
          <div style={{ display: "flex", gap: "10px", marginTop: "15px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Comment..."
              style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: "20px", padding: "10px 15px", outline: "none", fontSize: "13px", backgroundColor: "#fff" }}
              value={commentText[post.id] || ""}
              onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
            />
            <div 
              onClick={() => handleComment(post.id)}
              style={{ cursor: "pointer", color: "#3b82f6", display: "flex", alignItems: "center" }}
            >
              <Send size={20} />
            </div>
          </div>
        </div>
      </div>
    ))}
</div>

{/* --- Load More Button (Grid ရဲ့ အောက်မှာ သီးသန့်ထားပါသည်) --- */}
{lastVisible && (
  <div style={{ textAlign: "center", padding: "40px 0" }}>
    <button
      onClick={fetchMorePosts}
      disabled={loadingMore}
      style={{
        padding: "12px 35px",
        borderRadius: "30px",
        border: "1px solid #e2e8f0",
        backgroundColor: "#fff",
        cursor: "pointer",
        fontWeight: "700",
        color: "#3b82f6",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        transition: "0.2s"
      }}
    >
      {loadingMore ? "ခေတ္တစောင့်ပါ..." : "နောက်ထပ် အမှတ်တရများ ကြည့်ရန် ↓"}
    </button>
  </div>
)}

      {/* --- Professional Lightbox Overlay --- */}
{viewImage && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.95)", // ပိုမှောင်လိုက်ခြင်းဖြင့် ပုံကို ပိုပေါ်လွင်စေသည်
      backdropFilter: "blur(8px)", // အနောက်က Background ကို ဝါးပေးသော Apple Style effect
      zIndex: 5000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "zoom-out",
      animation: "fadeIn 0.3s ease", // ပွင့်လာလျှင် ညင်သာစေရန်
    }}
    onClick={() => setViewImage(null)}
  >
    {/* ပုံထည့်သည့် Container */}
    <div 
      style={{ 
        position: "relative", 
        maxWidth: "95%", 
        maxHeight: "95%", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center"
      }}
      onClick={(e) => e.stopPropagation()} // ပုံကိုနှိပ်လျှင် ပိတ်မသွားစေရန်
    >
      <img
        src={viewImage}
        style={{
          maxWidth: "100%",
          maxHeight: "90vh",
          borderRadius: "12px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          objectFit: "contain",
          border: "1px solid rgba(255,255,255,0.1)"
        }}
        alt="full screen view"
      />
      
      {/* ပုံအောက်ခြေတွင် ပြပေးမည့် ခလုတ်ငယ်များ (Optional) */}
      <div style={{ 
        marginTop: "15px", 
        display: "flex", 
        gap: "20px", 
        color: "rgba(255,255,255,0.7)",
        fontSize: "14px",
        fontWeight: "500"
      }}>
        <span onClick={() => setViewImage(null)} style={{ cursor: "pointer" }}>Close</span>
        <a 
          href={viewImage} 
          download 
          target="_blank" 
          rel="noreferrer" 
          style={{ color: "inherit", textDecoration: "none" }}
        >
          Download
        </a>
      </div>
    </div>

    {/* Close Button (ညာဘက်အပေါ်ထောင့်) */}
    <div
      style={{
        position: "absolute",
        top: 30,
        right: 30,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: "50%",
        width: "45px",
        height: "45px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        transition: "0.2s",
        border: "1px solid rgba(255,255,255,0.2)"
      }}
      onClick={() => setViewImage(null)}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
    >
      <X size={24} color="#fff" />
    </div>
  </div>
)}
    </div>
  );
};

// 🌟 ဤကုဒ်ကို MainDashboard function ရဲ့ အပြင်ဘက် (အောက်ဆုံးနား) မှာ ထားပါ
const PostItem = ({
  post,
  setViewImage,
  LinkIcon,
  mainMedia,
  postCaption,
  linkBtnStyle,
}) => {
  // useState ကိုသုံးဖို့ React.useState လို့ ရေးပါမယ်
  const [expanded, setExpanded] = React.useState(false);

  if (!post) return null;

  const needReadMore = post.caption?.length > 150;
  const currentCaption = expanded
    ? post.caption
    : post.caption?.substring(0, 150);

  // အဟောင်း/အသစ် media စစ်ဆေးခြင်း
  const hasOldMedia = post.fileUrl || post.imageUrl;
  const oldMediaUrl = post.fileUrl || post.imageUrl;
  const isOldVideo =
    post.fileType === "video" ||
    oldMediaUrl?.toLowerCase().match(/\.(mp4|mov|wmv|avi|mkv)$/) !== null;
  const isOldImage =
    oldMediaUrl?.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null ||
    oldMediaUrl?.includes("firebasestorage");

  return (
    <>
      {/* စာသားအပိုင်း */}
      <p
        style={{
          padding: "0 15px 10px",
          fontSize: "15px",
          color: "#333",
          lineHeight: "1.5",
          whiteSpace: "pre-wrap",
        }}
      >
        {currentCaption}
        {needReadMore && !expanded && "..."}
        {needReadMore && (
          <span
            onClick={() => setExpanded(!expanded)}
            style={{
              color: "#3b82f6",
              cursor: "pointer",
              fontWeight: "bold",
              marginLeft: "5px",
            }}
          >
            {expanded ? " လျှော့ဖတ်ရန်" : " ဆက်လက်ဖတ်ရှုရန်"}
          </span>
        )}
      </p>

      {/* ၁။ Grid ပုံစံဖြင့် Media များပြသခြင်း (အသစ်တင်မည့် ပိုစ့်များအတွက်) */}
      {post.media && post.media.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: post.media.length === 1 ? "1fr" : "1fr 1fr",
            gap: "5px",
            padding: "0 10px 10px",
          }}
        >
          {post.media.map((m, i) => (
            <div
              key={i}
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                height: post.media.length === 1 ? "auto" : "200px",
                backgroundColor: "#f8fafc",
                border: "1px solid #eee",
              }}
            >
              {m.type === "image" && (
                <img
                  src={m.url}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onClick={() => setViewImage(m.url)}
                  alt="p"
                  referrerPolicy="no-referrer"
                />
              )}
              {m.type === "video" && (
                <video
                  src={m.url}
                  controls
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
              {m.type === "audio" && (
                <div
                  style={{
                    padding: "15px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "5px" }}>
                    🎵
                  </div>
                  <audio src={m.url} controls style={{ width: "100%" }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ၂။ ပုံဟောင်း (Single File) သို့မဟုတ် Link များပြသခြင်း (အရင်တင်ခဲ့သော ပိုစ့်များအတွက်) */}
      {!post.media && hasOldMedia && (
        <div style={{ padding: "0 10px 10px" }}>
          {isOldVideo ? (
            <video
              src={oldMediaUrl}
              controls
              style={{ width: "100%", borderRadius: "12px" }}
            />
          ) : isOldImage ? (
            <img
              src={oldMediaUrl}
              style={{ width: "100%", borderRadius: "12px", cursor: "pointer" }}
              onClick={() => setViewImage(oldMediaUrl)}
              alt="post"
              referrerPolicy="no-referrer"
            />
          ) : (
            <a
              href={oldMediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px",
                backgroundColor: "#f1f5f9",
                color: "#3b82f6",
                textDecoration: "none",
                borderRadius: "12px",
                fontWeight: "bold",
                fontSize: "13px",
              }}
            >
              🔗 မျှဝေထားသော Link ကိုကြည့်ရန်
            </a>
          )}
        </div>
      )}
    </>
  );
};

// --- Styles (အသစ်ထပ်တိုးထားသည်) ---
const feedWrapper = { maxWidth: "650px", margin: "0 auto", padding: "0 15px" };
const inputCardStyle = {
  backgroundColor: "#fff",
  borderRadius: "20px",
  padding: "20px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  marginBottom: "20px",
};
const inputHeader = {
  display: "flex",
  gap: "15px",
  alignItems: "center",
  marginBottom: "15px",
};
const smallAvatar = { width: "40px", height: "40px", borderRadius: "50%" };
const textInput = {
  flex: 1,
  border: "none",
  backgroundColor: "#f1f5f9",
  padding: "12px 20px",
  borderRadius: "25px",
  outline: "none",
};
const inputActions = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
};
const uploadLabel = {
  cursor: "pointer",
  color: "#64748b",
  display: "flex",
  alignItems: "center",
};
const postcardBtn = {
  backgroundColor: "#f0f9ff",
  color: "#0ea5e9",
  border: "1px solid #bae6fd",
  padding: "8px 15px",
  borderRadius: "15px",
  cursor: "pointer",
  fontWeight: "600",
};
const postBtn = {
  backgroundColor: "#3b82f6",
  color: "#fff",
  border: "none",
  padding: "8px 20px",
  borderRadius: "15px",
  cursor: "pointer",
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
};
const modalContent = {
  backgroundColor: "#fff",
  padding: "25px",
  borderRadius: "25px",
  width: "90%",
  maxWidth: "450px",
};
const previewBox = {
  height: "200px",
  borderRadius: "15px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "15px",
  padding: "20px",
};
const postcardTextArea = {
  width: "100%",
  height: "100%",
  background: "none",
  border: "none",
  color: "#fff",
  fontSize: "20px",
  fontWeight: "bold",
  textAlign: "center",
  outline: "none",
  resize: "none",
};
const colorGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: "10px",
  marginBottom: "20px",
};
const colorCircle = {
  height: "40px",
  borderRadius: "50%",
  cursor: "pointer",
  transition: "0.2s",
};
const postBtnFull = {
  width: "100%",
  backgroundColor: "#3b82f6",
  color: "#fff",
  border: "none",
  padding: "12px",
  borderRadius: "15px",
  fontWeight: "bold",
  cursor: "pointer",
};

const postsGrid = { display: "flex", flexDirection: "column", gap: "20px" };
const postCardStyle = {
  backgroundColor: "#fff",
  borderRadius: "20px",
  overflow: "hidden",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
};
const postUserBar = {
  padding: "15px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const postName = { margin: 0, fontSize: "15px", fontWeight: "600" };
const postTime = { fontSize: "11px", color: "#94a3b8" };
const postCaption = { padding: "0 15px 15px", margin: 0, fontSize: "15px" };
const imageContainer = { padding: "0 10px 10px" };
const mainMedia = { width: "100%", borderRadius: "12px" };
const postActionBar = {
  display: "flex",
  padding: "10px",
  borderTop: "1px solid #f1f5f9",
};
const actionBtn = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  border: "none",
  background: "none",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
};
const postcardDisplay = {
  height: "350px", // ပိုရှည်လိုက်ရင် ပိုလှပါတယ်
  margin: "10px",
  borderRadius: "25px",
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
};
const postcardBgImgStyle = {
  position: "absolute",
  width: "100%",
  height: "100%",
  objectFit: "cover", // ပုံမပြဲသွားအောင် cover ထားပါ
  zIndex: 0,
  borderRadius: "25px",
};
const postcardContentOverlay = {
  zIndex: 1,
  // backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glassmorphism
  backgroundColor: "rgba(0,0,0,0.2)",
  // backdropFilter: 'blur(5px)',
  padding: "20px",
  borderRadius: "15px",
  width: "85%",
  textAlign: "center",
  // border: '1px solid rgba(255,255,255,0.3)',
};
const postcardTextDisplay = {
  color: "#fff",
  fontSize: "28px",
  fontWeight: "bold",
  /* စာလုံးကို ပုံပေါ်မှာ ထင်းနေအောင် အရိပ် (Shadow) ပိုထည့်ခြင်း */
  textShadow: "2px 2px 10px rgba(0,0,0,0.8), -1px -1px 0 rgba(0,0,0,0.5)",
  margin: "0 0 15px 0",
  wordWrap: "break-word",
  lineHeight: "1.4",
};
const audioPlayerWrapper = {
  backgroundColor: "rgba(255,255,255,0.8)",
  borderRadius: "30px",
  padding: "5px",
  display: "inline-block",
};
const miniAudioStyle = {
  height: "35px",
  maxWidth: "200px",
};

const fontBtnStyle = {
  padding: "5px 12px",
  borderRadius: "10px",
  backgroundColor: "#fff",
  cursor: "pointer",
  fontSize: "12px",
  whiteSpace: "nowrap",
};

const commentSection = { padding: "15px", backgroundColor: "#f8fafc" };
const commentItem = { display: "flex", gap: "10px", marginBottom: "10px" };
const commentAvatar = { width: "25px", height: "25px", borderRadius: "50%" };
const commentBubble = {
  backgroundColor: "#fff",
  padding: "8px 12px",
  borderRadius: "15px",
  fontSize: "13px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
};
const commentInputArea = { display: "flex", gap: "10px", marginTop: "10px" };
const commentInput = {
  flex: 1,
  border: "1px solid #e2e8f0",
  borderRadius: "15px",
  padding: "8px 15px",
  fontSize: "13px",
  outline: "none",
};

const emojiPopup = {
  position: "absolute",
  bottom: "40px",
  left: 0,
  backgroundColor: "#fff",
  padding: "10px",
  borderRadius: "20px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  display: "flex",
  gap: "10px",
  zIndex: 100,
};

const emojiPopupStyle = {
  position: "absolute",
  bottom: "50px",
  left: "0",
  backgroundColor: "#fff",
  display: "flex",
  flexDirection: "column", // အောက်ကို ဆင်းသွားအောင် (Line ခွဲဖို့)
  gap: "8px",
  padding: "12px",
  borderRadius: "20px",
  boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
  zIndex: 100,
  border: "1px solid #f1f5f9",
  width: "max-content",
};
const emojiGroup = {
  display: "flex",
  gap: "12px",
  justifyContent: "center",
};

const emojiIconStyle = {
  fontSize: "22px",
  cursor: "pointer",
  transition: "transform 0.2s",
  display: "inline-block",
  // Hover လုပ်ရင် ပိုကြီးလာအောင်
  ":hover": {
    transform: "scale(1.3)",
  },
};

const reactionSummary = {
  display: "flex",
  alignItems: "center",
  padding: "0 10px",
  backgroundColor: "#f8fafc",
  borderRadius: "15px",
  marginLeft: "10px",
};

const postcardActionRow = {
  display: "flex",
  justifyContent: "center",
  gap: "20px",
  marginTop: "15px",
};

const iconBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  backgroundColor: "#f1f5f9",
  padding: "8px 12px",
  borderRadius: "12px",
  fontSize: "13px",
  cursor: "pointer",
  color: "#475569",
  fontWeight: "600",
  border: "1px solid #e2e8f0",
};

const linkBtnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  padding: "15px",
  backgroundColor: "#f1f5f9",
  color: "#3b82f6",
  textDecoration: "none",
  borderRadius: "15px",
  fontWeight: "600",
  fontSize: "14px",
  border: "1px dashed #3b82f6",
  margin: "10px 0",
};

const loadMoreBtnStyle = {
  padding: "12px 24px",
  backgroundColor: "#fff",
  border: "1px solid #3b82f6",
  color: "#3b82f6",
  borderRadius: "30px",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "14px",
  transition: "0.3s",
  boxShadow: "0 4px 10px rgba(59, 130, 246, 0.1)",
};
// const lightboxOverlay = {
//   position: "fixed",
//   top: 0,
//   left: 0,
//   width: "100%",
//   height: "100%",
//   background: "rgba(0,0,0,0.9)",
//   zIndex: 5000,
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
// };

// --- Modern Dashboard Styles ---

const dashboardContainer = {
  maxWidth: "1100px", // ၂-ကော်လံအတွက် ပိုကျယ်လိုက်ပါပြီ
  margin: "0 auto",
  padding: "20px 15px",
};

// ၁။ Search Section Style
const searchWrapper = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  backgroundColor: "#fff",
  padding: "12px 24px",
  borderRadius: "30px", // Apple-style round bar
  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
  border: "1px solid #f1f5f9",
  marginBottom: "30px",
};

const searchInputStyle = {
  border: "none",
  outline: "none",
  width: "100%",
  fontSize: "15px",
  backgroundColor: "transparent",
  color: "#1e293b",
};

// ၂။ Post Creator (Minimized/ချုံ့ထားသည့်ပုံစံ)
const minimizedCreator = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  backgroundColor: "#fff",
  padding: "12px 20px",
  borderRadius: "16px",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  border: "1px solid #f1f5f9",
  marginBottom: "30px",
  transition: "0.2s ease",
};

const placeholderText = {
  flex: 1,
  color: "#94a3b8",
  fontSize: "15px",
  fontWeight: "500",
};

// ၃။ Post Creator (Expanded/ပွင့်လာသည့်ပုံစံ)
const expandedCreatorCard = {
  backgroundColor: "#fff",
  padding: "25px",
  borderRadius: "24px",
  boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
  border: "1px solid #f1f5f9",
  marginBottom: "30px",
};

const creatorTextarea = {
  width: "100%",
  minHeight: "100px",
  border: "none",
  outline: "none",
  fontSize: "16px",
  fontFamily: "inherit",
  resize: "none",
  padding: "10px 0",
  color: "#1e293b",
};

// ၄။ ၂-ကော်လံ Grid စနစ် (Masonry-like Grid)
const postGridSystem = {
  display: "grid",
  // Desktop မှာ ၄၅၀px အနည်းဆုံးထားပြီး ၂ ကော်လံခွဲမယ်၊ ဖုန်းမှာ ၁ ကော်လံပဲပြမယ်
  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 450px), 1fr))",
  gap: "25px",
  alignItems: "start", // ပိုစ့်တွေက အမြင့်မတူရင်လည်း သူ့အလိုလို စီသွားမယ်
  marginTop: "20px",
};

// ၅။ ခေတ်မီသော Post Card Style
// const modernPostCard = {
//   backgroundColor: "#fff",
//   borderRadius: "24px",
//   boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
//   border: "1px solid #f1f5f9",
//   overflow: "hidden",
//   transition: "transform 0.2s ease",
// };

// const postHeader = {
//   padding: "15px 20px",
//   display: "flex",
//   justifyContent: "space-between",
//   alignItems: "center",
// };

// const avatarStyle = {
//   width: "42px",
//   height: "42px",
//   borderRadius: "50%",
//   objectFit: "cover",
//   border: "2px solid #f8fafc",
// };

// ၆။ Lightbox (Professional Zoom-out)
const lightboxOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.95)",
  backdropFilter: "blur(10px)", // Apple Glass effect
  zIndex: 5000,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "zoom-out",
};

const lightboxImage = {
  maxWidth: "95%",
  maxHeight: "90vh",
  borderRadius: "12px",
  boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
  objectFit: "contain",
  border: "1px solid rgba(255,255,255,0.1)",
};

// ၇။ Action Buttons & Badges
const reactionBadge = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  backgroundColor: "#f8fafc",
  padding: "5px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  color: "#64748b",
  fontWeight: "600",
};

const deleteBtnBox = {
  cursor: "pointer",
  padding: "8px",
  borderRadius: "50%",
  backgroundColor: "#fef2f2",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

// ၁။ ၂-ကော်လံ ဖြစ်စေမည့် Grid
const postGridContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 350px), 1fr))",
  gap: "20px",
  width: "100%",
  padding: "20px 0",
  alignItems: "start",
};

const mainLayout = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%", // 👈 100% ဖြစ်ရပါမယ်
  maxWidth: "1200px", // 👈 1200px အထိ ချဲ့ပေးပါ
  margin: "0 auto",
  paddingTop: "70px",
  paddingBottom: "100px",
};

// ၂။ Post Card တစ်ခုလုံး (ဘဲဥပုံမဖြစ်စေရန် border-radius ကို 15px ပဲထားပါ)
const modernPostCard = {
  backgroundColor: "#fff",
  borderRadius: "20px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  border: "1px solid #f1f5f9",
  overflow: "hidden",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

// ၃။ Header (User Info နှင့် Delete Button ကို ဘေးတိုက်ခွဲရန်)
const postHeader = {
  padding: "15px 20px",
  display: "flex",
  justifyContent: "space-between", // ဒါက အမှိုက်ပုံးကို ညာဘက်အစွန် တွန်းပို့ပေးတာပါ
  alignItems: "center",
  background: "#fff", // နောက်ခံအပြာရောင်/ဘဲဥပုံများကို ဖယ်ရှားလိုက်ပါပြီ
};

const avatarStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "50%", // User ပုံကိုပဲ အဝိုင်းလုပ်ပါ
  objectFit: "cover",
};

const userNameStyle = {
  margin: 0,
  fontSize: "15px",
  fontWeight: "700",
  color: "#1e293b",
};

const dateStyle = {
  fontSize: "11px",
  color: "#94a3b8",
};

const deleteBtnStyle = {
  cursor: "pointer",
  padding: "8px",
  borderRadius: "50%",
  backgroundColor: "#fef2f2", // အနီနုရောင်နောက်ခံ
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  transition: "0.2s",
};

export default MainDashboard;