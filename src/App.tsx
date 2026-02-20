import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

/* ───── Intersection Observer hook ───── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1, rootMargin: '-40px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function Reveal({ children, className = '', delay = 0, id }: { children: React.ReactNode; className?: string; delay?: number; id?: string }) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      id={id}
      className={`reveal ${visible ? 'revealed' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ───── Countdown ───── */
function useCountdown() {
  const target = useRef(Date.now() + 11 * 86400000 + 34 * 3600000 + 10 * 60000 + 39000)
  const calc = useCallback(() => {
    const d = Math.max(0, target.current - Date.now())
    return {
      days: Math.floor(d / 86400000),
      hours: Math.floor((d % 86400000) / 3600000),
      minutes: Math.floor((d % 3600000) / 60000),
      seconds: Math.floor((d % 60000) / 1000),
    }
  }, [])
  const [time, setTime] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [calc])
  return time
}

/* ───── Quiz Data ───── */
const quizQuestions = [
  {
    question: 'When someone I care about doesn\'t reply for hours, I...',
    options: [
      { text: 'Check my phone constantly and feel anxious', style: 'anxious' as const },
      { text: 'Barely notice and carry on with my day', style: 'avoidant' as const },
      { text: 'Feel a little uneasy but trust they\'ll respond', style: 'secure' as const },
      { text: 'Assume they\'re losing interest and pull away first', style: 'fearful' as const },
    ],
  },
  {
    question: 'After a disagreement with my partner, I usually...',
    options: [
      { text: 'Replay every word and worry they\'ll leave', style: 'anxious' as const },
      { text: 'Shut down emotionally and need space', style: 'avoidant' as const },
      { text: 'Want to talk it through calmly', style: 'secure' as const },
      { text: 'Swing between wanting closeness and wanting to run', style: 'fearful' as const },
    ],
  },
  {
    question: 'In relationships, I tend to...',
    options: [
      { text: 'Give more than I receive and fear rejection', style: 'anxious' as const },
      { text: 'Keep emotional distance and value independence', style: 'avoidant' as const },
      { text: 'Feel comfortable with intimacy and trust', style: 'secure' as const },
      { text: 'Crave closeness but sabotage it when it gets real', style: 'fearful' as const },
    ],
  },
  {
    question: 'When a relationship ends, my first instinct is to...',
    options: [
      { text: 'Beg, over-explain, or try to fix it immediately', style: 'anxious' as const },
      { text: 'Act like I\'m fine and move on quickly', style: 'avoidant' as const },
      { text: 'Grieve but eventually accept and reflect', style: 'secure' as const },
      { text: 'Feel devastated but also relieved', style: 'fearful' as const },
    ],
  },
  {
    question: 'My deepest relationship fear is...',
    options: [
      { text: 'Being abandoned or not being enough', style: 'anxious' as const },
      { text: 'Losing my freedom or being controlled', style: 'avoidant' as const },
      { text: 'I don\'t carry a deep fear—I trust the process', style: 'secure' as const },
      { text: 'Being hurt if I let someone truly see me', style: 'fearful' as const },
    ],
  },
]

type AttachmentStyle = 'anxious' | 'avoidant' | 'secure' | 'fearful'

const quizResults: Record<AttachmentStyle, { title: string; description: string; advice: string }> = {
  anxious: {
    title: 'Anxious Attachment',
    description: 'You crave deep connection but often feel insecure about whether your partner truly cares. You may over-analyse texts, seek constant reassurance, and fear abandonment—even when things are going well.',
    advice: 'The 21-Day Attachment Reset will help you calm your nervous system, stop the obsessive thought loops, and build the inner security you\'ve been looking for in others.',
  },
  avoidant: {
    title: 'Avoidant Attachment',
    description: 'You value independence and tend to pull away when things get emotionally intense. Intimacy can feel suffocating, and you may struggle to express your needs or let people in fully.',
    advice: 'The 21-Day Attachment Reset will help you understand why closeness triggers your walls, and give you tools to stay present in relationships without losing yourself.',
  },
  secure: {
    title: 'Secure Attachment',
    description: 'You generally feel comfortable with closeness and trust in relationships. You can communicate your needs and handle conflict without spiralling. You\'re in a healthy place.',
    advice: 'Even with a secure base, the 21-Day Attachment Reset can deepen your self-awareness and help you maintain healthy patterns—especially if past relationships left hidden wounds.',
  },
  fearful: {
    title: 'Fearful-Avoidant Attachment',
    description: 'You deeply want love but are terrified of being hurt. You may push people away just as they get close, or swing between clinging and withdrawing. Relationships feel like an emotional rollercoaster.',
    advice: 'The 21-Day Attachment Reset is especially powerful for you. It will help you break the push-pull cycle, regulate your emotions, and finally feel safe enough to let love in.',
  },
}

