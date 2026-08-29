import React, { useState, useEffect, useRef } from "react";

import CourseEnrollPage from "./components/CourseEnrollPage";

// import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BookText,
  Clock,
  CheckCircle,
  Calendar,
  ChartBar,
  ChessKing,
  Crown,
  Calculator,
  FileCode,
  FileText,
  Grid3X3,
  Gamepad2,
  Gift,
  Heart,
  Info,
  PaintBucket,
  Play,
  PlayCircle,
  Rocket,
  Star,
  QrCode,
  LayoutGrid,
  Wallet,
  Video,
  Youtube,
} from "lucide-react";

// --- Apps Data ---
const apps = [
  {
    title: "ReMember",
    desc: "Designed for modern living, this app lets you schedule birthday reminders and holiday/event preparations for family, friends, and team members. Keep your home running smoothly with dedicated shopping lists for all your essential household purchases. Bring everyone closer together by collecting and sharing your future dreams all in one convenient place.",
    color: "#0789d0",
    isFree: false, // Premium ($3.99)
    url: "https://remember.mmusa.org",
    image: "/images/remember.jpeg",
    icon: <Heart size={20} />,
    color: "#ff4b5c",
  },
  {
    title: "Ledger",
    desc: "Keep your finances organized effortless with quick weekly tracking built for busy individuals. Ledger streamlines tax preparation by mapping your records straight to the exact fields on tax forms. Save time and avoid headaches whether you're doing your own taxes or handing structured reports to your CPA.",
    color: "#10b981",
    isFree: false,
    url: "https://ledger.mmusa.org",
    image: "/images/ledger.jpeg",
    icon: <Calculator size={20} />,
    color: "#3b82f6",
  },
  {
    title: "DocKeeper",
    desc: "Safely organize and store all your vital personal documents in one secure location. Easily categorize important files related to your home, vehicle, taxes, employment, government IDs, and residency records. Designed for quick access and peace of mind, this app ensures you never lose track of your essential paperwork.",
    color: "#f6c13b",
    isFree: false,
    url: "https://dockeeper.mmusa.org",
    image: "/images/dockeeper.jpeg",
    icon: <BookOpen size={20} />,
    color: "#10b981",
  },
  {
    title: "NexQR",
    desc: "Easily generate custom QR codes for your Wi-Fi networks, events, digital business cards (vCard), and cryptocurrency wallets in seconds. Customize your designs, share instantly, and streamline how you connect with others. Download now to turn your information into smart, scannable QR codes effortlessly!",
    isFree: true,
    url: "https://qr.mmusa.org",
    image: "/images/qr.jpeg",
    icon: <QrCode size={20} />,
    color: "#f59e0b",
  },
  {
    title: "KyarKwet",
    desc: "Experience the deep strategy of traditional Myanmar Draughts (Kyarkwet) right on your smartphone, played vertically on a unique custom board. Challenge your mind by capturing one, two, or even three pieces in a single move to promote your piece to a powerful King. Master two distinct game modes—take control of the board in classic Myanmar Draughts or test your tactical survival in Tiger vs. Cows!",
    isFree: true,
    url: "https://kyar.mmusa.org",
    image: "/images/kyar.jpeg",
    icon: <Crown size={20} />,
    color: "#800674",
  },
  {
    title: "Chess",
    desc: "Play chess your way by challenging either friends locally or playing against intelligent AI opponents. Connect seamlessly online to match with remote players and friends anywhere in the world. Elevate your strategy with real-time AI move suggestions and analysis designed to improve your gameplay.",
    isFree: true,
    url: "https://chess.mmusa.org",
    image: "/images/chess.jpeg",
    icon: <ChessKing size={20} />,
    color: "#800674",
  },
  {
    title: "LifeManager",
    desc: "LifeManager securely stores and organizes all your essential personal information in one convenient place. From home and vehicle details to work, office, government, and banking records, it keeps your vital data structured and easily accessible. Experience hassle-free management and stay completely in control of your daily life.",
    isFree: true,
    url: "https://lifemanager.mmusa.org",
    image: "/images/lifemanager.jpeg",
    icon: <Crown size={20} />,
    color: "#068076",
  },
  {
    title: "USLife",
    desc: "USLife tracks your income, expenses, and monthly budget effortlessly to help you stay on top of your finances. It also enables you to quickly locate nearby essentials, including restaurants, hospitals, gyms, gas stations, churches, grocery stores, urgent care centers, and police stations. Simplify your daily living and navigate your surroundings with ultimate ease.",
    isFree: true,
    url: "https://uslife.mmusa.org",
    image: "/images/uslife.jpeg",
    icon: <Grid3X3 size={20} />,
    color: "#068014",
  },
  {
    title: "MMCal",
    desc: "Explore full year-by-year Myanmar calendars complete with waxing/waning dates, Sabbath days, and national festivals. Effortlessly manage both traditional cultural holidays and your personal events in one place. Customize your calendar with personal notes, birthdays, and important reminders today.",
    isFree: true,
    url: "https://cal.mmusa.org",
    image: "/images/cal.jpeg",
    icon: <Calendar size={20} />,
    color: "#068014",
  },
  {
    title: "SaleReport",
    desc: "Track your inventory items in detail with automated record-keeping for income, expenses, and stock movements. Easily manage daily business operations, multiple branch locations, and staff assignments from a single platform. Gain full control and insights into your business growth with our comprehensive sales reporting system.",
    isFree: true,
    url: "https://sales.mmusa.org",
    image: "/images/sales.jpeg",
    icon: <ChartBar size={20} />,
    color: "#068014",
  },
  {
    title: "Daily Scheduler",
    desc: "စနစ်ကျတဲ့ တစ်နေ့တာကို ဖန်တီးဖို့ Focus Timer ပါဝင်တဲ့ Scheduler",
    url: "https://remember.mmusa.org", // Family Vault ထဲမှာပဲ Tab အနေနဲ့ ရှိနေမှာမို့လို့ပါ
    image: "/images/sales.jpeg",
    icon: <Clock size={20} />,
    color: "#3b82f6",
    isFree: true,
  },
];

