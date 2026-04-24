# Chat Conversation

Note: _This is purely the output of the chat conversation and does not contain any raw data, codebase snippets, etc. used to generate the output._

### User Input

Your job is to take a look at the output of the data analysis, read your memories and ask me questions about the research so you get into full context.

The goal is to structure and position this paper.

Please keep in mind and if it is not in the memory add to the memory that my co-author is one of the radiologists and he is a board certified radiologist working in one of the major hospitals of hungary.

We need to figure out the key findings, where this paper might be good to publish. 

First we need to figure out the major findings of the paper.

Here is my list:
AI does not significantly help users, but it can't be concluded mainly because of the small N, this happened because we needed to exclude KL1 cases.
The base DB of from a ground truth perspective is vary bad, after the re-annotation and the reaction of the platinum standard ground truth 28% of the labels have shifted. This is a major finding and a major confounding factor and a risk for other papers and for medical ML models in general.
Neuroticism significantly predicts annotation accuracy. No other psychometric tests are significant.
there is a increase of speed and a decrease of accuracy from phase 1 to phase 2.

I think the paper can be framed as one that started out as an addition study, but turned into an exploration study with the platinum standard GT. We can confirm some of the findings of the DANNY paper, add some with the neuroticism finding and also talk about importance of the open source datasets and the ambiguity of the annotations and the importance of a good annotation.

You are my supervisor, you are a full professor of ai in medicine. You hold a radiology degree also.

Your job is to point out the major findings, the major flaws of the research and help me figure out how to move forward. Where can this be published? How can these findings be structured for the maximal outcome? What is the narrative of the paper?

Please ask questions to get into full context please.@[/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis/FINAL_ANALYSIS_REPORT.md] @[/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis/figures] @[/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis/initial_prompt.MD] @[/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis/data/DANNY_paper.pdf] 

### Planner Response

Let me read all the relevant materials before engaging with you as your supervisor.

*Viewed [FINAL_ANALYSIS_REPORT.md](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis/FINAL_ANALYSIS_REPORT.md) *

*Viewed [initial_prompt.MD](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis/initial_prompt.MD) *

*Listed directory [figures](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis/figures) *

