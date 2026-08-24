import React from "react";

const LandingPage = ({ onLogin }) => {
  const [showTOS, setShowTOS] = React.useState(false);

  return (
    <div style={container}>
      {/* နောက်ခံ ဒီဇိုင်းအလှများ (Blobs) */}
      <div style={blob1}></div>
      <div style={blob2}></div>

      <div style={contentWrapper}>
        <header style={header}>
          <h1 style={logo}>
            <span style={{ color: "#c86202" }}>Re</span>
            <span style={{ color: "#06b715" }}>@</span>
            <span style={{ color: "#3b82f6" }}>Member</span>
          </h1>
          {/* <h1 style={logo}>Re<span style={{ color: '#3b82f6' }}>Member</span></h1> */}
          <h2 style={mainHeading}>
            Preserve Your Precious Memories <br />{" "}
            <span style={highlightText}>Privately and Securely</span>
          </h2>
          <p style={tagline}>
            A private world of memories for family and friends.
          </p>
        </header>

        <div style={mainGrid}>
          {/* Video Section */}
          <div style={videoWrapper}>
            <div style={videoContainer}>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/tW-DkRldhng?si=fZodmuS518kZzsPg"
                title="App Tutorial"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
            </div>
          </div>

          {/* Pricing & CTA Card */}
          <section style={pricingCard}>
            <div style={badge}>SPECIAL OFFER</div>
            <h2 style={cardTitle}>Unlimited Memories</h2>
            <div style={price}>
              $7.99<span style={perMonth}>/year</span>
            </div>

            <ul style={features}>
              <li style={featureLi}>
                <span>✅</span> Private Family Groups
              </li>
              <li style={featureLi}>
                <span>✅</span> Unlimited Photos & Videos
              </li>
              <li style={featureLi}>
                <span>✅</span> Digital Postcards & Chat
              </li>
              <li style={featureLi}>
                <span>✅</span> Birthday Alert & Workspace
              </li>
            </ul>

            <div style={buttonGroup}>
              <a
                href="https://buy.stripe.com/fZu6oHeQcbdI0WR4Bk1B60h"
                target="_blank"
                rel="noreferrer"
                style={buyBtn}
              >
                ❤️ $7.99/yr
              </a>

              <p style={infoText}>
                After purchasing, click the button below to start using the
                service.
              </p>

              <button onClick={onLogin} style={loginBtn}>
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="G"
                  style={gIcon}
                />
                Login with Google
              </button>
            </div>
          </section>
        </div>

        <footer style={footer}>
          <div style={{ marginBottom: "10px" }}>
            <span
              onClick={() => setShowTOS(true)}
              style={{
                cursor: "pointer",
                textDecoration: "underline",
                color: "#64748b",
              }}
            >
              Terms of Service
            </span>
          </div>
          @{new Date().getFullYear()} ReMember App — Privacy First. Built with
          Heart ❤️
        </footer>
      </div>

      {showTOS && (
        <div style={tosOverlay}>
          <div style={tosModal}>
            <h3
              style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}
            >
              📜 Terms of Service
            </h3>
            <div style={tosContent}>
              <p>
                <strong>1. Service Usage:</strong> This App is intended for
                privately storing and sharing memories among family members and
                friends.
              </p>
              <p>
                <strong>2. File Size Limit:</strong> To ensure system stability,
                each individual file is limited to a maximum size of 5 megabytes
                (5MB).
              </p>
              <p>
                <strong>3. Data Retention Policy:</strong> If a user fails to
                pay the monthly service fee or does not use the service for six
                (6) consecutive months, the system reserves the right to
                permanently delete the stored data, including photos, videos,
                and audio files.
              </p>
              <p>
                <strong>4. Privacy and Security:</strong> Your information will
                only be accessible to users who share the same Family Code. We,
                as the administrator, are committed to protecting your privacy
                and maintaining the security of your data.
              </p>
            </div>
            <button onClick={() => setShowTOS(false)} style={closeTOSBtn}>
              Understand.
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Modern Styles (Professional & Trendy) ---

const container = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight: "100vh",
  backgroundColor: "#f0f4f8",
  padding: "20px 10px",
  textAlign: "center",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  position: "relative",
  overflow: "hidden",
};

// နောက်ခံ အရောင်ပြေးအလှများ
const blob1 = {
  position: "absolute",
  width: "500px",
  height: "500px",
  background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
  borderRadius: "50%",
  top: "-100px",
  right: "-100px",
  filter: "blur(80px)",
  zIndex: 0,
  opacity: 0.6,
};
const blob2 = {
  position: "absolute",
  width: "400px",
  height: "400px",
  background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
  borderRadius: "50%",
  bottom: "-100px",
  left: "-100px",
  filter: "blur(80px)",
  zIndex: 0,
  opacity: 0.6,
};

const contentWrapper = {
  zIndex: 1,
  width: "100%",
  maxWidth: "1100px",
  textAlign: "center",
};

const header = {
  marginBottom: "20px",
  width: "100%",
  // maxWidth: "600px"
};

const logo = {
  fontSize: "clamp(30px, 8vw, 45px)",
  fontWeight: "900",
  color: "#1e293b",
  margin: "0 0 10px 0",
  letterSpacing: "-1px",
};

const videoContainer = {
  width: "95%",
  maxWidth: "500px", // ကွန်ပျူတာမှာ ၅၀၀ ထက် ပိုမကြီးစေဖို့
  aspectRatio: "16/9", // Video ratio မှန်အောင်
  margin: "20px 0",
  borderRadius: "15px",
  overflow: "hidden",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#000"
};

const title = {
  fontSize: "clamp(20px, 5vw, 28px)", // Title ကိုလည်း အလိုလို ညှိမယ်
  lineHeight: "1.3",
  color: "#1e293b",
  padding: "0 10px"
};

const mainHeading = {
  fontSize: "22px",
  // fontWeight: "800",
  color: "#0f172a",
  lineHeight: "1.2",
  margin: "15px 0",
};
const highlightText = { color: "#3b82f6" };
const tagline = { fontSize: "18px", color: "#64748b", fontWeight: "400" };

const mainGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: "40px",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "20px",
};

// Video Frame ဒီဇိုင်း
const videoWrapper = {
  flex: "1 1 500px",
  maxWidth: "650px",
  background: "#fff",
  padding: "12px",
  borderRadius: "24px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255,255,255,0.7)",
};

const responsiveVideo = {
  position: "relative",
  paddingBottom: "56.25%", // 16:9 Aspect Ratio
  height: 0,
  overflow: "hidden",
  borderRadius: "16px",
  backgroundColor: "#000",
};

const iframeStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
};

