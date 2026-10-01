# Sugoi Life Generator

**A live console for steering a generative world.** Built on Orbis for the Visko Orbis Online Challenge, September 2026.

You don't write prompts. You conduct possibility: move ten sliders, pick a style, and launch Vibes and literary Action Scenes on an arcade-style **bar timer**. At the end of every bar the app composes **one** open, conceptual prompt and sends it to Orbis, which morphs the running video. The live interaction is the whole experience.

## How it works

| Control | What it does |
|---|---|
| **World sliders** (5) | Tempo, Emotion, Risk, Harmony, Novelty |
| **Character sliders** (5) | Openness, Acceptance, Creativity, Logic, Reactivity |
| **Style** | Anime, Realistic or 3D |
| **Vibes** (10) | Pre-designed slider profiles. Launching one jumps every slider to that profile and adds an open sentence. |
| **Action Scenes** (16) | Literary and mythic universes (Kafka, Lovecraft, Poe, Floodland, Hikikomori, Hades, Skade, Cosmos, Maelstrom...) that interrupt the world for 2 bars |
| **DROP** | Triggers automatically when novelty and risk peak while harmony collapses. The reality ruptures without resetting the stream. |
| **Bar timer** | Nothing is sent while you play with the controls. At the end of the bar, one prompt goes out. |

Each slider has 5 positions (-2 to +2) with 4 pre-written phrases. Position 0 sends nothing. Prompts describe the conditions for surprise, never specific events, so Orbis does the inventing. The **Next prompt** box under the console shows exactly what will be sent.

All phrases, vibes, scenes and styles live in `lib/sugoi.ts`, and the screen is in `components/orbis-demo.tsx`.

## Run it

1. Requires Node 20.9 or newer.
2. Copy `.env.example` to `.env.local` and set `REACTOR_API_KEY=your_key` (get one at https://reactor.inc). The Gemini key is not needed.
3. `npm install`
4. `npm run dev`
5. Open http://localhost:3000, click **Connect**, then **Start**.

Tip: sound is off by default. Use the speaker icon in the corner of the video.

## Credits

Built on Visko's Orbis hackathon starter (https://github.com/Visko-Platform/orbis-online-hackathon-starter), which provides the Reactor session handling.
