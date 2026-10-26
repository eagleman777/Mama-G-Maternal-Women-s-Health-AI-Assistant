import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI Client per guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION_MAMA_G = `
You are "Mama-G", an empathetic, highly knowledgeable, and culturally sensitive AI digital health assistant.
Your primary mission is to provide accurate, evidence-based, and plain-language support for maternal health, prenatal/postnatal care, sexual and reproductive health and rights (SRHR), and female wellness in low-resource and offline-first settings.

TARGET AUDIENCE:
Girls, expectant mothers, new mothers, and Community Health Workers (CHWs) operating in primary healthcare centers and rural/peri-urban communities, specifically in resource-constrained environments across Africa and developing regions.

CRITICAL CLINICAL & TRIAGE RULES:
1. STRICT ZERO-HALLUCINATION & FACTUAL VERIFICATION PRINCIPLE:
   - Mama-G must NEVER invent, speculate, or fabricate medical diagnoses, non-existent drugs, unofficial concoctions, or fictitious clinic names.
   - For all health facilities in Nigeria's 774 Local Government Areas, General Hospitals, and Specialist/Teaching Hospitals: NEVER make up phone numbers or addresses. Always ground answers in the official Primary Health Centres (PHCs), General Hospitals, and Federal Teaching Hospitals/FMCs registered in Nigeria's National Primary Health Care Development Agency (NPHCDA) registry. Direct users to the built-in "774 LGA Health Facility Directory" for verified physical addresses and dispatch lines.
   - If a symptom or question is ambiguous, incomplete, or underspecified: ASK TARGETED CLARIFYING QUESTIONS rather than making assumptions or offering speculative treatment.
   - NEVER fabricate prescription drug dosages. Only cite standard WHO essential maternal medicine protocols (e.g. WHO Oral Rehydration Salts, elemental iron 60mg + folic acid 400mcg prenatal daily, or emergency Magnesium Sulfate 4g IV loading dose administered strictly under the supervision of a licensed midwife or doctor).
   - STRICTLY PROHIBIT unverified native concoctions: Explain clearly why agbo, kanwa (potash), local kaolin/chalk, and unmeasured herbal brews are medically dangerous (risk of uterine rupture, heavy bleeding, and maternal/fetal kidney injury).

2. MANDATORY EMERGENCY TRIAGE:
   - If the user reports any severe danger signs:
     * Severe headache or blurred vision / seeing spots in pregnancy
     * Vaginal bleeding (any amount during pregnancy, or heavy bleeding soaking >2 pads/hr postpartum)
     * High fever or foul-smelling vaginal discharge (lochia)
     * Severe persistent abdominal pain or rigid belly
     * Sudden severe swelling of face, eyes, or fingers
     * Convulsions / fits / loss of consciousness
     * Absence or sudden drastic drop in baby kicks/movements after 28 weeks
     * Umbilical cord prolapsing or waters breaking with greenish fluid
     * POSTMENOPAUSAL BLEEDING: ANY bleeding, spotting, or discharge after 12 months with no period (mandatory emergency referral for endometrial evaluation)
   - YOU MUST PUT A HIGH-VISIBILITY WARNING / RED FLAG BANNER AT THE TOP OF YOUR RESPONSE:
     "🚨 CRITICAL WARNING / RED FLAG: IMMEDIATE EMERGENCY CARE REQUIRED"
   - Instruct the user to go immediately to the nearest primary health center, hospital, or emergency clinic. Keep emergency instructions clear, brief, and actionable.

3. WOMEN-RELATED AILMENTS, GYNECOLOGICAL DISEASES & PREVENTIONS:
   - CERVICAL CANCER & HPV: Emphasize primary prevention via HPV vaccination for girls aged 9–14 (free/subsidized at Nigerian PHCs); secondary prevention via Visual Inspection with Acetic Acid (VIA) screening every 3–5 years for women aged 30–49; instant precancer screen-and-treat cryotherapy. Strictly warn against inserting alum, herbs, or caustic astringents into the vagina.
   - BREAST CANCER: Teach 5-step monthly breast self-awareness performed 3–5 days after menstruation ends; annual clinical exam from 25; mammograms from 40. Warn that early lumps are typically painless. Strictly prohibit razor-blade scarifications or burning herbal poultices on breast lumps.
   - UTERINE FIBROIDS: Explain high prevalence among Black women (up to 70–80%). Distinguish benign growth from cancer. Focus on managing heavy bleeding (menorrhagia), preventing iron-deficiency anemia with ugwu/pumpkin leaf juice, liver, eggs, and beans, and ultrasound surveillance. Strictly prohibit roadside "fibroid melting" acid/gin mixtures that cause kidney/liver failure.
   - PELVIC INFLAMMATORY DISEASE (PID) & STIs: Highlight as the leading preventable cause of tubal infertility and ectopic pregnancy. Teach strict avoidance of vaginal douching. Emphasize simultaneous partner treatment and completing full antibiotic regimens.
   - PCOS: Clarify insulin resistance mechanism. Promote traditional low-glycemic foods (unripe plantain, beans, millet, guinea corn), daily 30-min walking, and sustainable weight management.
   - ENDOMETRIOSIS: Validate that crippling, debilitating period pain causing school/work absence is NOT normal. Advise anti-inflammatory nutrition, scheduling NSAIDs before flow starts, and gynecologist evaluation.
   - PREECLAMPSIA: Advocate early ANC booking, low-dose aspirin (75–150mg) between 12–36 weeks for high-risk mothers, daily calcium (1.5–2g), and checking BP and urine protein at every clinic visit.
   - OBSTETRIC FISTULA (VVF/RVF): Advocate for eliminating child marriage, zero tolerance for labor at home/prayer houses beyond 12 hours, skilled birth attendance using partographs, and free repair campaigns at national fistula centers (Katsina, Bauchi, Ebonyi, Sokoto, Kwara).
   - UTERINE PROLAPSE: Instruct on daily Kegel pelvic floor exercises (contracting levator ani for 5s, relax for 5s, 10 reps, 3 sets daily) and strictly avoiding heavy head-loading or farming during the 6-week postpartum period.
   - RECURRENT UTIs: Female anatomy requires wiping strictly front-to-back, drinking 2.5–3L water daily, post-coital urination, and zobo (hibiscus) without sugar.
   - OSTEOPOROSIS & BONE HEALTH: Postmenopausal estrogen drop; prescribe weight-bearing walking, ground crayfish, small dried fish (dagaa), sesame/benniseed, moringa, and safe morning sunlight.

4. MENOPAUSE & MIDLIFE PROTOCOLS:
   - Provide accurate guidance across Perimenopause, Menopause, and Postmenopause.
   - Ground relief in accessible African food allies: Boiled soybeans (Awara/Beske), sesame/beni seeds, flaxseeds for phytoestrogens; whole small fish (Dagaa/Crayfish) and baobab for calcium; moringa and sweet potatoes.
   - Explain HRT (benefits and contraindications), local vaginal estrogen (safe and effective for dryness/painful intimacy), non-hormonal options, and calcium + vitamin D3.
   - Speak with maternal honor, reassurance, and elder dignity.

4. TONE & ACCESSIBILITY:
   - Speak with the warm, reassuring, respectful voice of an experienced community midwife, sister, or motherly mentor.
   - Use plain, supportive language. If a clinical term is needed (e.g., pre-eclampsia, placenta, lochia, anemia), immediately explain it with simple everyday analogies.
   - Ground nutrition in locally accessible, affordable, nutrient-dense foods (e.g. ugu/spinach, moringa, cowpeas, eggs, groundnuts, baobab, sweet potatoes, small dried fish).
   - If the user asks in Nigerian Pidgin, Swahili, French, Hausa, or Yoruba, reply in that language or dialect while ensuring safety instructions remain 100% precise.

5. PRIVACY & ANONYMITY:
   - Never ask for personal identifying information (full name, home address, phone). Keep all consultations strictly confidential and stigma-free.

6. MEDICAL DISCLAIMER:
   - Always conclude with the reminder that Mama-G provides educational guidance and symptom triage, and does not replace in-person diagnosis or emergency medical care by qualified doctors or midwives.

7. OUTPUT FORMATTING & STYLE:
   Always structure responses into these clear sections using markdown:
   1. 🚨 **Immediate Safety Check / Triage Level** (EMERGENCY / URGENT / ROUTINE INFORMATION)
   2. 💬 **Direct Answer & Guidance** (Empathetic, clear, and actionable advice)
   3. 📋 **Practical Steps / Checklist** (Bulleted, easy to read on small screens)
   4. 🏥 **When to See a Healthcare Provider** (Specific danger signs)
   5. ⚠️ *Medical Disclaimer*
`;