// --- YouTube Data ---
const youtubeCategories = [
  {
    title: "FrontEnd Web Developement",
    channels: [
      {
        name: "HTML Tutorial",
        embedId: "2u4q2vDLiU0",
        desc: "HTML Tutorial For Beginners: HTML Crash Course (2026)",
      },
      {
        name: "HTML & CSS – Full Course",
        embedId: "lI3iZ5xMII8",
        desc: "Web Development with HTML & CSS – Full Course for Beginners (2026)",
      },
      {
        name: "Git & GitHub",
        embedId: "mAFoROnOfHs",
        desc: "Git & GitHub Crash Course for Beginners [2026]",
      },
    ],
  },
  {
    title: "BackEnd Web Developement",
    channels: [
      {
        name: "Node JS Tutorial",
        embedId: "FPJzYFgexJA",
        desc: "Node JS Tutorial for Beginners 2026 [Learn Node JS from Scratch]",
      },
      {
        name: "SQL Tutorial",
        embedId: "h0nxCDiD-zg",
        desc: "SQL Tutorial for Beginners",
      },
      {
        name: "APIs for Beginners",
        embedId: "WXsD0ZgxjRw",
        desc: "APIs for Beginners - How to use an API (Full Course / Tutorial)",
      },
    ],
  },
];

// --- Courses Data ---
const courses = [
  {
    title: "FrontEnd Web Developer",
    desc: `Master the core foundations of modern web development by building responsive and interactive websites using HTML, CSS, and JavaScript. Gain hands-on experience with Git and GitHub to manage your code and showcase your portfolio to future employers. Start your developer journey today and turn your creative ideas into fully functional web applications!`,
    instructor: "MM",
    price: "$2,000",
    isFree: false,
    duration: "60hr",
    level: "Beginner to Pro",
    lessons: "25",
    image: "/images/frontEnd.jpeg",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="#e34f26"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z" />
      </svg>
    ),
    color: "#045567",
  },
  {
    title: "BackEnd Web Developer",
    desc: "Build robust, scalable server-side applications using Node.js while mastering database management with both SQL and NoSQL (MongoDB). Learn how to write secure APIs and seamlessly handle complex data logic for modern web applications. Master source code management and collaborative workflows using Git and GitHub to showcase your backend portfolio to top tech employers!",
    instructor: "MM",
    price: "$2,000",
    isFree: false,
    duration: "60hr",
    level: "Beginner to Pro",
    lessons: "25",
    image: "/images/backEnd.jpeg",
    icon: <FileCode size={20} />,
    color: "#08899a",
  },
  {
    title: "Full Stack Web Developer",
    desc: "Learn to write clean, professional code while building dynamic websites and full-featured web applications from scratch. You will develop strong problem-solving skills by tackling real-world challenges across both frontend and backend systems. Master the end-to-end development process to transform your ideas into fully functional digital solutions.",
    instructor: "MM",
    price: "$2,000",
    isFree: false,
    duration: "60hr",
    level: "Beginner to Pro",
    lessons: "25",
    image: "/images/fullStack.jpeg",
    icon: <Crown size={20} />,
    color: "#674c04",
  },
  {
    title: "Canva AI Video",
    desc: "Unlock your creativity with Canva by leveraging advanced AI tools like Gemini, ChatGPT, and Google AI Studio to generate unique images and custom logos effortlessly. Bring your static designs to life with smooth animations that grab attention and add professional flair to any project. Seamlessly edit and produce eye-catching videos tailored to your exact vision, all within an intuitive workspace.",
    instructor: "MM",
    price: "$2,000",
    isFree: false,
    duration: "40hr",
    level: "Beginner to Pro",
    lessons: "20",
    image: "/images/canvaAI.jpeg",
    icon: <PaintBucket size={20} />,
    color: "#850796",
  },
];