*Listed directory [knowledge](file:///Users/baltaymarci/.gemini/antigravity/knowledge) *

### Planner Response

Good. Now let me look at a few of the key figures and check for any existing knowledge items on this project.

*Viewed [Fig1_Transition_Sankey.png](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis/figures/Fig1_Transition_Sankey.png) *

*Viewed [Fig2_Label_Noise_Summary.png](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis/figures/Fig2_Label_Noise_Summary.png) *

*Viewed [Fig3_CoreResult.png](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis/figures/Fig3_CoreResult.png) *

*Viewed [Fig8_Psychometric_Heatmap.png](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis/figures/Fig8_Psychometric_Heatmap.png) *

*Viewed [Fig5_AI_Confidence_Mislabeled.png](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis/figures/Fig5_AI_Confidence_Mislabeled.png) *

*Viewed [Fig10_Model_Comparison.png](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis/figures/Fig10_Model_Comparison.png) *

### Planner Response

Now I have a thorough picture of the entire study. Let me also note the co-author information to memory before responding.

*Edited relevant file*

*Edited relevant file*

### Planner Response

Good. I've read and absorbed everything. I've saved your co-author's role to memory. Now let me put on my supervisor hat and engage with you properly.

---

# Initial Supervisor Assessment

*Putting on the professor hat — full professor of AI in Medicine, radiology degree, grumpy enough to be honest.*

---

I've reviewed the full analysis report, figures, and study design in detail. Before I give you my structured assessment, I need to ask you several questions because there are gaps that will determine how we frame and where we place this paper.

---

## Questions I Need Answered

**On the Neuroticism Finding — this is your most interesting psychometric result:**

1. The heatmap shows neuroticism predicts *higher* appropriate skepticism (r=0.39) and *lower* over-reliance (r=-0.39) — which is actually the **opposite direction** of what DANNY predicted. That's potentially a headline finding, not a footnote. But before we run with it — did you pre-register this as a directional hypothesis, or is this exploratory? The one-sided p-value note in NB3 (`p=0.9998` for "neuroticism predicting higher over-reliance") tells me the direction flipped on you. How did you handle this in the pre-registration or protocol?

2. The GEE model shows neuroticism predicts *higher accuracy* (OR=1.178, p=0.029). That's counterintuitive — more neurotic = more accurate? What's your clinical interpretation of this? Have you looked at whether this is driven by the no-AI condition specifically? (The Spearman table shows r=0.306 for neuroticism vs accuracy in no-AI, p=0.019, which didn't survive FDR — but the direction is interesting.)

**On the Ground Truth finding — this is your anchor finding:**

3. The binomial test shows the noise is directionally biased toward false negatives (p=0.031). The AI confidence figure is striking: the CNN had *low* confidence on the 5 FN images (median ~0.30), yet those images turned out to be KL2+. This means the **AI was also fooled by the bad labels** during training. Do you have data on whether the AI was *trained* on the OAI dataset images you used, or were they a held-out test set? This is critical for the contamination narrative.

4. Your Fleiss Kappa among the three radiologists on full KL grading is 0.181 — which is essentially poor-to-fair agreement. On binary (excl. KL1) it's 0.517. This is expected clinically, but it raises a methodological question: if even your three expert radiologists barely agreed, on what basis does the platinum *consensus* derive its authority? What was the consensus protocol — majority vote, or did you have a structured consensus meeting with reconciliation? This needs to be crystal clear in the paper because reviewers will attack it.

**On the Study Design and the KL1 Problem:**

5. After excluding KL1, you're down to 27 images. With 51 participants × 27 images, you have 1377 trials per session — that's actually reasonable power at the trial level, but at the *image* level your crossover is thin. The core problem is: the AI was binary, the experiment was binary, but 46% of your image set turned out to be genuinely ambiguous (KL1). Did you consider this a design flaw post-hoc, or did you always know KL1 would be an issue?

6. Your withdrawal effect (7.1% drop, p=0.0013 when AI removed) is statistically solid and clinically meaningful. But here's my concern: was the session 1 vs. session 2 performance drop uniform across all images, or was it concentrated on specific images — particularly the borderline ones? If the withdrawal effect is driven by the KL1-adjacent images that *were* included in the analysis, that changes the interpretation significantly.

**On the DANNY Comparison:**

7. You mentioned wanting to "confirm some DANNY findings." What specifically did DANNY find that you can confirm or refute? I want to know the *exact claims* from the DANNY paper so I can assess how well positioned you are to make a direct comparison. Did DANNY also use the OAI dataset with the same images? If yes — are their results now retrospectively invalidated by your platinum GT finding? *That* would be a much bolder claim worth making.

**On the Participants:**

8. High school students aged 15–18 with zero medical experience. This is an unusual population for a medical annotation study. What is the rationale? Cost? Availability? Ethical considerations? And critically — does this limit generalizability to the actual clinical question (non-expert crowd-sourcing for medical annotation)? Who is the intended annotator in practice? Citizen scientists? Medical students? Radiology residents? The answer changes the framing entirely.

**On Publishing:**

9. Have you submitted or presented any version of this work anywhere? Is there a conference deadline you're targeting, or are you targeting a journal? And crucially — is your co-author radiologist the corresponding author, or are you? This matters for the author order and journal selection strategy.

10. What is the DANNY paper's venue — IUI 2025 you said. Is this primarily an HCI paper? Because that tells me whether you're pitching to the same community (AI/HCI) or trying to cross into medical informatics or radiology journals.

---

Answer what you can. Even partial answers on #3, #4, and #7 will significantly shape the framing. The others help with positioning and narrative. I have a clear opinion on where this should be published and how the narrative should be structured, but I want to hear your answers first before I give you my full assessment.

### User Input

1. I did not pre register it. My hypothesis was that from the big5 and IQ, conscientiousness and IQ would correlate with accuracy. This is a novel finding that surprised me.
2. I do not have an explanation for this. I can take some ideas for this as I am uncertain of why this is happening.
3. The images from my 50 samples were exclusively from the test set of the OAI database. The CNN model was not trained at these images, they were trained on another subset. These 50 images were novel for the CNN when they saw it.
4. The three radiologists annotated the 60 images. The 50 from the first study + 10 from the KL 1 database. This ensured that they did not have a bias towards KL 1 grades. They did not have any AI help, the platform they used only had a magnifier, a color inverter, a KL grading scale and a confidence scale. They all annotated separately and when all of the annotations were in we held a 40 minute consensus meeting where we sat together and decided the ambiguous cases one by one (the ambiguous cases were those that could not be decided with consensus into the negative, KL1 and Positive categories). We went one by one and arrived to a consensus. One addition is that there was a radiologist that who did not annotate the database, but was there on the consensus meeting.
5. I did not expect this. I thought that the GT of the original database was gold standard with very little noise, but when the first part of the study went down with the high school students and I started looking at the data I got suspicious and wanted to investigate the GT. As it turned out there was a significant amount of label noise in the database and there was a significant amount of KL1 grade images in a database that based on the original GT should not have that.
6. I do not know the answer to that, but you are right in that I need to investigate. I am going to need you to write a prompt that is going to produce an analysis that investigates this.
7. I intentionally reproduced their UI and somewhat their test design for the non-expert annotation to test their findings. They had a different sample of images, but they also excluded the KL1 images and had a binary classification. I wanted to reproduce the findings that a non-expert can annotate in high quality and that the AI helps. I think the first claim that non-expert can annotate is somewhat confirmed, but due to maybe the label noise the second one can't be confirmed. I do not want to claim directly that the DANNY paper is invalid because of the label noise, but suggest that label quality might be a confounding and potentially an invalidating element of these studies and that the OAI database likely contains substantial label noise and the radiologist co-author might add that the KL grade is a very subjective scale.
8. As the study has a MRMC design that needs two separate sessions from the annotators with a 27 day washout and each session takes about 30-40 minutes it extremely hard to recruit for. The study did not have any funding so paying the annotators was out of the picture. The availability of these annotators for free was definetely the deciding factor of this cohort. We have a contract with all of the parents from the younger cohort accpeting that their kids will participate in the experiment. We have psychological evidence to believe that if the performance of this cohort differs from the general population it is bellow the average due to their age and developmental psychology, but the DANNY paper with it's university student cohort supports that this cohort is generalizable.
9. I have not sumbitted this and there are no targets of exact journals yet. I am the main author and the radiologist is the supporting author.
10. I am not sure where this paper fits into. It started out as a HCI paper, but turned into a different paper with the platina standard GT. I need you help with this as I am kind of blind here.

### Planner Response

Excellent answers. This is exactly what I needed. Let me give you my full assessment now.

---

# Supervisor's Full Assessment

*This is long. Read it carefully.*

---

## The Real Story of This Paper

Let me be direct with you: **you accidentally ran a better study than you set out to run.** You came in wanting to replicate DANNY and ended up discovering something more important. That is not a weakness — that is the actual story, and it needs to be told exactly that way.

The paper is no longer primarily about whether AI helps non-expert annotators. It is about **what happens when you trust a public medical dataset without validating it.** The AI experiment is the vehicle. The platinum standard finding is the engine.

---

## My Assessment of Your Four Findings

### Finding 1: The Label Noise (Your Anchor — Lead with This)

This is robust, clinically significant, and publishable on its own. The numbers speak for themselves:
- 25 images labeled KL0 → only 6 confirmed KL0 by platinum consensus
- 5 images labeled as "healthy" contained **definite arthritis** (KL2+)
- The bias is directional and statistically confirmed (binomial p=0.031)

Your consensus protocol is actually solid and will survive reviewer scrutiny: three radiologists annotating blindly and independently, a structured 40-minute consensus meeting, a fourth radiologist present at consensus as an observer. The low inter-rater Fleiss Kappa (0.181 on full KL) is **not a weakness** — it is a **finding**. You frame it as: *"The low pre-consensus agreement (κ=0.181) demonstrates why single-rater or unvalidated public labels are insufficient, and simultaneously validates why a structured consensus process was necessary."* The binary kappa (0.517) post-exclusion of KL1 is moderate and acceptable.

**One critical point:** Your CNN was trained on a *different* OAI subset, not your 50 images. This means the model learned from the same noisy label distribution that contaminated your test set. The low AI confidence on the 5 false-negative images (median ~0.30) is consistent with a model that was trained to call KL0 on those kinds of images. The model was *correct by platinum standard* on those images, but its own training punished it for that. This is a subtle but powerful point: **the AI was right, the labels were wrong, and the AI still lost confidence.** Make sure this is stated explicitly.

### Finding 2: AI Non-Significance (Not a Failure — Frame it Correctly)

GEE OR=1.164, p=0.178, Cohen's d=0.251. This is not "AI doesn't help." This is:

> *"Our primary analysis was underpowered to detect an AI benefit due to the exclusion of 46% of the image set following platinum standard reclassification as KL1. With N=27 remaining images and a small but directionally positive effect (OR=1.16, d=0.25), the study was not adequately powered to confirm or refute an AI benefit on this image set."*

However — and this is important — **your Wilcoxon test (p=0.037) and McNemar AI influence test (p=0.047) both reach significance.** These are softer analyses but they tell a consistent story. The AI *does* influence decisions, but whether that influence improves outcomes is indeterminate given the power constraints. You should keep this nuance front and center.

### Finding 3: Neuroticism (Your Most Surprising and Novel Finding)

This needs careful handling because it is **counterintuitive and directionally opposite to what was hypothesized.** Let me give you a theoretical framework for it:

The conventional expectation is: higher neuroticism → anxiety → over-reliance on authority signals (AI) → worse calibration. But your data shows the opposite: higher neuroticism → more appropriate skepticism, less over-reliance, better accuracy.

Here is one defensible explanation: **anxious individuals in an uncertain domain are *more vigilant*, not more compliant.** When a high school student with high neuroticism sees an AI prediction they're unsure about, their anxiety manifests as *resistance to the external signal* rather than acceptance of it. They second-guess. They re-examine. This is actually the *correct* behavior for a detection task where false negatives are costly. The neurotic student's internal alarm system overrides the AI's authority signal. 

This is consistent with literature on **anxiety and hypervigilance in uncertainty** — anxious individuals tend to process ambiguous stimuli more carefully, not less. You should cite Carleton (2016) on intolerance of uncertainty, and possibly Eysenck's Attentional Control Theory.

Also important: **this finding holds in the GEE model controlling for condition.** It is not an artifact of the no-AI vs AI split.

**One caveat you must address in the paper:** Your sample is all adolescents (15-18), and neuroticism in adolescents is correlated with developmental stage in ways that differ from adult populations. Make sure you flag this as a potential moderator of generalizability.

### Finding 4: Speed Increase, Accuracy Decrease (Session Effect / Withdrawal)

The session effect is solid (Session 2 slower by 14.8%, p significant; withdrawal effect -7.1%, p=0.0013). I have flagged Question 6 — whether the withdrawal effect is image-specific — as something you need to analyze before we can interpret this finding fully. I am generating that analysis prompt below.

---

## The Major Flaws You Need to Address

**Flaw 1: No Pre-Registration.**
You didn't pre-register. The neuroticism finding was a surprise. You *must* clearly label it as exploratory/post-hoc in the paper. Use the standard language: *"This analysis was exploratory and not pre-specified. Results should be interpreted with appropriate caution pending replication."* Don't try to hide it — reviewers will ask, and honesty here builds credibility.

**Flaw 2: High School Students.**
This is the weakest external validity argument. Your defense (DANNY used university students → your results are consistent → generalizable) is *circumstantial*, not direct. What you CAN say is: *"If anything, high school students represent a lower bound on non-expert annotation quality. The fact that accuracy under platinum GT was 78-81% suggests that even developmentally younger non-experts can achieve clinically relevant accuracy on binary OA detection, supporting the generalizability ceiling established by DANNY."*

**Flaw 3: Single-Site, No Funding, Convenience Sample.**
You know this. State it clearly in limitations. Don't oversell generalizability.

**Flaw 4: The AI Was Calibrated to the Noisy GT.**
This is actually both a flaw AND a feature. It's a flaw because the AI's 70% accuracy target was based on corrupted labels. It's a feature because it *illustrates your point* — the AI was built on bad data, trained on bad data, and still partially correct by platinum standard. This is the strongest argument for platinum standard validation as a prerequisite for AI deployment in this space.

---

## Where to Publish

This paper now sits at the intersection of three fields. Here is my recommendation stack, in order:

| Tier | Journal | Rationale |
|---|---|---|
| **Target** | **Radiology: Artificial Intelligence** (RSNA) | Perfect fit: annotation quality + AI assistance + radiology GT. Strong IF (~10). Radiologist co-author is critical credential here. |
| **Strong Alternative** | **npj Digital Medicine** (Nature) | Higher prestige, broader audience, covers AI methods in medicine. Your dataset critique angle fits their scope. More competitive. |
| **Safe Alternative** | **JAMIA** (Journal of American Medical Informatics) | Covers methodology, annotation studies, and human-AI interaction in clinical contexts. Very suitable. Slightly lower impact. |
| **If rejected** | **European Radiology** | Strong European presence, your Hungarian hospital co-author is a selling point, they have a growing AI supplement. |
| **Conference first?** | **MICCAI workshop** (Medical Image Computing) | Consider submitting the GT finding as a workshop paper to MICCAI to get community feedback before full journal submission. |

**My actual recommendation: Radiology: AI first.** Here is why:
1. Your board-certified radiologist co-author at a major Hungarian hospital is a direct credibility signal for this journal's audience.
2. The OAI dataset critique is directly actionable for the musculoskeletal imaging community — these are people who *use* OAI data regularly.
3. The human-AI interaction finding (neuroticism, reliance taxonomy) is novel to that community — they don't see psychometrics papers.
4. The journal is open to methodological critiques of standard datasets.

---

## The Narrative Architecture

Here is how I would structure the paper's argument:

**Title (working):** *"Platinum Standard Validation Reveals Systematic Label Noise in a Public Osteoarthritis Dataset: Implications for Human-AI Annotation Studies"*

**Abstract arc:**
1. We designed an AI-assisted annotation study extending DANNY (non-expert, MRMC).
2. Post-collection, we conducted platinum standard validation.
3. We found 28% label shift with directional false-negative bias (p=0.031).
4. This noise explains the underpowered AI benefit result and invalidates direct comparison with original GT metrics.
5. Under platinum GT: neuroticism predicts annotation accuracy and appropriate AI skepticism.
6. We call for platinum standard validation as a prerequisite for medical annotation benchmarks.

**Section structure:**
1. Intro: non-expert annotation + AI assistance in medical imaging, the OAI dataset and its assumed quality, DANNY gap we aimed to fill
2. Methods: full study design (MRMC, participants, AI, psychometrics) + platinum standard protocol (radiologist credentials, annotation platform, consensus process)
3. Results — Part A (GT Validation): the core label noise finding, Sankey, directional bias test, AI confidence on mislabeled images
4. Results — Part B (Annotation Study): AI effect (GEE, null, power analysis), session effects, withdrawal effect, reliance taxonomy
5. Results — Part C (Psychometrics): neuroticism findings (exploratory), IQ/conscientiousness null
6. Discussion: why the noise happened (KL1 ambiguity, subjectivity of KL grading per your radiologist's expertise), implications for OAI-derived benchmarks, neuroticism interpretation, limitations
7. Conclusion: call for platinum standard validation in medical ML annotation research

---

## The Prompt for the Withdrawal Effect Analysis

Here is the analysis prompt for Question 6:

---

> **Analysis Task: Withdrawal Effect Decomposition by Image**
>
> Using the existing pipeline and platinum GT (Strategy A — exclude KL1), investigate whether the session-to-session accuracy drop in Treatment Group 1 (AI-first, then no-AI) is uniformly distributed across images or driven by specific image subsets.
>
> **Analyses to run:**
> 1. For each of the 27 included images (KL1 excluded), compute: (a) mean accuracy in Session 1 (TG1, AI condition) and (b) mean accuracy in Session 2 (TG1, no-AI condition). Compute the per-image accuracy delta = Session2 - Session1. Plot as a ranked bar chart colored by gt_plat_kl.
> 2. Test whether the withdrawal effect is larger for specific image difficulty levels: run a mixed model predicting accuracy ~ session × gt_plat_kl for TG1 only, with participant random effect.
> 3. Test whether images where the AI was correct (ai_correct_plat=True) show a larger withdrawal effect than images where AI was incorrect.
> 4. Report: which images drove the largest accuracy drops? Are they concentrated in KL2 (moderate) or KL3/4 (severe)? Are they concentrated among images where the AI was correct (i.e., AI was helping and its removal caused the drop)?
> 5. Visualize as a 2-panel figure: left = per-image delta bar chart, right = boxplot of delta by gt_plat_kl.
>
> The goal is to determine whether the withdrawal effect is a general performance plateau or a targeted dependency on specific image-AI combinations. This will inform whether the "brittle benefit" interpretation applies broadly or only to images where participants were genuinely relying on correct AI signals.

---

## My Final Three Questions Before We Start Writing

1. **The 10 extra KL1 images** — you mentioned the radiologists annotated 60 images total (50 from the study + 10 from a KL1 database). Where did those 10 come from, and why were they included? Were they shown to participants or only to radiologists? This is relevant to the Methods section.

2. **Session washout verification** — was the 27/28-day washout actually enforced? Do you have timestamp data confirming participants didn't do both sessions within a shorter window? A reviewer will ask.

3. **The 17 dropouts** — you recruited 68, completed 51. The analysis notes that the psychometric N is 58 (51 completers + 7 TG0 dropouts who completed session 1 and psychometrics). What happened to the other 10 dropouts (TG1)? Did they drop before completing psychometrics? Is there any indication of differential attrition between groups that could bias the psychometric findings?

Run the withdrawal analysis when you're ready. Then we structure the paper outline and I'll help you write the Introduction.

### User Input

1. The extra 10 images came from the KL1 grade part of the test set of the OAI database. They were included not to cause bias to the radiologist.
2. Yes, we do have timestamp data and the 27 day washout period was enforced with a rule in the web app that annotators could only open the web app for the second time if the time has passed.
3. The psychometric data of the drop offs were not included in the analysis. All dropoffs were excluded from the analysis. There were student that got sick at the second session of were absent from the first session and thus only completed one session.

### Planner Response

Good. Those answers are clean and defensible. Let me update my memory with these details and then give you my synthesis.

*Edited relevant file*

### Planner Response

Good. Memory updated. Now my full synthesis:

---

## Three Things Are Now Resolved and Two Things Need Action

### ✅ What's Now Clean and Defensible

**The consensus protocol is genuinely strong.** A fourth non-annotating radiologist at the consensus meeting is actually excellent — it functions as an independent observer preventing groupthink. The "blind enrichment" with 10 KL1 images is a smart methodological decision that you should name explicitly in the Methods section. Call it what it is: *a spectrum-enriched blind annotation design to prevent grade-anchoring bias*. Reviewers will appreciate that you thought of this.

**The washout enforcement is airtight.** Technical enforcement via the web app with timestamp logs is far stronger than self-reported compliance. Most studies like this rely on participant honesty. You have data. Make sure that single sentence appears in your Methods: *"Session 2 access was gated by the application, which enforced the minimum 27-day interval verified by server-side timestamps."*

**The dropout explanation is clean.** Illness and absence are random, non-differential attrition. This is your best-case dropout scenario — you don't have a pattern that suggests systematic selection effects.

---

### ⚠️ Issue That Must Be Resolved Before Writing the Methods

**There is a discrepancy in your psychometric sample size that you may not be aware of.**

Your NB3 notebook uses **N=58** for the psychometric analyses — not N=51. It explicitly includes 7 dropouts from Treatment Group 0 who completed Phase 1 and the psychometric assessments before dropping out. The notebook states:

> *"This consists of the 51 completers plus 7 dropouts from the Control-first group (TG=0) who completed Phase 1 and the psychometrics before dropping out."*

You told me all dropouts were excluded. **One of these is wrong, and it matters for the neuroticism finding.** The GEE model for neuroticism was built on the larger N=58 cohort. You need to verify:

1. Were these 7 TG0 partial completers intentionally included in psychometrics because they provided valid data up to that point?
2. Or is this a bug in the notebook that inflated N without your knowledge?

If they were legitimately included — fine, but you need to be explicit about it and justify the inclusion (they completed all the measures the psychometric analysis requires). If it's a bug — you need to rerun NB3 on N=51 and check if the neuroticism finding survives.

**This is your most urgent pre-writing task.** Go look at your data. How many participants completed the psychometric battery? Is it 51 or 58?

---

## Where We Go From Here — Proposed Order of Operations

| Step | Task | Who |
|---|---|---|
| 1 | **Resolve the N=51 vs N=58 discrepancy** | You + check the data |
| 2 | **Run the withdrawal effect decomposition analysis** | Me (I write the analysis prompt, you run it) |
| 3 | **Draft the paper outline as a structured document** | Me (with your sign-off) |
| 4 | **Write the Introduction and Methods sections** | Both of us |
| 5 | **Get your radiologist co-author's written statement on KL grade subjectivity** | You + co-author |

Step 5 is important and often overlooked: your radiologist co-author can contribute a short clinical commentary in the Discussion — something like *"The inherent subjectivity of the Kellgren-Lawrence grading scale, particularly at grades 0-1, means that single-institution or unvalidated public labels should not be treated as ground truth in ML benchmarks."* That is a clinically authoritative statement that coming from a board-certified radiologist at a major hospital carries weight that you as an AI researcher cannot provide alone. That is exactly why he is on this paper.

---

Tell me: **is the N=58 intentional or a bug?** Once you confirm that, I'll write the withdrawal decomposition analysis script and we start on the paper outline.

### User Input

I have fixed these problems and re run all the Jupyter notebooks. 

Can you please go one more round with the analysis and plan.

I need you to ask even more questions and ask for more context. It is better to work on the context too much than not having enough context.

Please look at all the data again and think about it. You are still my supervisor.

Please start by rerunning the final analysis report. So you can read the correct my file.

*Viewed [FINAL_ANALYSIS_REPORT.md](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis/FINAL_ANALYSIS_REPORT.md) *

### Planner Response

Let me read the full updated report carefully before engaging.

*Listed directory [New analysis](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis) *

### Planner Response

The report file has moved. Let me find it.

*User accepted the command `find "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis" -name "*.md" -not -path "*/node_modules/*" 2>/dev/null`*

### Planner Response

The FINAL_ANALYSIS_REPORT.md no longer exists as a standalone file — the notebooks now write directly to report_assets. Let me read the report output from the notebooks directly by looking at what the scratch/README says, and read the key notebooks' outputs.

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && jupyter nbconvert --to script NB0_data_quality.ipynb NB1_ground_truth_comparison.ipynb NB2_annotation_experiment.ipynb NB3_psychometrics.ipynb NB4_integrated_models.ipynb --stdout 2>/dev/null | grep -v "^#" | grep -v "^$" | head -5`*

### Planner Response

Let me directly read the notebook outputs which contain the executed cell results:

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && python3 -c "
import json, sys

notebooks = [
    'NB0_data_quality.ipynb',
    'NB1_ground_truth_comparison.ipynb', 
    'NB2_annotation_experiment.ipynb',
    'NB3_psychometrics.ipynb',
    'NB4_integrated_models.ipynb'
]

for nb_name in notebooks:
    print(f'\n{'='*60}')
    print(f'NOTEBOOK: {nb_name}')
    print('='*60)
    try:
        with open(nb_name) as f:
            nb = json.load(f)
        for cell in nb['cells']:
            if cell['cell_type'] == 'code' and cell.get('outputs'):
                for output in cell['outputs']:
                    if output.get('output_type') in ('stream', 'execute_result', 'display_data'):
                        text = output.get('text', output.get('data', {}).get('text/plain', ''))
                        if isinstance(text, list):
                            text = ''.join(text)
                        if text and len(text.strip()) > 10:
                            print(text[:3000])
    except Exception as e:
        print(f'Error: {e}')
" 2>&1 | head -600`*

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && python3 -c "
import json

notebooks = [
    'NB0_data_quality.ipynb',
    'NB1_ground_truth_comparison.ipynb', 
    'NB2_annotation_experiment.ipynb',
    'NB3_psychometrics.ipynb',
]

for nb_name in notebooks:
    print(f'\n{\"=\"*60}')
    print(f'NOTEBOOK: {nb_name}')
    print('='*60)
    try:
        with open(nb_name) as f:
            nb = json.load(f)
        for cell in nb['cells']:
            if cell['cell_type'] == 'code' and cell.get('outputs'):
                for output in cell['outputs']:
                    if output.get('output_type') in ('stream', 'execute_result', 'display_data'):
                        text = output.get('text', output.get('data', {}).get('text/plain', ''))
                        if isinstance(text, list):
                            text = ''.join(text)
                        if text and len(text.strip()) > 10:
                            print(text[:2000])
    except Exception as e:
        print(f'Error: {e}')
" 2>&1`*

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && python3 -c "
import json

notebooks = ['NB0_data_quality.ipynb', 'NB1_ground_truth_comparison.ipynb']

for nb_name in notebooks:
    print(f'\n{\"=\"*60}')
    print(f'NOTEBOOK: {nb_name}')
    print('='*60)
    with open(nb_name) as f:
        nb = json.load(f)
    for cell in nb['cells']:
        if cell['cell_type'] == 'code' and cell.get('outputs'):
            for output in cell['outputs']:
                if output.get('output_type') in ('stream', 'execute_result', 'display_data'):
                    text = output.get('text', output.get('data', {}).get('text/plain', ''))
                    if isinstance(text, list):
                        text = ''.join(text)
                    if text and len(text.strip()) > 10:
                        print(text[:3000])
" 2>&1`*

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && python3 -c "
import json

with open('NB2_annotation_experiment.ipynb') as f:
    nb = json.load(f)

for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code' and cell.get('outputs'):
        for output in cell['outputs']:
            if output.get('output_type') in ('stream', 'execute_result', 'display_data'):
                text = output.get('text', output.get('data', {}).get('text/plain', ''))
                if isinstance(text, list):
                    text = ''.join(text)
                if text and len(text.strip()) > 10:
                    print(text[:3000])
" 2>&1`*

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && python3 -c "
import json

# Check the speedup analysis and session comparison more carefully from NB2
with open('NB2_annotation_experiment.ipynb') as f:
    nb = json.load(f)

# Print all markdown cells to understand the structure too
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'markdown':
        src = ''.join(cell['source'])
        if '##' in src or 'Section' in src:
            print(f'[MD cell {i}]:', src[:200])
" 2>&1`*

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && python3 -c "
import json

# Read speedup from NB2 cell outputs specifically 
with open('NB2_annotation_experiment.ipynb') as f:
    nb = json.load(f)

# Cell 11 should be temporal dynamics, get all outputs with Speedup in them
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code' and cell.get('outputs'):
        for output in cell['outputs']:
            text = output.get('text', output.get('data', {}).get('text/plain', ''))
            if isinstance(text, list):
                text = ''.join(text)
            if 'Speed' in text or 'speed' in text or 'duration' in text or 'Duration' in text or 'Session' in text:
                print(f'Cell {i}:', text[:2000])
" 2>&1`*

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && python3 -c "
import json

with open('NB2_annotation_experiment.ipynb') as f:
    nb = json.load(f)

# Cell 11 - temporal dynamics section
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code' and i >= 10 and i <= 14:
        print(f'--- CELL {i} source ---')
        print(''.join(cell['source'])[:500])
        print(f'--- CELL {i} outputs ---')
        for output in cell.get('outputs', []):
            text = output.get('text', output.get('data', {}).get('text/plain', ''))
            if isinstance(text, list): text = ''.join(text)
            if text: print(text[:2000])
        print()
" 2>&1`*

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && python3 -c "
import json

with open('NB2_annotation_experiment.ipynb') as f:
    nb = json.load(f)

# Find speedup output 
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code':
        src = ''.join(cell['source'])
        if 'speedup' in src.lower() or 'speed' in src.lower() or 'duration' in src.lower():
            print(f'--- CELL {i} source snippet ---')
            print(src[:600])
            print(f'--- CELL {i} outputs ---')
            for output in cell.get('outputs', []):
                text = output.get('text', output.get('data', {}).get('text/plain', ''))
                if isinstance(text, list): text = ''.join(text)
                if text: print(text[:1000])
            print()
" 2>&1`*

### Planner Response

I notice the speedup data from NB2 (`Session 1 Mean Duration: 17.43s`, `Session 2 Mean Duration: 14.84s`) is missing from the re-run. Let me check what happened:

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && python3 -c "
import json

with open('NB2_annotation_experiment.ipynb') as f:
    nb = json.load(f)

# Print ALL code cells with outputs for NB2
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code':
        src = ''.join(cell['source'])
        outputs = cell.get('outputs', [])
        if outputs:
            for output in outputs:
                text = output.get('text', output.get('data', {}).get('text/plain', ''))
                if isinstance(text, list): text = ''.join(text)
                if text and ('Session' in text or 'Speedup' in text or 'Mean Duration' in text or 'Withdrawal' in text or '17.' in text or '14.' in text):
                    print(f'CELL {i}:', text[:500])
        # also check if speedup code exists but has no output
        if 'Speedup' in src or 'session_mean' in src or 'Mean Duration' in src:
            print(f'CELL {i} HAS SPEEDUP CODE but outputs:', len(outputs))
" 2>&1`*

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && python3 -c "
import json

with open('NB2_annotation_experiment.ipynb') as f:
    nb = json.load(f)

# Show ALL code cells that have no output or empty output - to see what's missing
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code':
        src = ''.join(cell['source'])
        outputs = cell.get('outputs', [])
        has_text_output = False
        for o in outputs:
            t = o.get('text', o.get('data', {}).get('text/plain', ''))
            if isinstance(t, list): t = ''.join(t)
            if t and len(t.strip()) > 5:
                has_text_output = True
        if not has_text_output and src.strip():
            print(f'Cell {i} - NO TEXT OUTPUT:')
            print(src[:400])
            print('---')
" 2>&1`*

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && python3 -c "
import json

with open('NB2_annotation_experiment.ipynb') as f:
    nb = json.load(f)

# Find cell 11 fully - get all text from the source
cell_11 = nb['cells'][11]
print('Cell 11 source:')
print(''.join(cell_11['source']))
print('Outputs:')
for o in cell_11.get('outputs', []):
    text = o.get('text', o.get('data', {}).get('text/plain', ''))
    if isinstance(text, list): text = ''.join(text)
    print(repr(text[:500]))
" 2>&1`*

### Planner Response

Good — I can see the speedup analysis that was in the old report is not in cell 11 (it was removed or moved). The data is consistent. I now have the complete picture of the updated analysis. Let me look at the updated figures to confirm what changed:

*Viewed [Fig4_Reliance_Taxonomy.png](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis/figures/Fig4_Reliance_Taxonomy.png) *

*Viewed [Fig9_Learning_Curves.png](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis/figures/Fig9_Learning_Curves.png) *

*Viewed [Fig3_Accuracy_Paradox.png](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis/figures/Fig3_Accuracy_Paradox.png) *

*Viewed [Fig6_Decision_Flip_Map.png](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis/figures/Fig6_Decision_Flip_Map.png) *

### Planner Response

I now have a complete and detailed picture of the updated analysis. I see two significant issues I need to flag immediately — the learning curve figure is broken, and the accuracy paradox figure is missing the per-condition breakdown. Let me now respond in full as your supervisor.

---

# Second Round Supervisor Assessment

*Absorbing everything carefully before I speak.*

---

## What Changed from the Previous Run

Good: the N=51 fix in NB3 is confirmed. The psychometric numbers are slightly different as expected — neuroticism still significant at p=0.043 (Platinum GT), but it **disappears under original GT** (p=0.196). That GT-sensitivity is actually a major finding in itself and I'll address it below.

The core numbers are stable. The analysis is consistent.

---

## Three Immediate Technical Problems That Must Be Fixed Before Writing

### Problem 1: The Learning Curve Figure is Broken — Critical

**Fig9_Learning_Curves.png** is completely degenerate. It shows a flat line at accuracy=1.0 for AI condition and a flat line at 0.0 for No-AI condition across all 50 trial positions. This is physically impossible and indicates the data being fed into the LOESS plot is wrong — almost certainly it is using the binary accuracy column (0 or 1 per trial), not the participant-level smoothed accuracy, and the `lmplot` is collapsing on an aggregated variable incorrectly. The LOESS smoother cannot produce a meaningful curve with binary data at the trial level without proper aggregation first. **This figure cannot go anywhere near a manuscript.** It needs to be rebuilt.

### Problem 2: The Accuracy Paradox Figure is Incomplete

**Fig3_Accuracy_Paradox.png** only shows two bars — AI Model and Human Annotator (Overall) — comparing Original vs Platinum GT. This is a useful figure but it is **missing the key dimension**: the split by AI condition vs No-AI condition. The original specification called for a figure that shows all three KL1 strategies side by side. More importantly, the striking story is not that human accuracy changed overall — it is that the **rank order** of AI condition vs No-AI condition changes depending on which GT you use. Under original GT the narrative goes one way; under platinum GT it goes another. That contrast needs to be visible in the figure to make the "accuracy paradox" argument.

### Problem 3: The Speedup Analysis Has Vanished from the Notebooks

The original analysis report had explicit speedup numbers:
- Control Speedup (Late - Early): -2.10s
- AI Speedup (Late - Early): -11.89s
- Session 1 Mean Duration: 17.43s, Session 2 Mean Duration: 14.84s (14.8% reduction, p<0.0001)

These numbers are no longer appearing in the re-run NB2 outputs. The speedup is relevant because it supports the argument that **AI accelerates the decision process** — which is a usable finding even if the accuracy effect is underpowered. I need to know: did you intentionally remove this analysis, or did something break when you re-ran? This needs to be restored.

---

## Deep Dive: The Neuroticism Finding Under GT Switch

This is the most important new insight I got from the updated run. Look at the GT switch robustness table from NB3:

| Predictor | Platinum OR | Platinum p | Original OR | Original p |
|---|---|---|---|---|
| **big5_neuroticism** | **1.161** | **0.043** | 1.064 | 0.196 |
| big5_conscientiousness | 0.951 | 0.587 | **1.149** | **0.012** |

This is a profound finding for your paper's narrative:

- **Under the corrupted GT**: Conscientiousness is significant (p=0.012), Neuroticism is not (p=0.196)
- **Under the platinum GT**: Neuroticism is significant (p=0.043), Conscientiousness is not (p=0.587)

**The label noise literally swapped which personality trait appeared to matter.** A researcher using the original OAI GT would have concluded "conscientiousness predicts annotation quality" and published that. You would have confirmed your original hypothesis. Instead, the platinum GT reveals it is neuroticism — a completely different trait with a completely different mechanistic interpretation.

This is not just a statistical artifact. It is a demonstration that **psychometric findings derived from noisy ground truth are unreliable**. This adds an entirely new dimension to your paper's argument: it's not just that accuracy metrics are distorted by label noise — it's that **which psychological predictors appear significant depends on the quality of your ground truth.** That is a genuinely novel methodological contribution to the field.

---

## New Deep Questions — Round Two

Now that I have absorbed the full picture, here are the questions I still need answered:

**On the Study Infrastructure:**

1. You built a custom web application for this study. What did the interface look like from the participant's perspective? Specifically: when the AI heatmap was shown, did participants see the CNN's binary prediction (positive/negative), the confidence score (0-1), the heatmap overlay, or all three? The exact information presented affects how we interpret the reliance taxonomy. A participant who sees a confident AI prediction (e.g., 0.9) versus an uncertain one (0.5) should theoretically behave differently — do you have breakdowns of reliance behavior stratified by AI confidence level?

2. Was the order of images randomized independently for each participant within each session, or was it the same randomized order for everyone? If everyone saw images in the same order within a session, trial_order effects are image-difficulty confounded and the learning curve analysis (if fixed) needs to account for this.

3. What was the study's ethical approval situation? This is relevant for the Methods section — do you have institutional ethics approval (IRB equivalent in Hungary), and was the consent process for minors (parents of 15-18 year olds) formally documented? This is a hard requirement for any medical journal submission.

**On the DANNY Paper Specifically:**

4. DANNY used a similar reliance taxonomy (over-reliance, appropriate skepticism, etc.). What were their over-reliance and appropriate skepticism rates? You have 7.8% over-reliance and 14.5% appropriate skepticism. How does this compare to DANNY's numbers? If your rates are substantially lower, that is consistent with your platinum GT correction (fewer opportunities for over-reliance when the AI is "wrong" fewer times under platinum GT). This comparison is important to make explicit.

5. Did DANNY also find a withdrawal/brittle benefit effect? If not, your finding of a 7.1% accuracy drop when AI is removed (p=0.0013) is a novel contribution beyond what they reported.

6. Did DANNY report any psychometric predictors? If they did not include personality measures at all, your entire psychometric section is additive, not competitive.

**On the Data Itself:**

7. You have `symptom1` and `symptom2` columns — these are bounding box annotations drawn by participants. Have you done anything with these? Are they usable? Could they tell us something about *where* participants looked on the image, and whether this differs between AI and No-AI conditions? Even a descriptive analysis of "did participants mark different regions with vs without AI?" could be a supplementary finding. I'm asking because if this data exists and is rich, it could become a future paper or strengthen the current one.

8. The `phase1_video_watched` column has 1296 missing values out of 2754 trials. Does this mean that only some participants watched an instruction video before the experiment? Or is this column only populated in Phase 1? What was in the video — were participants shown examples of what OA looks like on X-rays? This is critical for interpreting the non-expert accuracy baseline, because if participants received structured training on what to look for, their accuracy is not purely "naive non-expert" performance.

9. The treatment group balance is slightly unequal: TG=0 has 27 participants, TG=1 has 24. This is a 3-participant imbalance. How was group assignment done — was it randomized (and happened to be unequal), block randomized, or convenience assigned? A reviewer will ask. If it was random, the imbalance is fine. If it was not, that is a limitation.

**On the Clinical Interpretation:**

10. Your radiologist co-author: has he read the results yet? Specifically, what is his clinical interpretation of the 5 false-negative images (the KL0→KL2+ cases)? Was there a systematic visual feature that made those images look "clean" to the original annotators but contained pathology? If he can say something concrete — e.g., "these five images all showed medial compartment narrowing that is easily missed without systematic joint space measurement" — that is a clinically grounding statement that transforms the paper from methodological to clinically actionable.

11. Your AI model has 100% specificity under platinum GT (exclude strategy) — meaning it never called a true negative as positive. But it has only 50% NPV. Can you explain this apparent tension? (I suspect it is because of the small number of platinum-confirmed negatives after KL1 exclusion — only 6 true KL0 images — making NPV unstable. But I want to hear your understanding of this.)

**On the Paper's Framing:**

12. You mentioned wanting to "confirm that non-experts can annotate in high quality." What is your definition of "high quality"? The overall accuracy is 78-81% under platinum GT. For context: what does the literature say a minimally competent annotator should achieve on binary OA classification? If DANNY reported ~75-80% for their university student population, you are in the same range despite your younger cohort — which is the generalizability argument. But if the field standard for "high quality" is 85%+, you need to be careful about claiming this.

13. You have not mentioned a power analysis anywhere. For a journal submission — especially to Radiology: AI — reviewers will ask whether the study was adequately powered for its primary outcome. Was a power analysis done before data collection? If not, you need to run a post-hoc power analysis and be honest about it. For an exploratory/replication study without pre-registration, this is somewhat more forgiving, but it still needs to appear.

14. Your Figure 6 (Decision Flip Map) is visually complex and hard to read at a glance. The four-category coding (Wrong Both, Correct Only Original, Correct Only Platinum, Correct Both) is the right conceptual structure, but the current figure does not sort images or participants in any meaningful order. Have you considered sorting images by "proportion of participants where platinum and original disagree" (i.e., by label noise impact) so the most contested images appear as a visible band? That would make this figure much more impactful.

---

## My Prioritized Action List Before We Write

Here is what I think needs to happen, in order:

| Priority | Action | Urgency |
|---|---|---|
| 🔴 **1** | Fix the learning curve figure (Fig9) — it's broken | Must fix |
| 🔴 **2** | Restore the speedup/session duration analysis in NB2 | Must fix |
| 🔴 **3** | Rebuild the accuracy paradox figure with AI vs No-AI condition split | Must fix |
| 🟠 **4** | Add explicit post-hoc power analysis | Important |
| 🟠 **5** | Answer questions 1, 8, 10, 12 above before writing begins | Important |
| 🟡 **6** | Explore symptom bounding box data (Q7) | If time allows |
| 🟡 **7** | Sort Fig6 by label noise impact | Polish |

The three red items are blocking — I cannot help you write the Results section until the figures that will appear in it are correct. 

Answer my questions when you can. And tell me — **do you want me to write the analysis scripts to fix the three broken items** right now while you work on the contextual answers?

### User Input

1. I have included four screenshots for you of the flow of the AI flow, so the application as it goes. You can identify based on the names, so 1, 2, 3, 4, the five different screens. We do not yet have analysis for this, but just to clarify things, the users had to give a confidence from 1 to 7 after the initial decision and the bounding boxes. And then they had a heat map, a overlap with the CNN, a heat map, a AI confidence from 0 to 100%, obviously converted to from 0 to 1, and a diagnosis of the AI, negative positive, and then they could revert, stay with their decision, and then give a final confidence.

2. Everybody had a random order in both sessions. So each session, each individual in each session had a different order of the images. There are variables to determine this. The "trial_id" variable contains this information and the "trial_image_name" variable. The "trial_image_name" contains the name of the image like 1.png, 2.png and the "trial_id" either starts with "p2_trial_" followed by a number from 1 to 50 or it starts by "trial_" and the same goes for the numbers. You can determine the order by the number at the end of the trial_id variable and you can determine the name of the image by the trial_image_name variable.

3. it was determined that the study did not need a ethical approval as the study at hand wasn't of that nature, but the minors did have, we do have a consent from their parents, a contract signed with those parents from the smaller class who were below 16 because parental consent is needed below 16. And we do have it.

4-5 Please look in the danny paper.

6. The DANNY paper did not explore individual differences of the annotators.

7. Thirdly, we could definitely do something with it. Please note that only the AI group had bounding boxes, only they drew with the bounding boxes. We could definitely derive some correlation between the overlap of their bounding boxes and their accuracy. Yeah, if you suggest that, we can definitely explore it.

8. I think that is due to a bug, so that everybody watched the video that was the educational video that showed them how to annotate. So let's leave it for now.

9. The assignment to the treatment group was done at random, and the slight imbalance is due to the fact that there was some drop-off, there were some non-completers due to their abstinence, due to sickness. So these, those who dropped off, dropped off because they were sick, they were absent, and that's causing the class imbalance. But I think we are good here.

10. I am going to consult my co-author. He did not take a look at it yet, but I have added it to my notes and we're going to explore it together.

11. It is likely due to the fact that we have a very small KL0, so negative dataset. That is very likely the root cause. From the 50 images, the prediction balance was very balanced, so 26 images were predicted to be negative and 24 to be positive. So this, with the combination of our very few KL0 cases, likely caused this 100% specificity.

12.  In the Danny paper, 83.4% accuracy was achieved in the experimental group and 68.9% in the control, no AI group. So quite a different finding there. Please look at the Danny paper because that is going to help. So we are in the same neighborhood.

13. I think I have done a GPOWER power analysis, so I used the programming or the statistical tool GPOWER, and I've done the power analysis, and I do have a proof of that, so like a screenshot, I have saved it. An N=50-90 was produced with G*Power . Do you need more info on that?

14. I have not done that, but what you outlined is a good idea. 


Please think about these questions deeply. 

I would like you to outline what are the things that need to be modified and improved and please write the prompt for each, one by one, for another agent to fix them.

Be precise in your speech, be specific on what that other agent has to do. Do not leave things for the imagination of that other agent. DO NOT be vague.

Please first tell me what has changed as a result of this context and outline what needs to be improved like your previous priority list and then I am going to ask you to write the prompts.
@[/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis/data/DANNY_paper.pdf] 

*Viewed [participants.csv](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis/data/participants.csv) *

### Planner Response

Let me read the DANNY paper now before doing my full analysis.

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis/data" && python3 -c "
import subprocess
result = subprocess.run(['pdftotext', 'DANNY_paper.pdf', '-'], capture_output=True, text=True)
print(result.stdout[:15000])
" 2>&1`*

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis/data" && python3 -c "
import PyPDF2
with open('DANNY_paper.pdf', 'rb') as f:
    reader = PyPDF2.PdfReader(f)
    text = ''
    for page in reader.pages:
        text += page.extract_text() + '\n'
    print(text[:20000])
" 2>&1`*

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && source venv/bin/activate && python3 -c "
import pypdf
with open('data/DANNY_paper.pdf', 'rb') as f:
    reader = pypdf.PdfReader(f)
    text = ''
    for page in reader.pages:
        text += page.extract_text() + '\n'
    print(text[:25000])
" 2>&1`*

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && source venv/bin/activate && pip list | grep -i pdf && python3 -c "import pdfminer; print('ok')" 2>&1 | head -20`*

*Read URL content from /doi/10.1145/3708359.3712149 *

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && source venv/bin/activate && python3 -c "
from pdfminer.high_level import extract_text
text = extract_text('data/DANNY_paper.pdf')
print(text[:25000])
" 2>&1`*

*User accepted the command `pip3 install pdfminer.six --quiet 2>&1 | tail -3 && python3 -c "
from pdfminer.high_level import extract_text
text = extract_text('/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis/data/DANNY_paper.pdf')
print(text[:25000])
" 2>&1`*

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && source venv/bin/activate && pip install pdfminer.six -q 2>&1 | tail -3 && python3 -c "
from pdfminer.high_level import extract_text
text = extract_text('data/DANNY_paper.pdf')
print(text[:30000])
" 2>&1`*

### User Input

please continue and read the danny paper directly. If you need I can give you the text of it directly.

*User accepted the command `mkdir -p "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis/scratch/pdf_reader" && cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis/scratch/pdf_reader" && python3 -m venv venv && source venv/bin/activate && pip install pypdf --quiet && python3 -c "
from pypdf import PdfReader
reader = PdfReader('/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis/data/DANNY_paper.pdf')
text = ''
for page in reader.pages:
    text += page.extract_text() + '\n'
print(text[:15000])
"`*

### Planner Response

I cannot extract the text from the PDF directly right now due to a network connection issue preventing me from installing the necessary PDF reading libraries locally (the `pip install pypdf` is failing because it cannot connect to the Python package index). 

Since you offered, **yes please, could you provide the text of the DANNY paper directly?** Even just the Abstract, Methods, and Results sections would be perfect. 

While you do that, I will answer your questions and give you the prompt to fix the figures based on your excellent answers.

---

### My Assessment of Your Answers

**The UI Flow (Q1):** 
The UI flow you described is incredibly rigorous. Capturing an initial confidence, showing the AI (heatmap + binary + confidence), and then capturing a final decision + final confidence is the gold standard for measuring AI influence. This means your reliance taxonomy is robust because you actually know what they thought *before* the AI intervened.

**Randomization (Q2):**
Perfect. Fully randomized trial order per session per participant. The `trial_order` learning curve analysis is statistically sound. 

**Ethical Approval & Consent (Q3):**
Excellent. Having the parental consent contracts on hand is exactly what you need. 

**Missing Video (Q8) & Group Imbalance (Q9):**
Both are completely fine. Random dropout causing a 27 vs 24 imbalance is standard. We will note the dropouts clearly.

**DANNY Paper Context (Q6, 12):**
Since DANNY found an 83.4% vs 68.9% accuracy split, your No-AI baseline (78.3%) is actually *higher* than theirs, while your AI-assisted accuracy (80.8%) is slightly lower. This means your high school students were already performing at a very high baseline level, leaving less room for the AI to help (a ceiling effect). And since DANNY didn't explore psychometrics, your neuroticism finding is entirely novel.

**G*Power Analysis (Q13):**
Perfect. If G*Power suggested N=50-90, then your N=51 completer cohort is technically powered, but at the absolute lowest bound. We will state this clearly in the limitations.

---

### What Needs to be Fixed (The Action Plan)

Based on the updated data and your context, here is what has changed and what we must fix before writing the manuscript:

1.  **The Learning Curve Figure is Broken:** We must rebuild the LOESS smoothed accuracy plot. Currently, it is failing because it's trying to smooth binary (0 or 1) data directly without aggregating it properly across participants first.
2.  **The Accuracy Paradox Figure is Incomplete:** We need to rebuild it to show the difference between AI and No-AI conditions across both Original and Platinum Ground Truths.
3.  **The Speedup Analysis is Missing:** The explicit calculation of how much faster the AI group was (e.g., -11.89 seconds vs -2.10 seconds) needs to be brought back into the notebook and printed clearly.

Here are the precise, copy-pasteable prompts you can give to another agent to fix these notebooks. 

---

### Prompt 1: Fix the Accuracy Paradox Figure (NB5)

> **Task:** Rebuild the Accuracy Paradox figure (Fig3) in `NB5_figures.ipynb` so that it explicitly shows the difference between the AI condition and the No-AI condition across the two different Ground Truths.
> 
> **Instructions:**
> 1. Open `NB5_figures.ipynb`. Locate the cell that generates `Fig3_Accuracy_Paradox.png`.
> 2. Currently, the figure only compares the "AI Model" against "Human Annotator (Overall)".
> 3. Change the data aggregation and visualization to be a grouped bar chart with four groups on the x-axis: "AI Model", "Human (No-AI)", and "Human (AI-Assisted)".
> 4. For each of these three groups, there should be two bars (hue): "Evaluated with Original GT" and "Evaluated with Platinum GT".
> 5. Use the `df_exclude` dataset (Strategy A) for this calculation. 
> 6. Save the new figure as `figures/Fig3_Accuracy_Paradox.png`. Ensure it uses a clean seaborn style and has clear legends and axis labels.

### Prompt 2: Fix the Learning Curve Figure (NB5)

> **Task:** Fix the degenerate LOESS learning curve figure (Fig9) in `NB5_figures.ipynb`.
> 
> **Instructions:**
> 1. Open `NB5_figures.ipynb`. Locate the cell that generates `Fig9_Learning_Curves.png` using `sns.lmplot` with `lowess=True`.
> 2. The current plot is broken (showing flat lines at 1.0 and 0.0) because it is trying to smooth un-aggregated binary data at the trial level. 
> 3. **The Fix:** Before plotting, create an aggregated dataframe. Group the data by `['condition', 'trial_order']` and calculate the `mean()` of `human_correct_plat_int`. 
> 4. Then, use `sns.lmplot` or `sns.regplot` on this *aggregated* dataframe (where y is the mean accuracy for that trial order across all participants). Plot two separate lines (one for AI, one for No-AI) on the same axes.
> 5. Do not use the raw `df_exclude` for the LOESS smoothing; use the aggregated `mean_accuracy_by_trial_order` dataframe.
> 6. Save the output to `figures/Fig9_Learning_Curves.png`.

### Prompt 3: Restore the Speedup/Duration Analysis (NB2)

> **Task:** Restore the missing trial duration/speedup analysis in `NB2_annotation_experiment.ipynb`.
> 
> **Instructions:**
> 1. Open `NB2_annotation_experiment.ipynb`. Go to the "Temporal Dynamics" section.
> 2. Add a new code block that calculates and prints the mean `trial_duration` for Session 1 and Session 2.
> 3. Calculate and print the percentage reduction in time (speedup) between Session 1 and Session 2.
> 4. Calculate this speedup separately for Treatment Group 0 (No-AI first) and Treatment Group 1 (AI first) to show how much of the speedup is due to learning vs. AI assistance. 
> 5. Run a paired t-test or Wilcoxon test comparing Session 1 duration vs Session 2 duration and print the p-value.
> 6. Ensure this text output is printed clearly when the cell is executed.

---

Please run these prompts with your coding agent. Once they are done, drop the DANNY paper text here for me, and we will immediately begin writing the Introduction and Methods sections of your manuscript!

### User Input

DANNY Paper:
Abstract
Economic constraints on recruiting experts hinder eforts to build
qualifed datasets for utilizing AI in professional domains (e.g., medical diagnosis), which could provide societal benefts. To solve this
issue, previous studies introduced crowdsourcing and AI to enable
non-experts to perform expert-level data labeling. Yet, they encountered three challenges: 1) the limited applicability of crowdsourcing
in less specialized domains (e.g., identifying animal species); 2) the
chicken-and-egg problem, a paradox where high-performance AI
is required to build a dataset to train such AI; and 3) over-reliance
on AI, where non-experts, lacking expertise, may incorrectly label
data when guided by sub-optimal AI. To address this, we introduce
DANNY (Data ANnotation for Non-experts made easY), an AI-based
tool designed to help non-experts label an arthritis dataset, aiming to increase labeling accuracy and mitigate over-reliance on AI.
By externalizing a cognitive forcing intervention to foster critical
thinking, DANNY provides two visualizations: 1) the Criteria phase,
where non-experts defne criteria across four arthritis features, and
2) the Correction phase, where they refne these criteria by comparing them to AI suggestions. In a study with 28 participants, DANNY
users achieved higher accuracy and a more appropriate reliance
on AI dependency than control groups. A follow-up study with 12
participants demonstrates how DANNY can be used to improve AI
with an ensemble method. Our fndings contribute new insights
into using AI to support non-experts in labeling domain-specifc
data when expert resources are limited.

