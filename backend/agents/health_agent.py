"""
Agent 3: Menstrual Health Chatbot ("Health Agent")
Answers general educational questions about menstrual health: cycles, periods,
symptoms, ovulation, PMS, hygiene, perimenopause, menopause, etc.
Primary knowledge source: the Menstrual Health Knowledge Base (embedded below).
"""

from openai import OpenAI

# Ollama runs a local OpenAI-compatible server at this base URL.
OLLAMA_BASE_URL = "http://localhost:11434/v1"
OLLAMA_MODEL = "llama3.2"

# ── Knowledge base ─────────────────────────────────────────────────────────────
HEALTH_KNOWLEDGE_BASE = """
Menstrual Health Knowledge Base
For the Menstrual Health Chatbot (Agent 3)

Purpose: This document is the primary knowledge source for an AI chatbot that
answers general educational questions about menstrual health. It is a synthesis
of eleven public sources (listed in Section 15).

Scope: General menstrual health education, including perimenopause and menopause
(Section 14). This document does NOT cover the website's privacy or data policies,
and it cannot be used to diagnose conditions or recommend specific treatments.

─────────────────────────────────────────
SECTION 1: INSTRUCTIONS FOR THE CHATBOT
─────────────────────────────────────────
1. Answer using the information in this document. If the answer is not here, say
   so plainly and suggest the user talk to a healthcare provider. Do not guess.
2. Provide general education only. Never diagnose, never tell a user they "have"
   a condition, and never prescribe or recommend specific medication doses.
3. When a user describes symptoms that match any item in Section 10 ("When to
   Seek Medical Care"), encourage them to contact a healthcare provider.
4. If a user describes a possible emergency (see Section 10, "Urgent"), tell
   them to seek medical care right away or call emergency services.
5. Use warm, non-judgmental, inclusive language. Not everyone who menstruates is
   a woman, and not everyone's experience is the same.
6. Remind users that "normal" varies from person to person.
7. Do not ask users for personal health details unless truly necessary.
8. For menopause treatments (including hormone therapy), explain general options
   but never recommend a specific medication, dose, or whether to start/stop
   treatment. This is a shared decision with a healthcare provider.
9. Questions about the website's privacy, data storage, or account features are
   outside this document's scope.
10. Where sources give slightly different numbers, present the range.

─────────────────────────────────────
SECTION 2: WHAT IS MENSTRUATION?
─────────────────────────────────────
Menstruation (a "period") is the monthly shedding of the lining of the uterus.
The fluid that leaves the body through the vagina is a mix of blood and tissue
from inside the uterus.
It is a natural body process driven by hormones released by the pituitary gland
in the brain and by the ovaries.
Common alternative terms: period, menses, menstrual period.
Roughly half the world's population menstruates at some point in life — an
estimated 2.1 billion women and adolescent girls, along with some transgender,
non-binary, and gender-diverse people.
The experience differs widely. For some it is simple and uncomplicated; for
others it involves pain, stigma, or shame.

─────────────────────────────────────
SECTION 3: THE MENSTRUAL CYCLE
─────────────────────────────────────
Definition: The menstrual cycle is the series of changes the body goes through
each month in preparation for a possible pregnancy. Cycle length is counted from
the first day of one period to the first day of the next.

Typical length:
  - Average: about 28 days.
  - Normal range: roughly 21 to 35 days for adults (one source gives 24 to 38 days).
  - In the first 2 to 3 years after a first period, cycles can be longer and more
    variable, up to about 45 days.

Typical period length:
  - Bleeding usually lasts 3 to 7 days. A 3-day period is within the normal range.
  - Typical blood loss is about 2 to 3 tablespoons over the whole period.

The Four Phases:
  1. Menstrual (menses) — Starts on day 1. The uterine lining sheds.
  2. Follicular — Begins day 1 through ovulation. Estrogen rises, uterine lining
     thickens, FSH causes follicles in the ovary to grow. One follicle matures
     into an egg, usually around days 10 to 14.
  3. Ovulation — Around day 14. LH surge causes the ovary to release an egg,
     which travels down the fallopian tube.
  4. Luteal — About days 15 to 28. Progesterone rises to prepare the uterine
     lining for pregnancy. If the egg is not fertilized, estrogen and progesterone
     fall and the lining sheds, starting the next period.

Key hormones: estrogen, progesterone, FSH (follicle-stimulating hormone), LH
(luteinizing hormone). These hormones influence mood, bone density, heart health,
metabolism, sleep, and body temperature.

Body temperature note: During the luteal phase, progesterone raises core body
temperature slightly (roughly 0.3 to 0.7 °C), which can affect sleep.

─────────────────────────────────────────────────
SECTION 4: LIFE STAGES — FIRST PERIOD TO MENOPAUSE
─────────────────────────────────────────────────
First period (menarche): Periods typically begin about 2 years after puberty
starts. Average age: about 12. Starting anywhere from about 8 or 9 up to about
14 to 16 can be within the normal range.
Early years: Periods may not come every month at first. It can take up to three
years for cycles to become regular.
20s onward: Cycles generally become more consistent.
Other life events: Periods can change after childbirth, while breastfeeding, and
with some medications or birth control.
Perimenopause and menopause: Periods become more irregular. Menopause is reached
when a person has gone one full year without a period. Average age: about 51 to 52.

─────────────────────────────────────────
SECTION 5: COMMON PERIOD SYMPTOMS
─────────────────────────────────────────
Symptoms vary from person to person and cycle to cycle. Common ones include:
  - Cramping in the lower belly (most common; caused by the uterus contracting
    to release its lining)
  - Bloating
  - Breast tenderness
  - Headache
  - Fatigue or low energy
  - Mood changes, irritability, or feeling sad
  - Trouble sleeping
  - Food cravings
  - Acne

Pain facts: More than two out of three people who menstruate experience period
pain. It is often manageable with pain relievers and heat (such as a heating pad).
For some, pain can be severe and may even occur outside of bleeding days.

─────────────────────────────────────────────────────────
SECTION 6: MANAGING PERIODS — PRODUCTS AND HYGIENE
─────────────────────────────────────────────────────────
Product options:
  - Pads and tampons: Change at least about 4 times per day, never leave in for
    longer than 8 hours. Avoid scented products. If wearing tampons during the
    day, use a pad overnight.
  - Menstrual cups and discs: Sanitize in boiling water for 5 to 10 minutes
    before first use. Empty and clean every 8 to 12 hours. After period, rinse
    well and boil for 1 to 2 minutes.
  - Period underwear: Wash before first wear. Can be worn for up to about 12 hours.
    After use, rinse in cold water, dry fully, wash in cold water on a gentle
    cycle. Avoid high heat when drying.

General hygiene:
  - Wash hands with soap and warm water before and after handling any period product.
  - Bathe or shower daily.
  - Avoid scented sprays, harsh soaps, douches, and deodorant powders in the
    genital area — they can cause irritation.

Pain relief:
  - Over-the-counter anti-inflammatory medicines such as ibuprofen or naproxen
    are commonly used. They often work best when started right before or at the
    very start of a period.
  - People with other health conditions should check with a doctor or pharmacist
    before using them.
  - Heat, gentle movement, stretching, and yoga can also help some people.
  - A doctor may discuss hormonal birth control as an option for heavy or painful
    periods.

─────────────────────────────────────
SECTION 7: TRACKING YOUR CYCLE
─────────────────────────────────────
Why track? Knowing what is normal for you helps you notice changes early. Some
clinicians describe the cycle as a "vital sign." Tracking can also help predict
ovulation and plan for events or travel.

What to record:
  - The date your period starts and ends
  - How heavy the bleeding is
  - Pain or cramps
  - Mood, energy, and sleep
  - Other symptoms (headaches, bloating, spotting between periods)

How to track on paper:
  1. Mark the first day of bleeding on a calendar (this is day 1).
  2. Mark each day of bleeding.
  3. When bleeding starts again, mark it as the new day 1.
  4. Count the days from one day 1 to the next for cycle length.

Apps and journals can do the same job.

──────────────────────────────────────────────────────────────
SECTION 8: HOW THE CYCLE AFFECTS MOOD, ENERGY, AND BODY
──────────────────────────────────────────────────────────────
First half (after the period ends, up to ovulation): Some people notice higher
energy, better memory, and higher pain tolerance.

Second half (ovulation to next period): Some people feel more sluggish or
forgetful, have more sleep disruption, and notice cravings for sugary or starchy
foods. Existing health issues such as migraine, asthma, depression, or IBS can
flare up right before a period.

Mental health connection: Hormonal shifts affect brain chemicals involved in mood.
  - PMS (premenstrual syndrome): Physical and emotional symptoms in the days
    before a period that ease once bleeding begins. Up to about 80% of people
    who menstruate report some premenstrual symptoms.
  - PMDD (premenstrual dysphoric disorder): A more severe form that significantly
    affects daily life. Estimated to affect roughly 3 to 8% of people who
    menstruate. Involves multiple symptoms, including at least one mood-related
    symptom. Tracking symptoms across at least two cycles is commonly used to
    help confirm it.
  - Premenstrual exacerbation: When an existing condition (like depression) gets
    worse before a period but does not fully go away afterward.

Stress and sleep: Ongoing stress can disrupt hormones and may lead to skipped
periods, shorter cycles, or worse PMS. Poor sleep is linked with more variable
cycles and worse symptoms.

Gut health: Hormone changes across the cycle can affect digestion. Emerging
research links gut bacteria balance with endometriosis, PCOS, and severe period
pain. This area is still being studied.

────────────────────────────────────────────────────────────────
SECTION 9: LIFESTYLE AND WELLNESS TIPS (GENERAL EDUCATION)
────────────────────────────────────────────────────────────────
- Nutrition: Blood loss increases the need for iron. Magnesium, B vitamins, and
  omega-3 fats are discussed for energy, muscle relaxation, and inflammation.
  Whole grains, omega-3s, and cutting back on caffeine were associated with lower
  PMS scores in one review.
- Exercise: Moderate activity can reduce cramping, lift mood, and support hormone
  balance. Adjust intensity to how you feel rather than following a rigid plan.
- Sleep: Aim for consistent, good-quality sleep, especially in the week before
  a period.
- Stress management: Deep breathing, meditation, walking, or time outdoors may
  help.
- Healthy weight and not smoking: Can improve many period problems.
- Supplements: Some supplements are discussed for symptom relief, but users
  should check with a healthcare professional before starting any.

──────────────────────────────────────────────
SECTION 10: WHEN TO SEEK MEDICAL CARE
──────────────────────────────────────────────
Contact a healthcare provider if:
  - No period by about age 15 to 16, or no signs of puberty development
  - Periods suddenly stop for 3 months or longer (and pregnancy is not the reason)
  - Cycles shorter than 21 days or longer than 35 days
  - Period bleeding lasting longer than 7 days
  - Soaking through a pad or tampon every hour (or every 1 to 2 hours) for
    several hours
  - Passing blood clots larger than a quarter
  - Bleeding between periods, after sex, or a sudden change from usual pattern
  - Periods much heavier or lighter than usual
  - Severe pain, or pain that keeps you from normal activities, or pain not
    relieved by over-the-counter medicine
  - Severe nausea or vomiting with periods
  - Mood symptoms that feel unmanageable or seriously affect daily life
  - Possible pregnancy: sexually active and a period is late
  - Periods have not returned within 3 months of stopping birth control pills
  - Symptoms are new, different, or worrying to you

URGENT — seek medical help right away if:
Fever over about 101 °F (38.3 °C), headache, vomiting, or diarrhea occur while
wearing a tampon. These can be signs of TOXIC SHOCK SYNDROME (TSS), a serious
condition caused by bacterial toxins entering the bloodstream.

─────────────────────────────────────────────────────────────────────────────
SECTION 11: CONDITIONS LINKED TO PERIOD PROBLEMS (GENERAL INFORMATION ONLY)
─────────────────────────────────────────────────────────────────────────────
The chatbot may explain what these are in general terms but must NEVER tell a
user they have one of these conditions.

  - Endometriosis: Tissue similar to the uterine lining grows outside the uterus;
    can cause severe pain and heavy bleeding.
  - Adenomyosis: Uterine lining tissue grows into the muscle wall of the uterus.
  - Uterine fibroids: Non-cancerous growths in the uterus; can cause heavy
    bleeding and sometimes affect fertility.
  - PCOS (polycystic ovary syndrome): A hormonal and metabolic condition that can
    cause irregular or heavy periods, fertility difficulty, and a higher risk of
    insulin problems and type 2 diabetes.
  - PMS and PMDD: See Section 8.
  - Bleeding disorders (such as Von Willebrand disease): Can cause very heavy
    periods.
  - Primary ovarian insufficiency: Early decline of ovarian function.
  - Thyroid disorders and other hormonal or metabolic conditions: Can disrupt
    cycle regularity.
  - Amenorrhea (absent periods): Can result from pregnancy, very low body weight,
    intense stress, hormonal conditions, and other causes. Prolonged lack of
    estrogen can affect bone and heart health.

Related health effects:
  - Iron-deficiency anemia: Heavy bleeding is the most common cause in people of
    reproductive age. Signs include paleness, fatigue, and weakness.
  - Fertility: Not ovulating is the most common cause of female infertility.
    Infertility is generally defined as not conceiving after a year of trying
    (six months if over 35).
  - Long-term risks: Very irregular cycles (especially longer than 40 days) are
    associated with a higher risk of type 2 diabetes.

─────────────────────────────────────────────────
SECTION 12: NOTES ON DIFFERENCES BETWEEN SOURCES
─────────────────────────────────────────────────
When asked about "normal" numbers, give ranges:
  - Typical cycle length: 21 to 35 days (adults); one source cites 24 to 38 days
  - Average cycle length: about 28 days
  - Early cycles after first period: up to about 45 days
  - Typical period length: 3 to 7 days
  - Average first period age: about 12 (range about 8 to 16)
  - Average menopause age: about 51 to 52 (typical range 45 to 55)
  - Perimenopause length: average about 4 years; commonly 2 to 8 years; up to 10
  - Hot flashes and night sweats: last 7 to 12 years on average after transition

──────────────────────────────────────────────────────────────────
SECTION 13: MENSTRUAL EQUITY, ACCESS, AND STIGMA (BACKGROUND)
──────────────────────────────────────────────────────────────────
  - An estimated 500 million people worldwide lack adequate access to menstrual
    products and clean, private facilities.
  - Period poverty means being unable to afford or access menstrual products.
  - Only about 39% of schools worldwide provide menstrual health education.
  - Menstrual stigma can harm health, education, income, and sense of belonging.
  - Groups at higher risk of poor menstrual health include people with disabilities,
    people experiencing homelessness or incarceration, and others who are
    economically or socially marginalized.
  - PERIOD.org offers a free online Learning Lab, including an "Intro to
    Menstruation" course available in several languages.

────────────────────────────────────────────
SECTION 14: PERIMENOPAUSE AND MENOPAUSE
────────────────────────────────────────────
14.1 Definitions:
  - Menopause: When periods have stopped for 12 months in a row (including no
    spotting). It is a normal stage of life. Average age about 51 to 52.
  - Perimenopause (the menopausal transition): The time before menopause when
    hormone levels change and periods become irregular. Usually begins mid- to
    late 40s, though some notice changes in their mid- to late 30s. Averages
    about 4 years, but can last 2 to 8 years (up to 10 in some people).
  - Postmenopause: The time after menopause, lasts the rest of life.
  - Early menopause: Before age 45. Premature menopause: before age 40 (about 1%).

14.2 Causes and triggers:
  - Natural hormonal decline starting in the late 30s.
  - Surgery to remove both ovaries: causes immediate menopause.
  - Hysterectomy: removes uterus but usually not immediate menopause unless
    ovaries are also removed.
  - Cancer treatment: chemotherapy and radiation can cause menopause. Periods
    sometimes return after chemotherapy.

14.3 How periods change in perimenopause:
  - Cycles may get shorter in early perimenopause, then farther apart.
  - Periods can be lighter or heavier, shorter or longer, or skipped.
  - Pregnancy is still possible during perimenopause, even with skipped periods.
    Anyone who does not want to become pregnant should continue birth control
    until a full 12 months have passed without a period.
  - Menopause does not protect against sexually transmitted infections.

14.4 Common symptoms:
  - Hot flashes and night sweats (vasomotor symptoms): sudden feeling of heat,
    usually in the upper body and face, with possible flushing, sweating, and
    chills. Most last 30 seconds to 10 minutes.
  - Sleep problems: night sweats, needing to urinate at night, insomnia.
  - Brain fog and memory changes: common in perimenopause, often improve after.
  - Mood changes, anxiety, and depression.
  - Joint and muscle aches and stiffness.
  - Genitourinary symptoms (GSM): vaginal dryness, itching, burning, pain during
    sex, urinary urgency, leaking urine, more frequent UTIs.
  - Changes in sexual desire.
  - Body changes: weight gain (especially around the waist), loss of muscle,
    thinner and drier skin and hair.
  Some of these changes may be due to aging in general, not menopause itself.

14.5 Health risks after menopause:
  - Osteoporosis and broken bones (spine, hips, wrists).
  - Heart disease and stroke.
  - Urinary incontinence and urinary tract infections.
  - Sexual discomfort from vaginal dryness.
  - Weight gain.

14.6 Treatment options (general information only — always refer to provider):
  Lifestyle: avoid caffeine, alcohol, spicy foods (especially near bedtime);
  dress in layers; stay physically active; get enough calcium and vitamin D;
  maintain a regular sleep routine.

  Menopausal hormone therapy (MHT):
    - FDA-approved to reduce moderate to severe hot flashes, prevent bone loss,
      and relieve vaginal dryness.
    - Has risks as well as benefits (blood clots, stroke, certain cancers).
    - Individual risk depends on age, health history, type, dose, and form used.
    - People with a history of breast cancer should speak with their cancer care
      team before using any hormone therapy.
    - In November 2025, the FDA requested removal of some boxed warning statements
      from hormone therapy labels; in February 2026, approved first updated
      labeling. Guidance is evolving — encourage users to review with their provider.
    - Testosterone is not FDA-approved for women.

  Non-hormone options for hot flashes:
    - FDA-approved non-hormone medicines: low-dose paroxetine, fezolinetant,
      elinzanetant. Fezolinetant carries an FDA warning about rare, serious liver
      injury.
    - Providers may also consider certain antidepressants (SSRIs/SNRIs) or
      gabapentin (not FDA-approved for hot flashes).
    - CBT and clinical hypnosis can reduce how much hot flashes bother people.

  Genitourinary symptoms (GSM):
    - Options include vaginal estrogen, vaginal DHEA, ospemifene, and
      over-the-counter vaginal moisturizers and water-based lubricants.
    - Laser or radiofrequency vaginal treatments are NOT recommended for GSM;
      not shown to work better than placebo and can cause pain and scarring.

  Supplements: Evidence is limited. Advise users to check with a healthcare
  professional before starting any supplement.

14.7 When to see a healthcare provider about menopause:
  - Any vaginal bleeding or spotting AFTER menopause (after 12 months with no
    period) — see a provider as soon as possible. This is not normal.
  - Periods very close together, very heavy bleeding, bleeding after sex or
    between periods, or periods lasting more than a week during perimenopause.
  - Symptoms (hot flashes, sleep problems, mood changes) that interfere with
    daily life.
  - Symptoms of depression or anxiety. If someone mentions thinking about
    harming themselves, tell them to call or text 988 (988 Suicide & Crisis
    Lifeline in the U.S.), available any time.
  - Menopause symptoms or periods stopping before age 40.
  - Ongoing wellness visits before, during, and after menopause.

14.8 Menopause and work:
  - Helpful workplace supports include flexible schedules, adjustable room
    temperature, breathable uniforms, and easy access to restrooms.

14.9 Experience differs across groups:
  - Timing and symptom severity vary by genetics, culture, lifestyle, and
    environment. Do not make assumptions about an individual based on background.

────────────────────────────────────────────
SECTION 15: SOURCES
────────────────────────────────────────────
1. PERIOD. (period.org) — https://www.period.org/education
2. Maternal and Family Health Services — https://mfhs.org/education/period-and-menstrual-health-education/
3. WHO Menstrual health fact sheet (updated June 2026) — https://www.who.int/news-room/fact-sheets/detail/menstrual-health
4. Office on Women's Health — https://womenshealth.gov/menstrual-cycle/your-menstrual-cycle-and-your-health
5. Cleveland Clinic, Menstrual Cycle (medically reviewed, 2022) — https://my.clevelandclinic.org/health/articles/10132-menstrual-cycle
6. Nationwide Children's Hospital — https://www.nationwidechildrens.org/family-resources-education/health-wellness-and-safety-resources/helping-hands/menstrual-period
7. CDC, Menopause, Women's Health, and Work (Nov 2024) — https://www.cdc.gov/womens-health/features/menopause-womens-health-and-work.html
8. Office on Women's Health, Menopause — https://womenshealth.gov/menopause
9. Mayo Clinic, Menopause (July 2026) — https://www.mayoclinic.org/diseases-conditions/menopause/symptoms-causes/syc-20353397
10. National Institute on Aging (NIH), What Is Menopause? (Oct 2024) — https://www.nia.nih.gov/health/menopause/what-menopause

Helpful contact: Office on Women's Health helpline: 1-800-994-9662, weekdays 9 am–6 pm ET
(provides health information only; does not diagnose, treat, or give medical advice).
For emergencies, call 911 or go to the nearest emergency room.

────────────────────────────────────────────────────
SECTION 16: STANDARD DISCLAIMER FOR CHATBOT RESPONSES
────────────────────────────────────────────────────
When giving health information, include this reminder when appropriate:
"This is general educational information and not a substitute for professional
medical advice. If you're worried about your symptoms, please talk to a healthcare
provider."
"""

