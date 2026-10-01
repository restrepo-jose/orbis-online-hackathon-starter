// Sugoi Life Generator: composer. Turns sliders + vibe + scene + daemon into ONE open, conceptual prompt.
// Principle: don't describe the surprise, describe the conditions for surprise.

export type Axis =
  | "tempo" | "emotion" | "risk" | "harmony" | "novelty"
  | "openness" | "acceptance" | "creativity" | "logic" | "reactivity";

export type State = Record<Axis, number>; // each value runs from -1 to +1

export const AXES: { id: Axis; group: "world" | "character"; label: string; low: string; high: string }[] = [
  { id: "tempo", group: "world", label: "Tempo", low: "slow", high: "fast" },
  { id: "emotion", group: "world", label: "Emotion", low: "melancholy", high: "euphoria" },
  { id: "risk", group: "world", label: "Risk", low: "safe", high: "dangerous" },
  { id: "harmony", group: "world", label: "Harmony", low: "discord", high: "harmony" },
  { id: "novelty", group: "world", label: "Novelty", low: "familiar", high: "strange" },
  { id: "openness", group: "character", label: "Openness", low: "closed", high: "open" },
  { id: "acceptance", group: "character", label: "Acceptance", low: "resisting", high: "accepting" },
  { id: "creativity", group: "character", label: "Creativity", low: "routine", high: "inventive" },
  { id: "logic", group: "character", label: "Logic", low: "intuitive", high: "analytical" },
  { id: "reactivity", group: "character", label: "Reactivity", low: "numb", high: "intense" },
];

export const NEUTRAL: State = {
  tempo: 0, emotion: 0, risk: 0, harmony: 0, novelty: 0,
  openness: 0, acceptance: 0, creativity: 0, logic: 0, reactivity: 0,
};

// Semantic anchors for values [-2, -1, +1, +2]. A value of 0 says nothing.
const ANCHORS: Record<Axis, [string, string, string, string]> = {
  tempo: ["Everything moves in extreme slow motion, almost frozen, drifting in stillness.", "Movement is slow and unhurried, a lingering calm pace.", "Movement is quick and energetic, the camera sweeping along.", "Everything races in a frantic blur of speed, wind and motion."],
  emotion: ["Deep sorrow: cold dim light, heavy gloom, tearful atmosphere.", "Wistful and sad, muted blue tones, soft melancholy.", "Joyful and warm, golden light, smiles and lively color.", "Pure euphoria: dazzling radiant light, ecstatic celebration, vivid bursts of color."],
  risk: ["Totally safe, cozy and sheltered, soft gentle light.", "Calm and secure, nothing threatens.", "Danger creeps in: shadows lengthen and tension builds.", "Extreme peril: looming disaster, harsh dramatic light, imminent threat."],
  harmony: ["Chaos and discord: clashing colors, distorted fractured shapes.", "Uneasy mismatches, things slightly off.", "Graceful order, pleasing symmetry, gentle colors.", "Perfect harmony: serene symmetry and luminous balanced beauty."],
  novelty: ["Everything is deeply familiar and repetitive, an ordinary routine.", "Mostly familiar, with little change.", "Unfamiliar things appear: strange shapes and surprises.", "Utterly alien and unprecedented: bizarre impossible things everywhere."],
  openness: ["The character is closed off, arms folded, turned away.", "The character is reserved and guarded.", "The character is curious, looking around and reaching out.", "The character is wide open, arms spread, embracing everything."],
  acceptance: ["The character fights and rejects what is happening.", "The character is reluctant and hesitant.", "The character accepts it calmly and goes along.", "The character surrenders serenely and embraces it all."],
  creativity: ["The character repeats the same mechanical routine.", "The character follows habit.", "The character acts imaginatively.", "The character improvises wildly, inventing playful new things."],
  logic: ["The character moves by pure dream intuition.", "The character follows hunches.", "The character acts carefully and deliberately.", "The character is intensely analytical, precise and methodical."],
  reactivity: ["The character barely reacts, almost motionless.", "The character reacts slowly and mildly.", "The character reacts readily with expressive gestures.", "The character reacts explosively, with huge expressions and instant movement."],
};

// Order: tempo, emotion, risk, harmony, novelty | openness, acceptance, creativity, logic, reactivity
const p = (w: number[], c: number[]): State => ({
  tempo: w[0] / 2, emotion: w[1] / 2, risk: w[2] / 2, harmony: w[3] / 2, novelty: w[4] / 2,
  openness: c[0] / 2, acceptance: c[1] / 2, creativity: c[2] / 2, logic: c[3] / 2, reactivity: c[4] / 2,
});

export type Vibe = { id: string; name: string; state: State; line: string };

