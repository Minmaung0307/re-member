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
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
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
  Smile,
} from "lucide-react";

// 🌟 Post တစ်ခုချင်းစီအတွက် သီးသန့် Component
const PostCard = ({
  post,
  auth,
  db,
  handleDelete,
  handleReaction,
  setActiveCommentPost,
  setViewImage,
  setShowEmojiPicker,
  showEmojiPicker,
  darkMode,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 🌟 ပုံဟောင်း/ပုံသစ် အကုန်ပေါ်စေမည့် Logic
  const allMedia =
    post.media ||
    (post.fileUrl || post.imageUrl || post.postcardImg
      ? [
          {
            url: post.fileUrl || post.imageUrl || post.postcardImg,
            type: "image",
          },
        ]
      : []);

  const charLimit = 80; // စာသားကို အတိုပဲပြမယ် (ကတ်ညီစေရန်)
  const isLongText = post.caption?.length > charLimit;
  const displayText = isExpanded
    ? post.caption
    : post.caption?.substring(0, charLimit);

  return (
    <div
      style={{
        ...modernPostCard,
        backgroundColor: darkMode ? "#1e293b" : "#fff",
        color: darkMode ? "#f1f5f9" : "#1e293b",
        border: darkMode ? "1px solid #334155" : "1px solid #f1f5f9",
      }}
    >
      {/* ၁။ Header */}
      <div style={postHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src={post.userImage} style={avatarStyle} alt="u" />
          <div style={{ overflow: "hidden" }}>
            <h4
              style={{ ...userNameStyle, color: darkMode ? "#fff" : "#1e293b" }}
            >
              {post.userName}
            </h4>
            <span style={postTime}>
              {post.createdAt
                ? post.createdAt.toDate().toLocaleString()
                : "Now"}
            </span>
          </div>
        </div>
        {(post.uid === auth.currentUser.uid ||
          auth.currentUser.email === "koalankar@gmail.com") && (
          <div
            onClick={() => handleDelete(post.id, post.uid, post.userName)}
            style={deleteBtnBox}
          >
            <Trash2 size={16} color="#ef4444" />
          </div>
        )}
      </div>

      {/* ၂။ စာသားအပိုင်း (အမြင့်ကို ပုံသေထိန်းထားသည်) */}
      <div style={postCaption}>
        {displayText}
        {isLongText && (
          <span
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ color: "#3b82f6", cursor: "pointer", fontWeight: "bold" }}
          >
            {isExpanded ? " Read Less..." : " Read More..."}
          </span>
        )}
      </div>

      {/* ၃။ ဓာတ်ပုံ/ဗီဒီယို အပိုင်း (အခု ပြန်ပေါ်လာပါပြီ) */}
      <div style={imageContainer}>
        {post.fileType === "postcard" ? (
          /* --- Postcard Display --- */
          <div
            style={{
              ...postcardDisplay,
              backgroundColor: post.fileUrl,
              width: "100%",
              height: "100%",
              margin: 0,
              borderRadius: 0,
            }}
          >
            {post.postcardImg && (
              <img src={post.postcardImg} style={postcardBgImgStyle} alt="bg" />
            )}
            <div style={postcardContentOverlay}>
              <h2 style={{ ...postcardTextDisplay, fontSize: "18px" }}>
                {post.caption}
              </h2>
            </div>
          </div>
        ) : allMedia.length > 0 ? (
          /* --- ရိုးရိုးပုံ သို့မဟုတ် ဗီဒီယို --- */
          allMedia[0].type === "video" ? (
            <video src={allMedia[0].url} controls style={mainMedia} />
          ) : (
            <img
              src={allMedia[0].url}
              style={mainMedia}
              alt="post"
              referrerPolicy="no-referrer"
              onClick={() => setViewImage(allMedia[0].url)}
              onError={(e) => {
                e.target.style.display = "none";
              }} // ပုံပျက်နေရင် ဖျောက်ထားမယ်
            />
          )
        ) : (
          <div style={{ color: "#94a3b8", fontSize: "12px" }}>No Media</div>
        )}
      </div>

      {/* ၄။ Interaction Bar */}
      <div
        style={{
          ...interactionBar,
          backgroundColor: darkMode ? "#1e293b" : "#fff",
          borderTop: darkMode ? "1px solid #334155" : "1px solid #f1f5f9",
        }}
      >
        <div style={{ display: "flex", gap: "15px" }}>
          <div
            onMouseEnter={() => setShowEmojiPicker(post.id)}
            onMouseLeave={() => setShowEmojiPicker(null)}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <button
              style={{
                ...actionBtnBase,
                color: darkMode ? "#94a3b8" : "#64748b",
              }}
            >
              <span style={{ fontSize: "18px" }}>
                {post.reactions?.[auth.currentUser.uid] || "🙏"}
              </span>
              <span>React</span>
            </button>

            {showEmojiPicker === post.id && (
              <div style={hoverReactionBox}>
                {[
                  "❤️",
                  "💖",
                  "🥰",
                  "🙏",
                  "👏",
                  "😂",
                  "🥳",
                  "🤣",
                  "🎂",
                  "🎉",
                  "🔥",
                  "✨",
                  "🫂",
                  "😮",
                  "👍",
                  "👌",
                ].map((e) => (
                  <span
                    key={e}
                    onClick={() => handleReaction(post.id, e)}
                    style={emojiHoverItem}
                  >
                    {e}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            style={{
              ...actionBtnBase,
              color: darkMode ? "#94a3b8" : "#64748b",
            }}
            onClick={() => setActiveCommentPost(post)}
          >
            <MessageCircle size={18} />
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>

        <div style={reactionPreview}>
          <span style={{ fontSize: "12px" }}>
            {post.reactions ? Object.values(post.reactions)[0] : "🙏"}
          </span>
          <span style={{ fontSize: "12px", fontWeight: "600" }}>
            {post.reactions ? Object.keys(post.reactions).length : 0}
          </span>
        </div>
      </div>
    </div>
  );
};

const MainDashboard = ({
  posts,
  setPosts,
  userFamilyCode,
  setStatusModal,
  setConfirmModal,
  darkMode,
}) => {
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

  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [activeCommentText, setActiveCommentText] = useState("");

  const cardStyles = [
    "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
    "linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
    "#ffffff",
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
    const isOwner =
      postUid === auth.currentUser.uid ||
      postUserName === auth.currentUser.displayName;
    if (!isOwner) return;

    // 🌟 Browser confirm အစား Custom Modal ကို သုံးခြင်း
    setConfirmModal({
      show: true,
      title: "Delete Memory?",
      message:
        "Are you sure you want to delete this post? This action cannot be undone.",
      onConfirm: async () => {
        try {
          const { doc, deleteDoc } = await import("firebase/firestore");
          await deleteDoc(doc(db, "posts", postId));

          setStatusModal({
            show: true,
            title: "Deleted!",
            message: "Memory has been removed successfully.",
            type: "success",
          });
        } catch (error) {
          console.error(error);
          setStatusModal({
            show: true,
            title: "Error",
            message: "Failed to delete.",
            type: "error",
          });
        }
      },
    });
  };

  const onFileChange = (e) => {
    const files = Array.from(e.target.files);
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB ကို Byte အဖြစ် ပြောင်းလဲခြင်း

    // 5MB ထက် ကျော်တဲ့ ဖိုင်ရှိမရှိ စစ်မယ်
    const oversizedFiles = files.filter((f) => f.size > MAX_SIZE);

    if (oversizedFiles.length > 0) {
      alert(
        `⚠️ File size limit exceeded.\n\n` +
          `Each file must not exceed 5MB.\n` +
          `Oversized files: ${oversizedFiles.map((f) => f.name).join(", ")}`,
      );
      e.target.value = null; // Input ကို ပြန်ရှင်းပစ်မယ်
      setSelectedFiles([]);
      setPreviewUrls([]);
      return;
    }

    // 5MB ထက် မကျော်မှသာ ရှေ့ဆက်မယ်
    setSelectedFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);
  };

  // ၄။ Postcard တင်ခြင်း
  const handlePostcardUpload = async () => {
    if (!postcardMessage.trim()) {
      alert("Write A Birthday Message...");
      return;
    }
    setUploading(true);
    let imgUrl = "";

    try {
      // ၁။ ပုံအသစ် (File) ရွေးထားလျှင် Storage သို့တင်မည်
      if (postcardImage && typeof postcardImage !== "string") {
        const imgRef = ref(
          storage,
          `postcards/images/${Date.now()}_${postcardImage.name}`,
        );
        const snapshot = await uploadBytes(imgRef, postcardImage);
        imgUrl = await getDownloadURL(snapshot.ref);
      }
      // ၂။ Template (Link) ကိုပဲ ရွေးထားလျှင် Link ကို တိုက်ရိုက်ယူမည်
      else if (typeof postcardImage === "string") {
        imgUrl = postcardImage;
      }

      // Firestore ထဲသို့ သိမ်းခြင်း
      await addDoc(collection(db, "posts"), {
        caption: postcardMessage,
        fileUrl: selectedColor,
        postcardImg: imgUrl,
        fileType: "postcard",
        userName: auth.currentUser.displayName,
        userImage: auth.currentUser.photoURL,
        uid: auth.currentUser.uid,
        postcardFont: "Inter, sans-serif", // Font ကို တစ်မျိုးတည်း ပုံသေထားလိုက်ပါပြီ
        reactions: {},
        comments: [],
        createdAt: serverTimestamp(),
        familyCode: userFamilyCode,
      });

      setPostcardMessage("");
      setPostcardImage(null);
      setShowPostcardEditor(false);
      setStatusModal({
        show: true,
        title: "🎨 Postcard Sent",
        message: "Your postcard has been posted successfully! ✨",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      setUploading(false);
      setStatusModal({
        show: true,
        title: "❌ Postcard Upload Failed",
        message: "Something went wrong. Please try again.",
        type: "error",
      });
    }
    setUploading(false);
  };

  const handleUpload = async () => {
    // ပုံလည်းမပါ၊ Link လည်းမပါ၊ စာလည်းမပါရင် ဘာမှမလုပ်ဘူး
    if (selectedFiles.length === 0 && !externalUrl && !caption) return;

    setUploading(true);
    let uploadedMedia = [];

    try {
      // ၁။ Online Link ထည့်ထားရင် အရင်ယူမယ်
      if (externalUrl) {
        uploadedMedia.push({
          url: externalUrl,
          type: "image",
          isExternal: true,
        });
      }

      // ၂။ စက်ထဲက ပုံတွေကို Loop ပတ်ပြီး Upload တင်မယ်
      for (const f of selectedFiles) {
        const storageRef = ref(storage, `media/${Date.now()}_${f.name}`);
        const snapshot = await uploadBytes(storageRef, f);
        const url = await getDownloadURL(snapshot.ref);

        uploadedMedia.push({ url: url, type: "image" });
      }

      await addDoc(collection(db, "posts"), {
        caption: caption,
        media: uploadedMedia,
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

      setCaption("");
      setSelectedFiles([]);
      setPreviewUrls([]);
      setExternalUrl("");
      setIsCreating(false);
      setStatusModal({
        show: true,
        title: "🎉 Success",
        message: "Memory uploaded successfully! ✨",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      setUploading(false);
      setStatusModal({
        show: true,
        title: "❌ Image Upload Failed",
        message: "Something went wrong. Please try again.",
        type: "error",
      });
    }
    setUploading(false);
  };

  return (
    // <div style={feedWrapper}>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 15px" }}>
      {/* --- ၁။ Search Bar (သီးသန့်ခွဲထုတ်ထားသည်) --- */}
      <div style={{ marginBottom: "25px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            backgroundColor: "#fff",
            padding: "12px 20px",
            borderRadius: "30px", // ပိုပြီး Apple Style ဆန်အောင် ဝိုင်းလိုက်သည်
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9",
          }}
        >
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search memories (e.g., by name or text)..."
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              fontSize: "15px",
              background: "transparent",
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
              display: "flex",
              alignItems: "center",
              gap: "15px",
              backgroundColor: "#fff",
              padding: "12px 20px",
              borderRadius: "30px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid #f1f5f9",
            }}
          >
            <img
              src={auth.currentUser?.photoURL}
              style={{ width: "35px", height: "35px", borderRadius: "50%" }}
              alt="me"
            />
            <div style={{ flex: 1, color: "#94a3b8", fontSize: "15px" }}>
              What would you like to share?{" "}
              {auth.currentUser?.displayName.split(" ")[0]}...
            </div>
            <Image color="#10b981" size={22} />
          </div>
        ) : (
          /* (ခ) ပွင့်လာသည့်ပုံစံ - Expanded Input Card */
          <div
            style={{
              ...inputCardStyle,
              position: "relative",
              animation: "fadeIn 0.3s ease",
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "20px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
                alignItems: "center",
              }}
            >
              <h4 style={{ margin: 0, color: "#1e293b" }}>
                Create a New Memory
              </h4>
              <X
                onClick={() => setIsCreating(false)}
                style={{ cursor: "pointer", color: "#64748b" }}
                size={20}
              />
            </div>

            {/* အပိုင်း (၁) - Avatar နှင့် စာသားရိုက်ရန်နေရာ */}
            <div
              style={{
                ...inputHeader,
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                marginBottom: "15px",
              }}
            >
              <img
                src={auth.currentUser?.photoURL}
                style={{
                  ...smallAvatar,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                }}
                alt="me"
              />
              <textarea
                placeholder="What's special about today?..."
                style={{
                  width: "100%",
                  minHeight: "100px",
                  border: "none",
                  outline: "none",
                  fontSize: "16px",
                  fontFamily: "inherit",
                  resize: "none",
                  padding: "5px",
                }}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            {/* Preview Images */}
            {previewUrls.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  overflowX: "auto",
                  padding: "10px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "10px",
                  marginBottom: "15px",
                }}
              >
                {previewUrls.map((url, i) => (
                  <div key={i} style={{ position: "relative", flexShrink: 0 }}>
                    <img
                      src={url}
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "10px",
                        objectFit: "cover",
                      }}
                      alt="preview"
                    />
                    <X
                      size={16}
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        background: "#ef4444",
                        color: "#fff",
                        borderRadius: "50%",
                        cursor: "pointer",
                        padding: "2px",
                      }}
                      onClick={() => {
                        const newFiles = [...selectedFiles];
                        newFiles.splice(i, 1);
                        setSelectedFiles(newFiles);
                        const newUrls = [...previewUrls];
                        newUrls.splice(i, 1);
                        setPreviewUrls(newUrls);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* အပိုင်း (၂) - Online Link ထည့်ရန်နေရာ */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#f1f5f9",
                padding: "10px 15px",
                borderRadius: "12px",
                marginBottom: "15px",
              }}
            >
              <LinkIcon size={16} color="#64748b" />
              <input
                style={{
                  border: "none",
                  background: "none",
                  outline: "none",
                  fontSize: "13px",
                  width: "100%",
                }}
                placeholder="Enter Link (URL)..."
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
              />
            </div>

            {/* အပိုင်း (၃) - နောက်ခံအရောင်ရွေးရန် */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  fontWeight: "600",
                }}
              >
                Choose Style:
              </span>
              {cardStyles.map((s) => (
                <div
                  key={s}
                  onClick={() => setSelectedStyle(s)}
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: s,
                    cursor: "pointer",
                    border:
                      selectedStyle === s
                        ? "2px solid #3b82f6"
                        : "1px solid #ddd",
                    boxShadow:
                      selectedStyle === s
                        ? "0 0 5px rgba(59,130,246,0.5)"
                        : "none",
                  }}
                />
              ))}
            </div>

            {/* အပိုင်း (၄) - ခလုတ်များ */}
            <div
              style={{
                ...inputActions,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #f1f5f9",
                paddingTop: "15px",
              }}
            >
              <div style={{ display: "flex", gap: "10px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#f1f5f9",
                    fontSize: "14px",
                  }}
                >
                  <Image size={20} color="#10b981" />
                  <span>Photo</span>
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={onFileChange}
                  />
                </label>
                <button
                  onClick={() => setShowPostcardEditor(true)}
                  style={{
                    ...postcardBtn,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    border: "none",
                    background: "#fef2f2",
                    color: "#ef4444",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  🎨 Postcard
                </button>
              </div>

              <button
                onClick={() => {
                  handleUpload();
                  setIsCreating(false);
                }}
                disabled={
                  (!selectedFiles.length && !externalUrl && !caption) ||
                  uploading
                }
                style={{
                  backgroundColor:
                    selectedFiles.length || externalUrl || caption
                      ? "#3b82f6"
                      : "#e2e8f0",
                  color: "#fff",
                  border: "none",
                  padding: "10px 25px",
                  borderRadius: "10px",
                  fontWeight: "bold",
                  cursor: "pointer",
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
        <div
          style={{
            ...modalOverlay,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 3000,
          }}
        >
          <div
            style={{
              ...modalContent,
              backgroundColor: "#fff",
              padding: "25px",
              borderRadius: "24px",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>
                Create a Birthday Greeting Card
              </h3>
              <X
                onClick={() => {
                  setShowPostcardEditor(false);
                  setPostcardImage(null);
                  setPostcardAudio(null);
                }}
                style={{ cursor: "pointer", color: "#64748b" }}
              />
            </div>

            {/* Preview Box */}
            <div
              style={{
                ...previewBox,
                backgroundColor: selectedColor,
                position: "relative",
                overflow: "hidden",
                height: "250px",
                borderRadius: "18px",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {postcardImage && (
                <img
                  src={
                    typeof postcardImage === "string"
                      ? postcardImage
                      : URL.createObjectURL(postcardImage)
                  }
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.5,
                    zIndex: 0,
                  }}
                  alt="preview"
                />
              )}
              <textarea
                placeholder="Write a Birthday Message..."
                style={{
                  ...postcardTextArea,
                  zIndex: 1,
                  width: "80%",
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: "20px",
                  textAlign: "center",
                  fontWeight: "bold",
                  textShadow: "1px 1px 4px rgba(0,0,0,0.5)",
                }}
                value={postcardMessage}
                onChange={(e) => setPostcardMessage(e.target.value)}
              />
            </div>

            {/* Template Selection */}
            <div style={{ marginBottom: "20px" }}>
              <span
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  fontWeight: "600",
                  display: "block",
                  marginBottom: "10px",
                }}
              >
                Templates:
              </span>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  overflowX: "auto",
                  paddingBottom: "5px",
                }}
              >
                {postcardTemplates.map((t) => (
                  <img
                    key={t.url}
                    src={t.url}
                    onClick={() => setPostcardImage(t.url)}
                    style={{
                      width: "80px",
                      height: "50px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      objectFit: "cover",
                      border:
                        postcardImage === t.url
                          ? "3px solid #3b82f6"
                          : "2px solid #f1f5f9",
                    }}
                    alt="template"
                  />
                ))}
              </div>
            </div>

            {/* Media Upload Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  backgroundColor: "#f8fafc",
                  cursor: "pointer",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                }}
              >
                <Image size={20} color="#3b82f6" />
                <span>Add Photo</span>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setPostcardImage(e.target.files[0])}
                />
              </label>
            </div>

            {/* Selected File Names */}
            {postcardImage && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#3b82f6",
                  marginBottom: "15px",
                  padding: "10px",
                  backgroundColor: "#f0f7ff",
                  borderRadius: "10px",
                }}
              >
                {postcardImage && typeof postcardImage !== "string" && (
                  <div>🖼️ {postcardImage.name}</div>
                )}
                {/* {postcardAudio && <div>🎵 {postcardAudio.name}</div>} */}
              </div>
            )}

            {/* Background Colors */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "25px",
                flexWrap: "wrap",
              }}
            >
              {colors.map((c) => (
                <div
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: c,
                    border:
                      selectedColor === c
                        ? "3px solid #3b82f6"
                        : "2px solid #fff",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                />
              ))}
            </div>

            <button
              onClick={handlePostcardUpload}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "15px",
                border: "none",
                backgroundColor: "#3b82f6",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "16px",
                cursor: "pointer",
              }}
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
          .filter((p) =>
            p.caption?.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          .map((post) => (
            <PostCard
              key={post.id}
              post={post}
              auth={auth}
              db={db}
              handleDelete={handleDelete}
              handleReaction={handleReaction}
              setActiveCommentPost={setActiveCommentPost}
              setViewImage={setViewImage}
              setShowEmojiPicker={setShowEmojiPicker}
              showEmojiPicker={showEmojiPicker}
              darkMode={darkMode}
            />
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
              transition: "0.2s",
            }}
          >
            {loadingMore ? "Please wait..." : "View more memories... ↓"}
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
              alignItems: "center",
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
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              alt="full screen view"
            />

            {/* ပုံအောက်ခြေတွင် ပြပေးမည့် ခလုတ်ငယ်များ (Optional) */}
            <div
              style={{
                marginTop: "15px",
                display: "flex",
                gap: "20px",
                color: "rgba(255,255,255,0.7)",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <span
                onClick={() => setViewImage(null)}
                style={{ cursor: "pointer" }}
              >
                Close
              </span>
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
              border: "1px solid rgba(255,255,255,0.2)",
            }}
            onClick={() => setViewImage(null)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.1)")
            }
          >
            <X size={24} color="#fff" />
          </div>
        </div>
      )}

      {/* --- 🌟 Comment Popup Modal 🌟 --- */}
      {activeCommentPost && (
        <div style={modalOverlay} onClick={() => setActiveCommentPost(null)}>
          <div style={commentPopupContent} onClick={(e) => e.stopPropagation()}>
            <div style={commentPopupHeader}>
              <h3 style={{ margin: 0, fontSize: "18px" }}>Comments</h3>
              <X
                onClick={() => setActiveCommentPost(null)}
                style={{ cursor: "pointer" }}
              />
            </div>

            <div style={commentScrollArea}>
              {activeCommentPost.comments?.length > 0 ? (
                activeCommentPost.comments.map((c, i) => (
                  <div key={i} style={commentBubbleRow}>
                    <img src={c.userImage} style={commentAvatar} alt="user" />
                    <div style={commentBubbleBox}>
                      <div style={commentAuthorName}>{c.userName}</div>
                      <div style={{ wordBreak: "break-word" }}>{c.text}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    textAlign: "center",
                    color: "#94a3b8",
                    marginTop: "20px",
                  }}
                >
                  No Comments
                </p>
              )}
            </div>

            <div style={commentInputSticky}>
              <input
                value={activeCommentText}
                onChange={(e) => setActiveCommentText(e.target.value)}
                placeholder="မှတ်ချက်ပေးရန်..."
                style={commentInputPopup}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && activeCommentText.trim() !== "") {
                    // --- Enter ခေါက်ပြီး ပို့တဲ့ Logic ---
                    const postRef = doc(db, "posts", activeCommentPost.id);
                    await updateDoc(postRef, {
                      comments: arrayUnion({
                        text: activeCommentText,
                        userName: auth.currentUser.displayName,
                        userImage: auth.currentUser.photoURL,
                        createdAt: new Date().toISOString(),
                      }),
                    });
                    setActiveCommentText("");
                    setActiveCommentPost(null); // 🌟 ဤနေရာတွင် Modal ကို ပိတ်ခိုင်းလိုက်ပါပြီ
                  }
                }}
              />
              <button
                onClick={async () => {
                  if (!activeCommentText.trim()) return;
                  // --- Send ခလုတ်နှိပ်ပြီး ပို့တဲ့ Logic ---
                  const postRef = doc(db, "posts", activeCommentPost.id);
                  await updateDoc(postRef, {
                    comments: arrayUnion({
                      text: activeCommentText,
                      userName: auth.currentUser.displayName,
                      userImage: auth.currentUser.photoURL,
                      createdAt: new Date().toISOString(),
                    }),
                  });
                  setActiveCommentText("");
                  setActiveCommentPost(null); // 🌟 ဤနေရာတွင်လည်း Modal ကို ပိတ်ခိုင်းလိုက်ပါပြီ
                }}
                style={commentSendIconBtn}
              >
                <Send size={20} />
              </button>
            </div>
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
            {expanded ? " Read Less..." : " Read More..."}
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
              🔗 View Shared Link
            </a>
          )}
        </div>
      )}
    </>
  );
};

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