const AboutSection = () => {
  return (
    <div style={styles.aboutWrapper}>
      <div style={styles.aboutHero}>
        <h1 style={styles.aboutMainTitle}>
          Empower Your Journey. <br />
          <span style={{ color: "#3b82f6" }}>Master Your Future.</span>
        </h1>
        <p style={styles.aboutSubTitle}>
          Welcome to MMUSA, your personal digital toolkit for growth. We believe
          that with the right tools, anyone can transform their life.
        </p>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconCircle, backgroundColor: "#e0f2fe" }}>
            <Rocket color="#3b82f6" />
          </div>
          <h3 style={{ marginBottom: "10px" }}>Applications</h3>
          <p style={{ fontSize: "13px", color: "#64748b" }}>
            Digital instruments designed to help you work smarter and streamline
            your daily life.
          </p>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconCircle, backgroundColor: "#dcfce7" }}>
            <PlayCircle color="#10b981" />
          </div>
          <h3 style={{ marginBottom: "10px" }}>Knowledge</h3>
          <p style={{ fontSize: "13px", color: "#64748b" }}>
            High-value insights and tech tips to help you absorb new information
            in minutes.
          </p>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconCircle, backgroundColor: "#fef3c7" }}>
            <BookOpen color="#f59e0b" />
          </div>
          <h3 style={{ marginBottom: "10px" }}>Mastery</h3>
          <p style={{ fontSize: "13px", color: "#64748b" }}>
            Structured roadmaps led by experts to take you from beginner to
            professional mastery.
          </p>
        </div>
      </div>

      <div style={styles.motivationContent}>
        <h2 style={styles.contentHeader}>
          Why MMUSA? Because You Deserve More.
        </h2>
        <p style={styles.contentText}>
          ကျွန်တော်တို့ MMUSA မှာရှိတဲ့ Apps တွေ၊ ဗီဒီယိုတွေနဲ့ သင်တန်းတွေဟာ
          ရိုးရိုး Digital ပစ္စည်းတွေတင် မဟုတ်ပါဘူး။ သင့်ဘဝရဲ့ တစ်နေရာရာမှာ
          မဖြစ်မနေ အထောက်အကူပြုပေးမယ့်{" "}
          <strong style={{ color: "#1e293b" }}>
            "ရင်းနှီးမြှုပ်နှံမှုတွေ"
          </strong>{" "}
          ဖြစ်ပါတယ်။
        </p>
        <p style={styles.contentText}>
          Think of MMUSA as your <strong>Personal Digital Toolkit</strong>.
          Whether it’s a skill you learn from a course or an app that helps you
          organize your business, MMUSA is right there with you, supporting your
          progress every step of the way.
        </p>
      </div>

      <div style={styles.finalQuote}>
        <p>
          "Don’t just watch the future happen —{" "}
          <strong style={{ color: "#1e293b" }}>Create it.</strong>"
        </p>
      </div>
    </div>
  );
};

