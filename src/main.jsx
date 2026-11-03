import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowUpRight, Code2, Mail, MessageCircle, Palette, X } from 'lucide-react';
import './styles.css';
import LabInvitation from './LabInvitation';
import BirdCompanion from './BirdCompanion';
import { skillCount, skillGroups } from './skills';
import { GitHubMark, InstagramMark, LinkedInMark } from './BrandIcons';

const productWork = [
  { index: '01', title: 'Ezypark', kind: 'Product concept', description: 'An automated vehicle parking-slot allocation system designed to make everyday parking more predictable and less frustrating.', tags: ['Product design', 'Systems thinking', 'Prototype'], tone: 'lime', mark: <>ezy<br />park.</> },
  { index: '02', title: 'Bird Blash', kind: 'Interactive build', description: 'A children’s mini game published on the Play Store under Exult Developers, built around simple rules, quick feedback and replayability.', tags: ['Game logic', 'Interaction', 'Creative code'], tone: 'violet', mark: <>bird<br />blash!</> },
  { index: '03', title: 'Community systems', kind: 'Design + leadership', description: 'Visual systems and digital experiences created while leading and contributing across GDSC, IEEE, TinkerHub and IEDC communities.', tags: ['Design systems', 'Community', 'Frontend'], tone: 'coral', mark: <>people<br />× systems.</> }
];

const designWork = [
  { title:'Magazine Launch', category:'Campaign', year:'2022', src:'/legacy-assets/work-1.png' },
  { title:'Magazine Launch Print', category:'Print', year:'2022', src:'/legacy-assets/work-2.png' },
  { title:'IEEE CS Kerala Website Launch', category:'Campaign', year:'2018', src:'/legacy-assets/WEBSITE.png' },
  { title:'Vertualis Winners', category:'Campaign', year:'2018', src:'/legacy-assets/VERTUALIS.png' },
  { title:'AKCSSC Thanksgiving', category:'Campaign', year:'2022', src:'/legacy-assets/akcssc/vishnu.png' },
  { title:'Hridayam', category:'Campaign', year:'2017', src:'/legacy-assets/sfi/whe.png' },
  { title:'Ayyankali Day', category:'Editorial', year:'2021', src:'/legacy-assets/sfi/ayan.png' },
  { title:'Clara Zetkin Day', category:'Editorial', year:'2021', src:'/legacy-assets/sfi/clara.jpg' },
  { title:'Danish Siddiqui Tribute', category:'Editorial', year:'2021', src:'/legacy-assets/sfi/s28.jpg' },
  { title:'Bhagat Singh Martyr’s Day', category:'Editorial', year:'2021', src:'/legacy-assets/sfi/bhakath.png' },
  { title:'Martyrs’ Day', category:'Editorial', year:'2021', src:'/legacy-assets/sfi/mart.png' },
  { title:'Children’s Day', category:'Editorial', year:'2021', src:'/legacy-assets/sfi/child.png' },
  { title:'College IV Motion', category:'Motion', year:'2022', src:'/legacy-assets/C02.mp4', type:'video' },
  { title:'Xanthronz Identity', category:'Identity', year:'2021', src:'/legacy-assets/other/xanthronz.png' },
  { title:'Poster Design Winner', category:'Campaign', year:'2022', src:'/legacy-assets/other/iedsq.png', full:'/legacy-assets/other/ied.png' },
  { title:'College Band Promo', category:'Campaign', year:'2022', src:'/legacy-assets/other/mussq.png', full:'/legacy-assets/other/mus.png' },
  { title:'AKCSSC Theme Exploration', category:'Identity', year:'2022', src:'/legacy-assets/akcssc/reg.png' },
  { title:'AKCSSC Theme System', category:'Identity', year:'2022', src:'/legacy-assets/akcssc/akhost.png' },
  { title:'Registration Open', category:'Campaign', year:'2022', src:'/legacy-assets/akcssc/rego.png' },
  { title:'Treasure Hunt', category:'Campaign', year:'2022', src:'/legacy-assets/akcssc/th.png' },
  { title:'Nature Walk', category:'Campaign', year:'2022', src:'/legacy-assets/akcssc/pine.png' },
  { title:'Liquify Art', category:'Experimental', year:'2022', src:'/legacy-assets/other/myself.png' },
  { title:'Cap Design', category:'Merchandise', year:'2022', src:'/legacy-assets/other/cap.png' },
  { title:'Keychain Design', category:'Merchandise', year:'2022', src:'/legacy-assets/other/keysq.png', full:'/legacy-assets/other/key.png' },
  { title:'Women’s Day', category:'Community', year:'2022', src:'/legacy-assets/club/women.png' },
  { title:'Fitness Motivation', category:'Campaign', year:'2022', src:'/legacy-assets/other/gym.png' },
  { title:'GDSC Seminar', category:'Community', year:'2022', src:'/legacy-assets/club/learn.png' },
  { title:'GDSC Talk Session', category:'Community', year:'2022', src:'/legacy-assets/club/talksq.png', full:'/legacy-assets/club/talk.png' },
  { title:'Fitness Club', category:'Identity', year:'2022', src:'/legacy-assets/other/flexsq.png', full:'/legacy-assets/other/flex.jpg' },
  { title:'IEDC Fest Certificate', category:'Print', year:'2022', src:'/legacy-assets/club/iedcsq.png', full:'/legacy-assets/club/iedc.jpg' },
  { title:'College Information Poster', category:'Community', year:'2020', src:'/legacy-assets/club/clglet.jpg' },
  { title:'IEEE Student Branch Event', category:'Community', year:'2022', src:'/legacy-assets/club/thsq.png', full:'/legacy-assets/club/th.png' },
  { title:'IEDC Marketing Competition', category:'Campaign', year:'2022', src:'/legacy-assets/club/mark.jpg' }
];

