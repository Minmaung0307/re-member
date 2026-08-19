import React, { useState, useEffect } from 'react';
import { db, storage, auth } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const MainDashboard = () => {
    const [caption, setCaption] = useState("");
    const [image, setImage] = useState(null);
    const [posts, setPosts] = useState([]);
    const [progress, setProgress] = useState(0);

    // ၁။ Firestore ကနေ Post တွေကို အချိန်နဲ့တပြေးညီ ဆွဲထုတ်ခြင်း (Real-time Feed)
    useEffect(() => {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    // ၂။ ပုံတင်ခြင်းလုပ်ဆောင်ချက်
    const handleUpload = () => {
        if (!image) return;

        const storageRef = ref(storage, `images/${Date.now()}_${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgress(prog);
            },
            (error) => console.error(error),
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                
                // Firestore ထဲကို Data ထည့်မယ်
                await addDoc(collection(db, "posts"), {
                    caption: caption,
                    imageUrl: url,
                    userName: auth.currentUser.displayName,
                    userImage: auth.currentUser.photoURL,
                    createdAt: serverTimestamp(),
                });

                setCaption("");
                setImage(null);
                setProgress(0);
                alert("အမှတ်တရလေး တင်ပြီးပါပြီ! ❤️");
            }
        );
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            {/* Upload Section */}
            <div style={cardStyle}>
                <h4>အမှတ်တရအသစ် တင်မယ် 📸</h4>
                <textarea 
                    placeholder="ဒီနေ့ ဘာတွေထူးခြားလဲ..." 
                    value={caption} 
                    onChange={(e) => setCaption(e.target.value)}
                    style={inputStyle}
                />
                <input type="file" onChange={(e) => setImage(e.target.files[0])} style={{ margin: '10px 0' }} />
                {progress > 0 && <progress value={progress} max="100" style={{ width: '100%' }} />}
                <button onClick={handleUpload} style={btnStyle} disabled={!image}>တင်မည်</button>
            </div>

            {/* Feed Section */}
            <div style={{ marginTop: '30px' }}>
                {posts.map(post => (
                    <div key={post.id} style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <img src={post.userImage} alt="user" style={avatarStyle} />
                            <strong>{post.userName}</strong>
                        </div>
                        <img src={post.imageUrl} alt="post" style={{ width: '100%', borderRadius: '8px' }} />
                        <p style={{ marginTop: '10px' }}>{post.caption}</p>
                        <small style={{ color: 'gray' }}>
                            {post.createdAt?.toDate().toLocaleString()}
                        </small>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Styles
const cardStyle = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    textAlign: 'left'
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    marginBottom: '10px'
};

const btnStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#ff4b5c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
};

const avatarStyle = {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    marginRight: '10px'
};

export default MainDashboard;