// 10 vibes: a slider profile + one open sentence. Launching one jumps the world into a mood that may not fit the moment.
export const VIBES: Vibe[] = [
  { id: "encounter", name: "Encounter", state: p([1, 1, 1, 0, 2], [1, 1, 1, 0, 2]), line: "Something unexpected enters the situation." },
  { id: "revelation", name: "Revelation", state: p([-1, 0, 0, 1, 2], [2, 1, 0, 1, 1]), line: "Something previously unnoticed becomes significant." },
  { id: "escalation", name: "Escalation", state: p([2, 0, 2, -1, 1], [0, -1, 0, -1, 2]), line: "The existing situation suddenly intensifies dramatically." },
  { id: "detour", name: "Detour (fast, sad, accepting)", state: p([2, -2, 0, 0, 1], [0, 2, 0, 0, 0]), line: "The situation unexpectedly changes direction." },
  { id: "discovery", name: "Discovery", state: p([0, 1, 0, 1, 2], [2, 2, 2, 0, 1]), line: "The character encounters something unfamiliar." },
  { id: "reversal", name: "Reversal", state: p([1, -1, 1, -2, 2], [0, -1, 1, 1, 2]), line: "The apparent meaning of the situation changes." },
  { id: "celebration", name: "Celebration", state: p([2, 2, -1, 2, 1], [2, 2, 2, -1, 2]), line: "The atmosphere suddenly becomes exuberant." },
  { id: "threat", name: "Threat (slow, happy, danger)", state: p([-2, 1, 2, -1, 1], [-1, 0, 0, 1, 2]), line: "Something unsettling begins to emerge." },
  { id: "miracle", name: "Miracle", state: p([-1, 2, -2, 2, 2], [2, 2, 1, -1, 1]), line: "Something inexplicable and extraordinary occurs." },
  { id: "rupture", name: "Rupture", state: p([2, 0, 2, -2, 2], [0, 0, 1, -2, 2]), line: "The established reality briefly breaks into something radically different." },
];

export type Scene = { id: string; name: string; text: string };

// Action Scenes = the literary daemons: a universe that gently pulls the generation toward it.
export const ACTION_SCENES: Scene[] = [
  { id: "kafka", name: "Kafka", text: "Ordinary circumstances acquire an opaque, bureaucratic, alienating logic that stays ambiguous and strangely matter-of-fact." },
  { id: "lovecraft", name: "Lovecraft", text: "Something impossibly ancient and vastly greater than the character becomes perceptible, evoking awe and unease without a defined monster." },
  { id: "shakespeare", name: "Shakespeare", text: "An ordinary situation acquires the gravity of a dramatic confrontation, as though hidden motives and impending consequences became visible." },
  { id: "poe", name: "Poe", text: "The atmosphere grows intimate, beautiful and unsettling, as if one ordinary detail has become impossible to ignore." },
  { id: "floodland", name: "Floodland", text: "The environment behaves as though another evolutionary possibility is emerging, with water, biology and architecture taking on an unfamiliar relationship." },
  { id: "hikikomori", name: "Hikikomori", text: "The character is isolated in a cluttered home where time stagnates, distant media noise hints at catastrophe, and something ridiculous and cute offers comic relief." },
  { id: "hades", name: "Hades", text: "A descent into an underworld of chthonic architecture, judgment and mythic inevitability." },
  { id: "mordor", name: "Mordor", text: "A vast, hostile, desolate landscape under an oppressive sky, with a distant menace and a long journey ahead." },
  { id: "skade", name: "Skade", text: "An enchanted eternal winter of mythic animals and childlike wonder, with a hidden kingdom and a thaw approaching." },
  { id: "sabato", name: "Sabato", text: "A descent into a subterranean urban labyrinth of psychological darkness, obsession and claustrophobia." },
  { id: "tournament", name: "Baddie", text: "A ritual tournament of exaggerated confidence and spectacle, in an arena where confrontation escalates suddenly." },
  { id: "jungle", name: "Jungle", text: "The rules of a game become physical: jungle, playful danger and escalating absurd obstacles." },
  { id: "aliens", name: "Aliens", text: "The sky changes and unknown visitors arrive at massive scale, mixing panic with wonder." },
  { id: "maelstrom", name: "Maelstrom", text: "A cartoonishly absurd scientific spectacle: an enormous flash, a dust cloud, and a comic transformation of the environment." },
  { id: "cosmos", name: "Cosmos", text: "A colossal, calm presence appears at the far horizon and communicates an enigmatic revelation about origins and stars, then departs." },
  { id: "trinosophia", name: "Trinosophia", text: "The environment becomes an esoteric space of symbolic geometry and chromatic architecture, leading into an immense living library where knowledge behaves as if alive." },
];

