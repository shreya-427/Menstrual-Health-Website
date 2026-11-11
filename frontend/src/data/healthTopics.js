/**
 * healthTopics.js — static educational topic data.
 *
 * This file is placeholder content only. The AI/content teammate will
 * replace or expand this with medically reviewed material from authoritative
 * sources (NIH, ACOG, WHO, Mayo Clinic).
 *
 * Each topic shape:
 * {
 *   id:           string,
 *   category:     string,
 *   title:        string,
 *   summary:      string,      — 1–2 sentence overview shown on the card
 *   content:      string,      — full text shown in the detail view (Markdown-like plain text)
 *   sourceTitle:  string,
 *   sourceUrl:    string,
 *   sourceOrg:    string,
 * }
 */

export const HEALTH_TOPICS = [
  {
    id: 'cycle-overview',
    category: 'Menstrual cycle basics',
    title: 'What is the menstrual cycle?',
    summary: 'The menstrual cycle is a monthly series of hormonal changes that prepare the body for a possible pregnancy.',
    content: `The menstrual cycle is counted from the first day of one period to the first day of the next. A typical cycle is between 21 and 35 days, though this varies between individuals and can change over time.

The cycle is regulated by hormones including estrogen, progesterone, FSH (follicle-stimulating hormone), and LH (luteinizing hormone). These hormones work together to prepare an egg for ovulation and to build and shed the uterine lining.

Cycles that are consistently shorter than 21 days or longer than 35 days, or that change significantly from month to month, are worth discussing with a healthcare provider.`,
    sourceTitle: 'Menstrual cycle — MedlinePlus',
    sourceUrl: 'https://medlineplus.gov/menstruation.html',
    sourceOrg: 'NIH MedlinePlus',
  },
  {
    id: 'cycle-phases',
    category: 'Menstrual cycle basics',
    title: 'Phases of the menstrual cycle',
    summary: 'The menstrual cycle has four main phases: menstrual, follicular, ovulatory, and luteal.',
    content: `The menstrual cycle is commonly described in four phases:

Menstrual phase: The uterine lining sheds as a period. This typically lasts 3–7 days.

Follicular phase: Overlapping with and following menstruation, the pituitary gland releases FSH, which stimulates follicles in the ovary to mature. Estrogen rises, rebuilding the uterine lining.

Ovulatory phase: A surge in LH triggers the release of a mature egg. Ovulation typically occurs around the middle of the cycle, but the exact timing varies significantly and cannot be reliably predicted from cycle day alone.

Luteal phase: After ovulation, the empty follicle (corpus luteum) produces progesterone. If the egg is not fertilized, progesterone and estrogen levels drop, triggering the next period.

Note: Phase timing varies between individuals. The phases shown in this application are educational approximations based on your average cycle length, not confirmed measurements.`,
    sourceTitle: 'The Menstrual Cycle — ACOG',
    sourceUrl: 'https://www.acog.org/womens-health/faqs/the-menstrual-cycle',
    sourceOrg: 'American College of Obstetricians and Gynecologists (ACOG)',
  },
  {
    id: 'common-symptoms',
    category: 'Symptoms',
    title: 'Common menstrual symptoms',
    summary: 'Cramps, bloating, headaches, and mood changes are common during the menstrual cycle.',
    content: `Many people experience physical and emotional symptoms during their menstrual cycle. Common symptoms include:

Menstrual cramps (dysmenorrhea): Pain in the lower abdomen before or during menstruation, caused by uterine contractions. Mild to moderate cramps are common. Severe cramps that interfere with daily activities may indicate conditions such as endometriosis or fibroids and should be evaluated by a healthcare provider.

Bloating: Fluid retention can cause a feeling of fullness or swelling, particularly in the days before menstruation.

Headaches: Hormonal fluctuations can trigger headaches or migraines in some people.

Mood changes: Feeling irritable, anxious, or low before or during a period is common and related to hormonal changes.

Fatigue: Energy levels often decrease in the days before menstruation.

If symptoms are severe, worsening, or significantly affecting quality of life, consult a healthcare provider.`,
    sourceTitle: 'Premenstrual Syndrome (PMS) — NIH Office on Women\'s Health',
    sourceUrl: 'https://www.womenshealth.gov/menstrual-cycle/premenstrual-syndrome',
    sourceOrg: 'NIH Office on Women\'s Health',
  },
  {
    id: 'irregular-cycles',
    category: 'Cycle irregularities',
    title: 'Irregular menstrual cycles',
    summary: 'Cycles are considered irregular when they fall outside the typical 21–35 day range or vary significantly in length.',
    content: `An irregular menstrual cycle is one that:
- Is shorter than 21 days or longer than 35 days consistently
- Varies by more than 7–9 days from cycle to cycle
- Results in very heavy, very light, or absent bleeding

Irregular cycles are common and can be caused by many factors, including stress, significant weight changes, intense exercise, hormonal contraceptive use, thyroid conditions, polycystic ovary syndrome (PCOS), and perimenopause.

Occasional irregularity is normal. Consistently irregular cycles, or sudden changes to a previously regular cycle, are worth discussing with a healthcare provider.`,
    sourceTitle: 'Abnormal Uterine Bleeding — ACOG',
    sourceUrl: 'https://www.acog.org/womens-health/faqs/abnormal-uterine-bleeding',
    sourceOrg: 'American College of Obstetricians and Gynecologists (ACOG)',
  },
  {
    id: 'pms-pmdd',
    category: 'Symptoms',
    title: 'PMS and PMDD',
    summary: 'Premenstrual syndrome (PMS) affects many people. A more severe form, PMDD, can significantly impact daily life.',
    content: `Premenstrual syndrome (PMS) refers to physical and emotional symptoms that occur in the one to two weeks before menstruation and improve after the period begins. Common symptoms include bloating, breast tenderness, headaches, fatigue, irritability, and mood changes.

Premenstrual dysphoric disorder (PMDD) is a more severe form of PMS. Symptoms include severe depression, anxiety, irritability, or mood swings that significantly interfere with daily life and relationships. PMDD is a recognized medical condition and is distinct from everyday premenstrual symptoms.

If you suspect you may have PMDD, speak with a healthcare provider. Effective treatments are available.`,
    sourceTitle: 'Premenstrual Dysphoric Disorder (PMDD) — NIH',
    sourceUrl: 'https://www.nimh.nih.gov/health/publications/premenstrual-dysphoric-disorder',
    sourceOrg: 'National Institute of Mental Health (NIH)',
  },
  {
    id: 'when-to-seek-care',
    category: 'Medical care',
    title: 'When to see a healthcare provider',
    summary: 'Some menstrual symptoms warrant prompt medical evaluation.',
    content: `Contact a healthcare provider if you experience:

- Periods that are consistently very heavy (soaking through a pad or tampon every hour for several hours)
- Periods that last longer than 7 days
- Bleeding between periods or after sex
- Periods that suddenly stop for 3 or more months (other than pregnancy)
- Severe pain during periods that is not controlled by over-the-counter pain relievers
- Symptoms that significantly impact your daily life or mental health

This application is an educational and tracking tool only. It does not provide medical diagnoses. Always consult a qualified healthcare provider for personal medical concerns.`,
    sourceTitle: 'When to See a Doctor — ACOG',
    sourceUrl: 'https://www.acog.org/womens-health',
    sourceOrg: 'American College of Obstetricians and Gynecologists (ACOG)',
  },
]

// Unique categories derived from topics
export const CATEGORIES = [...new Set(HEALTH_TOPICS.map(t => t.category))]