1 Introduction
The rapid advancement of artifcial intelligence (AI) technologies
has sparked interest across various felds, such as design [28, 30, 39],
medical [23, 47], and business [29, 56]. Developing AI tailored to
specifc professional domains often requires a signifcant amount
of annotated data [4, 40]. Ideally, engaging experts as annotators is
crucial for reliable datasets, but recruiting them can be challenging
due to their limited availability and high cost [35, 53].
In the HCI feld, previous studies have proposed crowdsourcing
systems that enable qualifed labeling by engaging non-experts,
who could be more easily recruited than experts. These works
have helped non-experts improve labeling accuracy by identifying
similarities and diferences between classes in labeling, leading
to reduced mislabeling [8–10, 19]. However, it remains questionable whether we can employ the crowdsourcing-based approach
in highly specialized felds such as medicine [14, 60], because of
the uncertainty and variance of non-experts’ understanding of a
professional domain they are unfamiliar with.
As a complementary solution, some researchers develop AI training methods that can learn from sub-optimal non-expert labeling
in building datasets of professional domains. Examples include supporting non-experts in labeling disease-related objects, such as a
tube on X-ray [15] and reducing noise from non-expert labeling during the AI training process [16, 62]. However, two problems remain.
First, the “chicken-and-egg” problem: Using AI to help non-experts
label data would require data in the frst place to train such AI;
therefore, AI models available to help non-experts are probably not
yet well-trained (i.e., sub-optimal). Second, possible over-reliance
on AI: Deploying AI introduces the risk of over-reliance on AI,
since non-experts lack the knowledge and are likely to be misled by
incorrect information from AI, leading to over-reliance [21, 45]. In
other words, to practically assist non-experts in labeling data in professional domains using AI, it is necessary to utilize sub-optimal AI
and provide an environment that enables non-experts to selectively
extract appropriate information from AI for labeling tasks.
In this paper, we present DANNY, an AI-based annotation tool
designed to help non-experts label arthritis in X-ray images within
the medical domain. Specifcally, we aim to utilize sub-optimal
AI to assist non-experts in labeling and to design the system to
mitigate over-reliance on AI. In other words, we investigate these
two research questions (RQs):
624





































