export type StyleId = "anime" | "realistic" | "3d";
export const STYLES: { id: StyleId; name: string; text: string }[] = [
  { id: "anime", name: "Anime", text: "Cringe webtoon visual novel primer plano, A character in a living world minimal background, (Anime style, hand-drawn 2D animation, cell-shaded webtoon art 3D anime character, expressive line art and vivid colors kinran digital:2.2) (marker outlines:0.4), shockingly real esoteric presence in nostalgia retro style Push improbable pairings with forced perspective and surreal derivative situations, and glitch texture, VIDEOGAME COLORING, 8k, videogame digital matte painting." },
  { id: "realistic", name: "Realistic", text: "A photoreal live-action feature-film sequence, photographed with premium cinema optics and the visual discipline of a major theatrical production. Sophisticated wide-angle composition, natural motivated light, rich dimensional exposure, graceful highlight roll-off, deep tonal separation, authentic materials and lifelike human presence. Elegant camera choreography with deliberate movement, natural parallax and precise spatial continuity. Performances feel physically present and spontaneous, with convincing weight, inertia, secondary motion and refined 24fps theatrical cadence. The image carries the visual authority of prestige blockbuster cinematography: immaculate production design, sophisticated lens rendering, restrained optical character, atmospheric depth, nuanced contrast, cinematic color separation and a polished final grade. Every frame feels intentionally photographed rather than digitally constructed. Premium final-cut finish: expansive yet controlled composition, striking visual hierarchy, realistic depth, natural motion blur, seamless temporal continuity and exceptional photographic fidelity. Luxurious, immersive, dramatic and commercially polished without artificial gloss or generic stock imagery." },
  { id: "3d", name: "3D", text: "masterpiece, physical based render, tableau vivant, documentary photography, hyper realistic, vrchat, vtuber avatar, videogame, CGI, 3d character image, clay material, volumetric, --style expressive --, immersive experience, 3D rigged mesh, blender, volumetric lighting, physical shading, unreal engine, CGI upgrade, the Upscaling By <@882017544045756437> augmented reality game #pixiv #sora2 #videogame #gaming #animation." },
];

// Slider positions: -1, -0.5, 0, +0.5, +1 (shown as -2..+2). Position 0 sends nothing for that axis.
const pick = (a: [string, string, string, string], v: number): string =>
  v <= -1 ? a[0] : v < 0 ? a[1] : v >= 1 ? a[3] : v > 0 ? a[2] : "";

// Changes only when a slider moves to a different position's phrase.
export const signature = (s: State) => AXES.map((ax) => pick(ANCHORS[ax.id], s[ax.id])).join("|");

// DROP: novelty and risk at maximum while harmony sits on the chaos side.
export const isDrop = (s: State) => s.novelty >= 1 && s.risk >= 1 && s.harmony <= -0.5;
const DROP_TEXT = "SUDDEN DRAMATIC CHANGE: the established reality collapses into an impossible transformation. Scale, physics, architecture and atmosphere rupture while the character remains present.";

export function composePrompt(opts: { state: State; prev?: State; vibeId?: string; sceneId?: string; styleId?: StyleId; drop?: boolean }): string {
  const { state, prev, vibeId, sceneId, styleId, drop } = opts;
  const changed: string[] = [];
  const held: string[] = [];
  for (const ax of AXES) {
    const text = pick(ANCHORS[ax.id], state[ax.id]);
    if (!text) continue;
    if (prev && pick(ANCHORS[ax.id], prev[ax.id]) !== text) changed.push(text);
    else held.push(text);
  }
  const style = STYLES.find((x) => x.id === styleId) ?? STYLES[0];
  const vibe = VIBES.find((v) => v.id === vibeId);
  const scene = ACTION_SCENES.find((x) => x.id === sceneId);
  const parts = [style.text + " in fast cuts, advance of timeline and use this universe and its content (characters, shapes, tones) to develop the story further and make reliable representations of A character in a living world the encounter with distinctive novelty inside its possibilities in physical ambiance use a clear reference that suggests action strongly to the model-With a high number of animation frames- Camera work: -24 fps- - Fast-paced cutting-Employ indefinite group articulation where the determinant is negative, generating open and chaotic spatial evolution. Let planar rotate spatial imaging projection, animate it and the characters are interacting with the environment and living life in a world with things surrounding and happening which is super funny and silly. Taking the print or dimensional characteristics of present charecters in the reference pic to make it a video animate it and speculate its planar rotate spatial imaging projection, producing dynamic reanimation and unpredictable unfolding of movement through non-returning compositional statesCoxeter Divergence Condition: For determinant values below zero, let motion diverge freely as the camera drifts or expands into higher dimensions. The animation should Communicate improvisation following a key, coda or theme for the model to join time elipsis with logical extension of events towards consecutive frames and situational milestones, taking the dimensional characteristics of present characters in the reference pic to make it a video, animate it and speculate its movement in a simulated medium faithful to the visible ambiance and surrounding environment, leading to dimensional transitions beyond the visual horizon."];
  if (scene) parts.push("SUDDEN DRAMATIC CHANGE, immediately visible: the whole scene transforms. " + scene.text);
  if (drop) parts.push(DROP_TEXT);
  if (vibe) parts.push(vibe.line);
  if (changed.length) parts.push("The world shifts noticeably: " + changed.join(" "));
  if (held.length && !scene) parts.push((changed.length ? "Still: " : "") + held.join(" "));
  parts.push("Keep the same character. The setting, camera and events may change dramatically; leave the specifics open. In the background perfection if high-definition with independent in movement between all the different layers.");
  return parts.join(" ");
}
