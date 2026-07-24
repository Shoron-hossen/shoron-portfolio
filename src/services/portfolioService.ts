export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription?: string;
  category: 'Full Stack' | 'Frontend' | 'Backend' | 'Mobile' | 'AI / Machine Learning';
  technologies: string[];
  imageUrl: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  createdAt: number;
}

export interface PersonalInfo {
  name: string;
  role: string;
  subRole: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl: string;
  cvUrl: string;
  socials: {
    github: string;
    linkedin: string;
    twitter: string;
    facebook: string;
    website: string;
  };
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export const INITIAL_PERSONAL_INFO: PersonalInfo = {
  name: "Shoron Hossen",
  role: "Full-Stack Web Developer & Software Engineer",
  subRole: "Specialized in React, Next.js, Node.js & Modern Cloud Applications",
  bio: "Passionate Full-Stack Developer with expertise in crafting responsive, scalable, and visually compelling web applications. Proficient in React, Next.js, Node.js, TypeScript, TailwindCSS, and cloud solutions.",
  email: "shoron.hossen@gmail.com",
  phone: "+880 1700 000000",
  location: "Dhaka, Bangladesh",
  avatarUrl: "https://shoron-blog.netlify.app/developer_portrait.png",
  cvUrl: "https://shoron-blog.netlify.app/cv.pdf",
  socials: {
    github: "https://github.com/Shoron-hossen",
    linkedin: "https://linkedin.com/in/shoron-hossen",
    twitter: "https://twitter.com/shoron_hossen",
    facebook: "https://facebook.com/shoron.hossen",
    website: "https://shoron-blog.netlify.app"
  }
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    title: "Shoron Blog & Tech Portfolio",
    subtitle: "Personal Full-Stack Developer Hub & Technical Blog",
    description: "A sleek, feature-packed portfolio and interactive blog built to showcase web projects, code snippets, and technical articles with clean dark mode UI.",
    longDescription: "Built with high performance in mind, integrating dynamic content management, smooth visual animations, fast PDF resume downloading, and comprehensive project showcases.",
    category: "Full Stack",
    technologies: ["React", "TypeScript", "TailwindCSS", "Node.js", "Netlify"],
    imageUrl: "/developer_portrait.png",
    liveUrl: "https://shoron-blog.netlify.app",
    githubUrl: "https://github.com/Shoron-hossen/shoron-portfolio",
    featured: true,
    createdAt: Date.now() - 1000000
  },
  {
    id: "proj-2",
    title: "Enterprise SaaS Analytics Dashboard",
    subtitle: "Real-time Metrics & Insights Engine",
    description: "High-throughput analytics platform providing live metric visualization, user behavior tracking, and automated custom report generation.",
    category: "Full Stack",
    technologies: ["React 19", "Next.js", "Node.js", "PostgreSQL", "WebSockets"],
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
    liveUrl: "https://shoron-blog.netlify.app",
    githubUrl: "https://github.com/Shoron-hossen",
    featured: true,
    createdAt: Date.now() - 2000000
  },
  {
    id: "proj-3",
    title: "AI Code Assistant & Playground",
    subtitle: "Interactive Code Generation & Optimization",
    description: "Developer tool harnessing AI for instant code refactoring, bug diagnosis, auto-completion, and live syntax highlighting in over 20 programming languages.",
    category: "AI / Machine Learning",
    technologies: ["TypeScript", "Python", "OpenAI API", "React", "Docker"],
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
    liveUrl: "https://shoron-blog.netlify.app",
    githubUrl: "https://github.com/Shoron-hossen",
    featured: true,
    createdAt: Date.now() - 3000000
  }
];

const LOCAL_STORAGE_PROJECTS_KEY = "shoron_portfolio_projects_data";
const LOCAL_STORAGE_INFO_KEY = "shoron_portfolio_info_data";

export class PortfolioService {
  static getProjects(): Project[] {
    const data = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_PROJECTS;
    }
  }

  static saveProjects(projects: Project[]) {
    localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  }

  static addProject(project: Omit<Project, 'id' | 'createdAt'>): Project {
    const current = this.getProjects();
    const newProj: Project = {
      ...project,
      id: 'proj-' + Date.now(),
      createdAt: Date.now()
    };
    const updated = [newProj, ...current];
    this.saveProjects(updated);
    return newProj;
  }

  static updateProject(id: string, updatedFields: Partial<Project>) {
    const current = this.getProjects();
    const updated = current.map(p => p.id === id ? { ...p, ...updatedFields } : p);
    this.saveProjects(updated);
  }

  static deleteProject(id: string) {
    const current = this.getProjects();
    const updated = current.filter(p => p.id !== id);
    this.saveProjects(updated);
  }

  static getPersonalInfo(): PersonalInfo {
    const data = localStorage.getItem(LOCAL_STORAGE_INFO_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_INFO_KEY, JSON.stringify(INITIAL_PERSONAL_INFO));
      return INITIAL_PERSONAL_INFO;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_PERSONAL_INFO;
    }
  }

  static savePersonalInfo(info: PersonalInfo) {
    localStorage.setItem(LOCAL_STORAGE_INFO_KEY, JSON.stringify(info));
  }
}
