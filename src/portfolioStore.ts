// ─── Pure Cloudflare D1 & R2 Portfolio Store ────────────────────────────────

export interface SkillCategory {
  category: string;
  icon: string;  // 'Layout' | 'Server' | 'Cpu' | 'Code2' | 'Globe' | 'Award'
  skills: string[];
}

export interface EducationEntry {
  title: string;
  institution: string;
  period: string;
  description: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface SkillProgressEntry {
  name: string;
  percentage: number;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface HeroStats {
  label1: string;  // e.g. "B.Sc. CSE (Running)"
  label2: string;  // e.g. "Full-Stack & Mobile"
  label3: string;  // e.g. "Available for Hire"
}

export interface HeroCard {
  title: string;
  description: string;
  icon: string;  // 'Award' | 'Terminal' | 'Cpu' | 'Layout' | 'Server'
}

export interface ProjectEntry {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  liveUrl: string;
  githubUrl: string;
  category: string;
}

export interface VentureEntry {
  id: string;
  name: string;
  role: string;          // e.g. "Founder & CEO"
  description: string;
  imageUrl: string;      // company logo or photo
  websiteUrl?: string;
  category?: string;     // e.g. "Tech & Software" | "Creative & Media"
  period?: string;       // e.g. "2024 — Present"
}

export interface ModelingOrganization {
  id: string;
  name: string;
  campaignTitle: string; // e.g. "Autumn/Winter Editorial Showcase"
  role: string;          // e.g. "Featured Runway & Editorial Model"
  year: string;
  imageUrl?: string;
  linkUrl?: string;
  category?: string;     // e.g. "Fashion Brand" | "Commercial" | "Magazine"
}

export interface ModelingPhoto {
  id: string;
  title: string;
  category: string;      // e.g. "Editorial" | "Commercial" | "Runway" | "Lookbook"
  imageUrl: string;
  photographer?: string;
  year?: string;
}

export interface PortfolioData {
  // Profile
  name: string;
  role: string;
  subRole: string;
  bio: string;
  email: string;
  phone?: string;
  location: string;
  cvUrl: string;
  avatarUrl: string;

  // Social Links
  socials: {
    github: string;
    linkedin: string;
    facebook: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };

  // Hero Section Editable Content
  heroStatusBadge: string;
  heroSubHeading: string;
  heroStats: HeroStats;
  heroCards: HeroCard[];

  // Typewriter terminal text
  terminalText: string;

  // Skills Section
  skillsSectionTitle: string;
  skillsSectionSubtitle: string;
  skillCategories: SkillCategory[];
  skillPercentages?: SkillProgressEntry[];

  // Resume / Timeline Section
  experienceSectionTitle: string;
  educations?: EducationEntry[];
  experiences: ExperienceEntry[];

  // FAQ Section
  faqSectionTitle: string;
  faqSectionSubtitle: string;
  faqs: FaqEntry[];

  // Projects
  projects: ProjectEntry[];

  // Ventures / Entrepreneurship (Showcased on Homepage)
  ventures?: VentureEntry[];

  // Modeling & Fashion (Showcased on dedicated Modeling Page)
  modelingOrganizations?: ModelingOrganization[];
  modelingPhotos?: ModelingPhoto[];
}

// ─── Default Data ───────────────────────────────────────────────────

export const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  name: "MD. SHORON HOSSEN",
  role: "Full-Stack Developer",
  subRole: "Mobile & Web Applications · Backend Systems & AI Solutions",
  bio: "Motivated Computer Science student and full-stack developer with experience in building scalable mobile and web applications. Strong interest in healthcare technology, backend systems, cloud infrastructure, and AI-driven solutions. Seeking opportunities to apply technical skills in real-world projects and professional environments.",
  email: "meshoron53@gmail.com",
  phone: "01888668396",
  location: "330, West Shewrapara, Dhaka, Bangladesh",
  cvUrl: "",
  avatarUrl: "/developer_portrait.png",

  socials: {
    github: "https://github.com/Shoron-hossen",
    linkedin: "https://linkedin.com/in/shoron-hossen",
    facebook: "https://facebook.com/shoron.hossen",
    instagram: "https://instagram.com/shoron.hossen",
    twitter: "",
    youtube: ""
  },

  heroStatusBadge: "Full-Stack Developer & CS Student",
  heroSubHeading: "Building Scalable Mobile & Web Applications · Backend & AI Solutions",

  heroStats: {
    label1: "B.Sc. CSE (Running)",
    label2: "Full-Stack & Mobile",
    label3: "Available for Hire"
  },

  heroCards: [
    {
      title: "Mobile App Development",
      description: "Building responsive, cross-platform mobile apps using Flutter and Dart with real-time API integrations and clean state management.",
      icon: "Layout"
    },
    {
      title: "Backend & Systems",
      description: "Architecting reliable server services, database models, and secure RESTful endpoints with Java, Spring Boot, Python, and FastAPI.",
      icon: "Server"
    },
    {
      title: "Databases & AI Solutions",
      description: "Managing databases with MySQL & MongoDB, CI/CD with Git & GitHub, and integrating OpenAI & modern AI APIs into real-world apps.",
      icon: "Cpu"
    }
  ],

  terminalText: "shoron@workspace:~$ flutter run && ./mvnw spring-boot:run # Systems ready & running",

  skillsSectionTitle: "Skills & Technical Stack",
  skillsSectionSubtitle: "Languages, frameworks, databases, and engineering tools applied in production",
  skillCategories: [
    {
      category: "Programming Languages",
      icon: "Code2",
      skills: ["Dart", "Java", "Python", "Kotlin", "JavaScript", "TypeScript"]
    },
    {
      category: "Frameworks & Backend",
      icon: "Server",
      skills: ["Flutter", "Spring Boot", "FastAPI", "Node.js"]
    },
    {
      category: "Frontend Technologies",
      icon: "Layout",
      skills: ["React", "HTML5", "CSS3", "Tailwind CSS"]
    },
    {
      category: "Databases",
      icon: "Cpu",
      skills: ["MySQL", "MongoDB", "Cloudflare D1"]
    },
    {
      category: "Version Control & Cloud",
      icon: "Globe",
      skills: ["Git", "GitHub", "Cloudflare Pages", "Cloudflare R2"]
    },
    {
      category: "Productivity Tools",
      icon: "Award",
      skills: ["Microsoft Office", "Google Workspace", "Postman", "Figma"]
    }
  ],
  skillPercentages: [
    { name: "Flutter & Dart (Mobile App Development)", percentage: 90 },
    { name: "Java & Spring Boot (Backend Architecture)", percentage: 85 },
    { name: "Python & FastAPI (REST APIs & Cloud Services)", percentage: 80 },
    { name: "Web Development (React, TypeScript, HTML5 & Tailwind CSS)", percentage: 85 },
    { name: "Database Engineering (MySQL, MongoDB & Cloudflare D1)", percentage: 80 },
    { name: "Git, GitHub & Cloudflare Infrastructure", percentage: 85 }
  ],

  experienceSectionTitle: "Resume",
  educations: [
    {
      title: "B.Sc. in Computer Science and Engineering",
      institution: "Green University of Bangladesh, Dhaka",
      period: "2022 — Present",
      description: "Pursuing undergraduate degree in Computer Science and Engineering. Active focus on full-stack web and mobile development, backend systems, and AI-driven applications."
    },
    {
      title: "Higher Secondary Certificate (HSC) — Science",
      institution: "Govt. Science College, Dhaka",
      period: "2019 — 2021",
      description: "Completed higher secondary education in Science stream with deep foundations in Mathematics, Physics, and Computer Studies."
    }
  ],
  experiences: [
    {
      title: "Java Developer & WordPress Developer",
      company: "Ingoude Company",
      period: "2023 — Present",
      description: "Developed backend applications using Java and Spring Boot. Built and customized WordPress websites for clients on freelance platforms like Fiverr and Upwork, delivering projects remotely."
    },
    {
      title: "Full-Stack Software Developer",
      company: "Freelance & Remote Projects",
      period: "2021 — 2023",
      description: "Engineered responsive full-stack web applications and cross-platform mobile apps using Flutter, React, TypeScript, and Node.js. Optimized database queries and delivered client-facing features with high reliability."
    }
  ],

  faqSectionTitle: "Frequently Asked Questions",
  faqSectionSubtitle: "Answers regarding background, skills, languages, and collaboration",
  faqs: [
    {
      question: "What is your primary technology stack?",
      answer: "I specialize in full-stack mobile and web development. My core technologies include Flutter & Dart for cross-platform mobile apps, Java (Spring Boot) and Python (FastAPI) for scalable backend systems, along with React, Tailwind CSS, MySQL, MongoDB, and Cloudflare services."
    },
    {
      question: "What is your educational background?",
      answer: "I am currently pursuing a B.Sc. in Computer Science and Engineering at Green University of Bangladesh, Dhaka, focusing on software engineering, cloud infrastructure, and AI-driven solutions."
    },
    {
      question: "What languages do you communicate in?",
      answer: "Bangla is my native language, and I have advanced proficiency in English, enabling seamless remote communication with international clients and engineering teams."
    },
    {
      question: "What was your role at Ingoude Company?",
      answer: "As a Java Developer & WordPress Developer, I developed backend applications using Java and Spring Boot, built and customized WordPress websites, and delivered client projects remotely via Fiverr and Upwork."
    },
    {
      question: "How can I contact you for opportunities or freelance work?",
      answer: "You can reach me directly via email at meshoron53@gmail.com, call 01888668396, or connect with me through GitHub (github.com/Shoron-hossen) and LinkedIn. My location is 330, West Shewrapara, Dhaka, Bangladesh."
    }
  ],

  projects: [
    {
      id: "p1",
      title: "Enterprise Mobile Healthcare Suite",
      subtitle: "Telemedicine & Patient Care",
      description: "Cross-platform mobile application providing real-time doctor consultations, secure medical record encryption, and prescription delivery management.",
      technologies: ["Flutter", "Dart", "Spring Boot", "MySQL", "WebSockets"],
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000",
      liveUrl: "https://shoron-blog.netlify.app",
      githubUrl: "https://github.com/Shoron-hossen",
      category: "Full Stack"
    },
    {
      id: "p2",
      title: "Cloud Infrastructure Analytics",
      subtitle: "Data Monitoring Platform",
      description: "Real-time system telemetry and metrics dashboard with responsive data charts, role-based authentication, and server status alerting.",
      technologies: ["React", "TypeScript", "Chart.js", "Node.js", "Tailwind CSS"],
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000",
      liveUrl: "https://shoron-blog.netlify.app",
      githubUrl: "https://github.com/Shoron-hossen",
      category: "Frontend"
    },
    {
      id: "p3",
      title: "Distributed Background Job Queue",
      subtitle: "Backend Service Architecture",
      description: "Resilient worker service handling asynchronous task execution, automated retries, and high-throughput job scheduling with Redis and Node.js.",
      technologies: ["Node.js", "Express", "Redis", "Docker", "PostgreSQL"],
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000",
      liveUrl: "https://shoron-blog.netlify.app",
      githubUrl: "https://github.com/Shoron-hossen",
      category: "Backend"
    },
    {
      id: "p4",
      title: "Engineer Portfolio & Cloud CMS",
      subtitle: "Personal Web Platform",
      description: "A fast, SEO-optimized portfolio and content management system powered by Cloudflare D1 database and Cloudflare R2 media storage.",
      technologies: ["React", "TypeScript", "Cloudflare D1", "Cloudflare R2", "Tailwind CSS"],
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000",
      liveUrl: "https://shoron-blog.netlify.app",
      githubUrl: "https://github.com/Shoron-hossen",
      category: "Full Stack"
    }
  ],

  ventures: [
    {
      id: "v1",
      name: "Nexus Web Solutions",
      role: "Founder & Technical Lead",
      description: "Digital engineering agency specializing in high-performance web applications, enterprise software architectures, and automated cloud workflows.",
      imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000",
      websiteUrl: "https://shoron-blog.netlify.app",
      category: "Tech & Software",
      period: "2024 — Present"
    },
    {
      id: "v2",
      name: "Aura Creative Studio",
      role: "Co-Founder & Creative Director",
      description: "Brand management collective focused on modern aesthetic storytelling, commercial lookbooks, and high-impact media production.",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000",
      websiteUrl: "https://shoron-blog.netlify.app",
      category: "Creative & Media",
      period: "2023 — Present"
    }
  ],

  modelingOrganizations: [
    {
      id: "m1",
      name: "Vogue Runway Collective",
      campaignTitle: "Autumn/Winter Editorial Showcase",
      role: "Featured Runway & Editorial Model",
      year: "2024",
      imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000",
      linkUrl: "https://shoron-blog.netlify.app",
      category: "Fashion Brand"
    },
    {
      id: "m2",
      name: "Urban Lifestyle Apparel",
      campaignTitle: "Contemporary Streetwear Lookbook",
      role: "Brand Ambassador & Commercial Model",
      year: "2024",
      imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000",
      linkUrl: "https://shoron-blog.netlify.app",
      category: "Commercial Brand"
    },
    {
      id: "m3",
      name: "Monochrome Fashion Magazine",
      campaignTitle: "High-Contrast Studio Portrait Series",
      role: "Cover Model & Editorial Feature",
      year: "2023",
      imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000",
      linkUrl: "https://shoron-blog.netlify.app",
      category: "Editorial Magazine"
    }
  ],

  modelingPhotos: [
    {
      id: "mp1",
      title: "Crimson Velvet Studio Session",
      category: "Editorial",
      imageUrl: "/developer_portrait.png",
      photographer: "Studio Lightworks",
      year: "2024"
    },
    {
      id: "mp2",
      title: "Urban Minimalist Series",
      category: "Commercial",
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000",
      photographer: "Aura Creative",
      year: "2024"
    },
    {
      id: "mp3",
      title: "High Fashion Monochrome",
      category: "Runway",
      imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000",
      photographer: "Vogue Collective",
      year: "2023"
    },
    {
      id: "mp4",
      title: "Golden Hour Exterior Shoot",
      category: "Lookbook",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000",
      photographer: "Horizon Visions",
      year: "2024"
    }
  ]
};

// ─── Cloudflare D1 Persistence Layer ────────────────────────────────

const LOCAL_STORAGE_KEY = "shoron_portfolio_data_v6";

export class PortfolioStore {
  static getLocal(): PortfolioData {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) {
      // Check for legacy v5 key
      const legacy = localStorage.getItem("shoron_portfolio_data_v5") || localStorage.getItem("shoron_portfolio_data_v4");
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          const migrated: PortfolioData = { ...DEFAULT_PORTFOLIO_DATA, ...parsed };
          if (!migrated.educations || migrated.educations.length === 0) {
            migrated.educations = DEFAULT_PORTFOLIO_DATA.educations;
          }
          if (!migrated.skillPercentages || migrated.skillPercentages.length === 0) {
            migrated.skillPercentages = DEFAULT_PORTFOLIO_DATA.skillPercentages;
          }
          if (!migrated.ventures || migrated.ventures.length === 0) {
            migrated.ventures = DEFAULT_PORTFOLIO_DATA.ventures;
          }
          if (!migrated.modelingOrganizations || migrated.modelingOrganizations.length === 0) {
            migrated.modelingOrganizations = DEFAULT_PORTFOLIO_DATA.modelingOrganizations;
          }
          if (!migrated.modelingPhotos || migrated.modelingPhotos.length === 0) {
            migrated.modelingPhotos = DEFAULT_PORTFOLIO_DATA.modelingPhotos;
          }
          this.setLocal(migrated);
          return migrated;
        } catch {}
      }
      return DEFAULT_PORTFOLIO_DATA;
    }

    try {
      const parsed = JSON.parse(saved);
      const merged: PortfolioData = { ...DEFAULT_PORTFOLIO_DATA, ...parsed };
      if (!merged.educations || merged.educations.length === 0) {
        merged.educations = DEFAULT_PORTFOLIO_DATA.educations;
      }
      if (!merged.skillPercentages || merged.skillPercentages.length === 0) {
        merged.skillPercentages = DEFAULT_PORTFOLIO_DATA.skillPercentages;
      }
      if (!merged.ventures || merged.ventures.length === 0) {
        merged.ventures = DEFAULT_PORTFOLIO_DATA.ventures;
      }
      if (!merged.modelingOrganizations || merged.modelingOrganizations.length === 0) {
        merged.modelingOrganizations = DEFAULT_PORTFOLIO_DATA.modelingOrganizations;
      }
      if (!merged.modelingPhotos || merged.modelingPhotos.length === 0) {
        merged.modelingPhotos = DEFAULT_PORTFOLIO_DATA.modelingPhotos;
      }
      return merged;
    } catch {
      return DEFAULT_PORTFOLIO_DATA;
    }
  }

  static setLocal(data: PortfolioData) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }

  // Subscribe to Cloudflare D1 database changes with local caching
  static subscribeToData(callback: (data: PortfolioData) => void): () => void {
    let active = true;
    // Deliver local cached data immediately for instant response
    callback(this.getLocal());

    // Fetch authoritative data from Cloudflare D1
    const loadFromD1 = async () => {
      try {
        let res = await fetch('/api/portfolio').catch(() => null);
        if (!res || !res.ok) {
          res = await fetch('https://shoron-portfolio.pages.dev/api/portfolio').catch(() => null);
        }

        if (res && res.ok && active) {
          const json = await res.json();
          if (json && json.exists && json.data) {
            const merged: PortfolioData = { ...DEFAULT_PORTFOLIO_DATA, ...json.data };
            if (!merged.educations || merged.educations.length === 0) {
              merged.educations = DEFAULT_PORTFOLIO_DATA.educations;
            }
            if (!merged.skillPercentages || merged.skillPercentages.length === 0) {
              merged.skillPercentages = DEFAULT_PORTFOLIO_DATA.skillPercentages;
            }
            if (!merged.ventures || merged.ventures.length === 0) {
              merged.ventures = DEFAULT_PORTFOLIO_DATA.ventures;
            }
            if (!merged.modelingOrganizations || merged.modelingOrganizations.length === 0) {
              merged.modelingOrganizations = DEFAULT_PORTFOLIO_DATA.modelingOrganizations;
            }
            if (!merged.modelingPhotos || merged.modelingPhotos.length === 0) {
              merged.modelingPhotos = DEFAULT_PORTFOLIO_DATA.modelingPhotos;
            }
            this.setLocal(merged);
            callback(merged);
          }
        }
      } catch (err) {
        console.warn("Could not load from Cloudflare D1:", err);
      }
    };

    loadFromD1();
    return () => { active = false; };
  }

  // Save data to Cloudflare D1 and sync local storage
  static async saveData(data: PortfolioData): Promise<boolean> {
    this.setLocal(data);

    try {
      let res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('https://shoron-portfolio.pages.dev/api/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).catch(() => null);
      }

      if (res && res.ok) {
        return true;
      }
    } catch (e) {
      console.warn("Could not save to Cloudflare D1, saved locally:", e);
    }
    return true;
  }

  static async resetToDefaults(): Promise<PortfolioData> {
    this.setLocal(DEFAULT_PORTFOLIO_DATA);
    await this.saveData(DEFAULT_PORTFOLIO_DATA);
    return DEFAULT_PORTFOLIO_DATA;
  }
}

export const CloudflarePortfolioStore = PortfolioStore;
