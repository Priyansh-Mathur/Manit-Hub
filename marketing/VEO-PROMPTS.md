# Veo Prompt Kit — Manit Hub Hybrid Ad

Generate these in **Gemini (gemini.google.com)** → click **"Video"** (Veo) in the prompt box.
Also works in **Flow** (labs.google/flow) if you prefer scene control.

**Rules for every clip:**
- Clips come out as ~8 seconds. Generate in **16:9** (I'll reframe for vertical where needed — or generate 9:16 versions too if Gemini offers the option).
- Download each MP4 and save it into `marketing/veo-clips/` with the exact filename given below.
- If a clip shows readable phone-screen text or a fake app UI, regenerate — we only want screen *glow*, never fake UI (the real UI comes from the actual app footage).
- Daily generation quota on AI Plus is limited — the 4 core clips are marked ⭐; do those first, extras later.

---

## ⭐ 01-hook.mp4 — Opening (the "chaos" hook)

```
Cinematic film look, 24fps, shallow depth of field. A male Indian engineering student sits on a hostel bed at night surrounded by chaos — textbooks, chargers, sticky notes, a cycle helmet. He rapidly switches between his phone and laptop looking overwhelmed, then pauses, looks at his phone as a soft blue glow lights his face, and slowly smiles with relief. Warm tungsten room light with cool phone glow. No readable text on any screen. Audio: quiet hostel ambience, a phone notification chime, subtle hopeful music swell.
```

## ⭐ 02-campus.mp4 — Campus energy

```
Cinematic drone-style tracking shot at golden hour over a sprawling green Indian engineering college campus — red-brick academic blocks, tree-lined avenues, students walking with backpacks in small groups, cyclists passing. Warm sunlight, lens flare, film grain. Energetic and optimistic mood. Audio: birdsong, distant campus chatter, uplifting acoustic music.
```

## ⭐ 03-marketplace.mp4 — Buy & sell beat

```
Cinematic handheld shot inside a bright Indian hostel corridor. One student hands a stack of engineering textbooks and a drafter to another student, who checks his phone and taps it once; both smile and do a fist bump. Shallow depth of field, natural window light. The phone screen shows only a soft glow, no readable text. Audio: corridor ambience, a cheerful payment success chime, light percussion music.
```

## ⭐ 04-study.mp4 — Exam grind beat

```
Cinematic montage in a large college library at night, warm desk lamps. Close-ups: highlighter on notes, a girl flipping through past exam papers, three students huddled around one laptop nodding, coffee cup steam. Focused but hopeful mood, shallow depth of field, film look. Audio: page turns, soft keyboard clicks, ambient lo-fi study music.
```

## 05-rides.mp4 — Ride share beat (optional)

```
Cinematic night shot at an Indian college main gate. Three students with duffel bags and backpacks laugh as they load luggage into a white cab, one checks his phone briefly (screen glow only, no readable text). Streetlights, light rain reflections on the road, festive end-of-semester energy. Audio: night traffic ambience, car door thud, warm upbeat music.
```

## 06-events.mp4 — Campus fest beat (optional)

```
Cinematic crowd shot of an Indian college festival at night — stage lights sweeping over a cheering crowd of students, confetti falling in slow motion, someone on shoulders waving, phones held up with flashlights. High energy, vibrant magenta and gold lighting. Audio: crowd cheering, bass-heavy festival music.
```

## 07-friends.mp4 — Community beat (optional)

```
Cinematic slow-motion shot in a sunlit college canteen. A group of five Indian students around a table burst into laughter as one shows the others something on his phone (screen glow only, no readable text). Steel tumblers, samosas on a plate, warm afternoon light through windows. Audio: canteen chatter, laughter, warm acoustic music.
```

## 08-outro.mp4 — Closing shot (optional)

```
Cinematic aerial shot rising slowly over an Indian engineering campus at dusk — hostel lights turning on one by one across the buildings, purple-orange sky, a lake reflecting the last light. Calm, proud, cinematic. Audio: soft wind, distant campus sounds, gentle emotional piano outro.
```

---

## What happens next

Once files are in `marketing/veo-clips/`, tell Claude **"stitch it"** and the hybrid ad gets assembled automatically:

**Structure (~60s):** 01 hook (AI) → title card → 02 campus (AI) + "Your entire campus. One app." → real UI rapid tour (marketplace → vault → CGPA → attendance → chat, from the existing tour renders) → 03/04/05… (AI beats intercut with matching UI closeups) → outro (AI) + logo + URL + voiceover close.

- Voiceover: same neural narration pipeline, re-timed to the new cut
- Both 16:9 (YouTube) and 9:16 (Reels/Shorts) outputs
- Note: Gemini videos carry Google's SynthID watermark (invisible) and possibly a small "Veo" corner mark — normal and fine for social; I can crop-scale it out if a visible mark appears.