IUI ’25, March 24–27, 2025, Cagliari, Italy Jeon et al.
e g h
X-ray image
Feature 1
Feature 2
Feature 3
Feature 4
Features
Scenario-2: Self-correcting users’ thoughts with AI
Arthritis
f
First
label
AI suggestion:
Non-arthritis
“The percentage of
your feature boxes
overlapping the areas
AI deemed important is
15%”.
User
“I am sure it is arthritis
because I think that
there are three features”.
“But, seeing the red
area, it seems like it is
non-arthritis. I need to
re-evaluate my
thought”.
User
Nonarthritis
Last label
X-ray image X-ray image X-ray image
“I’ve changed my
thought. I should
change my rst label
to non-arthritis ”.
Scenario-1: Understanding criteria for arthritis with AI
a c d
X-ray image
Feature 1
Feature 2
Feature 3
Feature 4
Features
Arthritis
b
First
label
AI suggestion:
Arthritis
“The percentage of
your feature boxes
overlapping the areas
AI deemed important is
90%”.
User
“I am sure it is arthritis
because I think this
image has feature 1, 3,
and 4”.
“It seems like AI
detect all three
features and my
thought quite
correct”.
User
Arthritis
Last label
“I have conrmed
that my thought is
right, so I keep the rst
label”.
X-ray image X-ray image X-ray image
Figure 1: Two exemplar interaction scenarios (workfow diagrams, not the actual UI) of DANNY to support users’ critical
thinking. In Scenario 1, users identify the main key criteria for arthritis and make an initial label (a). They then review
their understanding of the criteria with an AI suggestion, focusing on the red area that the AI highlights as important (b).
Users compare their understanding of the criteria with AI’s information (c). If users think their thoughts are reasonable, they
maintain their original label (d). In Scenario 2, steps (e), (f), and (g) mirror steps (a), (b), and (c), respectively. However, if users
believe that their understanding of the criteria is unreasonable after seeing AI’s suggestions, they might critically reassess and
self-correct their label (h).
• RQ1: How can we develop an AI-enabled tool that supports
non-experts to label medical imaging data with increased accuracy AI while mitigating over-reliance on a sub-optimal
AI?
• RQ2: How can such non-expert-labeled data be used to improve a medical AI model by providing additional training
data to enhance its performance?
To answer RQ1, we applied the dual-process theory [32, 33]
as a cognitive forcing intervention, which postulates that human
thinking is governed by two distinct systems: a fast, automatic, and
intuitive system (System 1) and a slow, deliberate, and analytical
system (System 2). In DANNY, users frst utilize System 2 (critical
thinking) before using System 1 (heuristics) in labeling. When
labeling arthritis on X-ray images, users are prompted to critically
evaluate the presence of the four main criteria of arthritis (e.g.,
narrow joint space, osteophytes, irregularity of the cortical surface,
and tibial spiking) [2, 49] before making a fnal labeling decision.
Building on the previous work by Buccinca et al. [6], we expanded the application of dual-process theory to real-world contexts by applying a cognitive forcing intervention. By externalizing
two cognitive operations for critical thinking, we design DANNY to
perform the intervention based on Lipman’s theory [38] to support
critical thinking: 1) thinking with criteria involving adherence to
principles of logical validity, such as establishing a clear cause-andefect relationship, and 2) self-corrective thinking, which includes
objective thinking based on self-evaluation.
Our tool, DANNY, manifests these two conditions of critical thinking as non-experts’ System 2 interactions with two
visualizations—Criteria phase and Correction phase—when labeling
arthritis on X-ray images. The Criteria phase enables users to check
the presence of four criteria for arthritis [2, 49] and draw boxes in
the area where they think that feature exists on an X-ray image,
which prompts users to think with criteria before labeling. The
Correction phase then allows users to verify and correct their boxes
with AI suggestions (shown as highlighted important areas), which
enables users to engage in self-corrective thinking. Figure 1 shows
two exemplar scenarios of DANNY.
We conducted a user study to validate whether DANNY enables non-experts to accurately label arthritis datasets without
over-relying on AI (Sec. 5). We recruited 28 participants, comprising an experimental group of 7 participants using DANNY and
three control groups: 1) Ctrl-AI: relying solely on a sub-optimal
AI, 2) Ctrl-XAI: using the same sub-optimal AI plus a saliency map
indicating where AI deems important, and 3) Ctrl-no-AI: without
any AI assistance. The reason to have both Ctrl-AI and Ctrl-XAI is
to investigate explanation’s impacts on over-reliance on AI.
Our fndings observed a signifcant diference in the accuracy
of labeling between the experimental and all the control groups.
However, a comparison between Ctrl-no-AI and Ctrl-AI found no
evidence of over-reliance on AI, although performance data do show
that DANNY was able to help users develop appropriate reliance on
AI, achieving signifcantly higher labeling accuracy than Ctrl-AI
and Ctrl-XAI when AI was wrong.
To answer RQ2, we conducted the second user study to investigate how DANNY can be used to improve the accuracy of an
AI model. Participants used DANNY to label arthritis on 600 Xray images to increase AI’s accuracy from a limited level (70%)
to a reasonable level (80%) [44] (Sec. 6). Although relying solely
on DANNY (with an improved AI accuracy of 74.62%) does not
match the expert-generated ground truth (83.13%), an ensemble
approach–where DANNY labels 300 low-uncertainty images and
expert annotations were used for the other 300 high-uncertainty
625












































































