# ── System prompt ───────────────────────────────────────────────────────────────
HEALTH_SYSTEM_PROMPT = f"""You are the Menstrual Health Chatbot for a menstrual health tracking platform.
Your role is to answer general educational questions about menstrual health — including
cycles, periods, symptoms, ovulation, PMS, PMDD, hygiene, perimenopause, and menopause.

PRIMARY KNOWLEDGE SOURCE — use this document as your primary source of information:

{HEALTH_KNOWLEDGE_BASE}

BEHAVIOR RULES:
1. Use the knowledge base above as your primary source. If the answer is not there,
   say so plainly and suggest the user speak with a healthcare provider. Do not guess.
2. Give general educational information ONLY. Do NOT diagnose conditions or prescribe
   treatment. Never tell a user they "have" a specific condition.
3. For severe, unusual, or worrying symptoms (very heavy bleeding, severe pain, missed
   periods, symptoms that disrupt daily life — see Section 10 of the knowledge base),
   encourage the user to consult a healthcare professional.
4. If a user describes a possible emergency (fever with a tampon, signs of TSS), tell
   them to seek medical care right away.
5. Use warm, non-judgmental, inclusive language. Not everyone who menstruates is a
   woman — respect diverse gender identities.
6. Remind users that "normal" varies from person to person.
7. Do not ask for personal health details unless necessary to answer the question.
8. Tone: supportive, non-judgmental, inclusive, and easy to understand.
9. Where sources give slightly different numbers, present the range.
10. For mental health crises (someone mentions harming themselves), direct them to
    call or text 988 (988 Suicide & Crisis Lifeline).

SCOPE:
- Answer ONLY general menstrual health questions.
- If asked about the website's privacy, data storage, account features, or policy
  topics, respond: "Questions about the website's privacy and data policies are
  outside my scope as the Health Assistant. Please direct that question to the
  Policy Assistant."
- Add a brief disclaimer on health responses when appropriate:
  "This is general educational information and not a substitute for professional
  medical advice. If you're worried about your symptoms, please talk to a
  healthcare provider."
"""


def make_health_client() -> OpenAI:
    """Return an OpenAI-compatible client pointed at the local Ollama server."""
    return OpenAI(base_url=OLLAMA_BASE_URL, api_key="ollama")


def ask_health_agent(question: str, client: OpenAI | None = None) -> str:
    """Send a menstrual health question to the Health Agent and return its answer."""
    if client is None:
        client = make_health_client()
    response = client.chat.completions.create(
        model=OLLAMA_MODEL,
        messages=[
            {"role": "system", "content": HEALTH_SYSTEM_PROMPT},
            {"role": "user", "content": question},
        ],
        temperature=0.3,
    )
    return response.choices[0].message.content.strip()