/* ───── Quiz Component ───── */
function QuizPage({ onBack }: { onBack: () => void }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<AttachmentStyle[]>([])
  const [result, setResult] = useState<AttachmentStyle | null>(null)
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in')

  const handleAnswer = (style: AttachmentStyle) => {
    const newAnswers = [...answers, style]
    setAnswers(newAnswers)

    if (current < quizQuestions.length - 1) {
      setFadeState('out')
      setTimeout(() => {
        setCurrent(c => c + 1)
        setFadeState('in')
      }, 300)
    } else {
      // Calculate result
      const counts: Record<string, number> = {}
      newAnswers.forEach(a => { counts[a] = (counts[a] || 0) + 1 })
      const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as AttachmentStyle
      setFadeState('out')
      setTimeout(() => {
        setResult(winner)
        setFadeState('in')
      }, 300)
    }
  }

  const progressPct = result ? 100 : ((current) / quizQuestions.length) * 100

  return (
    <div className="quiz-page">
      <div className="noise" />
      <nav className="nav scrolled">
        <div className="nav-inner">
          <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); onBack() }}>
            <img src="/logo.png" alt="21-Day Breakthrough" />
          </a>
          <button className="nav-cta" onClick={onBack}>Back to Home</button>
        </div>
      </nav>

      <div className="quiz-page-content">
        {!result ? (
          <div className={`quiz-card ${fadeState === 'in' ? 'quiz-fade-in' : 'quiz-fade-out'}`}>
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="quiz-counter">Question {current + 1} of {quizQuestions.length}</div>
            <h2 className="quiz-question">{quizQuestions[current].question}</h2>
            <div className="quiz-options">
              {quizQuestions[current].options.map((opt, i) => (
                <button key={i} className="quiz-option" onClick={() => handleAnswer(opt.style)}>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={`quiz-result ${fadeState === 'in' ? 'quiz-fade-in' : 'quiz-fade-out'}`}>
            <div className="quiz-result-label">Your Result</div>
            <h2 className="quiz-result-title">{quizResults[result].title}</h2>
            <p className="quiz-result-desc">{quizResults[result].description}</p>
            <div className="quiz-result-divider" />
            <p className="quiz-result-advice">{quizResults[result].advice}</p>
            <div className="quiz-result-actions">
              <a href="#pricing" className="btn-primary" onClick={(e) => { e.preventDefault(); onBack(); setTimeout(() => { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) }, 100) }}>
                Join The Waitlist — Launching Soon
              </a>
              <button className="btn-outline" onClick={() => { setResult(null); setCurrent(0); setAnswers([]); setFadeState('in') }}>
                Retake Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ───── Legal Pages ───── */
type LegalPage = 'refund' | 'terms' | 'privacy'

function LegalPageView({ page, onBack }: { page: LegalPage; onBack: () => void }) {
  const content: Record<LegalPage, { title: string; sections: { heading: string; text: string }[] }> = {
    refund: {
      title: 'Refund Policy',
      sections: [
        {
          heading: '14-Day Money-Back Guarantee',
          text: 'We stand behind our products. If you are not satisfied with your purchase, you may request a full refund within 14 days of the original purchase date — no questions asked.',
        },
        {
          heading: 'How to Request a Refund',
          text: 'Simply email us at support@21day-breakthrough.com with your order confirmation or the email address you used to purchase. We will process your refund within 5–7 business days.',
        },
        {
          heading: 'Eligibility',
          text: 'Refunds are available for all products purchased directly through our website. After the 14-day window, purchases are considered final. We reserve the right to deny refund requests that appear fraudulent or abusive.',
        },
        {
          heading: 'Chargebacks',
          text: 'If you have an issue with your purchase, please contact us first at support@21day-breakthrough.com before initiating a chargeback with your bank. We are committed to resolving any concerns quickly and fairly.',
        },
      ],
    },
    terms: {
      title: 'Terms of Service',
      sections: [
        {
          heading: 'Overview',
          text: 'By purchasing or accessing any product from 21-Day Breakthrough ("we", "us", "our"), you agree to the following terms. Please read them carefully before making a purchase.',
        },
        {
          heading: 'Products & Delivery',
          text: 'We sell digital self-help education products including ebooks and online programs. All products are delivered electronically. Upon successful payment, you will receive instant access to your purchase via download link or online access. We do not ship physical goods.',
        },
        {
          heading: 'Educational Disclaimer',
          text: 'Our products are for educational and informational purposes only. They are not a substitute for professional medical advice, diagnosis, therapy, or treatment. If you are experiencing a mental health crisis, please contact a licensed professional or emergency services. We make no guarantees of specific results — outcomes depend on individual effort and circumstances.',
        },
        {
          heading: 'Intellectual Property',
          text: 'All content, including text, videos, workbooks, and templates, is the intellectual property of 21-Day Breakthrough. Your purchase grants you a personal, non-transferable licence to use the materials. You may not resell, redistribute, copy, or share any product with third parties.',
        },
        {
          heading: 'Payment & Pricing',
          text: 'All payments are processed securely through Stripe. Prices are listed in USD and may be subject to change. Promotional pricing is available for a limited time at our discretion.',
        },
        {
          heading: 'Limitation of Liability',
          text: 'To the fullest extent permitted by law, 21-Day Breakthrough shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products.',
        },
        {
          heading: 'Contact',
          text: 'For questions about these terms, contact us at support@21day-breakthrough.com.',
        },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      sections: [
        {
          heading: 'Information We Collect',
          text: 'When you make a purchase, we collect your name, email address, and payment information. Payment details are processed directly by Stripe — we do not store your card number or financial data on our servers.',
        },
        {
          heading: 'How We Use Your Information',
          text: 'We use your information to: deliver your purchased products, send order confirmations and access details, respond to support requests, and send occasional updates about new products (you can unsubscribe at any time).',
        },
        {
          heading: 'Third-Party Services',
          text: 'We use Stripe to process payments. Stripe\'s privacy policy governs how they handle your payment information. We do not sell, trade, or rent your personal information to any third parties.',
        },
        {
          heading: 'Data Security',
          text: 'We take reasonable measures to protect your personal information. All transactions are encrypted via SSL/TLS. However, no method of transmission over the internet is 100% secure.',
        },
        {
          heading: 'Your Rights',
          text: 'You may request access to, correction of, or deletion of your personal data at any time by emailing support@21day-breakthrough.com. We will respond to your request within 30 days.',
        },
        {
          heading: 'Cookies',
          text: 'Our website may use minimal cookies for analytics and functionality. No third-party advertising cookies are used.',
        },
        {
          heading: 'Changes to This Policy',
          text: 'We may update this privacy policy from time to time. Changes will be posted on this page with an updated effective date.',
        },
        {
          heading: 'Contact',
          text: 'For privacy-related questions, contact us at support@21day-breakthrough.com.',
        },
      ],
    },
  }

  const { title, sections } = content[page]

  return (
    <div className="legal-page">
      <div className="noise" />
      <nav className="nav scrolled">
        <div className="nav-inner">
          <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); onBack() }}>
            <img src="/logo.png" alt="21-Day Breakthrough" />
          </a>
          <button className="nav-cta" onClick={onBack}>Back to Home</button>
        </div>
      </nav>
      <div className="legal-content">
        <h1>{title}</h1>
        <p className="legal-updated">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        {sections.map((s, i) => (
          <div key={i} className="legal-block">
            <h2>{s.heading}</h2>
            <p>{s.text}</p>
          </div>
        ))}
        <div className="legal-back">
          <button className="btn-outline" onClick={onBack}>Back to Home</button>
        </div>
      </div>
    </div>
  )
}

/* ───── App ───── */
export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showLegal, setShowLegal] = useState<LegalPage | null>(null)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const countdown = useCountdown()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  if (showLegal) {
    return <LegalPageView page={showLegal} onBack={() => { setShowLegal(null); window.scrollTo(0, 0) }} />
  }

  if (showQuiz) {
    return <QuizPage onBack={() => { setShowQuiz(false); window.scrollTo(0, 0) }} />
  }

  return (
    <>
      <div className="noise" />

      {/* NAV */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <img src="/logo.png" alt="21-Day Breakthrough" />
          </a>
          <a href="#pricing" className="nav-cta">Join Waitlist</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <Reveal><div className="hero-label">Launching Soon</div></Reveal>
          <Reveal delay={80}><h1>21-Day Attachment Reset</h1></Reveal>
          <Reveal delay={160}><p className="hero-tagline">Heal your patterns, calm your mind</p></Reveal>
          <Reveal delay={240}>
            <p className="hero-description">
              Stop chasing toxic love. Achieve emotional freedom in 21 days with a simple, daily attachment-healing system—without years of therapy, begging, or going "no contact" a hundred times.
            </p>
          </Reveal>
          <Reveal delay={320}>
            <div className="countdown-wrapper">
              <div className="countdown-label">Doors open in</div>
              <div className="countdown">
                <div className="countdown-item">
                  <span className="countdown-number">{pad(countdown.days)}</span>
                  <span className="countdown-unit">Days</span>
                </div>
                <span className="countdown-sep">:</span>
                <div className="countdown-item">
                  <span className="countdown-number">{pad(countdown.hours)}</span>
                  <span className="countdown-unit">Hours</span>
                </div>
                <span className="countdown-sep">:</span>
                <div className="countdown-item">
                  <span className="countdown-number">{pad(countdown.minutes)}</span>
                  <span className="countdown-unit">Min</span>
                </div>
                <span className="countdown-sep">:</span>
                <div className="countdown-item">
                  <span className="countdown-number">{pad(countdown.seconds)}</span>
                  <span className="countdown-unit">Sec</span>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <div className="hero-buttons">
              <a href="#pricing" className="btn-primary">Join The Waitlist</a>
              <a href="#program" className="btn-outline">Learn More</a>
            </div>
            <div className="hero-trust">
              <span>Be first to get launch pricing</span>
              <span className="trust-dot" />
              <span>Free — no spam</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* QUIZ */}
      <section className="quiz-section">
        <div className="quiz-inner">
          <Reveal><div className="section-label">Explore</div></Reveal>
          <Reveal delay={80}><h2>Not Sure If You Have Attachment Issues?</h2></Reveal>
          <Reveal delay={160}>
            <p>Discover your attachment style in under 2 minutes and learn why you keep attracting the wrong people.</p>
          </Reveal>
          <Reveal delay={240}>
            <a href="#" className="btn-primary" onClick={(e) => { e.preventDefault(); setShowQuiz(true); window.scrollTo(0, 0) }}>Take The Free Quiz</a>
            <p className="quiz-meta">5 questions &middot; Personalised results &middot; 100% free</p>
          </Reveal>
        </div>
      </section>

      {/* INTRO */}
      <Reveal className="intro-section" id="program">
        <div className="intro-grid">
          <div className="intro-left">
            <Reveal><div className="section-label">Introducing</div></Reveal>
            <Reveal delay={80}><div className="brand-name">Twenty One</div></Reveal>
            <Reveal delay={160}><h2>21-Day Attachment Reset</h2></Reveal>
            <Reveal delay={240}>
              <p>
                A guided 21-day program that helps you break toxic attachment, rebuild self-respect, and create the foundation for healthy love—through short daily lessons, simple exercises, and practical tools you can use in real life.
              </p>
            </Reveal>
          </div>
          <div className="intro-features">
            {[
              { num: '01', title: 'Stop Obsessing', desc: 'Stop obsessing over people who are wrong for you and finally break free from the mental loops.' },
              { num: '02', title: 'Feel Secure', desc: 'Feel calmer, more secure, and in control of your emotions instead of anxious and desperate.' },
              { num: '03', title: 'Set Boundaries', desc: 'Set healthy boundaries without guilt or panic—and actually stick to them.' },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="intro-feature">
                  <span className="intro-feature-num">{f.num}</span>
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>

      {/* WHAT'S INCLUDED */}
      <section className="includes-section">
        <div className="container text-center">
          <Reveal><div className="section-label">What's Included</div></Reveal>
          <Reveal delay={80}><h2>Everything You Need</h2></Reveal>
        </div>
        <div className="includes-grid container">
          {[
            { title: '21-Day Daily Plan', desc: 'One clear lesson and exercise each day—no overwhelm.' },
            { title: '6 Focused Video Trainings', desc: 'Covering attachment, boundaries, and self-worth.' },
            { title: '21-Day PDF Workbook', desc: 'Prompts, checklists, and trackers to guide your journey.' },
            { title: 'Scripts & Message Templates', desc: 'What to say (and what not to send) in triggering moments.' },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="include-card">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="includes-quote">
            "The best way to stop chasing toxic relationships is to change your patterns from the inside out—one day at a time."
          </p>
        </Reveal>
      </section>

      {/* JOURNEY */}
      <section className="journey-section">
        <Reveal><div className="section-label">Your Journey</div></Reveal>
        <Reveal delay={80}><h2>With Twenty One, You Will...</h2></Reveal>
        <Reveal delay={120}><p className="journey-subtitle">Four simple steps to emotional freedom</p></Reveal>
        <div className="journey-steps">
          {[
            { num: '01', title: 'Start the Reset', desc: 'Log in, download your workbook, and watch the quick orientation video.' },
            { num: '02', title: 'Follow One Lesson Per Day', desc: 'Spend 15–20 minutes a day on the lesson and exercise—no overwhelm.' },
            { num: '03', title: 'Use the Tools', desc: 'Apply scripts and calming tools when you feel triggered or want to reach out.' },
            { num: '04', title: 'Integrate & Move Forward', desc: 'By day 21: clearer standards, stronger boundaries, a calmer nervous system.' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="journey-step">
                <div className="journey-step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BONUSES */}
      <section className="bonuses-section">
        <Reveal><div className="section-label">Plus</div></Reveal>
        <Reveal delay={80}><h2>Join Now & Get These Bonuses FREE</h2></Reveal>
        <Reveal delay={120}>
          <p className="section-sub">
            This isn't a generic info dump—it's a targeted, plug-and-play resource built for people who are tired of repeating the same relationship story.
          </p>
        </Reveal>
        <div className="bonuses-grid container">
          {[
            { num: '1', title: 'No-Contact Support Kit', desc: 'Daily prompts and reminders to stay grounded during no-contact or low-contact.' },
            { num: '2', title: 'Emergency Calm Audio', desc: 'A short audio you can play when you feel the urge to text, beg, or chase.' },
            { num: '3', title: 'Healthy Standards Checklist', desc: 'A simple filter to evaluate future partners and protect yourself from repeating the past.' },
            { num: '4', title: 'Post-Breakup Reset Plan', desc: 'A 7-day plan to stabilise your emotions right after a breakup or relapse.' },
          ].map((b, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="bonus-card">
                <div className="bonus-num">{b.num}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="bonuses-note">
            Whether you're still in the relationship or already out but still emotionally stuck, you'll get the tools and clarity you need to start seeing shifts right away.
          </p>
        </Reveal>
      </section>

      {/* COMPARISON */}
      <section className="comparison-section">
        <Reveal><div className="section-label">The Truth</div></Reveal>
        <Reveal delay={80}><h2>The Old Way Is Broken</h2></Reveal>
        <div className="comparison-grid container">
          <Reveal>
            <div className="comparison-col old">
              <h3>Old Way</h3>
              <ul className="comparison-list">
                {[
                  'Relying on willpower to not text them.',
                  'Obsessively analysing every message and sign.',
                  'Piecing together random advice from TikTok and YouTube.',
                ].map((item, i) => (
                  <li key={i}><span className="comparison-mark x">✕</span>{item}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="comparison-col new">
              <h3>New Way</h3>
              <ul className="comparison-list">
                {[
                  'Following a structured 21-day process.',
                  'Doing one clear exercise per day to retrain your patterns.',
                  'Using proven scripts and tools when your emotions spike.',
                ].map((item, i) => (
                  <li key={i}><span className="comparison-mark check">✓</span>{item}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
        <Reveal>
          <div className="comparison-benefits">
            <h3>With Twenty One, you'll be able to:</h3>
            <ul className="benefits-list">
              <li>Skip trial and error and follow a proven path.</li>
              <li>Build momentum fast without overwhelm or confusion.</li>
              <li>Avoid the mistakes that keep most people stuck in toxic loops.</li>
              <li>Get clear, actionable steps you can implement the same day.</li>
              <li>Finally see real results from your efforts.</li>
              <li>Feel calm and grounded instead of anxious.</li>
            </ul>
          </div>
        </Reveal>
      </section>

      {/* WEEKLY BREAKDOWN */}
      <section className="weekly-section">
        <Reveal><div className="section-label">Inside The Program</div></Reveal>
        <Reveal delay={80}><h2>Here's What You'll Find Inside</h2></Reveal>
        <Reveal delay={120}>
          <p className="section-sub">
            In 21 days you'll move from obsession and anxiety to clarity, self-respect, and stronger boundaries—without playing games or turning cold.
          </p>
        </Reveal>
        <div className="weekly-grid container">
          {[
            { week: 'Week 1', title: 'Awareness & Patterns', desc: 'Understand your attachment style, triggers, and why you get hooked.' },
            { week: 'Week 2', title: 'Detachment & Regulation', desc: 'Tools to handle urges, anxiety, and overthinking in real time.' },
            { week: 'Week 3', title: 'Boundaries & Rebuilding', desc: 'Learn to say no, raise your standards, and prepare for healthier love.' },
          ].map((w, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="week-card">
                <div className="week-label">{w.week}</div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <Reveal><div className="section-label">Real Results</div></Reveal>
        <Reveal delay={80}><h2>What Others Are Saying</h2></Reveal>
        <div className="testimonials-grid container">
          {[
            { quote: '"I was stuck in the same painful pattern for years, but after using Twenty One, everything clicked. It gave me the exact steps to detach emotionally."', author: 'Sarah M.' },
            { quote: '"The scripts alone were worth it. I finally knew what to say (and what NOT to say) when I felt triggered. Game changer."', author: 'Jessica T.' },
            { quote: '"I thought I needed years of therapy. Turns out I needed a simple daily system. By week 3, I felt like a different person."', author: 'Amanda K.' },
            { quote: '"I started feeling calmer and more in control within two weeks. Everything clicked."', author: 'Early Access Member' },
          ].map((t, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="testimonial-card">
                <p className="testimonial-quote">{t.quote}</p>
                <p className="testimonial-author">— {t.author}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <section className="who-section">
        <Reveal><div className="section-label">Is This For You?</div></Reveal>
        <Reveal delay={80}><h2>Who Is Twenty One For?</h2></Reveal>
        <div className="who-grid container">
          <Reveal>
            <div className="who-col">
              <h3>Perfect For You If:</h3>
              <ul className="who-list">
                {[
                  "You're tired of repeating the same painful relationship patterns.",
                  "You're ready to be honest with yourself and do the work.",
                  'You can commit to 15–20 minutes per day for 21 days.',
                  'You want practical tools, not endless theory.',
                ].map((item, i) => (
                  <li key={i}><span className="who-mark yes">✓</span>{item}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="who-col">
              <h3>Not For You If:</h3>
              <ul className="who-list">
                {[
                  'You expect change without doing the exercises.',
                  "You're in immediate physical danger (you need emergency help first).",
                  "You want couples therapy. This is for your healing, not the relationship dynamic.",
                ].map((item, i) => (
                  <li key={i}><span className="who-mark no">✕</span>{item}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* STORY */}
      <section className="story-section">
        <div className="story-inner">
          <Reveal><div className="section-label">The Story</div></Reveal>
          <Reveal delay={80}><h2>How I Discovered The Solution</h2></Reveal>
          <Reveal delay={160}>
            <p>
              A few years ago my love life was a mess. I kept chasing the wrong people, overthinking every message, and promising myself I'd "be stronger next time"—but nothing really changed.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <p>
              After one especially painful breakup, I went all-in: books, therapy, videos, every method I could find. What finally worked wasn't more information—it was having <em>a simple, daily system</em> that actually changed my behaviour and how I saw myself.
            </p>
          </Reveal>
          <Reveal delay={240}><p>That system became <em>Twenty One</em>.</p></Reveal>
          <Reveal delay={280}>
            <p>
              It helped me stop obsessing over people who weren't choosing me. Feel calm and grounded instead of anxious and desperate. Show up in relationships with boundaries and self-respect.
            </p>
          </Reveal>
          <Reveal delay={320}>
            <p>
              Now, I want to share the exact process so you can break your own cycle faster, save years of trial and error, and build a love life that feels safe, not chaotic.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta" id="pricing">
        <div className="final-cta-inner">
          <Reveal><div className="section-label">Launching Soon</div></Reveal>
          <Reveal delay={80}><h2>Choose Your Path to Healing</h2></Reveal>
          <Reveal delay={120}>
            <p className="pricing-subtitle">Two options to fit your journey — available at launch.</p>
          </Reveal>
          <div className="pricing-grid">
            <Reveal delay={160}>
              <div className="pricing-tier">
                <div className="pricing-tier-header">
                  <h3>The Mini Ebook</h3>
                  <p className="pricing-tier-desc">A quick-start guide to understanding your attachment patterns and beginning your healing journey.</p>
                </div>
                <div className="pricing-tier-price">
                  <span className="pricing-old">$14.99</span>
                  <span className="pricing-new">$6.99</span>
                </div>
                <ul className="pricing-tier-features">
                  <li>Attachment style breakdown</li>
                  <li>Core healing exercises</li>
                  <li>Instant PDF download</li>
                </ul>
                <span className="pricing-coming-soon">Coming Soon</span>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="pricing-tier featured">
                <div className="pricing-tier-badge">Most Popular</div>
                <div className="pricing-tier-header">
                  <h3>The Full Protocol</h3>
                  <p className="pricing-tier-desc">The complete 21-day system with video trainings, workbook, scripts, and all bonuses included.</p>
                </div>
                <div className="pricing-tier-price">
                  <span className="pricing-old">$67</span>
                  <span className="pricing-new">$27.99</span>
                  <span className="pricing-save">Save $39</span>
                </div>
                <ul className="pricing-tier-features">
                  <li>21-day daily plan</li>
                  <li>6 focused video trainings</li>
                  <li>PDF workbook &amp; trackers</li>
                  <li>Scripts &amp; message templates</li>
                  <li>All 4 bonuses included</li>
                </ul>
                <span className="pricing-coming-soon">Coming Soon</span>
              </div>
            </Reveal>
          </div>
          <Reveal delay={300}>
            <div className="waitlist-wrapper">
              <p className="waitlist-heading">Get notified when we launch</p>
              {!submitted ? (
                <form
                  className="waitlist-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!email) return
                    // TODO: Replace with your email service (Mailchimp, ConvertKit, etc.)
                    console.log('Waitlist signup:', email)
                    setSubmitted(true)
                    setEmail('')
                  }}
                >
                  <input
                    type="email"
                    className="waitlist-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-amber waitlist-btn">Join The Waitlist</button>
                </form>
              ) : (
                <div className="waitlist-success">
                  <p className="waitlist-success-text">You're on the list!</p>
                  <p className="waitlist-success-sub">We'll email you the moment doors open — with a special launch discount.</p>
                </div>
              )}
            </div>
          </Reveal>
          <Reveal delay={360}>
            <p className="final-trust">No spam &middot; Unsubscribe anytime &middot; Launch discount for early subscribers</p>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-brand">
          <img src="/logo.png" alt="21-Day Breakthrough" />
        </div>
        <div className="footer-legal">
          <a href="#" onClick={(e) => { e.preventDefault(); setShowLegal('refund'); window.scrollTo(0, 0) }}>Refund Policy</a>
          <span className="footer-sep">&middot;</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowLegal('terms'); window.scrollTo(0, 0) }}>Terms of Service</a>
          <span className="footer-sep">&middot;</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowLegal('privacy'); window.scrollTo(0, 0) }}>Privacy Policy</a>
        </div>
        <p className="footer-email">
          <a href="mailto:support@21day-breakthrough.com">support@21day-breakthrough.com</a>
        </p>
        <p className="footer-copy">&copy; {new Date().getFullYear()} 21-Day Breakthrough. All rights reserved.</p>
      </footer>
    </>
  )
}