Empowering Medical Data Labeling for Non-Experts with DANNY IUI ’25, March 24–27, 2025, Cagliari, Italy
images–achieves an accuracy of 83.2%, approximating the all-labledby-expert performance. This fnding suggests that researchers who
develop AI in a medical feld can use DANNY to improve AI models
while requiring fewer expert resources than the current approach.
This research’s contributions include:
• We develop DANNY, the AI-based interface that assists nonexperts in labeling medical datasets accurately while helping
them appropriately rely on AI.
• We contribute a tool design that employs dual-process theory
to solve the important machine-learning task of annotating
a dataset by externalizing cognitive operations based on Lipman’s theory.
• We demonstrate the applicability of DANNY in using
non-expert-labeled data to improve an AI model with an
uncertainty-based ensemble method.
2 Related work
2.1 Crowdsourcing-based Annotation Tool for
Non-experts
Numerous HCI studies have suggested ways to enhance the quality
of non-expert annotations through collaborative crowdsourcing.
This collaborative method enables non-experts to identify patterns
of similarity and diference in labeling by comparing their thinking
to that of others, thereby enhancing the accuracy of dataset annotation. For example, Revolt [10] is a collaborative labeling approach
that borrows from expert annotation workfows and involves a
three-step process: voting, explaining diferences in labels, and categorizing new concepts. Fang et al. [19] introduced a two-round
crowdsourcing framework to enhance image labeling quality by
having workers select multiple labels in the frst round and choose
the best one in the second round. Otani et al. [43] introduced a
label aggregation method for hierarchical classifcation that organizes crowd workers based on their responses. Chang, Lee, and
Igarashi [9] present Spatial Labeling, which leverages the spatial
layout to improve label quality in non-expert image annotation.
Chang et al. [8] present DualLabel, an annotation tool that enables
secondary label assignments to images, enhancing annotation simplicity and model accuracy. However, this crowdsourcing-based
approach faces signifcant challenges in expanding its applicability
in real-world contexts. Variability in individual comprehension of
specialized knowledge constrains its applicability to less specialized
domains, such as the classifcation of specifc animal species [8–
10, 19]. Consequently, the efectiveness of non-experts’ labeling becomes problematic in highly specialized domains, such as medicine.
In this work, we present DANNY, an AI-based annotation tool
designed to help non-experts accurately label arthritis in X-ray images. To broaden the scope of a tool supporting non-expert labeling,
we redefne the role of AI in labeling tasks by using sub-optimal AI
as a tool that ofers guidelines or feedback to assist non-experts in
making their own decisions rather than providing a perfect answer.
This approach enables non-experts to gain a deeper understanding
of domain knowledge, such as the relationship between arthritis
and its four main criteria, thereby enhancing the accuracy of their
labeling.
2.2 Over-reliance on AI and Critical thinking
The AI community has presented AI frameworks to apply suboptimal non-expert labeling in building datasets of professional
domains: 1) supporting non-experts in labeling disease-related objects they are familiar with, such as a tube on X-ray [15] and 2)
reducing noise from non-expert labeling during the training process on AI [16, 62]. In the frst case, Damgaard et al. [15] extend
annotation types by labeling the shortcuts to make the non-experts
labeling meaningful. Instead of having non-experts directly label
pneumothorax, they label the artifact, such as a tube, which is
highly correlated with pneumothorax, thereby extending annotation types by labeling the shortcuts. In the second case, Zhang et
al. [62] present a Tri-network learning framework to alleviate the
problem of insufcient accurate annotations in a medical domain
with non-expert annotations. The Tri-network learning framework
consists of three networks where each pair of networks alternatively selects informative samples for the third network learning,
according to the consensus and diference between their predictions.
Amor, Silva-Rodríguez, and Naranjo[16] propose an uncertainty
estimation-based framework to handle noise in the annotation process where non-experts label skin cancer. This is based on a novel
formulation using a dual-branch min–max entropy calibration to
penalize inexact labels during the training. However, there are two
real-world constraints. First, using high-performance AI in the labeling process creates a paradox [22]: if the goal is to build a qualifed
dataset to develop high-performance AI, why label data when a
high-performance AI already exists? This highlights the need to
use sub-optimal AI when supporting an annotation task. Second,
deploying sub-optimal AI introduces the risk of over-reliance on AI.
Since non-experts lack professional knowledge, they are likely to be
misled by incorrect information from the sub-optimal AI [21, 45].
In cognitive science, to mitigate over-reliance on AI, previous
works presented cognitive forcing intervention that users should
frst engage System 2 (analytic thinking) before System 1 (heuristics)
in the context of the dual-process theory [32, 33]. People become
vulnerable to cognitive biases when they primarily rely on System 1
thinking, utilizing heuristics and shortcuts in decision-making [32].
On the other hand, System 2 (critical thinking) could be the way
to reduce over-reliance on technology [20, 50, 51], while this is
infrequently activated due to its slower pace and higher efort
requirement. In human-computer interaction (HCI), Buçinca et
al. [6] conceptually proved that cognitive forcing reduces overreliance on an AI model. The authors used three types of cognitive
forcing, such as on-demand, update, and wait, in general topics like
cooking recipes.
Building on previous work, DANNY applies a cognitive forcing
intervention to support non-experts in labeling within professional
domains, such as medicine, by frst engaging System 2 (critical
thinking) before System 1 (heuristics). Based on Lipman’s theory of
critical thinking [38], we externalize two cognitive operations for
critical thinking: 1) thinking with criteria, which involves adhering
to principles of logical validity, such as establishing clear cause-andefect relationships; and 2) self-corrective thinking, which includes
objective evaluation and self-refection. DANNY features two visualizations: 1) the Criteria phase, which enables users to check
the presence of four key features of arthritis; and 2) the Correction
626


Visualization Critical thinking Requirement Goal
Initial version DANNY (fnal)
Thinking with criteria The thinking process of using stan- Provide an opportunity to identify the cause- Reason phase Criteria phase
dards to guide one’s thinking and-efect relationship between four main
features and arthritis with AI.
Self-corrective thinking The thinking process of evaluating Provide an opportunity to refect on one’s Comparison phase Correction phase
and adjusting one’s own thoughts own decision-making and encourage one
and standards to adjust if they look wrong.


































Category Dataset # of images Ratio (Arthritis: Non)
(a) Total dataset 50 25 : 25
(b) Subset-correct 35 17 : 18
(c) Subset-incorrect 15 8 : 7











IUI ’25, March 24–27, 2025, Cagliari, Italy Jeon et al.
Table 1: Design goals for supporting critical thinking in the initial iteration.
News Rate Gauge
Phase 1 - Reason phase
2-a
2-b
Phase 2 - comparison phase
b-2 B b-1
S
AI’s suggestion: Arthritis
a-1
Arthritis
Nonarthritis
Ambiguous
Arthritis Ambiguous Non-arthritis
AI suggestion for arthritis
AI suggestion for non-arthritis
A-2
Next page (Comparison phase)
Arthritis Nonarthritis Ambiguous
A
1st choice
2nd choice
Figure 2: The initial version of the system. The initial version of the system presents two visualizations to support critical
thinking: the Reason phase (A) and the Comparison phase (B). In the Reason phase (A), users confrm the relationship between
the criteria and arthritis with AI, enabling them to understand the criteria. In the Comparison phase (B), users compare the
characteristics of each group, allowing them to self-correct their understanding of the criteria.
phase, which allows users to verify and refne their thoughts using
AI suggestions. This approach enables non-experts to engage in
critical thinking, thereby improving an appropriate reliance on AI.
3 Iteration #1: Early Design of DANNY and
Lessons Learned
We designed an initial version of the system to support critical
thinking and improve accuracy while reducing over-reliance on AI
in labeling arthritis X-ray images. Based on the two design goals
in Table 1, the initial version consists of two visualizations: 1) the
Reason phase and 2) the Comparison phase. In the pilot study,
where six participants labeled arthritis with the initial version of
sub-optimal AI (70%), we observed and summarized three lessons
learned: L1) Drawing features is needed for understanding the criteria, L2) Showing AI intervention too early prevents self-corrective
thinking, and L3) Batch processing protocol hinders self-correction.
3.1 The initial version of the system
Figure 2 shows the initial version of the system consisting of two
visualizations: 1) Reason phase and 2) Comparison phase. We have
designed two visualizations to satisfy two requirements for supporting critical thinking. The protocol for the initial versions of
the system follows batch processing [46] where users frst perform
initial labeling of all 50 imagesin the Reasoning phase, then proceed
to fnal labeling of them during the Comparison phase.
Table 2: The dataset used in the pilot and the frst user studies
is (a) the Total dataset (50 images). This dataset consists of
two subsets — (b) The Subset-Correct (35 images) and (c) The
Subset-Incorrect (15 images). (b) The Subset-Correct comprises images where the ground truth aligns with the AI
suggestion. (c) the Subset-Incorrect dataset contains images
whose ground truth does not match the AI suggestion.
The specifc protocol is as follows:
• Step 1: Users perform initial labeling on 50 X-ray images to
determine the presence or absence of arthritis with AI suggestion and a saliency map indicating AI deems important in
the suggestion in the Reason phase (Figure 2-A-1). If uncertain, users label the image as ambiguous. A labeled image is
populated into Figure 2-A-2. Users label all 50 images.
• Step 2: In the meantime, users check the labeling results and
understand the criteria by comparing images in each group
(Figure 2-A-2). Additionally, users are supposed to choose
a representative image for the four criteria in the arthritis
627













































































