const inputActions = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
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
  zIndex: 1,
  width: "85%",
  background: "none",
  border: "none",
  outline: "none",
  color: "#fff",
  fontSize: "22px",
  textAlign: "center",
  fontWeight: "700", // စာလုံးကို ပိုထင်ရှားအောင် Bold လုပ်ထားသည်
  textShadow: "2px 2px 8px rgba(0,0,0,0.6)", // စာသားဖတ်ရလွယ်အောင် အရိပ်ထည့်သည်
  fontFamily: "Inter, -apple-system, sans-serif", // Apple Style စာလုံးပုံစံ
  resize: "none",
};

const postTime = { fontSize: "11px", color: "#94a3b8" };

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

const commentAvatar = { width: "25px", height: "25px", borderRadius: "50%" };

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

const actionBtnBase = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  border: "none",
  background: "none",
  cursor: "pointer",
  color: "#64748b",
  fontWeight: "700",
  fontSize: "14px",
  padding: "5px 0",
};

const commentPopupContent = {
  backgroundColor: "#fff",
  borderRadius: "25px",
  width: "95%",
  maxWidth: "450px",
  height: "70vh", // အရမ်းမရှည်အောင် ၇၀ ထားပါသည်
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const commentScrollArea = {
  flex: 1,
  padding: "20px",
  overflowY: "auto",
  backgroundColor: "#fcfdfe",
};

const commentInputPopup = {
  flex: 1,
  border: "1px solid #e2e8f0",
  borderRadius: "25px",
  padding: "10px 18px",
  outline: "none",
  fontSize: "15px",
};

const reactionPreview = {
  display: "flex",
  alignItems: "center",
  gap: "2px",
  background: "#f8fafc",
  padding: "4px 10px",
  borderRadius: "20px",
};

const commentPopupHeader = {
  padding: "20px",
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const commentBubbleRow = {
  display: "flex",
  gap: "12px",
  marginBottom: "15px",
};

const commentBubbleBox = {
  backgroundColor: "#f1f5f9",
  padding: "10px 15px",
  borderRadius: "18px",
  fontSize: "14px",
  maxWidth: "80%",
};

const commentAuthorName = {
  fontWeight: "bold",
  marginBottom: "2px",
  color: "#1e293b",
  fontSize: "12px",
};

const commentInputSticky = {
  padding: "15px 20px",
  borderTop: "1px solid #eee",
  display: "flex",
  gap: "10px",
  alignItems: "center",
};

const commentSendIconBtn = {
  border: "none",
  background: "none",
  color: "#3b82f6",
  cursor: "pointer",
};

const modernPostCard = {
  borderRadius: "24px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  height: "560px", // 🌟 ကတ်အမြင့်ကို ပုံသေပြန်ထားလိုက်ပါပြီ
  position: "relative",
  marginBottom: "10px",
  transition: "0.3s ease",
};

const postCaption = {
  padding: "0 20px 10px",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  color: "#1e293b",
  fontSize: "12px",
  whiteSpace: "pre-wrap",
  lineHeight: "1.4",
  height: "50px", // 🌟 စာသားနေရာကို အမြင့်ကန့်သတ်လိုက်လို့ ကတ်မရှည်တော့ပါဘူး
  overflow: "hidden",
};

const imageContainer = {
  width: "100%",
  height: "340px", // 🌟 ပုံအမြင့်ကို ပုံသေထားသည်
  backgroundColor: "#f8fafc",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
};

const mainMedia = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const hoverReactionBox = {
  position: "absolute",
  bottom: "35px", // 🌟 ခလုတ်နဲ့ ပိုနီးကပ်သွားအောင် ညှိထားသည်
  left: 0,
  backgroundColor: "#fff",
  padding: "10px",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  display: "flex",
  flexWrap: "wrap",
  width: "220px",
  gap: "8px",
  zIndex: 1000,
  border: "1px solid #eee",
  // 🌟 Mouse ရွှေ့ရင် မပျောက်သွားစေဖို့ ပေါင်းကူးတံတား (Invisible Bridge)
  paddingTop: "20px",
  marginTop: "-20px",
};

const emojiHoverItem = {
  fontSize: "22px",
  cursor: "pointer",
  transition: "transform 0.1s",
  padding: "2px",
};

const interactionBar = {
  padding: "10px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "auto", // 🌟 အောက်ခြေမှာ အမြဲကပ်နေစေရန်
};
export default MainDashboard;
