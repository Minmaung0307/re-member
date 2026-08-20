import React, { useState, useEffect } from 'react';
import { db, storage, auth } from './firebase';
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
    deleteDoc 
} from 'firebase/firestore';
import { 
    ref, 
    uploadBytesResumable, 
    getDownloadURL, 
    uploadBytes 
} from 'firebase/storage';
import { 
    Home, 
    Gift, 
    ShieldCheck, 
    Link as LinkIcon, 
    Palette,
    Image, 
    Music, 
    Send, 
    Heart, 
    MessageCircle, 
    Share2, 
    MoreHorizontal, 
    Trash2, 
    X,
    Search
} from 'lucide-react';

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

    const cardStyles = [
        "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
        "linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)",
        "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
        "#ffffff"
    ];

    const [selectedFont, setSelectedFont] = useState("cursive"); // Font ရွေးဖို့
    const fonts = [
        { name: "Cursive", family: "cursive" },
        { name: "Modern", family: "sans-serif" },
        { name: "Classic", family: "serif" },
        { name: "Elegant", family: "Georgia" },
        { name: "Bold", family: "Impact" }
    ];

    const colors = [
        "#ffcfdf", "#ffdb58", "#a7f3d0", "#bae6fd", "#c7d2fe", 
        "#fecaca", "#fde68a", "#ddd6fe", "#fbcfe8", "#fbbf24",
        "#34d399", "#60a5fa", "#818cf8", "#f472b6", "#fb7185",
        "#a78bfa", "#2dd4bf", "#fb923c", "#4ade80", "#22d3ee"
    ];

    // useEffect(() => {
    //     const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    //     const unsubscribe = onSnapshot(q, (snapshot) => {
    //         setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    //     });
    //     return () => unsubscribe();
    // }, []);

    // ၁။ ပထမဆုံးအကြိမ် Post ၁၀ ခုပဲ ဆွဲမယ်
    useEffect(() => {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(10));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
            limit(10)
        );
        
        const querySnapshot = await getDocs(nextQuery);
        const newPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
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
            [`reactions.${auth.currentUser.uid}`]: emoji
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
                createdAt: new Date().toISOString()
            })
        });
        setCommentText({ ...commentText, [postId]: "" });
    };

    // ၃။ Delete Function (အစက်သုံးစက် menu အတွက်)
    const handleDelete = async (postId, postUid, postUserName) => {
        // ပိုင်ရှင် ဟုတ်မဟုတ် စစ်ဆေးခြင်း (UID သို့မဟုတ် အမည်ဖြင့်)
        const isOwner = postUid === auth.currentUser.uid || postUserName === auth.currentUser.displayName;

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

    // ၄။ Postcard တင်ခြင်း
    const handlePostcardUpload = async () => {
        if (!postcardMessage.trim()) return;
        setUploading(true);
        
        let imgUrl = "";
        let audUrl = "";

        try {
            // ပုံကို တင်ခြင်း
            if (postcardImage) {
                const imgRef = ref(storage, `postcards/images/${Date.now()}_${postcardImage.name}`);
                const snapshot = await uploadBytes(imgRef, postcardImage);
                imgUrl = await getDownloadURL(snapshot.ref);
            }

            // အသံကို တင်ခြင်း
            if (postcardAudio) {
                const audRef = ref(storage, `postcards/audio/${Date.now()}_${postcardAudio.name}`);
                const snapshot = await uploadBytes(audRef, postcardAudio);
                audUrl = await getDownloadURL(snapshot.ref);
            }

            // Firestore ထဲမှာ သိမ်းခြင်း
            await addDoc(collection(db, "posts"), {
                caption: postcardMessage,
                fileUrl: selectedColor, // နောက်ခံအရောင်
                postcardImg: imgUrl,    // ပူးတွဲပုံ
                postcardAud: audUrl,    // ပူးတွဲအသံ
                fileType: 'postcard',
                userName: auth.currentUser.displayName,
                userImage: auth.currentUser.photoURL,
                uid: auth.currentUser.uid,
                postcardFont: selectedFont,
                reactions: {},
                comments: [],
                createdAt: serverTimestamp(),
                familyCode: auth.currentUser.familyCode,
                familyCode: userFamilyCode,
            });

            // Form ကို Reset လုပ်ခြင်း
            setPostcardMessage("");
            setPostcardImage(null);
            setPostcardAudio(null);
            setShowPostcardEditor(false);
            setUploading(false);
            alert("မွေးနေ့ Postcard ကို အောင်မြင်စွာ တင်ပြီးပါပြီ! ✨");

        } catch (error) {
            console.error(error);
            alert("Error: တင်လို့မရပါ။ ပြန်ကြိုးစားကြည့်ပါ။");
            setUploading(false);
        }
    };

    const handleUpload = async () => {
        if (!file && !externalUrl && !caption) return;
        setUploading(true);
        let finalUrl = externalUrl;
        let type = "image"; // default

        // အကယ်၍ file တင်တာဆိုရင်
        if (file) {
            type = file.type.startsWith('video') ? 'video' : 'image';
            const storageRef = ref(storage, `${type}s/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            finalUrl = await getDownloadURL(storageRef);
        } 
        // အကယ်၍ Link URL ပဲ ထည့်တာဆိုရင် (ဗီဒီယို link လား စစ်မယ်)
        else if (externalUrl) {
            const videoExtensions = ['.mp4', '.mov', '.wmv', '.avi', '.mkv'];
            const isVideo = videoExtensions.some(ext => externalUrl.toLowerCase().includes(ext));
            type = isVideo ? 'video' : 'image';
        }

        await addDoc(collection(db, "posts"), {
            caption,
            fileUrl: finalUrl,
            fileType: type, // ဒါက အရေးကြီးပါတယ်
            layoutStyle: selectedStyle,
            userName: auth.currentUser.displayName,
            userImage: auth.currentUser.photoURL,
            uid: auth.currentUser.uid,
            likes: [],
            comments: [],
            createdAt: serverTimestamp(),
            familyCode: auth.currentUser.familyCode,
            familyCode: userFamilyCode,
        });
        setCaption(""); setFile(null); setExternalUrl(""); setUploading(false);
    };

    return (
        // <div style={feedWrapper}>
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            {/* Search Bar */}
            <div style={{display: 'flex', gap: '10px', marginBottom: '20px', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '15px', border: '1px solid #eee', alignItems: 'center'}}>
                <Search size={20} color="#64748b" />
                <input 
                    type="text" 
                    placeholder="ရှာဖွေပါ (ဥပမာ - နာမည် သို့မဟုတ် စာသား)..." 
                    style={{border: 'none', outline: 'none', width: '100%', fontSize: '14px'}}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
            </div>

            <div style={{display: 'flex', gap: '10px', marginBottom: '20px', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '15px', border: '1px solid #eee'}}>
                <Search size={20} color="#64748b" />
                <input 
                    type="text" 
                    placeholder="အမှတ်တရများကို ရှာဖွေပါ (ဥပမာ - နာမည် သို့မဟုတ် စာသား)..." 
                    style={{border: 'none', outline: 'none', width: '100%', fontSize: '14px'}}
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
            </div>

            {/* Input Card */}
            <div style={inputCardStyle}>
                {/* အပိုင်း (၁) - Avatar နှင့် စာသားရိုက်ရန်နေရာ */}
                <div style={inputHeader}>
                    <img src={auth.currentUser?.photoURL} style={smallAvatar} alt="me" />
                    <input 
                        type="text" 
                        placeholder="ဘာတွေမျှဝေချင်လဲ..." 
                        style={textInput} 
                        value={caption} 
                        onChange={(e) => setCaption(e.target.value)} 
                    />
                </div>

                {/* အပိုင်း (၂) - Online Link ထည့်ရန်နေရာ (Margin နည်းနည်းထည့်ထားပေးသည်) */}
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '8px 12px', borderRadius: '15px', marginBottom: '10px'}}>
                    <LinkIcon size={16} color="#64748b" />
                    <input 
                        style={{border: 'none', background: 'none', outline: 'none', fontSize: '13px', width: '100%'}} 
                        placeholder="သို့မဟုတ် Online Link (URL) ထည့်ပါ..." 
                        value={externalUrl} 
                        onChange={(e)=>setExternalUrl(e.target.value)} 
                    />
                </div>

                {/* အပိုင်း (၃) - နောက်ခံအရောင်ရွေးရန် (Style Picker) */}
                <div style={{display: 'flex', gap: '10px', margin: '10px 0', alignItems: 'center'}}>
                    <span style={{fontSize: '12px', color: '#64748b'}}>နောက်ခံရွေးရန်:</span>
                    {cardStyles.map(s => (
                        <div 
                            key={s} 
                            onClick={() => setSelectedStyle(s)} 
                            style={{
                                width: '25px', height: '25px', borderRadius: '50%', 
                                background: s, cursor: 'pointer', 
                                border: selectedStyle === s ? '2px solid #3b82f6' : '1px solid #ddd'
                            }} 
                        />
                    ))}
                </div>

                {/* အပိုင်း (၄) - ခလုတ်များ */}
                <div style={inputActions}>
                    <div style={{display: 'flex', gap: '15px'}}>
                        <label style={uploadLabel}>
                            <Image size={20} /> 
                            <span style={{marginLeft: '5px'}}>File</span>
                            <input type="file" hidden accept="image/*,video/*" onChange={(e) => setFile(e.target.files[0])} />
                        </label>
                        <button onClick={() => setShowPostcardEditor(true)} style={postcardBtn}>🎨 Postcard ရေးမည်</button>
                    </div>
                    
                    <button 
                        onClick={handleUpload} 
                        /* file မရှိရင်တောင် link ဒါမှမဟုတ် စာသားရှိရင် နှိပ်လို့ရအောင် ပြင်လိုက်တာပါ */
                        disabled={(!file && !externalUrl && !caption) || uploading} 
                        style={postBtn}
                    >
                        {uploading ? "တင်နေသည်..." : "တင်မည်"}
                    </button>
                </div>
            </div>

            {/* Postcard Editor Modal */}
            {showPostcardEditor && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                            <h3 style={{margin: 0, fontSize: '18px'}}>မွေးနေ့ဆုတောင်းကတ် ဖန်တီးပါ</h3>
                            <X onClick={() => { setShowPostcardEditor(false); setPostcardImage(null); setPostcardAudio(null); }} style={{cursor: 'pointer'}} />
                        </div>

                        {/* Preview Box */}
                        <div style={{...previewBox, backgroundColor: selectedColor, position: 'relative', overflow: 'hidden'}}>
                            {/* ပုံရွေးထားရင် အနောက်မှာ မှိန်မှိန်လေးပြမယ် */}
                            {postcardImage && (
                                <img src={URL.createObjectURL(postcardImage)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, zIndex: 0}} alt="preview" />
                            )}
                            <textarea 
                                placeholder="ဆုတောင်းစကား ရေးပါ..." 
                                style={{...postcardTextArea, zIndex: 1}}
                                value={postcardMessage}
                                onChange={(e) => setPostcardMessage(e.target.value)}
                            />
                        </div>

                        {/* Font Selection */}
                        <div style={{display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '15px', padding: '5px'}}>
                            {fonts.map(f => (
                                <button 
                                    key={f.name} 
                                    onClick={() => setSelectedFont(f.family)}
                                    style={{
                                        ...fontBtnStyle, 
                                        border: selectedFont === f.family ? '2px solid #3b82f6' : '1px solid #ddd',
                                        fontFamily: f.family
                                    }}
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>

                        {/* ပုံနဲ့ အသံ ထည့်ရန် ခလုတ်အသစ်များ */}
                        <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '15px'}}>
                            <label style={iconBtnStyle}>
                                <Image size={20} /> ဓာတ်ပုံထည့်မည်
                                <input type="file" hidden accept="image/*" onChange={(e) => setPostcardImage(e.target.files[0])} />
                            </label>
                            <label style={iconBtnStyle}>
                                <Music size={20} /> သီချင်း/အသံထည့်မည်
                                <input type="file" hidden accept="audio/*" onChange={(e) => setPostcardAudio(e.target.files[0])} />
                            </label>
                        </div>

                        {/* ရွေးထားတဲ့ File နာမည်လေးတွေပြဖို့ */}
                        <div style={{textAlign: 'center', fontSize: '12px', color: '#3b82f6', marginBottom: '10px'}}>
                            {postcardImage && <span>🖼️ {postcardImage.name} | </span>}
                            {postcardAudio && <span>🎵 {postcardAudio.name}</span>}
                        </div>

                        {/* Color Grid */}
                        <div style={colorGrid}>
                            {colors.map(c => (
                                <div key={c} onClick={() => setSelectedColor(c)} style={{...colorCircle, backgroundColor: c, border: selectedColor === c ? '3px solid #3b82f6' : 'none'}} />
                            ))}
                        </div>

                        <button onClick={handlePostcardUpload} style={postBtnFull} disabled={uploading}>
                            {uploading ? "တင်နေသည် (ခဏစောင့်ပါ)..." : "Postcard တင်မည်"}
                        </button>
                    </div>
                </div>
            )}

            {/* Posts List */}
            <div style={postsGrid}>
                {posts.filter(p => 
                    p.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.userName?.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(post => (
                    <div key={post.id} style={{...postCardStyle, background: post.layoutStyle || '#fff'}}>
                        <div style={postUserBar}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <img src={post.userImage} style={avatarStyle} alt="u" />
                                <div>
                                    <h4 style={postName}>{post.userName}</h4>
                                    <span style={postTime}>
                                        {post.createdAt ? post.createdAt.toDate().toLocaleString() : "တင်နေသည်..."}
                                    </span>
                                </div>
                            </div>
                            <Trash2 
                                size={18} 
                                color={post.uid === auth.currentUser.uid || post.userName === auth.currentUser.displayName ? "#ef4444" : "#ccc"} 
                                style={{ cursor: 'pointer' }} 
                                onClick={() => handleDelete(post.id, post.uid, post.userName)} 
                            />
                        </div>
                        
                        {post.fileType === 'postcard' ? (
                            <div style={{...postcardDisplay, backgroundColor: post.fileUrl, fontFamily: post.postcardFont || 'cursive'}}>
                                {/* ပူးတွဲပါတဲ့ ပုံရှိရင် နောက်ခံမှာ ပြမယ် */}
                                {post.postcardImg && (
                                    <img src={post.postcardImg} style={postcardBgImgStyle} alt="bg" />
                                )}
                                
                                {/* စာသား (Glassmorphism effect နဲ့) */}
                                <div style={postcardContentOverlay}>
                                    <h2 style={postcardTextDisplay}>{post.caption}</h2>
                                    
                                    {/* ပူးတွဲပါတဲ့ အသံ/သီချင်းရှိရင် Player ပြမယ် */}
                                    {post.postcardAud && (
                                        <div style={audioPlayerWrapper}>
                                            <audio src={post.postcardAud} controls style={miniAudioStyle} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <p style={postCaption}>{post.caption}</p>
                                {(post.fileUrl || post.imageUrl) && (
                                    <div style={imageContainer}>
                                        {/* URL ကို variable တစ်ခုထဲ အရင်ထည့်မယ် (ပိုသေချာအောင်) */}
                                        {(() => {
                                            const currentUrl = post.fileUrl || post.imageUrl || "";
                                            const isVideo = post.fileType === 'video' || currentUrl.toLowerCase().match(/\.(mp4|mov|wmv|avi|mkv)$/) !== null;
                                            const isImage = currentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null || currentUrl.includes("firebasestorage");

                                            if (isVideo) {
                                                return <video src={currentUrl} controls style={mainMedia} />;
                                            } else if (isImage) {
                                                return (
                                                    <img 
                                                        src={currentUrl} 
                                                        style={mainMedia} 
                                                        alt="post" 
                                                        referrerPolicy="no-referrer"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <a 
                                                        href={currentUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={linkBtnStyle}
                                                    >
                                                        <LinkIcon size={18} /> မျှဝေထားသော Link ကိုကြည့်ရန်
                                                    </a>
                                                );
                                            }
                                        })()}
                                    </div>
                                )}
                            </>
                        )}

                        <div style={postActionBar}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                {/* Reaction ပေးမယ့် ခလုတ် */}
                                <button 
                                    style={actionBtn} 
                                    // Mouse ရှိတဲ့ ကွန်ပျူတာအတွက်
                                    onMouseEnter={() => setShowEmojiPicker(post.id)} 
                                    // ဖုန်းနဲ့ သုံးတဲ့သူတွေ ခလုတ်ကို နှိပ်လိုက်ရင်လည်း ပေါ်လာအောင်
                                    onClick={() => setShowEmojiPicker(post.id)} 
                                >
                                    <span style={{ fontSize: '20px' }}>
                                        {post.reactions?.[auth.currentUser.uid] || '❤️'} 
                                    </span>
                                    <span>React</span>
                                </button>

                                {/* Emoji ရွေးတဲ့ Popup လေး (Mouse တင်မှ ပေါ်မယ်) */}
                                {showEmojiPicker === post.id && (
                                    <div 
                                        style={emojiPopupStyle} 
                                        onMouseLeave={() => setShowEmojiPicker(null)}
                                    >
                                        {/* ချစ်ခြင်း/လေးစားခြင်း */}
                                        <div style={emojiGroup}>
                                            {['❤️', '🥰', '🙏', '🫡', '👏', '💖'].map(emoji => (
                                                <span key={emoji} onClick={() => { handleReaction(post.id, emoji); setShowEmojiPicker(null); }} style={emojiIconStyle}>{emoji}</span>
                                            ))}
                                        </div>
                                        {/* ခံစားချက်/အားနာတာ/သနားတာ */}
                                        <div style={emojiGroup}>
                                            {['🥺', '😅', '🙈', '🤩', '✨', '🫂'].map(emoji => (
                                                <span key={emoji} onClick={() => { handleReaction(post.id, emoji); setShowEmojiPicker(null); }} style={emojiIconStyle}>{emoji}</span>
                                            ))}
                                        </div>
                                        {/* ပျော်စရာ/ရယ်စရာ */}
                                        <div style={emojiGroup}>
                                            {['😂', '🥳', '🎂', '🎉', '🔥', '🤣'].map(emoji => (
                                                <span key={emoji} onClick={() => { handleReaction(post.id, emoji); setShowEmojiPicker(null); }} style={emojiIconStyle}>{emoji}</span>
                                            ))}
                                        </div>
                                        {/* အံ့သြတာ/အရသာရှိတာ */}
                                        <div style={emojiGroup}>
                                            {['😮', '😋', '🤤', '🥘', '👍', '👌'].map(emoji => (
                                                <span key={emoji} onClick={() => { handleReaction(post.id, emoji); setShowEmojiPicker(null); }} style={emojiIconStyle}>{emoji}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Comment ခလုတ် */}
                            <button style={actionBtn}>
                                <MessageCircle size={20} />
                                <span>{post.comments?.length || 0} Comments</span>
                            </button>

                            {/* ဘယ်သူတွေ ဘာ reaction ပေးထားလဲဆိုတာ အကျဉ်းချုပ်ပြမယ် */}
                            <div style={reactionSummary}>
                                {post.reactions && Object.values(post.reactions).slice(0, 3).map((r, i) => (
                                    <span key={i}>{r}</span>
                                ))}
                                <span style={{ marginLeft: '5px', fontSize: '12px', color: '#64748b' }}>
                                    {post.reactions ? Object.keys(post.reactions).length : 0}
                                </span>
                            </div>
                        </div>

                        {/* Comments Area */}
                        <div style={commentSection}>
                            {post.comments?.map((c, i) => (
                                <div key={i} style={commentItem}>
                                    <img src={c.userImage} style={commentAvatar} alt="u" />
                                    <div style={commentBubble}><strong>{c.userName}</strong> {c.text}</div>
                                </div>
                            ))}
                            <div style={commentInputArea}>
                                <input type="text" placeholder="မှတ်ချက်ပေးရန်..." style={commentInput} value={commentText[post.id] || ""} onChange={(e) => setCommentText({...commentText, [post.id]: e.target.value})} />
                                <button onClick={() => handleComment(post.id)} style={{border: 'none', background: 'none', color: '#3b82f6'}}><Send size={18} /></button>
                            </div>
                        </div>
                    </div>
                ))}

                {lastVisible && (
                    <div style={{ textAlign: 'center', margin: '30px 0' }}>
                        <button 
                            onClick={fetchMorePosts} 
                            disabled={loadingMore}
                            style={loadMoreBtnStyle}
                        >
                            {loadingMore ? "ခဏစောင့်ပါ..." : "နောက်ထပ် အမှတ်တရများ ကြည့်ရန် ↓"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Styles (အသစ်ထပ်တိုးထားသည်) ---
const feedWrapper = { maxWidth: '650px', margin: '0 auto', padding: '0 15px' };
const inputCardStyle = { backgroundColor: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' };
const inputHeader = { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' };
const smallAvatar = { width: '40px', height: '40px', borderRadius: '50%' };
const textInput = { flex: 1, border: 'none', backgroundColor: '#f1f5f9', padding: '12px 20px', borderRadius: '25px', outline: 'none' };
const inputActions = { display: 'flex', justifyContent: 'space-between', gap: '10px' };
const uploadLabel = { cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' };
const postcardBtn = { backgroundColor: '#f0f9ff', color: '#0ea5e9', border: '1px solid #bae6fd', padding: '8px 15px', borderRadius: '15px', cursor: 'pointer', fontWeight: '600' };
const postBtn = { backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '600' };

const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 };
const modalContent = { backgroundColor: '#fff', padding: '25px', borderRadius: '25px', width: '90%', maxWidth: '450px' };
const previewBox = { height: '200px', borderRadius: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px', padding: '20px' };
const postcardTextArea = { width: '100%', height: '100%', background: 'none', border: 'none', color: '#fff', fontSize: '20px', fontWeight: 'bold', textAlign: 'center', outline: 'none', resize: 'none' };
const colorGrid = { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px' };
const colorCircle = { height: '40px', borderRadius: '50%', cursor: 'pointer', transition: '0.2s' };
const postBtnFull = { width: '100%', backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '12px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' };

const postsGrid = { display: 'flex', flexDirection: 'column', gap: '20px' };
const postCardStyle = { backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const postUserBar = { padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const avatarStyle = { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' };
const postName = { margin: 0, fontSize: '15px', fontWeight: '600' };
const postTime = { fontSize: '11px', color: '#94a3b8' };
const postCaption = { padding: '0 15px 15px', margin: 0, fontSize: '15px' };
const imageContainer = { padding: '0 10px 10px' };
const mainMedia = { width: '100%', borderRadius: '12px' };
const postActionBar = { display: 'flex', padding: '10px', borderTop: '1px solid #f1f5f9' };
const actionBtn = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' };
const postcardDisplay = {
    height: '350px', // ပိုရှည်လိုက်ရင် ပိုလှပါတယ်
    margin: '10px',
    borderRadius: '25px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
};
const postcardBgImgStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'cover', // ပုံမပြဲသွားအောင် cover ထားပါ
    zIndex: 0,
    borderRadius: '25px',
};
const postcardContentOverlay = {
    zIndex: 1,
    // backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glassmorphism
    backgroundColor: 'rgba(0,0,0,0.2)',
    // backdropFilter: 'blur(5px)',
    padding: '20px',
    borderRadius: '15px',
    width: '85%',
    textAlign: 'center',
    // border: '1px solid rgba(255,255,255,0.3)',
};
const postcardTextDisplay = {
    color: '#fff',
    fontSize: '28px',
    fontWeight: 'bold',
    /* စာလုံးကို ပုံပေါ်မှာ ထင်းနေအောင် အရိပ် (Shadow) ပိုထည့်ခြင်း */
    textShadow: '2px 2px 10px rgba(0,0,0,0.8), -1px -1px 0 rgba(0,0,0,0.5)', 
    margin: '0 0 15px 0',
    wordWrap: 'break-word',
    lineHeight: '1.4'
};
const audioPlayerWrapper = {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: '30px',
    padding: '5px',
    display: 'inline-block'
};
const miniAudioStyle = {
    height: '35px',
    maxWidth: '200px'
};

const fontBtnStyle = {
    padding: '5px 12px',
    borderRadius: '10px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '12px',
    whiteSpace: 'nowrap'
};

const commentSection = { padding: '15px', backgroundColor: '#f8fafc' };
const commentItem = { display: 'flex', gap: '10px', marginBottom: '10px' };
const commentAvatar = { width: '25px', height: '25px', borderRadius: '50%' };
const commentBubble = { backgroundColor: '#fff', padding: '8px 12px', borderRadius: '15px', fontSize: '13px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const commentInputArea = { display: 'flex', gap: '10px', marginTop: '10px' };
const commentInput = { flex: 1, border: '1px solid #e2e8f0', borderRadius: '15px', padding: '8px 15px', fontSize: '13px', outline: 'none' };

const emojiPopup = {
    position: 'absolute',
    bottom: '40px',
    left: 0,
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '20px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    display: 'flex',
    gap: '10px',
    zIndex: 100
};

const emojiPopupStyle = {
    position: 'absolute',
    bottom: '50px',
    left: '0',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column', // အောက်ကို ဆင်းသွားအောင် (Line ခွဲဖို့)
    gap: '8px',
    padding: '12px',
    borderRadius: '20px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    zIndex: 100,
    border: '1px solid #f1f5f9',
    width: 'max-content'
};
const emojiGroup = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
};

const emojiIconStyle = {
    fontSize: '22px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    display: 'inline-block',
    // Hover လုပ်ရင် ပိုကြီးလာအောင်
    ':hover': {
        transform: 'scale(1.3)'
    }
};

const reactionSummary = {
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    backgroundColor: '#f8fafc',
    borderRadius: '15px',
    marginLeft: '10px'
};

const postcardActionRow = {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '15px'
};

const iconBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f1f5f9',
    padding: '8px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    cursor: 'pointer',
    color: '#475569',
    fontWeight: '600',
    border: '1px solid #e2e8f0'
};

const linkBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '15px',
    backgroundColor: '#f1f5f9',
    color: '#3b82f6',
    textDecoration: 'none',
    borderRadius: '15px',
    fontWeight: '600',
    fontSize: '14px',
    border: '1px dashed #3b82f6',
    margin: '10px 0'
};

const loadMoreBtnStyle = {
    padding: '12px 24px',
    backgroundColor: '#fff',
    border: '1px solid #3b82f6',
    color: '#3b82f6',
    borderRadius: '30px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: '0.3s',
    boxShadow: '0 4px 10px rgba(59, 130, 246, 0.1)'
};

export default MainDashboard;