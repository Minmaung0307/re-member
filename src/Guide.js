import React from "react";
import {
  X,
  Home,
  Palette,
  Gift,
  CheckSquare,
  ShieldCheck,
  Info,
  Heart,
  Smartphone,
  Lock,
  Camera,
  MessageCircle,
} from "lucide-react";

const Guide = ({ onClose, darkMode }) => {
  const textColor = darkMode ? "#f1f5f9" : "#1e293b";
  const subTextColor = darkMode ? "#94a3b8" : "#64748b";
  const cardBg = darkMode ? "#334155" : "#f8fafc";

  const sections = [
    {
      title: "Dashboard",
      icon: <Home size={20} color="#3b82f6" />,
      content: [
        "Where you see 'What would you like to share?', you can upload text, multiple photos, audio files, and videos all at once.",
        "Each file can be up to 5MB. Files will be automatically compressed to save storage space.",
        "🎨 Use the Postcard button to create and send beautiful birthday greeting cards.",
        "To leave a reaction, press and hold the Heart icon, or use the Message icon to add a comment.",
      ],
      media: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?w=500",
        },
        {
          type: "video",
          url: "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?w=500",
        },
      ],
    },
    {
      title: "Memory Gallery",
      icon: <Palette size={20} color="#8b5cf6" />,
      content: [
        "View all photos and videos uploaded by family members together in a grid layout.",
        "Click on any photo to view it in full-screen mode.",
        "You can easily see who uploaded each photo below the image.",
      ],
      media: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?w=500",
        },

        {
          type: "video",
          url: "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?w=500",
        },
      ],
    },
    {
      title: "Family Events",
      icon: <Gift size={20} color="#ec4899" />,
      content: [
        "Use + Add Event to enter the event name, date, location, and a memorable photo.",
        "If there is a birthday, an automatic reminder will appear at the top of the Dashboard.",
        "You can edit your own events using the Pencil (Edit) icon or delete them using the Trash (Delete) icon.",
      ],
      media: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?w=500",
        },
        {
          type: "video",
          url: "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?w=500",
        },
      ],
    },
    {
      title: "Workspace",
      icon: <CheckSquare size={20} color="#10b981" />,
      content: [
        "Manage family tasks using three columns: To Do, In Progress, and Done.",
        "Add new tasks, and once completed, click and move them to the next column.",
        "Use the Family Bucket List to keep track of dreams and activities you want to accomplish together as a family.",
      ],
      media: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?w=500",
        },
        {
          type: "video",
          url: "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?w=500",
        },
      ],
    },
    {
      title: "Admin / Profile",
      icon: <ShieldCheck size={20} color="#f59e0b" />,
      content: [
        "Update your birthday, hobbies, and Daily Mood on your profile.",
        "The Family Owner can change the Family Code at any time. (Minimum 8 characters)",
        "Members who are not part of the group can be removed using the Kick button in the Sidebar.",
      ],
      media: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?w=500",
        },
        {
          type: "video",
          url: "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?w=500",
        },
      ],
    },
  ];

  return (
    <div style={overlayStyle}>
      <div
        style={{
          ...modalStyle,
          backgroundColor: darkMode ? "#1e293b" : "#fff",
        }}
      >
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={iconCircle}>
              <Info size={20} color="#fff" />
            </div>
            <h2 style={{ margin: 0, fontSize: "20px", color: textColor }}>
              ReMember Guide
            </h2>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>
            <X size={24} color={subTextColor} />
          </button>
        </div>

        {/* Content */}
        <div style={scrollAreaStyle}>
          <p
            style={{
              color: subTextColor,
              fontSize: "14px",
              marginBottom: "20px",
            }}
          >
            A guide to using the ReMember App to organize and preserve family
            memories.
          </p>

          {sections.map((section, idx) => (
            <div key={idx} style={{ ...sectionCard, backgroundColor: cardBg }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                {section.icon}
                <strong style={{ color: textColor }}>{section.title}</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {section.content.map((text, i) => (
                  <li
                    key={i}
                    style={{
                      color: subTextColor,
                      fontSize: "13px",
                      marginBottom: "6px",
                      lineHeight: "1.5",
                    }}
                  >
                    {text}
                  </li>
                ))}
              </ul>
              {/* 🌟 ပုံ သို့မဟုတ် ဗီဒီယို ပြသပေးမည့် အပိုင်း 🌟 */}
              {section.media &&
                section.media.map((item, mIdx) => (
                  <div key={mIdx} style={mediaWrapper}>
                    {item.type === "image" ? (
                      <img src={item.url} style={mediaStyle} alt="guide" />
                    ) : (
                      <video src={item.url} controls style={mediaStyle} />
                    )}
                  </div>
                ))}
            </div>
          ))}

          {/* Key Features Icons */}
          <div style={featureRow}>
            <div style={featureItem}>
              <Lock size={16} /> <span>End-to-End Privacy</span>
            </div>
            <div style={featureItem}>
              <Smartphone size={16} /> <span>PWA Ready</span>
            </div>
            <div style={featureItem}>
              <MessageCircle size={16} /> <span>Real-time Chat</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <button onClick={onClose} style={gotItBtn}>
            Understand
          </button>
        </div>
      </div>
    </div>
  );
};

// Styles
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  padding: "15px",
};
const modalStyle = {
  width: "100%",
  maxWidth: "500px",
  maxHeight: "90vh",
  borderRadius: "28px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
};
const headerStyle = {
  padding: "20px 25px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid rgba(0,0,0,0.05)",
};
const iconCircle = {
  backgroundColor: "#3b82f6",
  padding: "6px",
  borderRadius: "12px",
  display: "flex",
};
const closeBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
};
const scrollAreaStyle = { padding: "20px 25px", overflowY: "auto", flex: 1 };
const sectionCard = {
  padding: "15px",
  borderRadius: "18px",
  marginBottom: "15px",
};
const featureRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: "15px",
  marginTop: "10px",
  justifyContent: "center",
};
const featureItem = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "11px",
  color: "#94a3b8",
};
const footerStyle = {
  padding: "15px 25px",
  borderTop: "1px solid rgba(0,0,0,0.05)",
  textAlign: "center",
};
const gotItBtn = {
  width: "100%",
  padding: "14px",
  borderRadius: "16px",
  border: "none",
  backgroundColor: "#3b82f6",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "15px",
};

const mediaWrapper = {
  marginTop: "12px",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid rgba(0,0,0,0.1)",
};

const mediaStyle = {
  width: "100%",
  maxHeight: "250px",
  objectFit: "cover",
  display: "block",
};

export default Guide;