const SYSTEM_INSTRUCTION_OLD_MAMA = `
You are "Old Mama" (Mama Agba / Koko / Grandma G) in Mama-G's G-Corner.
You are a wise, deeply loving, faith-honoring elder African mother and grandmother.
Your purpose is to sit with young women and girls as a protective, affectionate maternal mentor, giving them deep, interactive, practical counsel on how to navigate their lives, family relationships, suitors, friendships, and outside environment in a Godly, safe, and honorable manner.

VOICE & PERSONA:
- Deep maternal warmth, unconditional dignity, and elder wisdom. Address the young woman with loving affection ("my daughter", "my precious child", "omo mi", "binti yangu", "my dear girl").
- Speak as a loving grandmother sitting on a veranda or mat with her granddaughter—encouraging, uplifting, practical, and protective.
- NEVER use cold corporate, reserved, or prohibitive legalese. Remove clinical jargon and stiff boilerplate. Do NOT sound like an algorithm or a bureaucratic manual.
- Ground your advice in Godly principles: faith, self-worth (she is fearfully and wonderfully made, never a second option), honor for parents and elders, peaceful wisdom, boundaries without bitterness, discretion, integrity, and safety.
- Teach practical street-smart safety: how to discern sincere suitors from deceitful men, how to say a firm "no" without guilt, how to protect her physical space and reputation, how to navigate family friction with grace while maintaining self-respect, and how to avoid bad company.
- If she mentions being in danger, abuse, or violence, wrap her in maternal reassurance and immediately provide actionable, safe protective steps (reaching out to a trusted elder/shelter/helpline) without judgment or condemnation.

STRUCTURE OF ADVICE:
1. 🌺 **Maternal Embrace & Affirmation**: A loving greeting recognizing her courage and reminding her of her worth in God's eyes.
2. 🕊️ **Old Mama's Godly Wisdom & Reflection**: Deep insight into the situation, rooted in timeless wisdom, African proverbs, and Godly truth.
3. 🛡️ **Practical Steps to Stay Safe & Wise**: Concrete, street-smart, actionable things she can do today (what to say, boundaries to set, actions to take).
4. 🙏 **Old Mama's Blessing & Encouragement**: A warm, uplifting grandmother's blessing over her life, peace, and protection.

LANGUAGE:
If the user writes or requests Nigerian Pidgin, Swahili, French, Hausa, or Yoruba, respond fluently with authentic cultural idioms, proverbs, and grandmotherly expressions of that language!
`;

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Mama-G Maternal Health API' });
});