// Pricing Card ဒီဇိုင်း (Glassmorphism)
const pricingCard = {
  flex: "1 1 350px",
  width: "95%",
  maxWidth: "400px",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(10px)",
  padding: "clamp(20px, 5vw, 40px)",
  borderRadius: "30px",
  boxShadow:
    "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  border: "1px solid rgba(255, 255, 255, 0.6)",
  textAlign: "center",
  boxSizing: "border-box"
};

const badge = {
  backgroundColor: "#dcfce7",
  color: "#15803d",
  padding: "6px 16px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "800",
  display: "inline-block",
  marginBottom: "15px",
};
const cardTitle = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#1e293b",
  margin: "0",
};
const price = {
  fontSize: "56px",
  fontWeight: "900",
  margin: "10px 0",
  color: "#0f172a",
  letterSpacing: "-2px",
};
const perMonth = {
  fontSize: "18px",
  color: "#64748b",
  fontWeight: "400",
  letterSpacing: "0",
};

const features = {
  listStyle: "none",
  padding: 0,
  textAlign: "left",
  margin: "0 auto 30px",
  maxWidth: "280px",
  display: "grid",
  gap: "12px",
  color: "#475569",
  lineHeight: "2",
  fontSize: "14px"
};

const featureLi = {
  fontSize: "15px",
  color: "#475569",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontWeight: "500",
};

const buttonGroup = { display: "flex", flexDirection: "column", gap: "12px" };

const buyBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#FFDD00",
  color: "#000",
  textDecoration: "none",
  padding: "12px",
  borderRadius: "12px",
  fontWeight: "800",
  marginBottom: "12px",
  fontSize: "15px",
  transition: "transform 0.2s",
  boxShadow: "0 4px 0 #d9c600",
};

const infoText = { fontSize: "12px", color: "#94a3b8", margin: "5px 0" };

const loginBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  backgroundColor: "#fff",
  color: "#1e293b",
  fontWeight: "700",
  fontSize: "15px",
  cursor: "pointer",
  transition: "all 0.2s",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
};

const gIcon = { width: "20px", height: "20px" };

const footer = {
  marginTop: "60px",
  color: "#94a3b8",
  fontSize: "13px",
  fontWeight: "500",
};

const tosOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  padding: "20px",
};
const tosModal = {
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "24px",
  maxWidth: "500px",
  width: "100%",
  boxShadow: "0 20px 25px rgba(0,0,0,0.1)",
  textAlign: "left",
};
const tosContent = {
  maxHeight: "300px",
  overflowY: "auto",
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#475569",
  marginBottom: "20px",
};
const closeTOSBtn = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#3b82f6",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

export default LandingPage;
