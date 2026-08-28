import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  User,
  PlayCircle,
  Award,
  Clock,
  ShieldCheck,
  Ticket,
  ArrowRight,
  Target,
  MessageSquare,
  Monitor,
} from "lucide-react";

const CourseEnrollPage = ({ data, onClose }) => {
  const [learningMode, setLearningMode] = useState("self"); // 'self' or 'instructor'
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  // စျေးနှုန်း တွက်ချက်ခြင်း
  const basePrice =
    data.price === "Free" ? 0 : parseInt(data.price.replace(/,/g, ""));
  const instructorFee = 25000; // ဆရာနဲ့သင်ရင် အပိုကြေး
  const totalPrice =
    learningMode === "instructor" ? basePrice + instructorFee : basePrice;
  const finalPrice = totalPrice - totalPrice * (discount / 100);

  const applyPromo = () => {
    if (promoCode.toUpperCase() === "WELCOME10") {
      setDiscount(10);
      alert("Promo Code အောင်မြင်ပါတယ်။ ၁၀% လျှော့ပေးလိုက်ပါပြီ။");
    } else {
      alert("Promo Code မမှန်ကန်ပါ။");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>{data.title}</h1>
            <p style={styles.instructorName}>
              By {data.instructor || "Expert Tutors"}
            </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X />
          </button>
        </div>

        <div style={styles.contentScroll}>
          {/* ၁။ သင်တန်းအသေးစိတ် (Course Details) */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Target size={20} /> သင်တန်းအကြောင်း သိကောင်းစရာ
            </h2>
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <Monitor size={18} color="#10b981" />
                <span>{data.lessons} Lessons (Video + Lab)</span>
              </div>
              <div style={styles.detailItem}>
                <Clock size={18} color="#10b981" />
                <span>စုစုပေါင်းကြာချိန် - {data.duration}</span>
              </div>
              <div style={styles.detailItem}>
                <ShieldCheck size={18} color="#10b981" />
                <span>Lifetime Access (သက်တမ်းအကန့်အသတ်မရှိ)</span>
              </div>
            </div>
            <p style={styles.description}>{data.desc}</p>
          </section>

          {/* ၂။ သင်ယူမည့်ပုံစံ ရွေးချယ်ခြင်း (Learning Mode) */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <User size={20} /> သင်ယူမည့်ပုံစံ ရွေးချယ်ပါ
            </h2>
            <div style={styles.modeGrid}>
              <div
                style={{
                  ...styles.modeCard,
                  borderColor: learningMode === "self" ? "#10b981" : "#eee",
                }}
                onClick={() => setLearningMode("self")}
              >
                <div style={styles.modeHeader}>
                  <PlayCircle
                    color={learningMode === "self" ? "#10b981" : "#64748b"}
                  />
                  <h3>Self-Paced Learning</h3>
                </div>
                <ul style={styles.modeList}>
                  <li>
                    • ဗီဒီယိုသင်ခန်းစာများကို ကြည့်ပြီး ကိုယ်တိုင်လေ့လာမည်
                  </li>
                  <li>• Community Group တွင် မေးမြန်းနိုင်မည်</li>
                  <li style={styles.priceTag}>+ 0 MMK</li>
                </ul>
              </div>

              <div
                style={{
                  ...styles.modeCard,
                  borderColor:
                    learningMode === "instructor" ? "#10b981" : "#eee",
                }}
                onClick={() => setLearningMode("instructor")}
              >
                <div style={styles.modeHeader}>
                  <MessageSquare
                    color={
                      learningMode === "instructor" ? "#10b981" : "#64748b"
                    }
                  />
                  <h3>With Instructor (ဆရာနှင့်သင်မည်)</h3>
                </div>
                <ul style={styles.modeList}>
                  <li>• ဆရာနှင့် Weekly Live Session (1-on-1) ပါဝင်မည်</li>
                  <li>• Homework Review နှင့် တိုက်ရိုက်လမ်းညွှန်မှု</li>
                  <li style={styles.priceTag}>+ 25,000 MMK</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ၃။ အောင်လက်မှတ် နမူနာ (Certificate Preview) */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Award size={20} /> Certificate Of Completion
            </h2>
            <div style={styles.certPreview}>
              <div style={styles.certFrame}>
                <Award size={48} color="#f59e0b" style={styles.certIcon} />
                <h4 style={styles.certOrg}>MMUSA ACADEMY</h4>
                <p style={styles.certText}>This is to certify that</p>
                <h3 style={styles.certName}>[Your Name Here]</h3>
                <p style={styles.certText}>has successfully completed</p>
                <h4 style={styles.certCourse}>{data.title}</h4>
                <div style={styles.certBadge}>Official Verified</div>
              </div>
            </div>
          </section>
        </div>

        {/* ၄။ ငွေပေးချေမှုနှင့် Checkout (Payment Section) */}
        <div style={styles.footer}>
          <div style={styles.promoArea}>
            <Ticket size={18} color="#64748b" />
            <input
              placeholder="Promo Code (WELCOME10)"
              style={styles.promoInput}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button onClick={applyPromo} style={styles.applyBtn}>
              Apply
            </button>
          </div>

          <div style={styles.checkoutBox}>
            <div style={styles.finalAmount}>
              {" "}
              {/* 🌟 ဒီ div လေးနဲ့ အုပ်ပေးပါ */}
              <h2 style={styles.totalPrice}>
                <span style={styles.totalLabel}>Total: </span>
                {finalPrice > 0 ? (
                  <>
                    {finalPrice.toLocaleString()}
                    <span
                      style={{
                        fontSize: "12px",
                        marginLeft: "4px",
                        fontWeight: "600",
                      }}
                    >
                      MMK
                    </span>
                  </>
                ) : (
                  "Free"
                )}
              </h2>
            </div>
            <button style={styles.enrollFinalBtn}>
              Enroll Now <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    width: "95%",
    maxWidth: "900px",
    height: "85vh",
    backgroundColor: "#fff",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
  },
  header: {
    padding: "25px 30px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: "24px", fontWeight: "800", color: "#1e293b", margin: 0 },
  instructorName: { color: "#64748b", margin: "5px 0 0 0" },
  closeBtn: {
    border: "none",
    background: "#f1f5f9",
    padding: "10px",
    borderRadius: "50%",
    cursor: "pointer",
  },
  contentScroll: { padding: "30px", overflowY: "auto", flex: 1 },
  section: { marginBottom: "40px" },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#475569",
  },
  description: { lineHeight: "1.7", color: "#64748b", fontSize: "15px" },
  modeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  modeCard: {
    padding: "20px",
    borderRadius: "20px",
    border: "2px solid #eee",
    cursor: "pointer",
    transition: "0.3s ease",
  },
  modeHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "15px",
  },
  modeList: {
    listStyle: "none",
    padding: 0,
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.8",
  },
  priceTag: { marginTop: "10px", fontWeight: "800", color: "#10b981" },
  certPreview: {
    padding: "40px",
    backgroundColor: "#f8fafc",
    borderRadius: "25px",
    display: "flex",
    justifyContent: "center",
  },
  certFrame: {
    width: "100%",
    maxWidth: "500px",
    padding: "30px",
    backgroundColor: "#fff",
    border: "8px solid #f1f5f9",
    textAlign: "center",
    position: "relative",
  },
  certName: {
    fontSize: "28px",
    fontFamily: "serif",
    margin: "15px 0",
    color: "#1e293b",
  },
  certCourse: { color: "#10b981", fontWeight: "700" },
  certBadge: {
    position: "absolute",
    top: "20px",
    right: "20px",
    padding: "5px 12px",
    backgroundColor: "#dcfce7",
    color: "#166534",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "bold",
  },
  footer: {
    padding: "25px 30px",
    backgroundColor: "#fff",
    borderTop: "1px solid #f1f5f9",
  },
  promoArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  promoInput: {
    flex: 1,
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    outline: "none",
  },
  applyBtn: {
    padding: "12px 20px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#1e293b",
    color: "#fff",
    cursor: "pointer",
  },
  checkoutBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    // 🌟 Mobile မှာ column (အထက်အောက်)၊ Desktop မှာ row (ဘေးတိုက်)
    flexDirection: window.innerWidth <= 768 ? "column" : "row",
    gap: window.innerWidth <= 768 ? "15px" : "0",
    width: "100%",
  },
  finalAmount: {
    textAlign: window.innerWidth <= 768 ? "center" : "left",
    width: window.innerWidth <= 768 ? "100%" : "auto",
  },
  totalPrice: {
    margin: 0,
    color: "#10b981",
    // 🌟 Mobile မှာ ၂၀၊ Desktop မှာ ၂၄ (စာလုံးဆိုဒ် သေးလိုက်ပါပြီ)
    fontSize: window.innerWidth <= 768 ? "16px" : "20px",
    fontWeight: "800",
  },
  totalLabel: {
    fontSize: window.innerWidth <= 768 ? "11px" : "14px",
    color: "#64748b",
    display: "block",
    marginBottom: "2px",
  },
  enrollFinalBtn: {
    // 🌟 Mobile မှာ ခလုတ်ကို အပြည့် (100%) ယူစေပါမယ်
    width: window.innerWidth <= 768 ? "100%" : "auto",
    padding: "15px 30px",
    borderRadius: "15px",
    border: "none",
    backgroundColor: "#10b981",
    color: "#fff",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    cursor: "pointer",
    transition: "0.3s",
  },
};

export default CourseEnrollPage;