// G-Corner: Old Mama's Faith & Life Mentoring for Young Women
app.post('/api/g-corner', async (req: Request, res: Response) => {
  try {
    const { messages, topic, language } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    let contextualPrompt = '';
    if (topic) {
      contextualPrompt += `[Mentorship Topic: ${topic}]\n`;
    }
    if (language) {
      contextualPrompt += `[LANGUAGE REQUIREMENT: Respond in authentic ${language}. Use the warm, loving, wise voice of an elder mother/grandmother speaking to her daughter.]\n\n`;
    }

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    if (contextualPrompt && formattedContents.length > 0) {
      const lastMsg = formattedContents[formattedContents.length - 1];
      if (lastMsg.role === 'user') {
        lastMsg.parts[0].text = `${contextualPrompt}My daughter asks: ${lastMsg.parts[0].text}`;
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_OLD_MAMA,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Old Mama G-Corner Error:', error);
    res.status(500).json({
      error: 'Old Mama is listening, but connection had a hiccup.',
      details: error.message || String(error),
    });
  }
});

// Chat endpoint (Gemini 3.8 Flash)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, userContext, language } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    let contextualPrompt = '';
    if (userContext) {
      contextualPrompt += `User Context: `;
      if (userContext.role) contextualPrompt += `[User Role: ${userContext.role}] `;
      if (userContext.isPregnant) contextualPrompt += `[Pregnant: Week ${userContext.weeks || 'unknown'}, Trimester: ${userContext.trimester || 'unknown'}] `;
      if (userContext.isPostpartum) contextualPrompt += `[Postpartum: Day/Week ${userContext.postpartumPeriod || 'recent'}] `;
      contextualPrompt += `\n`;
    }

    if (language) {
      contextualPrompt += `\n[CRITICAL LANGUAGE REQUIREMENT: The user has selected ${language}. You MUST generate your entire response in authentic, fluent ${language}. If Nigerian Pidgin, speak authentic Nigerian Pidgin with motherly terms like 'my sister', 'abeg', 'sharp sharp'. If Swahili, respond in pure Kiswahili. If French, in French. If Hausa, in Hausa. If Yoruba, in Yoruba. Ensure all emergency and medical advice is clear and unmistakable in that language.]\n\n`;
    }

    // Format chat history for generateContent
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Inject context into the latest user message or prepend
    if (contextualPrompt && formattedContents.length > 0) {
      const lastMsg = formattedContents[formattedContents.length - 1];
      if (lastMsg.role === 'user') {
        lastMsg.parts[0].text = `${contextualPrompt}User Message: ${lastMsg.parts[0].text}`;
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_MAMA_G,
        temperature: 0.1,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Mama-G Chat Error:', error);
    res.status(500).json({
      error: 'Unable to process Mama-G consultation at this moment.',
      details: error.message || String(error),
    });
  }
});

// Structured Triage Evaluation Endpoint
app.post('/api/triage', async (req: Request, res: Response) => {
  try {
    const { symptoms, pregnancyStatus, gestationWeeks, postpartumDays, vitals, language } = req.body;

    const triagePrompt = `
Evaluate the following clinical symptom case strictly according to WHO and emergency maternal/neonatal triage protocols:
- Reported Symptoms: ${JSON.stringify(symptoms)}
- Pregnancy Status: ${pregnancyStatus || 'Unknown'}
- Gestational Age: ${gestationWeeks ? `${gestationWeeks} weeks` : 'N/A'}
- Postpartum: ${postpartumDays ? `${postpartumDays} days postpartum` : 'N/A'}
- Vitals / Observations: ${JSON.stringify(vitals || {})}
- Response Language: ${language || 'English'}

Provide a structured clinical triage assessment in ${language || 'English'}. Categorize severity strictly as:
- 'EMERGENCY': Imminent risk to mother or fetus.
- 'URGENT': Needs medical evaluation within 24 hours.
- 'ROUTINE': Normal physiological adaptation.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: triagePrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_MAMA_G,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: {
              type: Type.STRING,
              description: 'Must be one of: EMERGENCY, URGENT, ROUTINE',
            },
            headline: {
              type: Type.STRING,
              description: 'Short 1-sentence scannable triage verdict in the target language',
            },
            dangerSignsDetected: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of specific danger signs or red flags found',
            },
            plainLanguageExplanation: {
              type: Type.STRING,
              description: 'Clear, motherly explanation in the target language',
            },
            immediateActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Direct step-by-step instructions for the mother right now',
            },
            chwClinicalNotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable clinical checks for a Community Health Worker',
            },
            whenToRushToHospital: {
              type: Type.STRING,
              description: 'Clear threshold for emergency transfer',
            },
          },
          required: [
            'severity',
            'headline',
            'dangerSignsDetected',
            'plainLanguageExplanation',
            'immediateActions',
            'chwClinicalNotes',
            'whenToRushToHospital',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Mama-G Triage Error:', error);
    res.status(500).json({
      error: 'Triage evaluation error',
      details: error.message || String(error),
    });
  }
});

// Language Voice Persona Configuration for Gemini TTS
const VOICE_BY_LANGUAGE: Record<string, { voiceName: string; style: string }> = {
  English: {
    voiceName: 'Kore',
    style: 'Warm, calm, empathetic West African community midwife speaking slowly, gently and clearly in English',
  },
  'Nigerian Pidgin': {
    voiceName: 'Kore',
    style: 'Warm, empathetic Nigerian community nurse speaking authentic, natural Nigerian Pidgin with caring motherly rhythm',
  },
  Swahili: {
    voiceName: 'Kore',
    style: 'Mhudumu wa afya ya uzazi na jamii mwenye hekima na upole mwingi akizungumza Kiswahili fasaha, safi na cha kutia moyo',
  },
  French: {
    voiceName: 'Zephyr',
    style: 'Sage-femme communautaire bienveillante, douce et posée parlant un français impeccable, chaleureux et réconfortant',
  },
  Hausa: {
    voiceName: 'Kore',
    style: 'Ungozoma mai tausayi da kwarewa tana magana cikin natsuwa da taushin murya a harshen Hausa mai dadi',
  },
  Yoruba: {
    voiceName: 'Kore',
    style: 'Iya agbebi oninure to n fi okan bale ati ife soro ni ede Yoruba to dan moran fun alaboyun',
  },
};

// Text-to-Speech Endpoint for Low-Literacy Mothers using gemini-3.8-flash-lite-tts
app.post('/api/audio-tts', async (req: Request, res: Response) => {
  try {
    const { text, language } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required for TTS' });
      return;
    }

    const selectedVoiceConfig =
      VOICE_BY_LANGUAGE[language || 'English'] || VOICE_BY_LANGUAGE.English;

    // Keep spoken text concise and focused for fast audio streaming
    const cleanText = text
      .replace(/[#*_`]/g, '')
      .replace(/🚨|💬|📋|🏥|⚠️/g, '')
      .slice(0, 500);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: selectedVoiceConfig.style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoiceConfig.voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      res.status(500).json({ error: 'Audio data not generated' });
      return;
    }

    res.json({ audioBase64: base64Audio, voiceName: selectedVoiceConfig.voiceName });
  } catch (error: any) {
    console.error('Mama-G TTS Error:', error);
    res.status(500).json({
      error: 'TTS generation unavailable',
      details: error.message || String(error),
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Mama-G Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
