import React from 'react';

const LandingPage = ({ onLogin }) => {
    return (
        <div style={container}>
            {/* နောက်ခံ ဒီဇိုင်းအလှများ (Blobs) */}
            <div style={blob1}></div>
            <div style={blob2}></div>

            <div style={contentWrapper}>
                <header style={header}>
                    <h1 style={logo}>Re<span style={{ color: '#3b82f6' }}>Member</span></h1>
                    <h2 style={mainHeading}>သင့်ရဲ့ အဖိုးတန်အမှတ်တရတွေကို <br/> <span style={highlightText}>သီးသန့် သိမ်းဆည်းထားပါ</span></h2>
                    <p style={tagline}>မိသားစုနှင့် သူငယ်ချင်းများအတွက် သီးသန့် အမှတ်တရ ကမ္ဘာလေး</p>
                </header>

                <div style={mainGrid}>
                    {/* Video Section */}
                    <div style={videoWrapper}>
                        <div style={responsiveVideo}>
                            <iframe width="560" height="315" src="https://www.youtube.com/embed/tW-DkRldhng?si=fZodmuS518kZzsPg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                        </div>
                    </div>

                    {/* Pricing & CTA Card */}
                    <section style={pricingCard}>
                        <div style={badge}>SPECIAL OFFER</div>
                        <h2 style={cardTitle}>Unlimited Memories</h2>
                        <div style={price}>$3.99<span style={perMonth}>/month</span></div>
                        
                        <ul style={features}>
                            <li style={featureLi}><span>✅</span> သီးသန့် မိသားစုအုပ်စုများ</li>
                            <li style={featureLi}><span>✅</span> အကန့်အသတ်မရှိ ဓာတ်ပုံ/ဗီဒီယို</li>
                            <li style={featureLi}><span>✅</span> Digital Postcards & Chat</li>
                            <li style={featureLi}><span>✅</span> Birthday Alert & Workspace</li>
                        </ul>
                        
                        <div style={buttonGroup}>
                            <a href="https://buy.stripe.com/eVq8wP5fC4PkgVPd7Q1B60f" target="_blank" rel="noreferrer" style={buyBtn}>
                                ☕ Buy Me A Coffee ($3.99)
                            </a>
                            
                            <p style={infoText}>ဝယ်ယူပြီးပါက အောက်ပါခလုတ်ကိုနှိပ်၍ အသုံးပြုပါ</p>
                            
                            <button onClick={onLogin} style={loginBtn}>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={gIcon}/>
                                Login with Google
                            </button>
                        </div>
                    </section>
                </div>

                <footer style={footer}>
                    @2026 ReMember App — Privacy First. Built with Heart ❤️
                </footer>
            </div>
        </div>
    );
};

// --- Modern Styles (Professional & Trendy) ---

const container = { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '100%',
    minHeight: '100vh', 
    backgroundColor: '#f0f4f8', 
    padding: '20px', 
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflow: 'hidden'
};

// နောက်ခံ အရောင်ပြေးအလှများ
const blob1 = { position: 'absolute', width: '500px', height: '500px', background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', borderRadius: '50%', top: '-100px', right: '-100px', filter: 'blur(80px)', zIndex: 0, opacity: 0.6 };
const blob2 = { position: 'absolute', width: '400px', height: '400px', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '50%', bottom: '-100px', left: '-100px', filter: 'blur(80px)', zIndex: 0, opacity: 0.6 };

const contentWrapper = { zIndex: 1, width: '100%', maxWidth: '1100px', textAlign: 'center' };

const header = { marginBottom: '40px' };
const logo = { fontSize: '48px', fontWeight: '900', color: '#1e293b', marginBottom: '10px', letterSpacing: '-1px' };
const mainHeading = { fontSize: '32px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2', margin: '15px 0' };
const highlightText = { color: '#3b82f6' };
const tagline = { fontSize: '18px', color: '#64748b', fontWeight: '400' };

const mainGrid = { 
    display: 'flex', 
    flexWrap: 'wrap', 
    gap: '40px', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: '20px'
};

// Video Frame ဒီဇိုင်း
const videoWrapper = {
    flex: '1 1 500px',
    maxWidth: '650px',
    background: '#fff',
    padding: '12px',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255,255,255,0.7)'
};

const responsiveVideo = {
    position: 'relative',
    paddingBottom: '56.25%', // 16:9 Aspect Ratio
    height: 0,
    overflow: 'hidden',
    borderRadius: '16px',
    backgroundColor: '#000'
};

const iframeStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
};

// Pricing Card ဒီဇိုင်း (Glassmorphism)
const pricingCard = { 
    flex: '1 1 350px',
    maxWidth: '400px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    backdropFilter: 'blur(10px)',
    padding: '40px', 
    borderRadius: '32px', 
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
    border: '1px solid rgba(255, 255, 255, 0.6)',
    textAlign: 'center'
};

const badge = { backgroundColor: '#dcfce7', color: '#15803d', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', display: 'inline-block', marginBottom: '15px' };
const cardTitle = { fontSize: '22px', fontWeight: '700', color: '#1e293b', margin: '0' };
const price = { fontSize: '56px', fontWeight: '900', margin: '10px 0', color: '#0f172a', letterSpacing: '-2px' };
const perMonth = { fontSize: '18px', color: '#64748b', fontWeight: '400', letterSpacing: '0' };

const features = { listStyle: 'none', padding: 0, textAlign: 'left', margin: '25px 0', display: 'grid', gap: '12px' };
const featureLi = { fontSize: '15px', color: '#475569', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' };

const buttonGroup = { display: 'flex', flexDirection: 'column', gap: '12px' };

const buyBtn = { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#FFDD00', 
    color: '#000', 
    textDecoration: 'none', 
    padding: '16px', 
    borderRadius: '16px', 
    fontWeight: '800', 
    fontSize: '16px',
    transition: 'transform 0.2s',
    boxShadow: '0 4px 0 #d9c600'
};

const infoText = { fontSize: '12px', color: '#94a3b8', margin: '5px 0' };

const loginBtn = { 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px', 
    borderRadius: '16px', 
    border: '1px solid #e2e8f0', 
    backgroundColor: '#fff', 
    color: '#1e293b', 
    fontWeight: '700', 
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};

const gIcon = { width: '20px', height: '20px' };

const footer = { marginTop: '60px', color: '#94a3b8', fontSize: '13px', fontWeight: '500' };

export default LandingPage;