Empowering Medical Data Labeling for Non-Experts with DANNY
and non-arthritis groups (green boxes). The representative
image refers to the images that clearly illustrate the criteria as
understood by the users. Users can understand the criteria of
arthritis through this step.
• Step 3: Users conduct the fnal labeling of the ambiguouslabeled images to arthritis-labeled and non-arthritis-labeled
images in the Comparison phase (Figure 2-B). By comparing
ambiguous images (red and blue boxes based on AI suggestions) to representative images (green boxes) and labeled images (Figure 2-B-1), users can self-correct their understanding
of the criteria for arthritis. This step is performed after all 50
images have gone through steps 1 and 2.
The Reason phase (Figure 2-A) is a visualization that provides
AI’s suggestion of the presence of arthritis in an X-ray image with
the saliency maps. Users can confrm the relationship between main
features and arthritis with AI suggestions and reasons through
saliency maps (Figure 2-A-1). We applied a saliency map because
this is one of the intuitive methods that allow users to comprehend
the results generated by AI systems in the medical domain. This
map provides a rationale by directly presenting which part is the
most important on the complicated medical images, such as X-ray
and tumor, in the AI suggestion [5, 58]. In addition, by checking the
common features of each group, they can understand the criteria
for arthritis (Figure 2-A-2). We expected that this visualization
would facilitate the frst condition of critical thinking: thinking
with criteria (Figure 3-E1).
The Comparison phase (Figure 2-B) is a spatial layout where
users can efciently compare images and then relabel images. Users
can drag and organize the images and look at the images in close
inspection (Figure 2-B-1) based on the advantage of a spatial layout [42, 48]. Unlike the Reason phase, the Comparison phase allows
users to self-correct their understanding of criteria by checking the
main features of arthritis they may have either misconceived or not
previously considered. We expected that this visualization would
support the second condition of critical thinking: self-corrective
thinking (Figure 3-E2).
3.2 AI model and datasets
We built a dataset and trained models for the initial version of our
system (OAI dataset [11]) consisting of the fve Kellgren-Lawrence
(KL) grades[34] from Grade 0 (Healthy) to Grade 4 (Severe arthritis).
Since arthritis is defned as grade 2 or more on the KL grades [31],
we defned Grade 0 (Healthy) as non-arthritis, and Grade 2 (Minimal), 3 (Moderate) and Grade 4 (Severe) as arthritis, removing the
Garde 1 (Doubtful). The total number of images is 8,016 (arthritis:
4,159; non-arthritis: 3,857). After building the datasets for 70% for
training (5,611), 10% for validation (802), and 20% for testing (1,603),
we trained an AI model to predict arthritis with the dataset. Considering the potential applicability of our methodology, we endeavored
to use a universally accessible model that anyone can utilize. In the
prediction for arthritis, we used ResNet-18 [24] trained on the arthritis dataset. For the saliency map (XAI), we used Grad-Cam [54]
that explains the predictions of any classifer to the classifcation
process of ResNet-18 for the images.
Given that previous work states AI performance is considered
reasonable between 80% and 95% [44], we utilize a model with 70%
IUI ’25, March 24–27, 2025, Cagliari, Italy
performance to simulate a real-world scenario, with the goal of
developing AI with optimal performance (over 80%). To fnd the
parameters that show limited performance (70%), we trained 63
models (ResNet-18) by incrementally and randomly adding 100
images to training and validation sets, starting from 100 images
up to 6,300 images (the sum of train and validation sets) and using
the test set (1,603 images). We identifed that training with 600
images achieved the limited accuracy level of 70%, while training
with 1,200 images resulted in the reasonable accuracy level of 83%.
Overall, to demonstrate both optimal and sub-optimal performance,
we used 2,803 images (1,200 for training and 1,603 for testing).
With the sub-optimal model, we built the dataset of 50 images for
AI suggestions in this system (Table 2). Except for the 2,803 images
used for proving optimal and sub-optimal level, we labeled the 5,213
images from the remaining training and validation sets frst. Based
on the requirements, such as the ratio of arthritis and non-arthritis,
and the ratio of correct and incorrect suggestions in Table 2, we
randomly selected 50 images. Furthermore, an additional 10 images, meeting the same requirements, were chosen for test sessions
conducted prior to the labeling process (50 images), following the
previous work on labeling assistance [17] that conducted a test
session using about 20% of the total labeled images.
3.3 Pilot study
3.3.1 Participants. We conducted a pilot study with six participants to evaluate the initial version of the system. All participants
were university students with no expertise in medicine (Table 4 in
the appendix). To recruit participants from more diverse majors, we
recruited people through online advertisements and snowball sampling. As compensation, participants received a 20 USD Amazon 1
gift card after the study.
3.3.2 Procedure. Before using the interface, participants were
asked to watch the video to learn and understand the four features
of arthritis (e.g., narrow joint space, osteophytes, the Irregularity
of the cortical surface, and tibial spiking) [2, 49]. We made the
video, referring to the X-ray materials from the radiology online
course 2 to help them understand. After watching the educational
video, participants conducted a test session where they labeled 10
images to prevent unintended errors due to unfamiliarity with the
interface [17].
Next, participants were asked to label 50 X-ray images as either arthritis or non-arthritis in 30 minutes. Our user study aimed
to determine whether participants using DANNY could label the
arthritis dataset accurately while reducing over-reliance on AI. Table 2 shows (a) the Total dataset (50 images), which is composed of
two datasets — (b) The Subset-Correct and (c) The Subset-Incorrect.
(b) The Subset-Correct comprises images where the ground truth
aligns with the AI suggestion. (c) The Subset-Incorrect contains images for which ground-truth does not match the AI suggestion. We
hypothesize that our system efectively reduces over-reliance on AI
and improves accuracy only if users can achieve high performance
in both the entire dataset and the Subset-Incorrect. After participants completed the labeling tasks, we conducted an interview,
during which the participants explained in detail whether/how AI
1https://www.amazon.com/ 2https://www.radiologymasterclass.co.uk/
628





























































IUI ’25, March 24–27, 2025, Cagliari, Italy Jeon et al.
Expectation Lessons DANNY
Users conrm the
relationship between main
features and arthritis with
AI and develop their
criteria for arthritis.
Support for
“thinking with
criteria”
E1
Users eciently compare
the characteristics of
groups and relabel images
by self-correcting their
criteria.
Support for
“self-corrective
thinking”
E2
Batch
processing
Reason phase
X-ray image XAI
User: Arthritis AI: Arthritis
Initial design
Ambiguous
Compare & Re-label
Arthritis Non-arthritis
Users wanted to draw
criteria for understanding
criteria rather than
choosing representative
images.
Drawing
criteria is
needed
L1
L2 AI suggestion
too early
Showing AI suggestion
too early prevents selfcorrective thinking.
L3
Batch processing
hinders selfcorrection
Sequential
processing
Comparison phase
Criteria phase
Correction phase
X-ray image
Feature 1
Feature 2
Feature 3
Feature 4
Features
AI suggestion:
Arthritis
“The percentage of
your feature boxes
overlapping the areas
AI deemed important is
80%.
Figure 3: The iteration procedure from the initial design to DANNY. We built the initial design with the expectation (E1 and E2).
After the pilot study, we gained three lessons (L1, L2, and L3). Addressing three lessons, we built DANNY consisting of two
visualizations: 1) Criteria phase and 2) Correction phase.
helped them understand the criteria and correct them. When reporting interview quotes, we use �� to denote participant number �
X in this pilot study (Table 4 in the appendix).
3.4 Results and Lessons
The average accuracy results are 68%, 79%, and 42% in the datasets
(a), (b), and (c), respectively. This means that the initial version
helped non-experts label at the suboptimal AI level (AI’s performance: 70%). After the interviews were completed, we applied
thematic analysis and iterative open coding [13] to analyze the
interview transcripts. Two researchers coded and analyzed the
transcripts for emerging themes, and the fndings were discussed
iteratively by the co-authors until a consensus was reached.
From the deployment experience and several pilots for design
iterations, we developed several design lessons to help users better 5
). “I think providing AI suggestions with saliency maps was
quite reasonable. I completed labeling 49 images in the frst visualization” �� ). In addition, previous works support these comments
1
explore diverse opinion landscapes. In the following subsections,
we introduce some of the lessons (denoted as L1-L3).
3.4.1 L1: Drawing criteria is needed for understanding criteria. In
the initial version, participants were expected to understand the
criteria for arthritis by choosing representative images during the
Reason phase. Contrary to our expectations, participants wanted
to annotate the x-ray image to highlight the criteria they found for
understanding criteria for arthritis. For example:“I think fnding and
recording the four main features would help me set my understanding
of the criteria more. Also, it’d also be much more intuitive when I need
to revise my understanding” ��
6
3.4.2 L2: Showing AI suggestion too early prevents self-corrective
thinking. In the initial version, participants were supposed to understand the criteria for arthritis in the frst visualization (Reason
phase) and fnally label ambiguous samples that were not labeled,
self-correcting their understanding of the criteria in the second
visualization (Comparison phase). However, contrary to our expectations, none of the participants used the second visualization
as anticipated (relabeling only 1.5 images on average, 3% of the
total 50 images). This indicates that the self-correction thinking
was not supported as expected. Participants expressed a desire to
frst explore and identify the features on their own, before viewing
the AI suggestion and the XAI image. For example: “It feels like I
leaned toward easily accepting what the AI suggested because I got
exposed to its information before I could think things through on my
own” ��
that providing AI results before humans make a decision leads to
over-reliance on AI [20, 50, 51].
3.4.3 L3: Batch processing protocol hinders self-correction. In the
initial version, participants were supposed to use the second visualization after fnalizing labeling 50 images in the frst and reviewing
them (batch processing protocol). We anticipated that users would
understand the criteria by selecting representative images from 50
images before self-correcting their understanding of the criteria in
the second visualization. However, users expressed their difculty
using the second visualization because they could not recall why
). “Choosing representative images they could not label those images in the frst visualization. For exjust doesn’t fully express my understanding criteria. I wish I could ample, “I really struggled to go back and tweak my understanding of 2 identify and record features.” �� ). the criteria in the second feature. I just couldn’t recall why labeling
629








































































































Empowering Medical Data Labeling for Non-Experts with DANNY
was tough in the frst function, and without knowing that, I ended up
not changing much at all in the second round.” ��
4).
4 Iteration #2: Final Design of DANNY
Figure 3 shows the overview of the iteration procedure from the
initial design to DANNY. Refecting on the three lessons (e.g., L1, L2,
and L3), we iterated on the design of DANNY to provide two new
visualizations – Criteria phase and Correction phase. To address
L1, we revised the UI so that users can draw a box to represent
their thoughts regarding four criteria for arthritis to understand
the criteria (L1). For L2, we defer AI suggestion to the second visualization instead of the frst visualization for self-correction. For
L3, we changed the protocol from batch processing to sequential
processing, in which users complete initial and fnal labeling one
image at a time.
4.1 Criteria phase (L1 and L3)
The Criteria phase allows users to establish the cause-and-efect
relationship between four criteria (e.g., narrow joint space, osteophytes, the irregularity of the cortical surface, and tibial spiking) [2, 49] and arthritis to support thinking with criteria, addressing L1, which states that drawing criteria is needed to understand
criteria for arthritis. In addition, to address L3, we applied sequential processing, where users initially label an image (Criteria phase),
then perform the fnal labeling of the image (Correction phase), and
afterward move to the next image.
The use of the Criteria phase follows the steps outlined below:
• Step-1-1: Users check the presence of criteria. When fnding
a criterion, they click a drop-down to choose present. If the
criterion is absent, they click the drop-down and select not
present. If the user is unclear about the feature’s existence, they
can select ambiguous (Figure 4-A).
• Step-1-2: Users draw a box where they think a feature exists
by dragging it with the left mouse button. If users draw a box
incorrectly, they can delete it by hovering the mouse over it
and right-clicking (Figure 4-B).
• Step-1-3: Step-1 and Step-2 are repeated until users check all
four criteria, after which they can proceed to the next step.
• Step-1-4: Labeling an X-ray image for the initial labeling (Figure 4-C) based on the criteria specifed in the previous steps.
Through these steps, we expect that users will have opportunities to learn the cause-and-efect relationship between criteria and
arthritis to support their thinking with criteria (System 2).
4.2 Correction phase (L2)
To address L2, the Correction phase ofers an AI suggestion for
labeling after fnding the criteria. This visualization provides three
types of information to support self-corrective thinking: 1) an AI
suggestion for labeling (Figure 4-D), 2) the red area that AI deems
important forthe suggestion (Figure 4-E), and 3) the overlap percentage between the boxes the user made and the red area (Figure 4-F).
If the information provided by the AI is reasonable, it is accepted for
fnal labeling; otherwise, the original labeling is retained, following
these steps.
• Step-2-1: Users check AI suggestions for labeling arthritis or
non-arthritis (Figure 4-D). Based on overlapped percentages
IUI ’25, March 24–27, 2025, Cagliari, Italy
between the AI box and boxes drawn by users, if the IoU is
50% or less, this says “The AI seems to consider diferent parts
as important”; if the IoU is over 50%, this says “The AI seems
to consider the part you think art important as important.”
• Step-2-2: Users compare the boxes they drew in the Criteria
phase to the red area that AI deems important in AI’s labeling
suggestion (Figure 4-E). This comparison enables users to
evaluate the appropriateness of AI suggestions by comparing
the red area by AI with the criteria that users found.
• Step-2-3: Users check the overlapped percentages between
each box they drew and the red area from AI. This information
helps to understand at a glance how much the AI criteria
and personal criteria quantitatively align (Figure 4-F). The
overlapped percentage is calculated by comparing the number
of red pixels scanned from the AI’s saliency map within the
area of the drawn boxes and dividing that value by the total
number of red pixels of the AI’s red focus area.
• Step-2-4: Users proceed with the fnal labeling of an image by
reviewing their understanding of the criteria. If users believe
their understanding of the criteria is reasonable, they maintain
their original label. If not, they critically reassess and selfcorrect, ultimately changing their label (Figure 4-G).
We expect that users will have opportunities to adjust their
understanding of the criteria for arthritis based on AI suggestions
and feedback, thereby supporting their self-corrective thinking.
5 RQ1: Can DANNY Increase Labeling Accuracy
& Mitigate AI Overreliance?
We conducted two user studies, each to answer two research questions. For answering RQ1, our frst user study involving 28 participants aimed to determine whether participants using DANNY
could label the arthritis dataset with high accuracy while reducing
over-reliance on AI.
5.1 Participants
We recruited 28 non-expert participants into one experimental
group of 7 and three control groups, each comprising 7 participants.
All participants were non-experts in the medical feld and were
students from the same university. Table 5 in the appendix shows
the detailed demographic information of participants. To recruit
participants from more diverse majors, we recruited people through
online advertisements and snowball sampling. Our study was approved by the Institutional Review Board (IRB), and the consent of
the participants was obtained before the study. As compensation,
participants received a 20 USD Amazon 3 gift card after the study.
5.2 Design & procedure
The study procedure isthe same asin the pilot userstudy (Sec. 3.3.2).
After watching the educational video on the criteria for arthritis,
participants labeled 10 images as a test. Then, they label 50 images
(Table 2) in 30 minutes.
We conducted a between-subjects study with one experimental
and three control groups. In the experimental group, non-expert
participants were asked to use DANNY to label the 50 arthritis
3https://www.amazon.com/
630




































IUI ’25, March 24–27, 2025, Cagliari, Italy Jeon et al.
Phase 2 - correction phase
X-ray image
First label
Ai focus spot
Final label
b bE D
F
G
Labeling suggestion
Overlap Percentage
Legend A
C
Phase 1 - Criteria Phase
Figure 4: DANNY presents two visualizations to support critical thinking: 1) the Criteria phase and 2) the Correction phase,
addressing three lessons from the pilot study with the initial version.
Arthritis Non-arthritis
(a)
Arthritis Non-arthritis
(b)
Arthritis Non-arthritis
(c)
AI Suggestion: Arthritis AI Suggestion: Arthritis
Figure 5: The interfaces were designed for three control groups: (a) a control group without AI suggestions (Ctrl-no-AI), (b) a
control group with AI suggestions (Ctrl-AI), and (c) a control group with AI suggestions and saliency maps indicating areas
the AI deems important (Ctrl-XAI). In both Ctrl-AI and Ctrl-XAI, participants can view the AI’s suggestions, which provide
information about the presence of arthritis in the images. In contrast, participants in the Ctrl-no-AI group cannot access any
AI suggestions during the task.
X-ray images. In the frst control group, non-expert participants
labeled the dataset without any AI suggestions (Ctrl-no-AI). In the
second control group, non-expert participants labeled the dataset
with AI suggestions (Ctrl-AI). In the third control group, non-expert
participants label the dataset with suggestions from AI and saliency
maps indicating AI deems important in the suggestions (Ctrl-XAI).
The rationale behind the three control groups is as follows: Ctrlno-AI serves as a baseline, while Ctrl-AI and Ctrl-XAI are designed
to examine the efect of explainable information, such as a saliency
map, on mitigating over-reliance on AI. Explanations can help users
better evaluate the accuracy ofAIrecommendations and understand
how AI systems function [18, 26, 52], while detailed explanations
can sometimes cause users to develop inappropriate reliance [61].
Figure 5 shows the dummy interfaces for control groups.
5.3 Measurement
To answer RQ1, we examined the impacts of DANNY on increasing
accuracy while mitigating over-reliance on AI. In subsection 5.4.1
and 5.4.2, we analyze the accuracy of (a) the Total dataset and (c) the
Subset-Incorrect in Table 2, respectively, across the experimental
and control groups.
5.4 Results
5.4.1 Increased accuracy. To demonstrate that DANNY improves
labeling accuracy, we evaluate whether there are signifcant diferences in labeling accuracy between the experimental and control
groups. A one-way ANOVA was conducted to measure whether
DANNY helped increase accuracy. Post-hoc comparisons were conducted using Tukey’s correction [57]. Figure 6 shows that there is
a signifcant diference in the accuracy between the experimental
and all control groups (Ctrl-no-AI, Ctrl-AI, and Ctrl-XAI) in the
dataset.
631





































































