export interface ServiceFaq {
  q: string;
  a: string;
}

export interface DetailedService {
  slug: string;
  name: string;
  category: string;
  badge: string;
  icon: string;
  metaTitle: string;
  metaDescription: string;
  h1Title: string;
  subtitle: string;
  shortSummary: string;
  fullOverview: string;
  whoIsThisFor: string[];
  focusAreas: string[];
  keyTakeaways: string[];
  sessionApproach: string;
  faqs: ServiceFaq[];
  durationMinutes: number;
  price: number;
  format: string;
  locationDetails: string;
}

export const DETAILED_SERVICES: DetailedService[] = [
  {
    slug: "individual-counselling",
    name: "Individual Counselling & Personal Growth",
    category: "Personal Growth",
    badge: "Self-Worth & Inner Compass",
    icon: "psychology",
    metaTitle: "Individual Counselling in Chennai & Online | Aswathy Jeyarajasekar",
    metaDescription:
      "Client-centred individual counselling in Chennai and online. A safe, unhurried space to untangle self-doubt, perfectionism, decision fatigue, and personal identity.",
    h1Title: "Individual Counselling & Personal Growth in Chennai & Online",
    subtitle:
      "A compassionate, reflective space to understand who you are beneath expectations, self-doubt, and everyday pressures.",
    shortSummary:
      "Untangling perfectionism, imposter syndrome, decision paralysis, and self-esteem dilemmas at your own gentle pace.",
    fullOverview:
      "Individual counselling offers an unhurried, non-judgmental mirror to examine your internal narrative, emotional habits, and life choices. In our collaborative sessions, therapy is never about being told what to do or being diagnosed through clinical scrutiny. Instead, it is a safe space where your vulnerability meets deep respect. We explore the roots of persistent self-criticism, identify where your boundaries may be compromised, and reconnect you with your personal values and authentic self-worth.",
    whoIsThisFor: [
      "Adults and young adults struggling with chronic self-doubt or imposter syndrome",
      "Individuals experiencing persistent perfectionism and fear of making mistakes",
      "Anyone navigating identity shifts, personal transitions, or existential questioning",
      "People wanting to cultivate genuine self-compassion and emotional grounding",
    ],
    focusAreas: [
      "Overcoming internal criticism and shame-based thinking",
      "Building emotional awareness and nervous system grounding",
      "Managing decision fatigue and finding clarity in life directions",
      "Developing self-trust and honoring your authentic needs",
      "Untangling productivity from self-worth",
    ],
    keyTakeaways: [
      "A grounded sense of self that does not rely solely on external approval",
      "Practical tools to manage anxious spirals and self-critical thoughts",
      "Clarity on personal priorities, values, and emotional boundaries",
    ],
    sessionApproach:
      "Grounded in Person-Centered Therapy (PCT) and somatic awareness, our consultations honor your rhythm. You are invited to bring whatever is on your mind — from fleeting worries to deeply buried feelings — without any requirement to have everything organized beforehand.",
    faqs: [
      {
        q: "How does individual counselling help with self-doubt?",
        a: "Individual counselling helps you identify where self-critical patterns began and provides a safe space to practice self-compassion, leading to lasting internal confidence rather than temporary motivation.",
      },
      {
        q: "Do I need to have a specific problem to attend individual counselling?",
        a: "Not at all. Many clients come to explore personal growth, gain clarity about their direction, or simply have a quiet, dedicated space to reflect with a psychologist.",
      },
      {
        q: "Are individual counselling sessions conducted online?",
        a: "Yes, all consultations are conducted 100% online via secure Google Meet telehealth sessions, accessible from anywhere in Chennai, across India, and globally.",
      },
    ],
    durationMinutes: 50,
    price: 1800,
    format: "100% Online (Google Meet Telehealth)",
    locationDetails: "Online Telehealth (Across India & Worldwide)",
  },
  {
    slug: "student-counselling",
    name: "Student & Young Adult Counselling",
    category: "Academic & Career Growth",
    badge: "Empowering Transitions",
    icon: "school",
    metaTitle: "Student Counselling in Chennai & Online for Young Adults | Aswathy Jeyarajasekar",
    metaDescription:
      "Specialized student counselling in Chennai and online for young adults. Compassionate support for academic burnout, exam stress, career anxiety, and independence transitions.",
    h1Title: "Student & Young Adult Counselling in Chennai & Online",
    subtitle:
      "Supportive psychological guidance for college students, graduates, and young adults managing academic pressure, career uncertainty, and personal independence.",
    shortSummary:
      "Dedicated holding space for students and young professionals navigating high expectations, exam burnout, family separation, and emerging adulthood.",
    fullOverview:
      "The transition through college, university, and the early years of a career is one of the most psychologically demanding life phases. Students and young adults frequently grapple with intense academic competition, the weight of parental and societal expectations, career ambiguity, and sudden autonomy. Our student and young adult counselling service provides a safe, grounded sounding board where you can unpack burnout, navigate relationship shifts, and build resilient emotional habits without fear of academic or parental judgment.",
    whoIsThisFor: [
      "Undergraduate and postgraduate students experiencing academic burnout or exam paralysis",
      "Young adults stepping into their first jobs or navigating workplace culture shock",
      "Students dealing with imposter feelings, procrastination, and peer comparison",
      "Individuals moving away from home or adjusting to living independently in Chennai or other cities",
    ],
    focusAreas: [
      "Managing chronic academic stress, deadline paralysis, and exam dread",
      "Navigating parental expectations versus authentic career and life aspirations",
      "Building emotional resilience during competitive entrance exams or job hunts",
      "Navigating roommate, friendship, and romantic relationship transitions",
      "Establishing realistic daily routines that protect physical and mental rest",
    ],
    keyTakeaways: [
      "Sustainable study and work rhythms that protect your nervous system from burnout",
      "Effective tools to manage acute test anxiety and performance panic",
      "A compassionate space to figure out who you are becoming as an independent adult",
    ],
    sessionApproach:
      "We combine compassionate validation with tangible grounding practices. Sessions are collaborative and tailored to the unique pressures of student life in India, allowing flexible online appointments around your class or work schedules.",
    faqs: [
      {
        q: "Can college students attend counselling confidentially without their parents knowing?",
        a: "Yes. For adult students (18+), all counselling sessions are strictly confidential. No information or attendance records are disclosed to family members or universities without your explicit consent.",
      },
      {
        q: "How does counselling help with exam anxiety and procrastination?",
        a: "Procrastination is usually an emotional regulation issue rather than laziness. We explore the fear of failure or perfectionism driving the avoidance, and create realistic, low-pressure steps to regain focus.",
      },
      {
        q: "Do you offer student-friendly consultation slots?",
        a: "Yes, flexible evening and weekend slots are available via online telehealth so students can schedule sessions without missing lectures or assignments.",
      },
    ],
    durationMinutes: 50,
    price: 1500,
    format: "100% Online (Google Meet Telehealth)",
    locationDetails: "Online Telehealth (Across India & Worldwide)",
  },
  {
    slug: "emotional-wellbeing-counselling",
    name: "Emotional Wellbeing & Stress Management",
    category: "Emotional Wellbeing",
    badge: "Gentle Nervous System Regulation",
    icon: "favorite",
    metaTitle: "Emotional Wellbeing & Stress Management Counselling Chennai | Aswathy Jeyarajasekar",
    metaDescription:
      "Compassionate counselling for emotional fatigue, stress regulation, and anxious thoughts in Chennai and online. Somatic grounding and person-centred care.",
    h1Title: "Emotional Wellbeing & Stress Management Counselling in Chennai & Online",
    subtitle:
      "Learn to navigate chronic stress, emotional overwhelm, and racing thoughts with gentle, evidence-informed psychological support.",
    shortSummary:
      "Navigating chronic anxiety, mood swings, somatic fatigue, and inner dialogue without harsh suppression.",
    fullOverview:
      "Emotional distress and chronic stress are not personal weaknesses — they are often the nervous system's intelligent signal that you have been carrying too much for too long. When stress accumulates, it often manifests physically through tight shoulders, restless sleep, shallow breathing, irritability, or brain fog. Our emotional wellbeing counselling sessions provide an unhurried sanctuary to slow down, gently unpack the sources of your distress, and learn practical somatic grounding techniques that restore a sense of safety within your body and mind.",
    whoIsThisFor: [
      "Individuals experiencing persistent tension, racing thoughts, or overwhelming worry",
      "Working professionals facing chronic corporate burnout and nervous exhaustion",
      "Anyone feeling emotionally drained, irritable, or disconnected from joy",
      "People wanting to develop gentle grounding practices to calm everyday distress",
    ],
    focusAreas: [
      "Understanding the mind-body connection in stress and anxiety",
      "Developing personalized somatic grounding tools for high-stress moments",
      "Recognizing emotional boundaries to prevent chronic overwhelm",
      "Transforming harsh self-criticism into curious self-kindness",
      "Rebuilding daily capacity for restorative rest and emotional calm",
    ],
    keyTakeaways: [
      "Real-time grounding exercises you can use whenever you feel overwhelmed",
      "Clear insight into your unique stress triggers and emotional warning signs",
      "A restored relationship with rest, self-care, and personal peace",
    ],
    sessionApproach:
      "Our sessions provide an unhurried, patient atmosphere. Rather than forcing you to 'fix' thoughts quickly, we gently explore physical sensations, emotional triggers, and personalized regulation techniques at your own comfort level.",
    faqs: [
      {
        q: "What is the difference between stress management and deep counselling?",
        a: "Stress management often focuses on short-term coping tips. In counselling, we go deeper to understand why your nervous system is on high alert, untangle chronic patterns, and build lasting emotional equilibrium.",
      },
      {
        q: "Will I be given breathing and grounding exercises?",
        a: "Yes. When appropriate and desired, we introduce gentle somatic grounding and mindfulness practices that you can easily practice in your daily life.",
      },
      {
        q: "Can I attend online from home?",
        a: "Yes. Online telehealth sessions allow you to participate from your private room, wrapped in comfort, without having to navigate traffic or travel stress.",
      },
    ],
    durationMinutes: 50,
    price: 1800,
    format: "100% Online (Google Meet Telehealth)",
    locationDetails: "Online Telehealth (Across India & Worldwide)",
  },
  {
    slug: "relationship-counselling",
    name: "Relationships & Interpersonal Dynamics",
    category: "Relationship & Interpersonal",
    badge: "Healthy Boundaries & Connection",
    icon: "diversity_1",
    metaTitle: "Relationship & Interpersonal Counselling Chennai | Aswathy Jeyarajasekar",
    metaDescription:
      "Individual counselling for relationship dynamics, family conflicts, healthy boundaries, and communication patterns in Chennai and online.",
    h1Title: "Relationship & Interpersonal Counselling in Chennai & Online",
    subtitle:
      "Explore attachment patterns, cultivate respectful boundaries, and communicate your authentic needs without guilt.",
    shortSummary:
      "Healthy communication boundaries, family frictions, romantic attachment, and social anxiety explored in individual consultations.",
    fullOverview:
      "Our relationships with partners, parents, siblings, friends, and colleagues can be our deepest source of joy and our most painful point of distress. Many people struggle with setting boundaries because they fear confrontation or abandonment, while others find themselves caught in repetitive friction or emotional withdrawal. In our individual relationship counselling consultations, we explore how your attachment style and family background influence your interpersonal world, helping you communicate with clarity and protect your emotional peace.",
    whoIsThisFor: [
      "Individuals feeling overwhelmed by family expectations or interpersonal conflict",
      "Anyone who struggles to say 'no' without crippling guilt or fear of disappointing others",
      "People wanting to understand their patterns in dating, romantic relationships, or friendships",
      "Individuals healing from breakups, emotional betrayals, or difficult life separations",
    ],
    focusAreas: [
      "Identifying anxious, avoidant, or secure attachment tendencies",
      "Learning to establish firm, compassionate boundaries with loved ones",
      "Communicating needs clearly and constructively without defensive walls",
      "Processing grief, separation, and relational disappointments",
      "Managing social anxiety and cultivating authentic connections",
    ],
    keyTakeaways: [
      "The ability to set kind, unshakeable boundaries that protect your wellbeing",
      "Deep insight into why certain relational dynamics trigger intense emotions",
      "Confidence in expressing your emotional needs clearly and calmly",
    ],
    sessionApproach:
      "These sessions are conducted individually, offering a safe, neutral space to look honestly at your relational world without pressure. We examine dynamics with empathy and curiosity rather than assigning blame.",
    faqs: [
      {
        q: "Is this couples counselling or individual counselling?",
        a: "This service is conducted on an individual basis. It is designed to help you explore your personal role, boundaries, communication style, and emotional experience within your relationships.",
      },
      {
        q: "How can individual counselling improve my relationships?",
        a: "When you understand your own attachment patterns, emotional triggers, and boundaries, you become clearer and calmer in how you interact, which naturally shifts the dynamics in your relationships.",
      },
      {
        q: "Can I discuss difficult family or in-law dynamics?",
        a: "Yes. Many clients seek counselling specifically to navigate complex multigenerational family systems and cultural expectations in India.",
      },
    ],
    durationMinutes: 50,
    price: 1800,
    format: "100% Online (Google Meet Telehealth)",
    locationDetails: "Online Telehealth (Across India & Worldwide)",
  },
  {
    slug: "life-transitions-counselling",
    name: "Life Challenges & Transitions",
    category: "Life Transitions",
    badge: "Navigating The Unknown",
    icon: "alt_route",
    metaTitle: "Life Transitions & Adult Counselling Chennai | Aswathy Jeyarajasekar",
    metaDescription:
      "Empathetic counselling in Chennai and online for navigating major life transitions, career shifts, relocation, grief, and adapting to unexpected changes.",
    h1Title: "Life Challenges & Transitions Counselling in Chennai & Online",
    subtitle:
      "Steady therapeutic accompaniment through career pivots, relocations, grief, and unexpected life disruptions.",
    shortSummary:
      "Grief, major career shifts, relocation adjustment, and unexpected lifecycle disruptions navigated collaboratively.",
    fullOverview:
      "Life rarely unfolds in a straight line. Major life events — whether planned like relocating to a new city, switching careers, or entering retirement, or unforeseen like health challenges, grief, or personal loss — can shake our sense of identity and security. Even positive transitions can bring unexpected anxiety and emotional fatigue. Our life transitions counselling provides a steady anchor to process grief, adapt to the unfamiliar, and rebuild your life with confidence and patience.",
    whoIsThisFor: [
      "Adults navigating career transitions, unexpected job loss, or professional pivots",
      "Individuals moving to Chennai, another city, or abroad and experiencing relocation stress",
      "People processing grief, loss of a loved one, or significant life milestones",
      "Anyone experiencing quarter-life or mid-career existential re-evaluations",
    ],
    focusAreas: [
      "Navigating ambiguity and rebuilding routine from ground zero",
      "Processing grief and honoring loss at a healthy, unhurried pace",
      "Adjusting to new cultural, workplace, or family environments",
      "Reconnecting with personal resilience and decision-making clarity",
      "Managing identity shifts when former roles or titles change",
    ],
    keyTakeaways: [
      "A supportive anchor during times of disorientation or upheaval",
      "Practical strategies to establish new anchors, rhythms, and routines",
      "A compassionate framework to move forward one day at a time",
    ],
    sessionApproach:
      "We honor your pace. You will not be expected to 'move on' or forced to find silver linings. We provide steady companionship and practical reflection as you discover your next steps.",
    faqs: [
      {
        q: "How does counselling help during relocation or major career shifts?",
        a: "Major transitions shake our familiar emotional anchors. Counselling offers a dedicated space to process feelings of displacement, fatigue, and fear, helping you regain your footing.",
      },
      {
        q: "What if I am struggling with grief?",
        a: "Grief has no set timeline. In our sessions, your feelings of sorrow, numbness, or anger are held with deep respect and patience, without any expectation to rush your healing.",
      },
      {
        q: "Are online consultations effective during life transitions?",
        a: "Yes. Online counselling provides continuity of care, allowing you to stay connected with your psychologist even if you are moving, traveling, or settling into a new home.",
      },
    ],
    durationMinutes: 50,
    price: 1800,
    format: "100% Online (Google Meet Telehealth)",
    locationDetails: "Online Telehealth (Across India & Worldwide)",
  },
];

export function getServiceBySlug(slug: string): DetailedService | undefined {
  return DETAILED_SERVICES.find((s) => s.slug === slug);
}
