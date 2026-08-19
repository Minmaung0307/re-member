import React, { useState, useEffect } from 'react';
import { db, storage, auth } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Image, Send, MoreHorizontal, Heart, MessageCircle, Share2 } from 'lucide-react';

const MainDashboard = () => {
    const [caption, setCaption] = useState("");
    const [image, setImage] = useState(null);
    const [posts, setPosts] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const handleUpload = () => {
        if (!image) return;
        setUploading(true);
        const storageRef = ref(storage, `images/${Date.now()}_${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on("state_changed", null, (err) => console.error(err),
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                await addDoc(collection(db, "posts"), {
                    caption, imageUrl: url,
                    userName: auth.currentUser.displayName,
                    userImage: auth.currentUser.photoURL,
                    createdAt: serverTimestamp(),
                });
                setCaption(""); setImage(null); setUploading(false);
            }
        );
    };

    return (
        <div style={feedWrapper}>
            {/* Input Card */}
            <div style={inputCardStyle}>
                <div style={inputHeader}>
                    <img src={auth.currentUser?.photoURL} style={smallAvatar} alt="me" />
                    <input 
                        type="text" 
                        placeholder="မျှဝေချင်တာလေးတွေ ရေးပါ..." 
                        style={textInput} 
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                    />
                </div>
                <div style={divider}></div>
                <div style={inputActions}>
                    <label style={uploadLabel}>
                        <Image size={20} color="#10b981" />
                        <span>ဓာတ်ပုံ/ဗီဒီယို</span>
                        <input type="file" hidden onChange={(e) => setImage(e.target.files[0])} />
                    </label>
                    <button onClick={handleUpload} disabled={!image || uploading} style={postBtn}>
                        {uploading ? "တင်နေသည်..." : <><Send size={16} /> တင်မည်</>}
                    </button>
                </div>
                {image && <div style={previewText}>📍 {image.name} ကို ရွေးထားသည်</div>}
            </div>

            {/* Posts List */}
            <div style={postsGrid}>
                {posts.map(post => (
                    <div key={post.id} style={postCardStyle}>
                        <div style={postUserBar}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <img src={post.userImage} style={avatarStyle} alt="u" />
                                <div>
                                    <h4 style={postName}>{post.userName}</h4>
                                    <span style={postTime}>{post.createdAt?.toDate().toLocaleDateString()}</span>
                                </div>
                            </div>
                            <MoreHorizontal size={20} color="#64748b" />
                        </div>
                        
                        <p style={postCaption}>{post.caption}</p>
                        
                        {post.imageUrl && (
                            <div style={imageContainer}>
                                <img src={post.imageUrl} style={mainImage} alt="post" />
                            </div>
                        )}

                        <div style={postActionBar}>
                            <button style={actionBtn}><Heart size={20} /><span>Like</span></button>
                            <button style={actionBtn}><MessageCircle size={20} /><span>Comment</span></button>
                            <button style={actionBtn}><Share2 size={20} /><span>Share</span></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Styles ---
const feedWrapper = { maxWidth: '650px', margin: '0 auto', padding: '0 15px' };

const inputCardStyle = {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    marginBottom: '30px',
    border: '1px solid rgba(0,0,0,0.05)',
};

const inputHeader = { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' };
const smallAvatar = { width: '40px', height: '40px', borderRadius: '50%' };
const textInput = { flex: 1, border: 'none', backgroundColor: '#f1f5f9', padding: '12px 20px', borderRadius: '25px', outline: 'none', fontSize: '15px' };
const divider = { height: '1px', backgroundColor: '#f1f5f9', margin: '0 -20px 15px' };
const inputActions = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const uploadLabel = { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#64748b', fontWeight: '600' };
const postBtn = { backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' };
const previewText = { fontSize: '12px', color: '#3b82f6', marginTop: '10px' };

const postsGrid = { display: 'flex', flexDirection: 'column', gap: '25px' };
const postCardStyle = { backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' };
const postUserBar = { padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const avatarStyle = { width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' };
const postName = { margin: 0, fontSize: '15px', color: '#1e293b', fontWeight: '600' };
const postTime = { fontSize: '12px', color: '#94a3b8' };
const postCaption = { padding: '0 20px 15px', margin: 0, fontSize: '16px', color: '#334155', lineHeight: '1.5' };
const imageContainer = { padding: '0 10px 10px' };
const mainImage = { width: '100%', borderRadius: '16px', display: 'block' };
const postActionBar = { display: 'flex', padding: '10px 20px', borderTop: '1px solid #f1f5f9' };
const actionBtn = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', background: 'none', padding: '10px', color: '#64748b', cursor: 'pointer', fontSize: '14px', fontWeight: '600' };

export default MainDashboard;