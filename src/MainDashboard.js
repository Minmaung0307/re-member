import React, { useState, useEffect } from 'react';
import { db, storage, auth } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Camera, Send, Image as ImageIcon, Clock } from 'lucide-react'; // Icon လေးတွေ သုံးမယ်

const MainDashboard = () => {
    const [caption, setCaption] = useState("");
    const [image, setImage] = useState(null);
    const [posts, setPosts] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

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

        uploadTask.on("state_changed",
            (snapshot) => {
                const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgress(prog);
            },
            (error) => { console.error(error); setUploading(false); },
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                await addDoc(collection(db, "posts"), {
                    caption, imageUrl: url,
                    userName: auth.currentUser.displayName,
                    userImage: auth.currentUser.photoURL,
                    createdAt: serverTimestamp(),
                });
                setCaption(""); setImage(null); setProgress(0); setUploading(false);
            }
        );
    };

    return (
        <div style={containerStyle}>
            {/* Create Post Section */}
            <div style={uploadCardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <img src={auth.currentUser?.photoURL} style={avatarSmall} alt="me" />
                    <strong style={{ fontSize: '14px' }}>မင်္ဂလာပါ၊ {auth.currentUser?.displayName}</strong>
                </div>
                <textarea 
                    placeholder="ဒီနေ့ ဘာတွေ ထူးခြားလဲ..." 
                    value={caption} 
                    onChange={(e) => setCaption(e.target.value)}
                    style={textAreaStyle}
                />
                <div style={actionRow}>
                    <label style={uploadBtn}>
                        <ImageIcon size={18} /> ပုံရွေးမည်
                        <input type="file" hidden onChange={(e) => setImage(e.target.files[0])} />
                    </label>
                    <button onClick={handleUpload} disabled={!image || uploading} style={submitBtn}>
                        {uploading ? `တင်နေသည် (${progress}%)` : <><Send size={18} /> တင်မည်</>}
                    </button>
                </div>
                {image && <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>📍 Selected: {image.name}</p>}
            </div>

            {/* Post Feed */}
            <div style={feedContainer}>
                {posts.map(post => (
                    <div key={post.id} style={postCard}>
                        <div style={postHeader}>
                            <img src={post.userImage} style={avatarStyle} alt="u" />
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '15px' }}>{post.userName}</div>
                                <div style={timeStyle}><Clock size={12} /> {post.createdAt?.toDate().toLocaleDateString()}</div>
                            </div>
                        </div>
                        <p style={captionStyle}>{post.caption}</p>
                        <img src={post.imageUrl} style={postImage} alt="memory" />
                        <div style={postFooter}>
                            <button style={footerBtn}>❤️ Like</button>
                            <button style={footerBtn}>💬 Comment</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Styles (Professional Theme) ---
const containerStyle = { backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px 10px' };
const uploadCardStyle = { 
    maxWidth: '550px', margin: '0 auto 25px', backgroundColor: '#fff', 
    padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' 
};
const textAreaStyle = { 
    width: '100%', border: 'none', backgroundColor: '#f0f2f5', borderRadius: '10px', 
    padding: '15px', fontSize: '15px', minHeight: '80px', outline: 'none', resize: 'none' 
};
const actionRow = { display: 'flex', justifyContent: 'space-between', marginTop: '15px', alignItems: 'center' };
const uploadBtn = { 
    cursor: 'pointer', color: '#444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px',
    padding: '8px 15px', borderRadius: '8px', backgroundColor: '#eee'
};
const submitBtn = { 
    backgroundColor: '#ff4b5c', color: '#fff', border: 'none', padding: '8px 20px', 
    borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
};
const feedContainer = { maxWidth: '550px', margin: '0 auto' };
const postCard = { 
    backgroundColor: '#fff', borderRadius: '15px', marginBottom: '20px', 
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' 
};
const postHeader = { display: 'flex', alignItems: 'center', padding: '15px', gap: '12px' };
const avatarStyle = { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' };
const avatarSmall = { width: '30px', height: '30px', borderRadius: '50%' };
const timeStyle = { fontSize: '11px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' };
const captionStyle = { padding: '0 15px 15px', fontSize: '15px', lineHeight: '1.5', color: '#333' };
const postImage = { width: '100%', maxHeight: '500px', objectFit: 'cover' };
const postFooter = { display: 'flex', borderTop: '1px solid #eee', padding: '5px' };
const footerBtn = { flex: 1, padding: '10px', border: 'none', background: 'none', color: '#666', fontWeight: '600', cursor: 'pointer' };

export default MainDashboard;