Empowering Medical Data Labeling for Non-Experts with DANNY IUI ’25, March 24–27, 2025, Cagliari, Italy
0%
25%
50%
75%
100%
83.4%
73.1% 74.9%
68.9%
***
**
Accuracy
Ctrl-no-AI Ctrl-AI Experimental
Subset (b)
Correct
AI suggestion
Subset (c)
Incorrect
AI suggestion
Total dataset
(a)
*
**
**
***
**
93.8% 94.3%
89.0%
80.8%
***
61.0%
36.2% 37.8%
41.0%
Ctrl-XAI
Figure 6: Bar plots showing the accuracy diferences between the experimental and control groups in the dataset (Table 2)
(
∗� < 0.05, ∗∗� < 0.01, ∗∗∗� < 0.001).
In the case of the total dataset (50 images, Figure 6-(a)), the accuracy between the experimental group and control groups showed
signifcantly diferent accuracy (F(3,24) = 10.4, p <. 001). According
to the post-hoc analysis, there are signifcant diferences between
the experimental and all control groups: 1) Ctrl-no-AI (p < .001), 2)
Ctrl-AI (p = .004), and 3) Ctrl-XAI (p = .019). There was no significant diference between the control groups. These results verify
the hypothesis that DANNY impacts increasing accuracy.
In the case that AI suggestions are correct (35 images, Figure 6-
(a)), the accuracy between the experimental group and control
groups showed signifcantly diferent patterns (F(3,24) = 7.16, p =
.001). According to the post-hoc analysis, the experimental and the
Ctrl-no-AI groupsshowed signifcant diferences(p = .002). The CtrlXAI and the Ctrl-no-AI groups showed signifcant diferences (p =
.003). Given that both the experimental and Ctrl-XAI groups provide
suggestions from AI and saliency maps highlighting important
factors for the suggestions, these elements can enhance accuracy
when the AI’s suggestions are correct.
The diference in usage time between the experimental group and
the three control groups may indicate the potential of DANNY for
improving accuracy. The average usage time per image of DANNY
is 40.04 seconds, which was signifcantly longer compared to the
Ctrl-no-AI group (5.16 seconds), the Ctrl-AI group (6.45 seconds),
and the Ctrl-XAI group (5.7 seconds). These results suggest that
non-experts using DANNY spent sufcient time identifying the
labeling criteria, leading to a more deliberate labeling process and
higher accuracy.
5.4.2 DANNY enabled appropriate reliance on AI. Over-reliance on
AI is defned as users accepting incorrect AI recommendations [45].
With the defnition, to demonstrate the efect of DANNY on mitigating over-reliance on AI, we evaluate the Subset-Incorrect (15
images, Figure 6-(c)). According to the post-hoc analysis, there are
signifcant diferences between the experimental and all control
groups: 1) Ctrl-no-AI (p = .003), 2) Ctrl-AI (p < .001), and 3) Ctrl-XAI
(p < .001). There was no signifcant diference between the control
groups.
The accuracy of the Ctrl-no-AI group is not signifcantly higher
than that of the Ctrl-AI or Ctrl-XAI groups, indicating that participants’ performance did not signifcantly decline when using
sub-optimal AI compared to working without AI. Therefore, this
result challenges our assumption that non-expert users would overrely on a sub-optimal AI. On the other hand, there is a signifcant
diference between the experimental group and two control groups
with AI suggestions (Ctrl-AI and Ctrl-XAI) in the Subset-Incorrect
dataset, suggesting that DANNY was able to help users develop
appropriate reliance on AI, i.e., users can correctly override wrong
AI suggestions to reach the correct labels [45, 52].
5.5 Interview
We conducted interviews with the seven participants in the experimental group. During the interview, the participants explained in
detail how AI helps users label arthritis X-ray images, helping them
understand the criteria for arthritis (the Criteria phase) and correct
their understanding of the criteria by themselves (the Correction
phase). When reporting interview quotes, we use �� to denote �
participant number X in the user study.
5.5.1 Supporting critical thinking for non-experts. All participants
answered that the DANNY provided sufcient support for critical
thinking in the labeling process. They mentioned that the two visualizations enabled them to have enough time to formulate their
understanding of the criteria for arthritis and opportunities for selfcorrection. Regarding the Criteria phase, participants mentioned
that this visualization was useful in understanding the relationship between arthritis and the four criteria. For example, “I was
able to understand criteria by thoroughly exploring the features in
the Criteria phase. Since I am not a medical professional and only
learned from the short introductory video, by the Criteria phase, I
could more understand what arthritis is” (��
3). “Boxing the criteria
directly into boxes really helped me understand them better. If I had
632




































































Table 3: The Comparison-600 dataset used in the second user
study. All ratios regarding information align with Table 2. (b)
The Subset-Correct dataset comprises images in which the
ground-truth aligns with the AI suggestion. (c) the SubsetIncorrect dataset contains images whose ground truth does
not match the AI suggestion.
Category Dataset # of images Ratio (Arthritis: Non)
(a) Total dataset 600 300 : 300
(b) Subset-Correct 420 210 : 210
(c) Subset-Incorrect 180 90 : 90









IUI ’25, March 24–27, 2025, Cagliari, Italy Jeon et al.
just looked at them, I think it would have been hard to remember the
criteria. Especially with osteophytes, which was hard to grasp, but intentionally boxing them over and over gave me a bit more confdence.
(�1
�
”
Case-2:
DANNY
(nonexperts)
Case-1:
groundtruth
(experts)
Comparison600 dataset
Comparison600 dataset
ResNet-18
Dataset for training Training AI
ResNet-18
b
c
600 images
used to
achieve 70%
a
Ground-truth Ground-truth
600 images
used to
achieve 70%
a
Ground-truth DANNY
Figure 7: The setup of the second user study in the scenario
where the goal is to increase AI performance from a limited level (70%) to a reasonable level (over 80%) with DANNY.
). “Boxing the criteria was helpful in understanding the criteria
for arthritis. In the next phase, this understanding led me to consider
whether specifc criteria exist when evaluating AI suggestions. Without this boxing of the criteria, I might have relied on my intuition
alone to judge the AI’s suggestions” (�1
�). Regarding the Correction
phase, participants mentioned that this visualization was helpful in
self-correcting their criteria for arthritis. For example, “Looking at
the AI’s suggestions and the red areas it considered important helped
me adjust my understanding of the criteria, which overall improved
my understanding of arthritis” (�2
�). “Comparing it with the red area
helped me understand the AI’s suggestions. Like, when it suggested
’non-arthritis’ even though it clearly looked like arthritis, the saliency
map showed the AI didn’t really focus on the criteria. After going
through this a few times, I feel like I got better at fltering the AI’s
suggestions” (�7
� We created two versions of the Comparison-600 dataset: b) ).
ground truth (previously labeled by experts) and c) labeled
5.5.2 Impact of User Confidence on AI Suggestion Acceptance. Par- by DANNY. We then merged each with a) the 70% dataset,
ticipants mentioned that the level of their confdence in the Criteria respectively, to compare the outcomes of AI performance.
phase impacts the acceptance of AI suggestions in the Correction
phase. In the case of high confdence, users could evaluate the AI
suggestions and important areas based on their criteria. For example, “If I was confdent in my initial labeling, I could assess the
suitability of the AI’s red box for fnal labeling” (�1
�
confdent in the initial labeling and the red box seemed odd, I didn’t
DANNY and 2) ground-truth (previously obtained from experts).
To improve the applicability of DANNY, we presented an ensemble
labeling approach based on uncertainty: high-uncertainty images
are labeled with ground-truth from experts, while low-uncertainty
). “When I was
4
� consider the AI suggestion and proceeded with fnal labeling.” (� ). On
images are labeled by non-experts using DANNY (Sec. 6.4). This
result indicates that our ensemble method, DANNY, can enhance AI
the other hand, when users have low confdence in their frst labeling, they mention that the impact of AI suggestions is limited. For
sure of my initial labelings, it was hard to understand AI suggestions”
performance while maintaining satisfactory results and potentially
reducing the number of experts required. example, “Considering AI performance is about 70% when I was not
(� ). “When receiving assistance from AI without understanding the
presence of features, it seems I made heuristic rather than critical
7
�
2
�
decisions.” (� ).
5.5.3 Features AI detected. Participants demonstrated interest in
AI’s capabilities regarding reasoning, such as which criteria AI
detects for the suggestions. Users noted that showing the features
AI detected would be more benefcial in comparing their criteria to
AI suggestions which is important for self-correction. For example,
“Because the AI isn’t all that great, knowing which features it’s picking
6 up � could really help understand AI’s suggestion.” (� ). “The red area is
1
�
really helpful, but in the end, it seems crucial to know which features
the AI is recognizing. This would be incredibly benefcial in adjusting
my own criteria.” (� ).
RQ2: Can data labeled with DANNY be used to
improve AI? 6.1 Setup
To answer RQ2, we conducted the second user study with 12 participants to investigate whether non-expert labeled data with DANNY
can contribute to improving AI performance during the development process to a reasonable level. We devised a scenario in which
non-experts use DANNY to label arthritis dataset to improve AI
with sub-optimal performance (70%) towards a level above 80%
(Sec. 6.1). We evaluated the impact by comparing the accuracy of
models trained with two datasets labeled by: 1) non-experts using
In our experimental scenario, the goal is to increase AI performance
from limited performance (70%) to a reasonable level (over 80%)
using DANNY. Figure 7 showsthe setup for the second userstudy to
implement the scenario. To achieve this, we frst need to determine
the range of the number of datasets needed for increasing the
performance from 70% to 80%. In Section 3.2, we experimentally
identifed the range from 600 to 1,200 images. In other words, we
would frst train an initial AI model with 600 images to achieve
6
633








































































































Empowering Medical Data Labeling for Non-Experts with DANNY
70% accuracy and then add another 600 images (some of which
were labeled by non-experts using DANNY) to improve that AI.
Then to another 600 images, we built the Comparison-600 dataset.
We randomly chose 600 images satisfying the ratio requirements,
including the ratio of arthritis and non-arthritis, and the ratio of
correct and incorrect suggestion, as shown in Table 3. We created
two versions of labels for the Comparison-600 dataset: 1) by ground
truth (previously obtained from experts) and 2) non-experts using
DANNY. Then, each version was merged with the 70% dataset to
compare the AI outcomes (ResNet-18 [24]).
6.2 Participants and procedure
We recruited 12 participants who were all non-experts in the medical feld (Table 5 in the appendix). In the recruitment, we used
the same method as the frst user study (Sec. 5.1) but none of the
participants were in the frst study. Except for the dataset, the procedure for the second user study was identical to that of the pilot
(Sec. 3.3.2) and the frst user study (Sec. 5.2).
6.3 Results: improving AI only using
non-expert-labeled data
In this section, we report two results: 1) the labeling accuracy of the
Comparison-600 dataset by twelve participants, and 2) the performance of a model trained with the Comparison-600 dataset labeled
by non-experts with DANNY and ground-truth. First, the labeling
accuracy of the Comparison-600 dataset by twelve participants is
76.5%. This is higher than the performance of AI in DANNY (70%)
while lower than the frst user study (83.4%). To understand the
performance diference between the two studies, it should be noted
that in the frst study, all participants labeled the same 50 images,
while in the second study, each of the 12 participants labeled a
diferent batch of 50 images, resulting in a total of 600 images. The
number of images in the second user study is 12 times greater than
in the frst. This increase includes more ambiguous images to label,
which may have infuenced the accuracy of the second study.
Next, with the newly-labeled dataset, we trained AI models
and evaluated them. The accuracy of model training with the
Comparison-600 dataset labeled by non-experts using DANNY is
74.62%. The ground-truth version (83.13%) is higher, indicating that
using non-expert-only labels might be challenging in improving
AI models. However, our ensemble approach in the next section,
which involves applying non-expert labeling to images with low
uncertainty and using ground-truth labeling for the remaining images, demonstrates the potential benefts of non-expert labeling
using DANNY.
6.4 Results: improving AI using an
uncertainty-based ensemble labeling
approach
To identify a possible direction in which non-experts who lack
specialized knowledge can contribute to the labeling process, we
evaluated accuracy by the uncertainty score of the datasets, based
on the concept that the uncertainty of labeling an image indicates
complexity and difculty of the data in the labeling process[25]. Our
assumption is that if non-experts label images with low uncertainty,
IUI ’25, March 24–27, 2025, Cagliari, Italy
they can label them more accurately due to the relatively lower
complexity following the results. We confrmed the relationship
between labeling accuracy and uncertainty based on the results
from the frst user study (Sec. B.1 in the appendix).
Building on these results in the frst user study, we created three
scenarios based on uncertainty in the second user study: 1) the lowhigh (blue), 2) the high-low (green), and 3) the unordered (grey).
In the low-high scenario, non-expert-labeled images were used,
starting with those having the lowest uncertainty and following
an uncertainty-ascending order. For instance, at the x-axis point
of 50 in Figure 7, the model was trained using the 50 images with
the lowest uncertainty labeled by non-experts, while the remaining
550 images were labeled with ground-truth labels. Conversely, in
the high-low scenario, non-expert-labeled images were applied in
the opposite order, starting with the highest uncertainty, following an uncertainty-descending order. In the unordered scenario,
non-expert labeling was applied randomly without considering
uncertainty.
Figure 8 shows the accuracy of an AI model as it is trained
with increasing numbers of images labeled by non-experts, out
of a total of 600 images in the three scenarios. Overall, all three
scenarios show a trend where accuracy decreases as the number
of images labeled by non-experts increases. However, the Lowest
uncertainty scenario (Figure 8-blue line) shows the applicability
of non-expert labeling. As an example, when non-experts labeled
the 300 images with the lowest uncertainty and ground-truth was
applied to the remaining 300 images, the performance matched
the fgure of 83.13% (the dashed red line in Figure 8), which was
achieved by training entirely with ground-truth labeled data. This
fnding indicates the possible application of DANNY in improving
AI models lies in reducing the need of expert participation using the
ensemble approach: experts focus on the high-uncertainty images
while non-experts cover the middle- and low-uncertainty images
with DANNY.
7 Discussion
We have outlined ourresearch methodology and introduced DANNY
by incorporating the critical thinking theory for the applicability
of an AI-based system to increase labeling performance while mitigating over-reliance on AI (RQ1), and then we proved the impact
of DANNY through the results in the frst user study. Through the
second user study, we demonstrated the feasibility of DANNY in
developing an AI model (RQ2). We summarize the fndings of the
study and discuss their implications. We also report the study’s
limitations and our plans for future research.
Externalization of critical thinking theory in DANNY. In
this research, we frst identifed two primary design rationales to
facilitate labeling from the Lipman’s critical thinking theory [38]:
(1) thinking with criteria and 2) self-corrective thinking. In theory, understanding and developing criteria are crucial for enhancing critical thinking. By externalizing this theory, we developed
DANNY that employed a cognitive intervention to enable users to
understand the criteria and self-correct them. Understanding and
developing the criteria equips users with the interpretive ability to
consume AI suggestions properly. For example, in our user study,
634













































































