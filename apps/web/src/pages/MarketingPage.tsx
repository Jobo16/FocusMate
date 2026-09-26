import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  FileSearch,
  Layers3,
  Mic2,
  Monitor,
  Smartphone,
} from "lucide-react";
import { Brand } from "../components/Brand";
import { getWorkspaceHref } from "../site/siteSurface";

const steps = [
  {
    number: "01",
    icon: AudioLines,
    title: "记录",
    description: "从主动采集和手动导入开始，为每条资料标记来源与时间。",
  },
  {
    number: "02",
    icon: Layers3,
    title: "整理",
    description: "把原始素材、提取文字和推断分开，让每个结论都能追溯到证据。",
  },
  {
    number: "03",
    icon: FileSearch,
    title: "找回",
    description: "按问题、时间和来源查找过去的信息，并回到当时的原始片段。",
  },
];

const platforms = [
  { icon: Mic2, name: "网页", status: "录音预览中", detail: "主动开启的录音会话" },
  { icon: Monitor, name: "桌面", status: "规划中", detail: "长时间工作上下文" },
  { icon: Smartphone, name: "手机", status: "规划中", detail: "移动录音与内容导入" },
];

export const MarketingPage = () => {
  const workspaceHref = getWorkspaceHref();

  return (
    <div className="marketing-page">
      <header className="marketing-header">
        <Brand href="/" />
        <nav className="marketing-nav" aria-label="首页导航">
          <a href="#approach">产品思路</a>
          <a href="#platforms">三个端</a>
        </nav>
        <a className="button-primary marketing-header-action" href={workspaceHref}>
          进入工作台 <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </header>

      <main>
        <section className="marketing-hero">
          <div className="marketing-hero-copy">
            <p className="eyebrow text-forest">DAYMARK / PERSONAL CONTEXT</p>
            <h1>
              让每个重要片段，
              <span>都有迹可循。</span>
            </h1>
            <p className="marketing-lead">
              Daymark 希望将你授权记录的声音、画面和分享内容，整理成带时间与出处的个人上下文。
              需要的时候，找到资料，也找到它从何而来。
            </p>
            <div className="marketing-hero-actions">
              <a className="button-primary" href={workspaceHref}>
                进入网页工作台 <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="text-link" href="#approach">
                了解产品方向 <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
            <p className="marketing-availability">网页录音可预览 · 持久保存与 AI 历史检索仍在开发中</p>
          </div>

          <div className="marketing-hero-visual" aria-label="Daymark 产品方向示意">
            <div className="visual-heading">
              <span>DAYMARK / 001</span>
              <span>产品方向示意</span>
            </div>
            <div className="visual-statement">
              <span>Remember</span>
              <span>what matters.</span>
            </div>
            <div className="visual-flow" aria-hidden="true">
              <div><span>01</span><strong>授权记录</strong><small>CAPTURE</small></div>
              <div><span>02</span><strong>整理脉络</strong><small>ORGANIZE</small></div>
              <div><span>03</span><strong>回到证据</strong><small>RETRIEVE</small></div>
            </div>
          </div>
        </section>

        <section className="marketing-section" id="approach">
          <div className="section-heading">
            <p className="eyebrow text-forest">A PLACE FOR CONTEXT</p>
            <h2>从发生，到可找回。</h2>
            <p>Daymark 围绕一条简单的路径构建：记录真实来源，保留处理过程，让检索结果可以核对。</p>
          </div>
          <div className="step-grid">
            {steps.map(({ number, icon: Icon, title, description }) => (
              <article className="step-block" key={number}>
                <div className="step-top">
                  <span>{number}</span>
                  <Icon size={24} strokeWidth={1.7} aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="platform-section" id="platforms">
          <div>
            <p className="eyebrow text-forest">ONE IDEA, THREE SURFACES</p>
            <h2>先从网页开始，<br />走向每个日常场景。</h2>
            <p>每个端按照真实的平台能力交付，共用一致的资料与证据规则。</p>
          </div>
          <div className="platform-list">
            {platforms.map(({ icon: Icon, name, status, detail }) => (
              <div className="platform-row" key={name}>
                <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                <div><strong>{name}</strong><span>{detail}</span></div>
                <small>{status}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="marketing-closing">
          <div>
            <p className="eyebrow">START WITH THE WEB</p>
            <h2>从现在的片段开始。</h2>
            <p>打开网页工作台，体验录音预览，了解历史检索的下一步。</p>
          </div>
          <a className="button-light" href={workspaceHref}>
            打开工作台 <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </section>
      </main>

      <footer className="marketing-footer">
        <Brand href="/" />
        <p>Daymark · 个人上下文，始于每一个当下。</p>
        <span>© {new Date().getFullYear()} Daymark</span>
      </footer>
    </div>
  );
};
