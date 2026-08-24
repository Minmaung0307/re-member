import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { Plus, Trash2, Edit3, Calendar, List } from "lucide-react";

const Workspace = ({ user, darkMode }) => {
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [taskInput, setTaskInput] = useState("");

  // ဒေတာများ ဆွဲယူခြင်း (ကိုယ့် UID နဲ့ဆိုင်တာပဲ ယူမယ်)
  useEffect(() => {
    if (!user) return;
    const qNotes = query(
      collection(db, "notes"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    const qTasks = query(collection(db, "tasks"), where("uid", "==", user.uid));

    const unsubNotes = onSnapshot(qNotes, (snap) =>
      setNotes(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
    const unsubTasks = onSnapshot(qTasks, (snap) =>
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );

    return () => {
      unsubNotes();
      unsubTasks();
    };
  }, [user]);

  // ၁။ မှတ်စုတင်ခြင်း
  const addNote = async () => {
    if (!noteInput.trim()) return;
    await addDoc(collection(db, "notes"), {
      text: noteInput,
      uid: user.uid,
      createdAt: serverTimestamp(),
    });
    setNoteInput("");
  };

  // ၂။ Task အသစ်ထည့်ခြင်း
  const addTask = async () => {
    if (!taskInput.trim()) return;
    await addDoc(collection(db, "tasks"), {
      title: taskInput,
      status: "todo",
      uid: user.uid,
      createdAt: serverTimestamp(),
    });
    setTaskInput("");
  };

  // ၃။ Drag and Drop Logic
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    await updateDoc(doc(db, "tasks", draggableId), {
      status: destination.droppableId,
    });
  };

  const columns = {
    todo: { name: "To Do", color: "#FFD700" },
    inProgress: { name: "In Progress", color: "#3498db" },
    done: { name: "Done", color: "#22c55e" },
  };

  return (
    <div style={container}>
      {/* Private Notes Section */}
      <section style={section}>
        <h3 style={{ color: darkMode ? "#fff" : "#1e293b" }}>
          <List size={20} /> Daily Notes (Private)
        </h3>
        <div style={inputGroup}>
          <input
            style={input}
            placeholder="Write a New Note..."
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
          />
          <button onClick={addNote} style={addBtn}>
            <Plus size={20} />
          </button>
        </div>
        <div style={notesGrid}>
          {notes.map((n) => (
            <div
              key={n.id}
              style={{
                backgroundColor: '#eff6ff', // အပြာနုရောင် Sticky Note
                padding: '15px',
                borderRadius: '12px',
                marginBottom: '10px',
                borderLeft: '5px solid #3b82f6', // ဘေးလိုင်းအပြာရင့်
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                width: '200px' // ပုံထဲကအတိုင်း အကွက်လေးဖြစ်အောင်
              }}
            >
              <span style={{ fontSize: '14px', color: '#1e3a8a', lineHeight: '1.5' }}>{n.text}</span>
              <Trash2
                size={14}
                color="#ef4444"
                style={{ cursor: "pointer" }}
                onClick={() => deleteDoc(doc(db, "notes", n.id))}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Kanban Task Board */}
      <section style={section}>
        <h3 style={{ color: darkMode ? "#fff" : "#1e293b" }}>
          <Calendar size={20} /> Personal Tasks
        </h3>
        <div style={inputGroup}>
          <input
            style={input}
            placeholder="Add a New Task..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />
          <button onClick={addTask} style={addBtn}>
            <Plus size={20} />
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div style={kanbanGrid}>
            {Object.entries(columns).map(([id, column]) => (
              <Droppable droppableId={id} key={id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      ...kanbanCol,
                      backgroundColor: darkMode
                        ? "#1e293b"
                        : "rgba(255,255,255,0.5)",
                      // 🌟 Done column ဖြစ်ရင် 100% width ယူစေမည့် logic 🌟
                      flex: id === "done" ? "1 1 100%" : "1 1 300px",
                    }}
                  >
                    <h4
                      style={{
                        color: column.color,
                        borderBottom: `2px solid ${column.color}`,
                        marginBottom: "15px",
                        paddingBottom: "5px",
                      }}
                    >
                      {column.name}
                    </h4>
                    {tasks
                      .filter((t) => t.status === id)
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...taskCard,
                                // backgroundColor logic ပြင်ဆင်ချက်
                                backgroundColor:
                                  id === "todo"
                                    ? "#fef9c3"
                                    : id === "inProgress"
                                    ? "#dbeafe"
                                    : "#dcfce7", // fallback အနေနဲ့ done အရောင်ကို တိုက်ရိုက်ပေးလိုက်ပါ

                                // borderLeft logic ပြင်ဆင်ချက်
                                borderLeft: `6px solid ${
                                  id === "todo" 
                                    ? "#facc15" 
                                    : id === "inProgress" 
                                    ? "#3b82f6" 
                                    : "#22c55e"
                                }`,

                                color: "#1e293b",
                                ...provided.draggableProps.style,
                              }}
                            >
                              <span style={{ flex: 1, fontWeight: "500" }}>{task.title}</span>
                              <Trash2
                                size={14}
                                onClick={() => deleteDoc(doc(db, "tasks", task.id))}
                                style={{ cursor: "pointer", opacity: 0.7 }}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </section>
    </div>
  );
};

// Styles
const container = {
  width: "90%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "30px",
  paddingBottom: "50px",
};
const section = { backgroundColor: "transparent", borderRadius: "20px" };
const inputGroup = { display: "flex", gap: "10px", marginBottom: "20px" };
const input = {
  flex: 1,
  padding: "12px",
  borderRadius: "15px",
  border: "1px solid #e2e8f0",
  outline: "none",
};
const addBtn = {
  backgroundColor: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: "15px",
  padding: "10px",
  cursor: "pointer",
};
const notesGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: "15px",
};
const noteCard = {
  padding: "15px",
  borderRadius: "15px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};
const kanbanGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
  width: "100%",
  paddingBottom: "10px 0",
};
const kanbanCol = {
  flex: "1 1 300px", // အနည်းဆုံး 300px ယူမယ်၊ နေရာရှိရင် ချဲ့မယ်
  minHeight: "300px",
  backgroundColor: "rgba(255,255,255,0.5)",
  padding: "20px",
  borderRadius: "24px",
  display: "flex",
  flexDirection: "column",
};
const taskCard = {
  backgroundColor: "#fff",
  padding: "12px",
  borderRadius: "10px",
  marginBottom: "10px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "14px",
};

export default Workspace;