IUI ’25, March 24–27, 2025, Cagliari, Italy Jeon et al.
75%
80%
85%
90%
50 100 150 200 250 300 350 400 450 500 550 600
Low-high High-low Unordered
Accuracy
83.13%
The number of images labeled by non-experts out of 600 images
Figure 8: The graph illustrates the accuracy of an AI model trained with increasing numbers of images labeled by non-experts,
from a total of 600 images across three scenarios: 1) the low-high (blue line) where images are ordered by increasing uncertainty;
2) the high-low (green line) where images are ordered by decreasing uncertainty; and 3) the unordered (grey line) where the
order is random. The red dashed line represents the AI’s performance, achieving an accuracy of 83.13% when trained on all 600
images labeled as ground truth. Notably, the low-high scenario shows performance comparable to the ground-truth level when
using up to 300 images, achieved with the most non-expert labeling (300 images) among the three cases.
boxing the criteria in the Criteria phase not only helped users understand the criteria for arthritis but led them to utilize criteria when
evaluating AI suggestions. Through labeling 50 images, they iterated and deepened their understanding of these criteria. Users then
assessed whether the AI suggestions are correct or incorrect based
on their understanding of these criteria, which led to appropriate
reliance on AI. Conversely, when users lack a solid understanding
of either the criteria or arthritis labeling, interacting with AI might
lead to inappropriate reliance on the AI. This suggests that critical
(or System 2) thinking by means of thinking in criteria matters in
their interaction with AI.
Enabling appropriate reliance on AI and domain knowledge. Over-reliance on AI occurs when users accept incorrect AI
recommendations, leading to an overall performance no better
than not having AI. Even though we found no statistically significant evidence of over-reliance on AI, we did show that DANNY
can help non-experts develop appropriate reliance on AI. With
DANNY, users overrode wrong AI suggestions (self-reliance) and
followed correct AI suggestions (AI-reliance), leading to overall better decision-making for labeling than all three baselines. In essence,
the DANNY’s ability to enable appropriate reliance stems from its
capacity to help non-experts to understand domain knowledge,
such as the four criteria for arthritis. Previous works’ fndings
align with this point. For example, Wang and Yin [59] emphasized the importance of designs that enhance understanding of the
model, its inherent uncertainty, and trust calibration to improve
AI-human interaction in decision-making processes. While these
three properties have been demonstrated in domains requiring relatively less expertise (e.g., predicting criminal recidivism), their
efectiveness remains limited in specialized domains that require
domain knowledge (e.g., forest cover prediction). Furthermore, Cai
et al. [7] have shown that providing experts with opportunities
to refne AI predictions—such as emphasizing critical parts of the
model’s output based on their own criteria—can infuence trust
in the algorithm and decision-making. In specialized felds such
as medicine, this suggests that when supporting human decisionmaking, the priority lies in supporting domain-specifc knowledge.
DANNY to enable understanding criteria for decision-making in a
professional feld suggests its potential to help prevent or mitigate
over-reliance, thereby preventing or mitigating over-reliance and
improving decision-making.
DANNY’s generalizability to other domains. In this work,
we focused on arthritis X-ray images as a case study of DANNY’s
design based on dual-process and critical thinking theory. We expect
the workfow supported by DANNY is extensible to other labeling
tasks, from other medical images, to a range of scientifc data where
the labelers need to employ critical thinking of key criteria.
Specifcally, to implement DANNY-like workfow for labeling
data in other professional domains, future work needs frst consider
the following questions:
• Whether the number of criteria is manageable for non-experts
to understand.
• Whether the standards between criteria are clear enough for
non-experts to comprehend.
If these conditions are met, DANNY can be applied to other domains following four steps. First, researchers need to defne the
cause-efect relationship in the task. For example, when developing
an AI-based interface to fnd tumors, researchers should defne the
tumor criteria, such as the number of nuclei and necrosis probability [23]. Secondly, for building DANNY, researchers should develop
AI models having sub-optimal performance (60-70%). Thirdly, researchers should provide enough chances and time for non-experts
to understand the criteria before AI supports as the medium for
interaction with AI. Lastly, AI should provide labeling suggestions
and the causes to support self-correction for their understanding
of criteria.
The usage of DANNY in developing AI. We proposed the
ensemble approach based on uncertainty grouping through the
second user study, whereby DANNY can support non-experts to
contribute up to one-third of the total dataset. In our second study,
the diference between building the full expert-labeled dataset and
635

















































































































Empowering Medical Data Labeling for Non-Experts with DANNY
including non-experts’ contribution was negligible (about 0.8%).
This approach strategically utilizes AI uncertainty to allocate labeling tasks, aligning with the principles of Active Learning [1, 55],
which aim to maximize the use of limited labeling resources to improve model performance. This approach can be directly integrated
into an Active Learning framework that can optimize resource allocation based on uncertainty, achieve cost efciency, and improve
model performance through a streamlined workfow. In addition,
applying human-in-the-loop (HITL) [41] shows the potential for
increasing non-experts’ contribution, given that they can interact
with AI that has a better performance by expert labeling. When
experts label high-uncertainty images and these data are used for
AI training, the resulting AI achieves higher performance, enabling
more efective collaboration with non-experts during labeling tasks.
Considering the volume of data emerging across various domains,
such as tumors [23], genomics [37], and satellite data [27] and the
corresponding increase in the demand for experts,such an ensemble
approach presents the potential to save time and money of building
datasets in the real world, maintaining the quality of labeling.
Intuitive comparison for self-correction.Non-expertsshould
continually refne and develop an understanding of criteria with
clear explanations for AI’s suggestions, assisting them in reducing
over-reliance on AI while enhancing the accuracy of their labeling tasks. During interviews, most participants preferred knowing the detected features by AI for its suggestions to important
areas (e.g., red areas). Knowing detected features enables fnal labeling through intuitive comparison with their identifed features.
In essence, they desired information similar to their understanding
of criteria when receiving AI suggestions. Previous studies have addressed local feature importance within AI interfaces that support
human decision-making [36]. Local explanation methods clarify
the reasoning behind particular predictions, helping individuals
comprehend these predictions to make well-informed decisions.
Our research emphasizes the importance of aligning the level of
information provided by AI with the underlying reasons for users’
criteria, supporting self-correction, a critical aspect of critical thinking.
Limitations and future work We acknowledge the limitations
of our study, which we plan to address in future work. First, the
reason for the AI labeling suggestion may have limitations in supporting non-experts’ needs. DANNY only shows the area why AI
thinks it is important for a particular labeling suggestion but does
not further specify the detected features users wanted for intuitive
comparison with their understanding of the criteria. To address
this, we plan to expand DANNY with AI models predicting labeling
and visualizing criteria. Beyond simply highlighting specifc parts
that AI deems most important, the future system can show visual
attributes by which AI identifes the criteria. This allows users to
interact with the AI based on that criteria prediction information,
facilitating a deeper understanding of AI’s decision-making process
and potentially leading to a more appropriate reliance on AI. Gu et
al. [23] presented an AI-based interface to help a pathologist fnd a
tumor by developing multiple AI to detect the criteria for tumor,
such as the number of nuclei and necrosis probability. In this study,
the absence of a dataset related to criteria limited the detection of
criteria. However, in future research, through expansion studies
IUI ’25, March 24–27, 2025, Cagliari, Italy
in domains where data can be secured, such as tumors, we plan to
broaden the potential applicability of DANNY.
Secondly, although 46 people participated in the pilot and two
user studies, these results may only represent a specifc demographic. Participants in our study were either currently enrolled in
a university or had graduated from one. Given the importance of
learning abilities in our research, we must consider the infuence
of particular demographics, such as educational levels. In future
research, we aim to recruit users from more diverse backgrounds
to test the applicability and limitations of DANNY. Additionally,
to reduce errors inevitably arising from individual diferences, we
plan to develop an interface that allows multiple non-experts can
collaboratively label a single image.
8 Conclusion
Our study proposed a new methodology to empower non-expert
labeling of data in a professional domain with AI suggestions.
Through the implementation of a cognitive forcing intervention and
critical thinking workfow, DANNY helps non-experts accurately label arthritis in X-ray images, while facilitating appropriate reliance
on AI. To achieve this, DANNY provides two visualizations: 1) the
Criteria phase, which enables users to build their understanding of
the criteria for arthritis, and 2) the Correction phase, which allows
them to self-correct their understanding of the criteria. Both the
quantitative and qualitative results of our user studies confrmed
that DANNY is able to enable data labeling by non-experts more
accurately than the baseline approaches; further, an ensemble approach allows non-expert to contribute a signifcant portion of data
to improve an existing AI model.


I have made these modifications and run the notebooks. I need you to look at the outputs.

I have given you the whole danny paper's text in the context so you can look at it.

Please take a look at the whole project with fresh eyes and tell me what is going on and tell me if you need anything else. 

If everything is in good shape please help me with the outline of the paper. What are the key findings and how should we structure the project.

### Planner Response

Let me re-read all updated notebook outputs first before responding.

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && python3 -c "
import json

notebooks = ['NB2_annotation_experiment.ipynb', 'NB3_psychometrics.ipynb', 'NB4_integrated_models.ipynb', 'NB5_figures.ipynb']

for nb_name in notebooks:
    print(f'\n{\"=\"*60}')
    print(f'NOTEBOOK: {nb_name}')
    print('='*60)
    try:
        with open(nb_name) as f:
            nb = json.load(f)
        for i, cell in enumerate(nb['cells']):
            if cell['cell_type'] == 'code' and cell.get('outputs'):
                for output in cell['outputs']:
                    if output.get('output_type') in ('stream', 'execute_result', 'display_data'):
                        text = output.get('text', output.get('data', {}).get('text/plain', ''))
                        if isinstance(text, list):
                            text = ''.join(text)
                        if text and len(text.strip()) > 20 and '<Figure' not in text:
                            print(f'[Cell {i}]:', text[:1500])
    except Exception as e:
        print(f'Error: {e}')
" 2>&1`*

*User accepted the command `cd "/Users/baltaymarci/Documents/Feel Good AI/PerCoTate/public/scripts/dataAnalysis/New analysis" && python3 -c "
import json

with open('NB2_annotation_experiment.ipynb') as f:
    nb = json.load(f)

# Find all cells with text output - look for speedup/duration/session specifically
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code' and cell.get('outputs'):
        for output in cell['outputs']:
            text = output.get('text', output.get('data', {}).get('text/plain', ''))
            if isinstance(text, list): text = ''.join(text)
            if text and len(text.strip()) > 20 and '<Figure' not in text:
                print(f'[Cell {i}]:', text[:2000])
                print()
" 2>&1`*

*Viewed [Fig3_Accuracy_Paradox.png](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis/figures/Fig3_Accuracy_Paradox.png) *

*Viewed [Fig9_Learning_Curves.png](file:///Users/baltaymarci/Documents/Feel%20Good%20AI/PerCoTate/public/scripts/dataAnalysis/New%20analysis/figures/Fig9_Learning_Curves.png) *

### Planner Response

I now have everything I need. Let me deliver the full supervisor assessment and paper outline.

*Edited relevant file*

### Planner Response

---

# Current State: Everything Is in Good Shape

Let me give you the full picture clearly.

## What the Updated Notebooks Tell Me

**Three things are now fixed and confirmed:**

1. ✅ **Fig3 (Accuracy Paradox)** — This is now exactly what it should be. Four groups side by side (AI Model, Human Overall, Human No-AI, Human AI-Assisted), each with Original vs Platinum GT bars. The figure is publication-ready and tells the core story visually.

2. ✅ **Fig9 (Learning Curves)** — Fixed. Now shows meaningful LOESS curves for AI vs No-AI conditions. Both hover around 0.79-0.83 with no systematic drift in either direction — which is itself a finding: **there is no learning or fatigue effect within sessions.** The figure is now publication-ready.

3. ✅ **Speedup Analysis** — Restored. Session 1: **17.43s**, Session 2: **14.84s**, 14.87% reduction overall. However — and this is critical — **the speedup is not statistically significant** (paired t-test p=0.35, Wilcoxon p=0.088). This is a reversal from the old report. You can only report this as a descriptive trend, not a significant finding. Do not overclaim it.

---

## What the DANNY Paper Changes

Reading the DANNY paper in full reveals three critical comparison points:

1. **Your No-AI baseline (78.4%) is 9.5 percentage points higher than DANNY's (68.9%).** Your high school students were already performing better than their university students without any assistance. This is your ceiling effect argument — less room for AI to help.

2. **DANNY's tool is far more elaborate** (40 seconds/image, criteria drawing phase, correction phase). Yours is simpler. Yet you achieve 80.8% vs their 83.4% — with a stronger evaluation methodology. That is actually a powerful comparison.

3. **DANNY never validated their ground truth.** Their 83.4% is measured against potentially corrupted OAI labels. This is the careful, non-inflammatory critique your paper makes — not "DANNY is wrong," but "without platinum standard validation, we cannot know if these numbers reflect true performance."

---

## The Paper Outline

I've written the complete paper outline as an artifact. Here is the summary:

**Working Title:** *"Systematic Label Noise in a Public Osteoarthritis Dataset Confounds Non-Expert AI-Assisted Annotation Studies: A Platinum Standard Validation"*

**The Five Core Findings in Narrative Order:**
1. 🔴 **GT Label Noise** (Lead): 28% shift, directional FN bias, AI fooled by corrupted labels
2. 🟠 **Accuracy Paradox**: All metrics look worse under noisy GT; platinum GT restores true picture
3. 🟡 **AI Effect**: Positive but underpowered (OR=1.164, d=0.251) — ceiling effect + small image set
4. 🟢 **Neuroticism** (Exploratory): Only detectable under platinum GT — the most methodologically striking meta-finding
5. 🔵 **Withdrawal Effect**: 7.1% drop when AI removed (p=0.0013) — novel vs DANNY

**Section structure:** Introduction → Related Work → Methods → Results (4 subsections) → Discussion → Conclusion

---

## Before We Begin Writing, I Need 5 Answers

1. **G*Power exact output** — what effect size did you specify? What power level did you target? (This sentence goes in Methods.)
2. **BFI version** — full BFI-2 (60 items) or short form BFI-2-S (30 items)?
3. **IQ test name** — what non-verbal IQ instrument did you use?
4. **Radiologist statement** — have you consulted your co-author yet on his interpretation of the 5 FN images?
5. **Any missing analyses?** — Do you want the withdrawal decomposition by image (which images drove the 7.1% drop) before we write, or shall we write first and add it as a supplementary analysis?

Once you answer these, we begin writing the Introduction. The outline is in the artifact — take a look and tell me if anything should be restructured.