const Portal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("apps");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedCourse, setSelectedCourse] = useState(null);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={styles.pageWrapper}>
      <header style={styles.header}>
        <h1 style={styles.logoText} onClick={() => navigate("/")}>
          <span style={{ color: "#dd7c15" }}>MM</span>
          <span style={{ color: "#3b82f6" }}>USA</span>
        </h1>
        <p style={styles.tagline}>
          <span
            style={{ color: "#dd7c15a1", fontSize: "15px", fontWeight: "Bold" }}
          >
            Digital
          </span>
          <span
            style={{ color: "#3b83f6a5", fontSize: "15px", fontWeight: "Bold" }}
          >
            {" "}
            Hub
          </span>
        </p>
      </header>

      {/* Navigation Tabs */}
      {!isMobile && (
        <nav style={styles.tabContainer}>
          <div style={styles.tabsWrapper}>
            <button
              onClick={() => setActiveTab("apps")}
              style={activeTab === "apps" ? styles.activeTab : styles.tab}
            >
              <LayoutGrid size={18} />
              <span>Apps</span>
            </button>
            <button
              onClick={() => setActiveTab("youtube")}
              style={activeTab === "youtube" ? styles.activeTab : styles.tab}
            >
              <Play size={18} />
              <span>YouTube</span>
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              style={activeTab === "courses" ? styles.activeTab : styles.tab}
            >
              <BookOpen size={18} />
              <span>Courses</span>
            </button>
            <button
              onClick={() => setActiveTab("about")}
              style={activeTab === "about" ? styles.activeTab : styles.tab}
            >
              <Info size={18} />
              <span>About</span>
            </button>
          </div>
        </nav>
      )}

      <main style={styles.mainContent}>
        {/* --- Applications Tab --- */}
        {activeTab === "apps" && (
          <div style={styles.gridContainer}>
            {apps.map((app, index) => (
              <AppCard key={index} data={app} />
            ))}
          </div>
        )}

        {/* 🌟 YouTube Tab 🌟 */}
        {activeTab === "youtube" &&
          youtubeCategories.map((cat) => (
            <div
              key={cat.title}
              style={{ width: "100%", marginBottom: "40px" }}
            >
              <h2
                style={{
                  color: "#1e293b",
                  marginBottom: "30px",
                  textAlign: "center", // အလယ်ပို့မယ်
                  width: "100%",
                  fontSize: "24px",
                  fontWeight: "800",
                }}
              >
                {cat.title}
              </h2>

              {/* 🌟 Grid Container ထဲမှာ VideoCard ကို ပြန်သုံးပါမယ် 🌟 */}
              <div style={styles.gridContainer}>
                {cat.channels.map((video) => (
                  <VideoCard key={video.embedId} video={video} /> // 👈 ဤနေရာတွင် ခေါ်သုံးလိုက်ပါပြီ
                ))}
              </div>
            </div>
          ))}

        {/* --- Courses Tab --- */}
        {activeTab === "courses" && (
          <div style={styles.gridContainer}>
            {courses.map((course, index) => (
              <CourseCard
                key={index}
                data={course}
                onEnroll={(data) => setSelectedCourse(data)}
              />
            ))}
          </div>
        )}
        {selectedCourse && (
          <CourseEnrollPage
            data={selectedCourse}
            onClose={() => setSelectedCourse(null)} // 🌟 ပိတ်လိုက်ရင် State ပြန်ရှင်းမယ်
          />
        )}

        {/* --- About Tab --- */}
        {activeTab === "about" && <AboutSection />}
      </main>

      <footer style={styles.footer}>
        <p>
          @{new Date().getFullYear()} MMUSA Platform. Built with ❤️ for Myanmar
        </p>
      </footer>

      {/* 📱 Mobile Bottom Navigation - ဖုန်းမှာပဲ ပေါ်ပါမယ် */}
      {isMobile && (
        <div style={styles.bottomNav}>
          <div
            style={styles.bottomNavItem}
            onClick={() => setActiveTab("apps")}
          >
            <LayoutGrid
              size={24}
              color={activeTab === "apps" ? "#2563eb" : "#64748b"}
            />
            <span
              style={{
                ...styles.bottomNavLabel,
                color: activeTab === "apps" ? "#2563eb" : "#64748b",
              }}
            >
              Apps
            </span>
          </div>
          <div
            style={styles.bottomNavItem}
            onClick={() => setActiveTab("youtube")}
          >
            <Play
              size={24}
              color={activeTab === "youtube" ? "#2563eb" : "#64748b"}
            />
            <span
              style={{
                ...styles.bottomNavLabel,
                color: activeTab === "youtube" ? "#2563eb" : "#64748b",
              }}
            >
              YouTube
            </span>
          </div>
          <div
            style={styles.bottomNavItem}
            onClick={() => setActiveTab("courses")}
          >
            <BookOpen
              size={24}
              color={activeTab === "courses" ? "#2563eb" : "#64748b"}
            />
            <span
              style={{
                ...styles.bottomNavLabel,
                color: activeTab === "courses" ? "#2563eb" : "#64748b",
              }}
            >
              Courses
            </span>
          </div>
          <div
            style={styles.bottomNavItem}
            onClick={() => setActiveTab("about")}
          >
            <Info
              size={24}
              color={activeTab === "about" ? "#2563eb" : "#64748b"}
            />
            <span
              style={{
                ...styles.bottomNavLabel,
                color: activeTab === "about" ? "#2563eb" : "#64748b",
              }}
            >
              About
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// --- App Card Component with Hover Effect ---
const AppCard = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const cardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // နှိပ်လိုက်တဲ့နေရာက ဒီ Card ရဲ့ အပြင်ဘက်ဖြစ်နေရင် ပိတ်မယ်
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    // Event နားထောင်မယ်
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Memory မစားအောင် ပြန်ဖြုတ်မယ်
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLaunchApp = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (data.url) {
      window.open(data.url, "_blank", "noopener,noreferrer");
    }
  };

  const toggleDescription = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      ref={cardRef}
      style={{
        ...styles.card,
        transform: hovered ? "translateY(-10px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        borderColor: hovered ? "#3b82f6" : "#e2e8f0",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleLaunchApp}
    >
      <div style={styles.imageContainer}>
        <img
          src={data.image}
          style={styles.cardImg}
          alt={data.title}
          onError={(e) => {
            if (
              e.target.src !==
              "https://via.placeholder.com/400x200?text=No+Image+Found"
            ) {
              e.target.src =
                "https://via.placeholder.com/400x200?text=No+Image+Found";
            }
          }}
        />

        <div style={styles.badgeContainer}>
          {data.isFree ? (
            <div style={styles.freeBadge}>FREE</div>
          ) : (
            <div style={styles.premiumBadge}>
              <Crown size={12} style={{ marginRight: "4px" }} /> PREMIUM
            </div>
          )}
        </div>

        <div style={{ ...styles.iconBadge, backgroundColor: data.color }}>
          {data.icon}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          style={{
            ...styles.favoriteBtn,
            backgroundColor: isFavorite
              ? "rgba(250, 204, 21, 0.9)"
              : "rgba(0,0,0,0.4)",
            boxShadow: isFavorite ? "0 0 10px rgba(250, 204, 21, 0.5)" : "none",
          }}
        >
          <Star
            size={18}
            fill={isFavorite ? "#fff" : "none"}
            stroke="#fff"
            strokeWidth={2}
          />
        </button>
      </div>

      <div style={styles.cardBody}>
        <h3 style={{ ...styles.cardTitle, color: data.color }}>{data.title}</h3>

        <p
          style={isExpanded ? styles.cardDescFull : styles.cardDesc}
          onClick={toggleDescription}
        >
          {data.desc || ""}
          {!isExpanded && data.desc?.length > 12 && (
            <span style={styles.readMoreText}> Read more...</span>
          )}
        </p>

        <button
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={handleLaunchApp}
          style={{
            ...styles.button,
            cursor: "pointer",
            position: "relative",
            zIndex: 100,
            border: "none",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none",
            transform: hovered ? "translateY(-3px)" : "translateY(0)",
            transition: "all 0.3s ease",
            boxShadow: hovered
              ? "0 8px 20px rgba(37, 99, 235, 0.4)"
              : "0 4px 15px rgba(37, 99, 235, 0.2)",
          }}
        >
          <span style={{ fontWeight: "700" }}>Launch App</span>
          <ArrowRight
            size={18}
            style={{
              marginLeft: "8px",
              transform: hovered ? "translateX(5px)" : "translateX(0)",
              transition: "transform 0.3s ease",
            }}
          />
        </button>
      </div>
    </div>
  );
};

// --- Course Card Component ---
const CourseCard = ({ data, onEnroll }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const cardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // နှိပ်လိုက်တဲ့နေရာက ဒီ Card ရဲ့ အပြင်ဘက်ဖြစ်နေရင် ပိတ်မယ်
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    // Event နားထောင်မယ်
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Memory မစားအောင် ပြန်ဖြုတ်မယ်
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDescription = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      ref={cardRef}
      style={{
        ...styles.courseCard,
        transform: hovered ? "translateY(-12px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 25px 30px -10px rgba(0, 0, 0, 0.15)"
          : "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
        borderColor: hovered ? "#10b981" : "#f1f5f9",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 🖼️ Image Section */}
      <div style={styles.courseImageContainer}>
        <img
          src={data.image}
          style={styles.courseImg}
          alt={data.title}
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/400x225?text=Course+Preview";
          }}
        />

        {/* Top Badges */}
        <div style={styles.courseBadgeContainer}>
          {data.isFree ? (
            <div style={styles.freeLabel}>FREE</div>
          ) : (
            <div style={styles.premiumLabel}>
              <Crown size={12} style={{ marginRight: "4px" }} /> PREMIUM
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          style={{
            ...styles.courseFavoriteBtn,
            backgroundColor: isFavorite ? "#10b981" : "rgba(255,255,255,0.9)",
            color: isFavorite ? "#fff" : "#64748b",
          }}
        >
          <Star size={16} fill={isFavorite ? "#fff" : "none"} />
        </button>

        {/* Bottom Image Info (Lessons Count) */}
        <div style={styles.lessonsOverlay}>
          <BookOpen size={14} style={{ marginRight: "5px" }} />
          {data.lessons} Lessons
        </div>

        <div style={styles.rightIconOverlay}>{data.icon}</div>
      </div>

      {/* 📄 Card Body */}
      <div style={styles.courseCardBody}>
        <h3
          style={{
            ...styles.courseTitle,
            color: hovered ? "#10b981" : "#1e293b",
          }}
        >
          {data.title}
        </h3>

        {/* Meta Row: Duration & Level */}
        <div style={styles.metaRow}>
          <div style={styles.metaItem}>
            <Clock size={14} style={{ marginRight: "4px" }} />
            <span>{data.duration}</span>
          </div>
          <div style={styles.metaItem}>
            <CheckCircle size={14} style={{ marginRight: "4px" }} />
            <span>{data.level}</span>
          </div>
        </div>

        <p
          style={isExpanded ? styles.courseDescFull : styles.courseDesc}
          onClick={toggleDescription}
        >
          {data.desc || "No course description is available yet."}
          {!isExpanded && data.desc?.length > 45 && (
            <span style={styles.readMoreGreen}> Read More...</span>
          )}
        </p>

        {/* Price & Action Row */}
        <div style={styles.footerRow}>
          <div style={styles.priceContainer}>
            <span
              style={{
                ...styles.priceValue,
                color: data.isFree ? "#f59e0b" : "#4f46e5",
              }}
            >
              {data.isFree ? (
                "Free"
              ) : (
                <>
                  {data.price}
                  <span style={styles.currencyText}>MMK</span>
                </>
              )}
            </span>
          </div>

          <button
            // 🌟 အရေးကြီးဆုံးအချက်- Link အစား onClick function ကို သုံးမယ်
            onClick={() => onEnroll(data)}
            style={{
              ...styles.viewBtn,
              backgroundColor: hovered ? "#059669" : "#10b981",
              // button ဖြစ်သွားတဲ့အတွက် default ဘောင်တွေကို ဖျောက်ဖို့ ဒါလေးတွေ ထည့်ပေးပါ
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <span>Enroll Now</span>
            <ArrowRight size={16} style={{ marginLeft: "6px" }} />
          </button>
        </div>
      </div>
    </div>
  );
};

const VideoCard = ({ video }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={styles.card}>
      {" "}
      {/* styles.videoCard အစား styles.card ကိုသုံးတာ ပိုညီပါတယ် */}
      <div
        style={{
          width: "100%",
          height: "180px",
          overflow: "hidden",
          borderRadius: "15px 15px 0 0",
        }}
      >
        <iframe
          width="100%"
          height="100%"
          // 🌟 ဤနေရာတွင် လမ်းကြောင်းကို အမှန်ပြင်လိုက်ပါပြီ
          src={`https://www.youtube.com/embed/${video.embedId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={video.name}
          style={{ border: "none" }}
        ></iframe>
      </div>
      <div style={styles.cardContent}>
        <h3 style={styles.cardTitle}>{video.name}</h3>

        {/* 🌟 Description - နှိပ်လိုက်ရင် အရှည်ကြီးဖြစ်သွားမယ် 🌟 */}
        <p
          style={isExpanded ? styles.cardDescFull : styles.cardDesc}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {video.desc || ""}
          {!isExpanded && video.desc?.length > 50 && (
            <span style={styles.readMoreText}> ...ဖတ်ရန်</span>
          )}
        </p>
      </div>
    </div>
  );
};

// --- Styles ---
const styles = {
  container: {
    width: "95%", // 🌟 ဖုန်းမှာ ဘေးဘောင်နည်းနည်းပဲ ချန်မယ်
    maxWidth: "800px",
    // minHeight: "100vh",
    height: "92vh",
    backgroundColor: "#f8fafc",
    borderRadius: "24px",
    color: "#1e293b",
    fontFamily: "'Inter', sans-serif",
    padding: "40px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", // Desktop အတွက် 320px က ပိုမှန်ပါတယ်
    gap: "30px",
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    justifyContent: "center",
    boxSizing: "border-box",
  },

  mainContent: {
    // 🌟 ဤ Style အသစ်ကို ထပ်ထည့်ပါ
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },

  pageWrapper: {
    width: "100%",
    minHeight: "100vh", // 🌟 height အစား minHeight သုံးမှ scroll ဆွဲလို့ရပါမည်
    backgroundColor: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: "120px", // Bottom Nav မဖုံးစေရန်
    boxSizing: "border-box",
    overflowX: "hidden", // 🌟 ဘေးတိုက် မပြတ်စေရန်
  },

  // 🌟 Mode ရွေးတဲ့ ကတ်တွေကို အပေါ်အောက် စီခိုင်းမယ် (FlexWrap သုံးမယ်)
  modeGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap", // 🌟 နေရာမလောက်ရင် အောက်ဆင်းသွားမယ်
    gap: "15px",
  },

  modeCard: {
    flex: "1 1 300px", // 🌟 အနည်းဆုံး 300px ယူမယ်၊ ဖုန်းမှာဆို အလိုလို stack ဖြစ်သွားမယ်
    padding: "20px",
    borderRadius: "20px",
    border: "2px solid #eee",
    cursor: "pointer",
    transition: "0.3s ease",
    boxSizing: "border-box",
  },

  header: {
    textAlign: "center",
    padding: "30px 15px 10px",
    width: "100%",
    boxSizing: "border-box",
  },

  logo: {
    fontSize: "42px",
    fontWeight: "900",
    letterSpacing: "-1px",
    margin: 0,
  },

  logoText: {
    fontSize: "36px",
    fontWeight: "900",
    margin: "0 0 5px 0",
    letterSpacing: "-0.5px",
  },

  tagline: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
    fontWeight: "600",
  },

  tabNav: {
    display: "flex",
    gap: "8px",
    backgroundColor: "#e2e8f0",
    padding: "6px",
    borderRadius: "100px",
    marginBottom: "50px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  navContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "0 20px",
    marginBottom: "30px",
  },

  tabsWrapper: {
    display: "flex",
    flexWrap: "nowrap", // 🌟 တစ်တန်းတည်း ဖြစ်စေရန် nowrap ပြောင်းပါ
    justifyContent: "center",
    gap: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: "8px",
    borderRadius: "20px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    width: "100%",
    maxWidth: "600px", // 🌟 ၄ ခုဆန့်အောင် width ချဲ့လိုက်ပါပြီ
  },

  tab: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "15px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    color: "#64748b",
    transition: "all 0.2s ease",
    flex: "1 1 auto", // တစ်ခုချင်းစီကို အချိုးကျ နေရာယူစေမယ်
    minWidth: "100px",
  },

  activeTab: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "15px",
    border: "none",
    backgroundColor: "#fff",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
    flex: "1 1 auto",
    minWidth: "100px",
  },
  content: { width: "100%", maxWidth: "1100px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    display: "flex", // 🌟 Card ကို Flex လုပ်မယ်
    flexDirection: "column", // 🌟 အပေါ်အောက် စီမယ်
    height: "100%", // 🌟 Card အမြင့်ကို အပြည့်ယူမယ်
    border: "1px solid #f1f5f9",
    width: "100%",
    boxSizing: "border-box",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    height: "190px",
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  favoriteBtn: {
    position: "absolute",
    top: "12px",
    left: "12px", // ညာဘက်မှာ Premium badge ရှိနိုင်လို့ ဘယ်ဘက်မှာ ထားပေးထားပါတယ်
    background: "rgba(0,0,0,0.3)",
    backdropFilter: "blur(5px)",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    padding: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    zIndex: 20,
  },
  cardContent: {
    padding: "15px 20px 20px",
    flex: 1,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // 🌟 Content အားလုံးကို အလယ်ပို့မယ်
    textAlign: "center", // 🌟 စာသားကို အလယ်ပို့မယ်
    justifyContent: "space-between",
  },
  imageContainer: {
    width: "100%",
    height: "160px",
    position: "relative",
    overflow: "hidden",
  },
  cardImg: { width: "100%", height: "100%", objectFit: "cover" },
  iconBadge: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
  cardBody: {
    padding: "20px",
    display: "flex", // 🌟 Body ကိုလည်း Flex လုပ်မယ်
    flexDirection: "column", // 🌟 အပေါ်အောက် စီမယ်
    flex: 1, // 🌟 ကျန်တဲ့နေရာအလွတ်တွေကို Body က ယူထားမယ်
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "800",
    lineHeight: "1.3",
    color: "#1e293b",
    marginBottom: "4px",
    textAlign: "center", // 🌟
  },
  cardDesc: {
    fontSize: "13px",
    padding: "0 10px",
    color: "#64748b",
    lineHeight: "1.5",
    margin: "0 0 20px 0",
    // textAlign: "center",
    // 🌟 ဤနေရာတွင် Min Height ထည့်ခြင်းဖြင့် စာတိုတိုရှည်ရှည် နေရာလွတ်တူသွားပါမယ်
    // 🌟 ၂ ကြောင်းစာ အမြင့်ကွက်တိဖြစ်အောင် 40px ပြောင်းလိုက်ပါ
    // (တွက်ချက်ပုံ - 13px * 1.5 line-height * 2 lines = 39px)
    minHeight: "40px",
    height: "40px",
    display: "-webkit-box",
    WebkitLineClamp: 2, // အများဆုံး 2 ကြောင်းပဲ ပြမယ်
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    cursor: "pointer",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "14px",
    backgroundColor: "#79c2f8",
    color: "#fff",
    textDecoration: "none",
    border: "none",
    fontWeight: "700",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "auto", // 🌟 ဤစာကြောင်းက ခလုတ်ကို အောက်ခြေမှာ အမြဲကပ်နေစေမှာပါ
    border: "none",
    transition: "all 0.2s ease",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  cardDescFull: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.5",
    margin: "0 0 20px 0",
    // textAlign: "center",
    cursor: "pointer",
    whiteSpace: "pre-wrap",
    padding: "0 10px", // 🌟 ပွင့်လာတဲ့အခါမှာလည်း ဘေးဘောင်နဲ့ မကပ်အောင် 10 px စီ ခွာမယ်
    transition: "all 0.3s ease",
  },

  readMoreText: {
    color: "#3b82f6",
    fontWeight: "600",
    fontSize: "13px",
  },

  launchBtnModern: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    background: "linear-gradient(135deg, #0f99e4a8 0%, #03a4fac2 100%)",
    color: "#fff",
    textDecoration: "none",
    padding: "14px 24px",
    borderRadius: "16px",
    fontSize: "15px",
    fontWeight: "700",
    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    marginTop: "auto",
    width: "100%", // Mobile မှာ အပြည့်ယူတာက ပိုနှိပ်လို့ကောင်းတယ်
    boxSizing: "border-box",
  },

  btnArrowWrapper: {
    display: "flex",
    alignItems: "center",
    transition: "transform 0.3s ease",
    // Hover လုပ်ရင် arrow လေးက ညာဘက်ကို တိုးသွားမယ် (CSS transform လိုအပ်ပါသည်)
  },
  launchLink: {
    fontSize: "14px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    marginTop: "auto",
  },
  priceTag: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#10b981",
    margin: "0 0 15px 0",
  },
  enrollBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
  },

  footer: {
    marginTop: "auto",
    // paddingTop: "60px",
    // paddingBottom: "20px",
    padding: "15px 20px",
    backgroundColor: "#fff",
    borderTop: "1px solid #f1f5f9",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
    width: "100%",
    display: "flex",
    flexDirection: "column", // 🌟 ဖုန်းမှာ အပေါ်အောက် စီမယ်
    gap: "15px",
  },

  checkoutBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap", // 🌟 ဈေးနှုန်းနဲ့ ခလုတ် မဆန့်ရင် အောက်ဆင်းမယ်
    gap: "10px",
  },

  tabContainer: {
    display: "flex",
    gap: "10px",
    overflowX: "auto", // 🌟 ဖုန်းမှာ ဘေးတိုက် scroll ဆွဲလို့ရအောင်
    whiteSpace: "nowrap",
    padding: "15px",
    width: "100%",
    maxWidth: "500px",
    boxSizing: "border-box",
    justifyContent: "center", // Desktop မှာ အလယ်ထားမယ်
    msOverflowStyle: "none", // IE/Edge scrollbar ဖျောက်မယ်
    scrollbarWidth: "none", // Firefox scrollbar ဖျောက်မယ်
    WebkitOverflowScrolling: "touch", // iOS မှာ ချောမွေ့အောင်
  },

  tabBtn: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    transition: "0.2s ease",
  },

  activeTabBtn: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "14px",
    border: "1px solid #3b82f6",
    backgroundColor: "#3b82f6",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
  },

  categoryTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: "20px",
    marginTop: "10px",
    textAlign: "center", // 🌟 စာသားကို အလယ်ပို့မယ်
    display: "flex",
    alignItems: "center",
    justifyContent: "center", // 🌟 အလယ်မှာ စုမယ်
    gap: "10px",
    borderBottom: "3px solid #3b82f6", // အောက်ခြေမှာ လိုင်းတိုလေး ထည့်မယ်
    width: "fit-content",
    margin: "0 auto 25px auto",
    paddingBottom: "5px",
  },
  videoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "30px",
  },
  videoCard: {
    backgroundColor: "#fff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
    border: "1px solid #f1f5f9",
    position: "relative", // 🌟 ဒါလေး ပါမှ Badge က card ထဲမှာပဲ နေမှာပါ
    display: "flex",
    flexDirection: "column",
    width: "100%",
    boxSizing: "border-box",
  },
  videoWrapper: {
    position: "relative",
    width: "100%",
    paddingTop: "56.25%", // 16:9 Aspect Ratio
    aspectRatio: "16/9",
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "15px",
    backgroundColor: "#000",
  },
  videoIframe: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "none",
  },
  videoTitle: {
    fontSize: "16px",
    fontWeight: "700",
    marginTop: "15px",
    marginBottom: "8px",
    color: "#1e293b",
    textAlign: "center", // 🌟 ဗီဒီယိုခေါင်းစဉ်ကို အလယ်ပို့ရန်
    padding: "0 10px",
  },
  videoDesc: { color: "#64748b", fontSize: "14px", lineHeight: "1.5" },

  badgeContainer: {
    position: "absolute",
    top: "12px",
    right: "12px",
    zIndex: 10,
  },
  freeBadge: {
    backgroundColor: "#10b981", // အစိမ်းရောင်
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: "800",
    boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)",
  },
  premiumBadge: {
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", // ရွှေရောင်
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 4px 10px rgba(245, 158, 11, 0.3)",
  },

  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    borderTop: "1px solid #e2e8f0",
    zIndex: 1000,
    paddingBottom: "env(safe-area-inset-bottom)", // iPhone တွေအတွက် နေရာချန်တာပါ
  },

  bottomNavItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
    flex: 1,
  },

  bottomNavLabel: {
    fontSize: "11px",
    fontWeight: "600",
  },

  content: {
    padding: "20px",
    paddingBottom: "100px", // အောက်ခြေ Menu က Content တွေကို မဖုံးသွားအောင် နေရာပိုချန်ရပါမယ်
    maxWidth: "1200px",
    margin: "0 auto",
  },

  courseCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    // maxWidth: "360px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
    border: "1px solid #f1f5f9",
    boxSizing: "border-box",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    marginTop: "auto",
  },
  courseImageContainer: {
    position: "relative",
    height: "180px",
    width: "100%",
    overflow: "hidden",
  },
  courseImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  courseBadgeContainer: {
    position: "absolute",
    top: "12px",
    right: "12px",
    display: "flex",
    gap: "8px",
  },
  premiumLabel: {
    backgroundColor: "#f59e0b",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  freeLabel: {
    backgroundColor: "#10b981",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "700",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  courseFavoriteBtn: {
    position: "absolute",
    top: "12px",
    left: "12px",
    border: "none",
    borderRadius: "10px",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  lessonsOverlay: {
    position: "absolute",
    bottom: "10px",
    left: "12px",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(4px)",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
  },
  courseCardBody: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  courseTitle: {
    fontSize: "18px",
    fontWeight: "700",
    margin: "0 0 10px 0",
    lineHeight: "1.4",
    transition: "color 0.3s ease",
  },
  metaRow: {
    display: "flex",
    gap: "15px",
    marginBottom: "12px",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    color: "#64748b",
    fontSize: "12px",
  },
  courseDesc: {
    fontSize: "13px",
    color: "#475569",
    lineHeight: "1.6",
    margin: "0 0 20px 0",
    cursor: "pointer",
    display: "-webkit-box",
    WebkitLineClamp: 2, // 🌟 အများဆုံး ၂ ကြောင်းပဲပြမယ်
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    whiteSpace: "pre-wrap",
    height: "42px", // 🌟 ဤနေရာတွင် height ကို ပုံသေထားလိုက်ပါ (Apps ကတ်အတိုင်း)
  },
  courseDescFull: {
    fontSize: "13px",
    color: "#475569",
    lineHeight: "1.6",
    margin: "0 0 20px 0",
    cursor: "pointer",
    whiteSpace: "pre-wrap",
  },
  rightIconOverlay: {
    position: "absolute",
    bottom: "10px",
    right: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(4px)",
    color: "#1e293b",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  readMoreGreen: {
    color: "#10b981",
    fontWeight: "600",
  },
  footerRow: {
    marginTop: "auto", // 🌟 ကျန်တဲ့နေရာလွတ်တွေကို အပေါ်ပို့ပြီး footer ကို အောက်ဆုံးတွန်းပို့မယ်
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "15px",
    borderTop: "1px solid #f1f5f9",
    width: "100%", // 🌟 အကျယ်အပြည့်ယူမယ်
  },
  priceValue: {
    fontSize: "14px", // 🌟 ဂဏန်း သို့မဟုတ် Free စာသားကို ၁၅ အထိ သေးလိုက်ပါပြီ
    fontWeight: "700",
    color: "#10b981",
    display: "flex",
    alignItems: "baseline", // ဂဏန်းနဲ့ MMK ကို ခြေဖျားချင်း ညီစေရန်
  },
  currencyText: {
    fontSize: "12px", // 🌟 MMK ကို ပိုသေးအောင် ၁၀ သတ်မှတ်လိုက်ပါပြီ
    fontWeight: "600",
    marginLeft: "5px",
    opacity: 0.8, // အရောင်ကို အနည်းငယ် မှိန်လိုက်ပါမယ်
  },
  viewBtn: {
    textDecoration: "none",
    color: "#fff",
    backgroundColor: "#10b981",
    // marginTop: "auto" ကို ဖြုတ်လိုက်ပါပြီ (ဘာလို့လဲဆိုတော့ footerRow မှာ ပါပြီးသားမို့လို့ပါ)
    padding: "10px 16px",
    borderRadius: "14px",
    border: "none",
    fontWeight: "700",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
    boxSizing: "border-box",
    transition: "background-color 0.3s ease",
  },
  aboutWrapper: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "40px 20px",
    textAlign: "center",
  },
  aboutHero: { marginBottom: "60px" },
  aboutMainTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1e293b",
    lineHeight: "1.2",
    marginBottom: "20px",
  },
  aboutSubTitle: {
    fontSize: "16px",
    color: "#64748b",
    lineHeight: "1.6",
    maxWidth: "700px",
    margin: "0 auto",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "60px",
  },
  statCard: {
    padding: "30px",
    backgroundColor: "#fff",
    borderRadius: "24px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    textAlign: "center",
  },
  iconCircle: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
  },
  motivationContent: {
    textAlign: "left",
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "30px",
    border: "1px solid #f1f5f9",
    marginBottom: "40px",
  },
  contentHeader: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "20px",
  },
  contentText: {
    fontSize: "15px",
    color: "#475569",
    lineHeight: "1.8",
    marginBottom: "20px",
  },
  finalQuote: {
    fontSize: "18px",
    color: "#3b82f6",
    fontStyle: "italic",
    marginTop: "40px",
  },
};

export default Portal;
