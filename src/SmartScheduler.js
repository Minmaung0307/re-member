import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { useNavigate } from "react-router-dom"; // 🌟 Ecosystem လမ်းကြောင်းအတွက်
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import {
  Clock,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit3,
  Plus,
  X,
  Tag,
  Flame,
  Target,
  FileText,
  Heart,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

const SmartScheduler = ({ userFamilyCode, setStatusModal }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Task အသစ်အတွက် State
  const [newTask, setNewTask] = useState({
    title: "",
    startTime: "09:00",
    endTime: "10:00",
    category: "Work",
  });

  // Pomodoro Focus Timer State
  const [timer, setTimer] = useState(1500); // 25 mins
  const [isActive, setIsActive] = useState(false);

  // ၁။ Real-time Tasks Fetching (Firestore ကနေ ဒေတာယူခြင်း)
  useEffect(() => {
    if (!auth.currentUser) return; // 🌟 familyCode မလိုတော့ပါဘူး

    const q = query(
      collection(db, "daily_tasks"),
      // 🌟 အိမ်နံပါတ်ထက် John ရဲ့ ID နဲ့ပဲ တိုက်ရိုက်ရှာမယ် (ဒါမှ DocKeeper နဲ့ အမြဲကိုက်မှာပါ)
      where("userId", "==", auth.currentUser.uid), 
      where("date", "==", selectedDate),
      orderBy("startTime", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.log("Index Error:", err));
    
    return () => unsub();
}, [selectedDate]); // 🌟 userId က မပြောင်းလဲလို့ dependency မှာ မလိုပါဘူး

  // ၂။ Focus Timer Logic
  // ၁။ အပေါ်ဆုံးနားမှာ အသံဖိုင်အတွက် link တစ်ခု ထည့်ထားမယ်
  const alertSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
  );

  // ၂။ Timer logic ထဲမှာ အချိန်ပြည့်ရင် လုပ်မယ့်အလုပ်တွေ ထည့်မယ်
  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => setTimer(timer - 1), 1000);
    } else if (timer === 0 && isActive) {
      // 🌟 အချိန်ပြည့်သွားတဲ့အချိန်မှာ လုပ်မည့် ထူးခြားချက်များ
      setIsActive(false);
      alertSound.play(); // အသံမြည်မယ်

      // Status Modal သုံးထားရင် အဲ့ဒါနဲ့ ပြမယ်၊ မရှိရင် Browser alert သုံးမယ်
      if (typeof setStatusModal === "function") {
        setStatusModal({
          show: true,
          title: "Focus Complete! 🏆",
          message:
            "ကောင်းမွန်စွာ အာရုံစိုက်နိုင်ခဲ့ပါတယ်။ အခု ၅ မိနစ်လောက် အနားယူလိုက်ပါဦး။",
          type: "success",
        });
      } else {
        alert("Focus Session ပြီးဆုံးပါပြီ။ အနားယူလိုက်ပါဦး။ ☕");
      }

      // Timer ကို ၅ မိနစ် (နားချိန်) သို့မဟုတ် ၂၅ မိနစ် (အလုပ်ချိန်) ပြန်ပြောင်းပေးမယ်
      setTimer(1500);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  // ၃။ Task အသစ်ထည့်ခြင်း (Database သိမ်းခြင်း)
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim() || !auth.currentUser) return;

    try {
      await addDoc(collection(db, "daily_tasks"), {
        userId: auth.currentUser.uid,
        date: selectedDate,
        title: newTask.title,
        startTime: newTask.startTime,
        endTime: newTask.endTime,
        category: newTask.category,
        status: "pending",
        sourceApp: null, // လက်နဲ့ထည့်တာမို့ null ထားမယ်
        createdAt: serverTimestamp(),
      });
      setNewTask({
        title: "",
        startTime: "09:00",
        endTime: "10:00",
        category: "Work",
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  // ၄။ Status ပြောင်းလဲခြင်း (ပြီးစီး/မပြီးစီး)
  const toggleStatus = async (id, currentStatus) => {
    await updateDoc(doc(db, "daily_tasks", id), {
      status: currentStatus === "completed" ? "pending" : "completed",
    });
  };

  // ၅။ Ecosystem Navigation (တခြား App တွေဆီ လှမ်းသွားခြင်း)
  const handleTaskClick = (task) => {
    if (task.sourceApp === "dockeeper") {
      navigate(`/dockeeper/file/${task.linkId}`);
    } else if (task.sourceApp === "familyvault") {
      navigate(`/family/event/${task.linkId}`);
    }
  };

  return (
    <div style={styles.dashboard}>
      {/* --- Left Column: Calendar & Timer --- */}
      <div style={styles.leftCol}>
        <div style={styles.card}>
          <Calendar size={20} color="#3b82f6" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.datePicker}
          />
        </div>

        {/* Focus Timer (Pomodoro) */}
        <div style={styles.timerCard}>
          <h4 style={{ margin: 0 }}>Focus Session</h4>
          <div style={styles.timerDisplay}>
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
          </div>
          <div style={styles.timerControls}>
            <button
              onClick={() => setIsActive(!isActive)}
              style={styles.timerBtn}
            >
              {isActive ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={() => {
                setTimer(1500);
                setIsActive(false);
              }}
              style={styles.timerBtn}
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* --- Middle Column: Timeline --- */}
      <div style={styles.mainCol}>
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>Daily Schedule</h3>
          <button onClick={() => setIsModalOpen(true)} style={styles.addBtn}>
            <Plus size={18} /> New Task
          </button>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressBarBox}>
          <div
            style={{
              ...styles.progressFill,
              width:
                tasks.length > 0
                  ? `${(tasks.filter((t) => t.status === "completed").length / tasks.length) * 100}%`
                  : "0%",
            }}
          ></div>
        </div>

        <div style={styles.timeline}>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  ...styles.taskItem,
                  opacity: task.status === "completed" ? 0.6 : 1,
                  borderLeft: `5px solid ${getCategoryColor(task.category)}`,
                  cursor: task.sourceApp ? "pointer" : "default",
                }}
                onClick={() => handleTaskClick(task)}
              >
                <div style={styles.timeInfo}>
                  <span>{task.startTime}</span>
                  <span style={{ color: "#94a3b8" }}>{task.endTime}</span>
                </div>

                <div style={styles.taskCore}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        textDecoration:
                          task.status === "completed" ? "line-through" : "none",
                      }}
                    >
                      {task.title}
                    </h4>
                    {task.sourceApp === "dockeeper" && (
                      <FileText size={14} color="#3b82f6" />
                    )}
                    {task.sourceApp === "familyvault" && (
                      <Heart size={14} color="#ec4899" />
                    )}
                  </div>
                  <div style={styles.tagBadge}>{task.category}</div>
                </div>

                <div
                  style={styles.actions}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => toggleStatus(task.id, task.status)}
                    style={styles.checkBtn}
                  >
                    <CheckCircle2
                      color={
                        task.status === "completed" ? "#10b981" : "#cbd5e1"
                      }
                    />
                  </button>
                  <button
                    onClick={() => deleteDoc(doc(db, "daily_tasks", task.id))}
                    style={styles.iconBtn}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p
              style={{
                textAlign: "center",
                color: "#94a3b8",
                marginTop: "40px",
              }}
            >
              No tasks for this day.
            </p>
          )}
        </div>
      </div>

      {/* --- Task Creation Modal --- */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h4>Add New Task</h4>
              <button
                onClick={() => setIsModalOpen(false)}
                style={styles.iconBtn}
              >
                <X />
              </button>
            </div>
            <form onSubmit={addTask} style={styles.form}>
              <input
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                style={styles.input}
              />
              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Start Time</label>
                  <input
                    type="time"
                    value={newTask.startTime}
                    style={styles.input}
                    onChange={(e) =>
                      setNewTask({ ...newTask, startTime: e.target.value })
                    }
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>End Time</label>
                  <input
                    type="time"
                    value={newTask.endTime}
                    style={styles.input}
                    onChange={(e) =>
                      setNewTask({ ...newTask, endTime: e.target.value })
                    }
                  />
                </div>
              </div>
              <label style={styles.label}>Category</label>
              <select
                style={styles.input}
                value={newTask.category}
                onChange={(e) =>
                  setNewTask({ ...newTask, category: e.target.value })
                }
              >
                <option value="Work">Work / Business</option>
                <option value="Health">Health / Fitness</option>
                <option value="Family">Family / Personal</option>
                <option value="Learning">Study / Learning</option>
              </select>
              <button type="submit" style={styles.saveBtn}>
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const getCategoryColor = (cat) => {
  const colors = {
    Work: "#3b82f6",
    Health: "#10b981",
    Family: "#ec4899",
    Learning: "#f59e0b",
  };
  return colors[cat] || "#cbd5e1";
};

const styles = {
  dashboard: {
    display: "flex",
    gap: "20px",
    padding: "20px",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    flexWrap: "wrap",
  },
  leftCol: {
    width: "280px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  mainCol: {
    flex: 1,
    minWidth: "350px",
    backgroundColor: "#fff",
    borderRadius: "24px",
    padding: "25px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
  },
  card: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
  },
  timerCard: {
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: "20px",
    borderRadius: "18px",
    textAlign: "center",
  },
  timerDisplay: {
    fontSize: "48px",
    fontWeight: "800",
    margin: "15px 0",
    fontFamily: "monospace",
  },
  timerControls: { display: "flex", justifyContent: "center", gap: "15px" },
  timerBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "#fff",
    padding: "10px",
    borderRadius: "50%",
    cursor: "pointer",
  },
  datePicker: {
    border: "none",
    outline: "none",
    fontWeight: "600",
    color: "#1e293b",
    cursor: "pointer",
    width: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  addBtn: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "12px",
    display: "flex",
    gap: "5px",
    fontWeight: "600",
    cursor: "pointer",
  },
  progressBarBox: {
    height: "6px",
    backgroundColor: "#f1f5f9",
    borderRadius: "3px",
    marginBottom: "25px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10b981",
    transition: "0.4s ease",
  },
  timeline: { display: "flex", flexDirection: "column", gap: "12px" },
  taskItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    backgroundColor: "#f8fafc",
    borderRadius: "16px",
    transition: "0.2s",
    border: "1px solid transparent",
  },
  timeInfo: {
    display: "flex",
    flexDirection: "column",
    minWidth: "65px",
    fontSize: "11px",
    fontWeight: "800",
  },
  taskCore: { flex: 1 },
  tagBadge: {
    fontSize: "10px",
    backgroundColor: "#fff",
    padding: "2px 8px",
    borderRadius: "5px",
    width: "fit-content",
    marginTop: "4px",
    border: "1px solid #e2e8f0",
  },
  actions: { display: "flex", gap: "10px" },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#64748b",
  },
  checkBtn: { background: "none", border: "none", cursor: "pointer" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "24px",
    width: "400px",
    boxShadow: "0 20px 25px rgba(0,0,0,0.1)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: "14px",
  },
  row: { display: "flex", gap: "10px" },
  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    marginLeft: "5px",
  },
  saveBtn: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default SmartScheduler;
