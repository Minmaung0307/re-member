import React, { useState, useEffect, useRef } from 'react';
import { db, auth, storage } from './firebase';
import { doc, updateDoc, deleteDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Trash2, Edit3, Check, Send, X, Image as ImageIcon } from 'lucide-react';

const Chat = ({ recipient, onClose }) => {
    // Component state
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [chatImage, setChatImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");

    // Message ဖျက်ရန်
    const handleDelete = async (id) => {
        if (window.confirm("ဒီစာကို ဖျက်မှာ သေချာပါသလား?")) {
            await deleteDoc(doc(db, "messages", id));
        }
    };

    // Message ပြင်ရန်
    const handleUpdate = async (id) => {
        if (!editText.trim()) return;
        await updateDoc(doc(db, "messages", id), { 
            text: editText,
            isEdited: true 
        });
        setEditingId(null);
    };

    const scrollRef = useRef();

    useEffect(() => {
        // ၁။ recipient မရှိရင် သို့မဟုတ် Login ဝင်ထားတဲ့ user မရှိရင် ဘာမှမလုပ်ဘဲ ပြန်ထွက်မယ်
        // ဒါမှ auth.currentUser.uid ကြောင့် တက်မယ့် error ကို ကာကွယ်နိုင်မှာပါ
        if (!recipient || !auth.currentUser) return;

        let unsubscribe;

        try {
            const chatId = [auth.currentUser.uid, recipient.id].sort().join('_');
            const q = query(
                collection(db, "messages"), 
                where("chatId", "==", chatId), 
                orderBy("createdAt", "asc")
            );

            // ၂။ onSnapshot မှာ အောင်မြင်တဲ့အခါ (Success) နဲ့ အမှားတက်တဲ့အခါ (Error) နှစ်ခုလုံးကို ကိုင်တွယ်မယ်
            unsubscribe = onSnapshot(q, 
                (snapshot) => {
                    setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }, 
                (error) => {
                    // Logout ဖြစ်သွားတဲ့အခါ တက်လာမယ့် Permission Error ကို Console မှာ မပြခိုင်းတော့ပါဘူး
                    if (error.code === 'permission-denied') return;
                    console.error("Messages Listener Error:", error);
                }
            );
        } catch (err) {
            console.error("Chat Setup Error:", err);
        }

        // ၃။ Cleanup Function: စကားပြောခန်း ပိတ်လိုက်ရင် Listener ကို ပိတ်ပေးမယ်
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [recipient]); // auth.currentUser ကိုပါ စောင့်ကြည့်ချင်ရင် dependency မှာ ထည့်နိုင်ပါတယ်

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() && !chatImage) return;

        setUploading(true);
        const chatId = [auth.currentUser.uid, recipient.id].sort().join('_');
        let imgUrl = null;

        if (chatImage) {
            const imgRef = ref(storage, `chat_images/${Date.now()}_${chatImage.name}`);
            await uploadBytes(imgRef, chatImage);
            imgUrl = await getDownloadURL(imgRef);
        }

        await addDoc(collection(db, "messages"), {
            chatId,
            text: message,
            imageUrl: imgUrl,
            senderId: auth.currentUser.uid,
            createdAt: serverTimestamp(),
        });

        setMessage("");
        setChatImage(null);
        setUploading(false);
    };

    return (
        <div style={chatBoxContainer}>
            <div style={chatHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={recipient.photoURL} style={smallAvatar} alt="u" />
                    <strong>{recipient.displayName}</strong>
                </div>
                <button onClick={onClose} style={closeBtn}><X size={18} /></button>
            </div>

            <div style={messageArea}>
                {messages.map((msg) => (
                    <div key={msg.id} style={msg.senderId === auth.currentUser.uid ? myMsgRow : theirMsgRow}>
                        <div style={msg.senderId === auth.currentUser.uid ? myMsg : theirMsg}>
                            {msg.imageUrl && <img src={msg.imageUrl} style={{width: '100%', borderRadius: '10px', marginBottom: '5px'}} alt="chat" />}
                            
                            {/* Edit Mode သို့မဟုတ် ရိုးရိုးစာသားပြမည့် နေရာ */}
                            {editingId === msg.id ? (
                                <div style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
                                    <input 
                                        value={editText} 
                                        onChange={(e) => setEditText(e.target.value)} 
                                        style={{background: 'rgba(255,255,255,0.2)', border: '1px solid #fff', color: '#fff', borderRadius: '5px', padding: '2px 5px', width: '100%'}}
                                    />
                                    <Check size={16} onClick={() => handleUpdate(msg.id)} style={{cursor: 'pointer', color: '#10b981'}} />
                                    <X size={16} onClick={() => setEditingId(null)} style={{cursor: 'pointer', color: '#ef4444'}} />
                                </div>
                            ) : (
                                <>
                                    <div style={{wordBreak: 'break-word'}}>{msg.text}</div>
                                    {msg.isEdited && <small style={{fontSize: '9px', opacity: 0.5}}>(edited)</small>}
                                </>
                            )}
                            
                            {/* မိမိစာဖြစ်ရင် Edit/Delete အိုင်ကွန်လေးများ (Bubble ရဲ့ အောက်ခြေမှာ ပေါ်မည်) */}
                            {msg.senderId === auth.currentUser.uid && editingId !== msg.id && (
                                <div style={{display: 'flex', gap: '8px', marginTop: '5px', opacity: 0.6, justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '3px'}}>
                                    <Edit3 size={12} onClick={() => { setEditingId(msg.id); setEditText(msg.text); }} style={{cursor: 'pointer'}} />
                                    <Trash2 size={12} onClick={() => handleDelete(msg.id)} style={{cursor: 'pointer'}} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={sendMessage} style={inputArea}>
                <label style={{cursor: 'pointer', color: '#64748b'}}><ImageIcon size={20} /><input type="file" hidden onChange={(e) => setChatImage(e.target.files[0])} /></label>
                <input type="text" placeholder="စာရိုက်ပါ..." style={chatInput} value={message} onChange={(e) => setMessage(e.target.value)} />
                <button type="submit" disabled={uploading} style={sendBtn}><Send size={18} /></button>
            </form>
            {chatImage && <div style={{fontSize: '10px', padding: '5px', backgroundColor: '#e2e8f0'}}>Selected: {chatImage.name}</div>}
        </div>
    );
};

// ... (Styles တွေက အရင်အတိုင်းပဲ သုံးလို့ရပါတယ်)
const chatBoxContainer = { width: '320px', height: '450px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', position: 'fixed', bottom: '20px', right: '20px', zIndex: 2000, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)'};
const chatHeader = { padding: '12px 15px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '15px 15px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'default' };
const smallAvatar = { width: '25px', height: '25px', borderRadius: '50%' };
const closeBtn = { background: 'none', border: 'none', color: '#fff', cursor: 'pointer' };
const messageArea = { flex: 1, padding: '15px', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '8px' };
const myMsgRow = { display: 'flex', justifyContent: 'flex-end' };
const theirMsgRow = { display: 'flex', justifyContent: 'flex-start' };
const myMsg = { backgroundColor: '#3b82f6', color: '#fff', padding: '8px 12px', borderRadius: '15px 15px 0 15px', maxWidth: '80%', fontSize: '14px' };
const theirMsg = { backgroundColor: '#e2e8f0', color: '#1e293b', padding: '8px 12px', borderRadius: '15px 15px 15px 0', maxWidth: '80%', fontSize: '14px' };
const inputArea = { padding: '10px', display: 'flex', gap: '8px', borderTop: '1px solid #eee', alignItems: 'center' };
const chatInput = { flex: 1, border: '1px solid #eee', borderRadius: '20px', padding: '8px 15px', outline: 'none' };
const sendBtn = { border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer' };

export default Chat;