const filters = ['All', ...new Set(designWork.map(item => item.category))];

function App() {
  const [filter, setFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(9);
  const [activeWork, setActiveWork] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const contactTriggerRef = useRef(null);
  const filteredWork = filter === 'All' ? designWork : designWork.filter(item => item.category === filter);
  const visibleWork = filteredWork.slice(0, visibleCount);

  useEffect(() => {
    document.body.style.overflow = activeWork ? 'hidden' : '';
    const close = event => {
      if (event.key !== 'Escape') return;
      if (activeWork) setActiveWork(null);
      else if (contactOpen) {
        setContactOpen(false);
        contactTriggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', close);
    return () => { window.removeEventListener('keydown', close); document.body.style.overflow = ''; };
  }, [activeWork, contactOpen]);

  useEffect(() => {
    if (contactOpen) document.querySelector('.contact-options a')?.focus();
  }, [contactOpen]);

  useEffect(() => {
    const updateScroll = () => setIsScrolled(window.scrollY > 100);
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    let frame = 0;
    const onPointerMove = event => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      const x = event.clientX;
      const y = event.clientY;
      const target = event.target.closest('.topbar, .hero-visual, .section-head, .project-card, .media-frame, .portrait-card, .contact-card');
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--cursor-x', x + 'px');
        document.documentElement.style.setProperty('--cursor-y', y + 'px');
        document.documentElement.style.setProperty('--cursor-opacity', '1');
        if (target) {
          const bounds = target.getBoundingClientRect();
          target.style.setProperty('--spot-x', x - bounds.left + 'px');
          target.style.setProperty('--spot-y', y - bounds.top + 'px');
        }
      });
    };
    const hideLight = () => document.documentElement.style.setProperty('--cursor-opacity', '0');
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', hideLight);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', hideLight);
    };
  }, []);

  return <div className="site-shell">
    <div className="ambient-cursor-light" aria-hidden="true" />
    <BirdCompanion />
    <div className="page-wrap">
      <header className="topbar"><a className={`logo ${isScrolled ? 'logo--compact' : ''}`} href="#top" aria-label="Sinu V Mathew, back to top"><img className="logo__image" src="/legacy-assets/logo.png" alt=""/><span className="logo__text" aria-hidden="true">SVM<span>.</span></span></a><nav aria-label="Primary navigation"><a href="#product">Developer</a><a href="#design">Design</a><a href="#about">About</a><a href="#skills">Skills</a><a href="#contact">Say hello ↗</a></nav></header>
      <main id="top">
        <section className="hero"><div className="hero-copy"><div className="eyebrow violet">Software engineer &amp; designer</div><h1 className="hero-name">Sinu V<br/>Mathew<span>.</span></h1><h2 className="hero-statement">I build useful digital products and design how they feel.</h2><p>Development Specialist at Experion Technologies, with a background in visual identity, interactive experiences and community-led design.</p><div className="actions"><a className="button primary" data-bird-stop="explore" href="#product">Explore my work <ArrowDown size={15}/></a><a className="button outline" href="https://www.linkedin.com/in/sinuvmathew" target="_blank" rel="noreferrer"><span className="text-icon">in</span> LinkedIn</a></div><a className="hero-lab-link" href="./x440.html"><span>New</span> Explore X440 LAB <ArrowUpRight size={13}/></a></div><div className="hero-visual hero-visual--quiet" aria-hidden="true"><div className="hero-visual-orbit"/><span className="hero-visual-stamp mono">SVM / 01</span></div></section>
        <div className="ticker mono">{['product engineering','frontend craft','visual identity','creative direction','community','product engineering','frontend craft'].map((item, i) => <span key={i}>{item}</span>)}</div>

        <LabInvitation/>
        <section id="product"><SectionHead icon={<Code2 size={16}/>} label="Product & Engineering" title="Ideas made usable." text="Current work across software, products, interaction and the systems behind them."/><div className="projects">{productWork.map((p) => <article className="project-card" data-bird-stop="product" key={p.index}><div className={`project-art ${p.tone}`}><div>{p.mark}</div></div><div className="project-content"><div><div className="mono">{p.index} / {p.kind}</div><h3>{p.title}</h3><p>{p.description}</p></div><div className="tags">{p.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div></article>)}</div></section>

        <section id="design"><SectionHead icon={<Palette size={16}/>} label="Design Archive · 2017—2022" title="Visual work, kept alive." text="Selected identity, campaign, editorial and community work from the original portfolio."/><div className="filter-row" aria-label="Filter design work">{filters.map(item => <button className={filter === item ? 'active' : ''} data-bird-stop={item === 'All' ? 'design' : undefined} onClick={() => { setFilter(item); setVisibleCount(9); }} key={item}>{item}</button>)}</div><div className="design-grid" id="design-work-grid">{visibleWork.map((work, index) => <button className={`design-card ${index === 0 && filter === 'All' ? 'feature' : ''}`} data-bird-stop={index > 0 && index % 6 === 0 ? 'gallery' : undefined} key={work.title} onClick={() => setActiveWork(work)}><div className="media-frame">{work.type === 'video' ? <video src={work.src} muted playsInline preload="metadata"/> : <img src={work.src} alt={work.title} loading="lazy"/>}<span className="view-work">View ↗</span></div><div className="design-meta"><div><h3>{work.title}</h3><p>{work.category}</p></div><span>{work.year}</span></div></button>)}</div>{visibleCount < filteredWork.length && <div className="design-more"><span className="mono">Showing {visibleWork.length} of {filteredWork.length} works</span><button className="button outline" type="button" aria-controls="design-work-grid" onClick={() => setVisibleCount(count => count + 9)}>Show more work <ArrowDown size={15}/></button></div>}</section>

        <section id="about"><SectionHead label="About" title="A hybrid mind." text="Design gives me the questions. Engineering gives me the leverage to explore the answers."/><div className="about-grid"><div className="portrait-card" data-bird-stop="about"><img src="/legacy-assets/testimonial-2.jpeg" alt="Sinu V Mathew"/><div className="portrait-note mono">Kerala, India · Designer × Developer</div></div><div className="about-copy"><h3>Part builder,<br/>part storyteller.</h3><p>I’m a Computer Science and Engineering graduate from College of Engineering, Kidangoor, now working as a Development Specialist at Experion Technologies. My path began with graphic and web design, grew through community leadership, and evolved into building software products.</p><p>I have led design for student and startup teams, created Bird Blash through Exult Developers, organized and hosted technical events, explored cloud computing, and built hands-on projects—including a DIY Tesla coil. That maker instinct still shapes how I approach software: understand the system, simplify the experience, and build with care.</p><a className="skills-jump" href="#skills">Explore my full toolkit <ArrowUpRight size={15}/></a><div className="timeline"><Role year="now" title="Development Specialist" org="Experion Technologies" side="current"/><Role year="2021–22" title="Creative Lead" org="TinkerHub" side="community"/><Role year="2021—" title="Design Lead" org="Google Developer Student Clubs" side="community"/><Role year="2019–23" title="Computer Science & Engineering" org="College of Engineering, Kidangoor" side="education"/></div></div></div></section>

        <section id="skills" className="skills-section">
          <SectionHead icon={<Code2 size={16}/>} label={`Skills · ${skillCount} in my toolkit`} title="A toolkit in practice." text="The skills behind my work, grouped so you can see how I build, design and deliver."/>
          <div className="skills-grid">{skillGroups.map((group, index) => <article className="skill-group" data-bird-stop="skills" key={group.title}>
            <div className="skill-group__top"><span className="mono">0{index + 1} / {String(group.skills.length).padStart(2, '0')}</span><h3>{group.title}</h3><p>{group.note}</p></div>
            <div className="skill-pills">{group.skills.map(skill => <span key={skill}>{skill}</span>)}</div>
          </article>)}</div>
        </section>

        <section className="proof"><blockquote>“Sinu was part of my team in IEEE CS Kerala. He is a multi-talented designer and animator, a good team player, and talented.”</blockquote><p>— Anandhu Prasad</p><blockquote>“Nice to work with him — such a creative designer.”</blockquote><p>— Romal Raju</p></section>

        <section id="contact"><div className={`contact-card ${contactOpen ? 'contact-card--open' : ''}`}><div><div className="eyebrow acid">Have a good problem?</div><h2>Let’s make something clear.</h2><p>Available for thoughtful software, product and design conversations.</p></div><button className="button acid-button contact-trigger" ref={contactTriggerRef} type="button" data-bird-stop="contact" aria-expanded={contactOpen} aria-controls="contact-options" onClick={() => setContactOpen(open => !open)}>{contactOpen ? <X size={15}/> : <Mail size={15}/>} {contactOpen ? 'Close options' : 'Start a conversation'} <ArrowUpRight size={15}/></button>{contactOpen && <div className="contact-options" id="contact-options"><a href="https://www.linkedin.com/in/sinuvmathew/" target="_blank" rel="noreferrer"><LinkedInMark size={22}/><strong>LinkedIn</strong><span>Open my profile to message</span><ArrowUpRight className="contact-option-arrow" size={17}/></a><a href="https://wa.me/919400711787?text=Hi%20Sinu%2C%20I%20found%20your%20portfolio%20and%20would%20like%20to%20connect." target="_blank" rel="noreferrer"><MessageCircle size={22}/><strong>WhatsApp</strong><span>+91 94007 11787</span><ArrowUpRight className="contact-option-arrow" size={17}/></a><a href="mailto:sinuvadakkel@gmail.com?subject=Hello%20from%20your%20portfolio"><Mail size={22}/><strong>Email</strong><span>sinuvadakkel@gmail.com</span><ArrowUpRight className="contact-option-arrow" size={17}/></a></div>}</div></section>
      </main>
      <footer><span>© 2026 Sinu V Mathew</span><span>Kerala, India · Built with curiosity and too many open tabs</span><div className="socials"><a href="https://github.com/SINUVMATHEW" target="_blank" rel="noreferrer" aria-label="GitHub"><GitHubMark size={17}/><span>GitHub</span></a><a href="https://www.linkedin.com/in/sinuvmathew" target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedInMark size={17}/><span>LinkedIn</span></a><a href="https://www.instagram.com/sinu.v.mathew/" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramMark size={17}/><span>Instagram</span></a></div></footer>
    </div>

    {activeWork && <div className="lightbox" role="dialog" aria-modal="true" aria-label={activeWork.title} onClick={() => setActiveWork(null)}><button className="lightbox-close" onClick={() => setActiveWork(null)} aria-label="Close"><X size={20}/></button><div className="lightbox-inner" onClick={event => event.stopPropagation()}>{activeWork.type === 'video' ? <video src={activeWork.src} controls autoPlay/> : <img src={activeWork.full || activeWork.src} alt={activeWork.title}/>}<div className="lightbox-caption"><div><span className="mono">{activeWork.category} · {activeWork.year}</span><h2>{activeWork.title}</h2></div><button onClick={() => setActiveWork(null)}>Close</button></div></div></div>}
  </div>
}

function SectionHead({icon, label, title, text}) { return <div className="section-head"><div><div className="section-label mono">{icon}{label}</div><h2>{title.replace('.', '')}<span>.</span></h2></div><p>{text}</p></div> }
function Role({year, title, org, side}) { return <div className="role"><div className="year mono">{year}</div><div><h4>{title}</h4><p>{org}</p></div><em>{side}</em></div> }

const mount = document.getElementById('root');
const root = mount.__portfolioRoot || (mount.__portfolioRoot = createRoot(mount));
root.render(<App />);
