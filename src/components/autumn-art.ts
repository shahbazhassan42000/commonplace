// Hand-drawn autumn friends for the site's margins, as inline SVG markup.
// These are constant strings (never user input), rendered by ./autumn and
// animated by the cr-* classes in globals.css.

const INK = "#4b2a2a";
const FOX_INK = "#3b1e1e";
const CREAM = "#fdf6e9";
const BLUSH = "#f4a7a3";
const ROSE = "#e08b88";
const ROSE_DARK = "#c46c69";
const RUST = "#d0703c";
const RUST_DARK = "#a9542a";
const OCHRE = "#e3a347";
const OCHRE_DARK = "#bf8128";
const BROWN = "#a8714a";
const BROWN_LIGHT = "#c99266";
const BROWN_DARK = "#6f4a31";
const SPINES = "#8d6248";
const LEAF_RED = "#c0482f";
const TEA = "#b97a4e";
const GINGER = "#e5975a";
const GINGER_DARK = "#c4693a";
const GINGER_LIGHT = "#f6d3b2";

const svg = (viewBox: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

/** A dot eye with a highlight, wrapped so it can blink. */
const eye = (x: number, y: number, r = 1.7) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.4}" r="${r * 0.34}" fill="#fff"/>`;

const MAPLE =
  "M12 1.8 L13.6 6.4 L18.2 4.6 L16.6 9.4 L21.6 11.2 L16.8 13.2 L18 18.2 L13.2 15.6 L12 21 L10.8 15.6 L6 18.2 L7.2 13.2 L2.4 11.2 L7.4 9.4 L5.8 4.6 L10.4 6.4 Z";
const MAPLE_VEINS = "M12 21 L12 8.5 M12 13.5 L8.2 10 M12 13.5 L15.8 10 M12 21 L12 23.2";
const OVAL = "M12 2 C18.5 6 20 14.5 12 21.5 C4 14.5 5.5 6 12 2 Z";
const OVAL_VEINS = "M12 4.5 L12 23 M12 10 L9 8 M12 10 L15 8 M12 14.5 L8.6 12.2 M12 14.5 L15.4 12.2";
const HEART =
  "M12 20.5 C4.4 15 2.6 9.2 6.4 6.2 C8.9 4.3 11.3 5.4 12 7.4 C12.7 5.4 15.1 4.3 17.6 6.2 C21.4 9.2 19.6 15 12 20.5 Z";
const HEART_VEINS = "M12 8 L12 23 M12 12 L9.2 10.2 M12 12 L14.8 10.2";

const leafShape = (outline: string, veins: string, fill: string, line: string) =>
  `<path d="${outline}" fill="${fill}" stroke="${line}" stroke-width=".9"/><path d="${veins}" stroke="${line}" stroke-width=".8"/>`;

/** Falling-leaf shapes, each in a 24×24 box. */
export const LEAVES = {
  maple: svg("0 0 24 24", leafShape(MAPLE, MAPLE_VEINS, RUST, RUST_DARK)),
  redMaple: svg("0 0 24 24", leafShape(MAPLE, MAPLE_VEINS, LEAF_RED, "#8f3220")),
  oval: svg("0 0 24 24", leafShape(OVAL, OVAL_VEINS, OCHRE, OCHRE_DARK)),
  heart: svg("0 0 24 24", leafShape(HEART, HEART_VEINS, ROSE, ROSE_DARK)),
};

/** A squirrel with a pink bow, holding an acorn; its tail sways. */
export const SQUIRREL = svg(
  "0 0 64 64",
  `<g class="cr-tail">
    <path d="M27 54 C12 56 4 42 8 30 C11 18 24 10 31 16 C35 20 33 26 27 25 C21 24 17 32 20 40 C22 46 26 48 28 50 Z" fill="${BROWN_LIGHT}" stroke="${INK}" stroke-width="2"/>
    <path d="M13 40 C12 31 17 22 25 19" stroke="${BROWN}" stroke-width="1.6"/>
  </g>
  <ellipse cx="37" cy="47" rx="11" ry="11" fill="${BROWN}" stroke="${INK}" stroke-width="2"/>
  <ellipse cx="40" cy="49.5" rx="6" ry="7.2" fill="${CREAM}"/>
  <path d="M33.5 23 L35 13.5 L40 21 Z" fill="${BROWN}" stroke="${INK}" stroke-width="2"/>
  <path d="M35.2 20.8 L35.8 16.6 L38.2 20.4 Z" fill="${BLUSH}"/>
  <path d="M42 20.5 L46.5 12.5 L48.5 21.5 Z" fill="${BROWN}" stroke="${INK}" stroke-width="2"/>
  <path d="M44.2 20.2 L46.3 16 L47.2 20.8 Z" fill="${BLUSH}"/>
  <circle cx="41" cy="30" r="10.5" fill="${BROWN}" stroke="${INK}" stroke-width="2"/>
  <g class="cr-blink">${eye(45, 29.5)}</g>
  <ellipse cx="46.6" cy="33.8" rx="2.6" ry="1.6" fill="${BLUSH}"/>
  <ellipse cx="51" cy="31.2" rx="1.4" ry="1.1" fill="${INK}"/>
  <path d="M48.6 34.4 q1.1 1 2.2 0" stroke="${INK}" stroke-width="1.2"/>
  <path d="M41 20.5 L36.8 18 L37.2 22.8 Z M41 20.5 L45.2 18 L44.9 22.9 Z" fill="${ROSE}" stroke="${INK}" stroke-width="1.3"/>
  <circle cx="41" cy="20.5" r="1.4" fill="${ROSE_DARK}"/>
  <ellipse cx="45" cy="44" rx="3.5" ry="4" fill="#c27a3d" stroke="${INK}" stroke-width="1.6"/>
  <path d="M41.3 42 Q45 37.6 48.7 42 Z" fill="${BROWN_DARK}" stroke="${INK}" stroke-width="1.6"/>
  <path d="M45 39.2 L45.7 37.4" stroke="${INK}" stroke-width="1.4"/>
  <ellipse cx="41.4" cy="44" rx="2.1" ry="1.8" fill="${BROWN}" stroke="${INK}" stroke-width="1.4"/>
  <ellipse cx="48.6" cy="44.4" rx="2" ry="1.7" fill="${BROWN}" stroke="${INK}" stroke-width="1.4"/>
  <ellipse cx="32" cy="57.6" rx="4.2" ry="2.3" fill="${BROWN}" stroke="${INK}" stroke-width="1.8"/>
  <ellipse cx="43" cy="57.6" rx="4.2" ry="2.3" fill="${BROWN}" stroke="${INK}" stroke-width="1.8"/>`,
);

/** A fox curled up asleep, breathing, with z's drifting up. Drawn for the burgundy footer. */
export const SLEEPY_FOX = svg(
  "0 0 124 76",
  `<g class="cr-breathe">
    <path d="M86 58 C104 62 120 50 116 34 C113 22 98 20 94 30 C100 29 106 34 104 42 C102 49 94 52 86 52 Z" fill="${RUST}" stroke="${FOX_INK}" stroke-width="2"/>
    <path d="M116 34 C113 22 98 20 94 30 C99 29.4 103 31.5 105 35 C108 32 112 32.5 116 34 Z" fill="${CREAM}" stroke="${FOX_INK}" stroke-width="2"/>
    <path d="M30 64 C28 48 42 36 62 36 C82 36 96 46 94 60 C93 66 88 68 82 68 L38 68 C33 68 30 67 30 64 Z" fill="${RUST}" stroke="${FOX_INK}" stroke-width="2"/>
    <path d="M76 68 C78 60 86 58 90 62" stroke="${FOX_INK}" stroke-width="1.6"/>
  </g>
  <path d="M21 41 L18 26 L31 35 Z" fill="${RUST}" stroke="${FOX_INK}" stroke-width="2"/>
  <path d="M22.4 37.6 L20.8 30 L27.4 34.8 Z" fill="${CREAM}"/>
  <path d="M37 36 L44 23 L48 39 Z" fill="${RUST}" stroke="${FOX_INK}" stroke-width="2"/>
  <path d="M40 35.4 L43.8 28 L46 37 Z" fill="${CREAM}"/>
  <ellipse cx="34" cy="50" rx="16" ry="13.5" fill="${RUST}" stroke="${FOX_INK}" stroke-width="2"/>
  <path d="M19 53 C22 62 42 64 50 54 C43 58 27 59 19 53 Z" fill="${CREAM}"/>
  <path d="M25.5 49.5 q3.2 2.6 6.4 0 M37.5 49.5 q3.2 2.6 6.4 0" stroke="${FOX_INK}" stroke-width="1.9"/>
  <ellipse cx="24.5" cy="54.6" rx="2.8" ry="1.7" fill="${BLUSH}"/>
  <ellipse cx="45" cy="54.6" rx="2.8" ry="1.7" fill="${BLUSH}"/>
  <ellipse cx="35" cy="56.2" rx="1.9" ry="1.4" fill="${FOX_INK}"/>
  <ellipse cx="27" cy="67.5" rx="5" ry="2.6" fill="${CREAM}" stroke="${FOX_INK}" stroke-width="1.8"/>
  <ellipse cx="41" cy="67.5" rx="5" ry="2.6" fill="${CREAM}" stroke="${FOX_INK}" stroke-width="1.8"/>
  <path class="cr-z" d="M12 28 h4 l-4 4 h4" stroke="${CREAM}" stroke-width="1.6"/>
  <path class="cr-z cr-d2" d="M5 17 h5.5 l-5.5 5.5 h5.5" stroke="${CREAM}" stroke-width="1.8"/>
  <path class="cr-z cr-d3" d="M14 5 h7 l-7 7 h7" stroke="${CREAM}" stroke-width="2"/>`,
);

/** A teacup with a happy face, steam and a little heart rising, a leaf on the saucer. */
export const TEACUP = svg(
  "0 0 84 68",
  `<path class="cr-steam" d="M31 25 C28 20 34 17 31 12" stroke="${INK}" stroke-opacity=".4" stroke-width="1.8"/>
  <path class="cr-steam cr-d2" d="M48 25 C45 20 51 17 48 12" stroke="${INK}" stroke-opacity=".4" stroke-width="1.8"/>
  <path class="cr-steam cr-d3" d="M39.5 17 C36.6 14.9 36.2 12.5 37.9 11.4 C38.9 10.8 39.4 11.4 39.5 12.2 C39.6 11.4 40.1 10.8 41.1 11.4 C42.8 12.5 42.4 14.9 39.5 17 Z" fill="${ROSE}"/>
  <ellipse cx="40" cy="60" rx="27" ry="5.2" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
  <ellipse cx="40" cy="59" rx="16" ry="2.6" stroke="${ROSE}" stroke-width="1.2"/>
  <path d="M58.5 37 C67 35 69 47 57 49" stroke="${INK}" stroke-width="2.4"/>
  <path d="M21 32 L59 32 C59 49 52 57 40 57 C28 57 21 49 21 32 Z" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
  <ellipse cx="40" cy="32" rx="19" ry="3.8" fill="${TEA}" stroke="${INK}" stroke-width="2"/>
  <path d="M22.5 38.5 C31 41.5 49 41.5 57.5 38.5" stroke="${ROSE}" stroke-width="1.6"/>
  <path d="M32 46 q2.2 -2.2 4.4 0 M43.6 46 q2.2 -2.2 4.4 0" stroke="${INK}" stroke-width="1.6"/>
  <ellipse cx="30.5" cy="49.5" rx="2.4" ry="1.5" fill="${BLUSH}"/>
  <ellipse cx="49.5" cy="49.5" rx="2.4" ry="1.5" fill="${BLUSH}"/>
  <path d="M37.8 49 q2.2 2 4.4 0" stroke="${INK}" stroke-width="1.4"/>
  <g transform="translate(56 49) rotate(28) scale(.5)">${leafShape(MAPLE, MAPLE_VEINS, RUST, RUST_DARK)}</g>`,
);

/** A mushroom friend with rosy cheeks, holding a pencil; she sways and scribbles. */
export const MUSHROOM = svg(
  "0 0 68 76",
  `<g class="cr-sway">
    <ellipse cx="28" cy="70.5" rx="5" ry="2.6" fill="${CREAM}" stroke="${INK}" stroke-width="1.8"/>
    <ellipse cx="40" cy="70.5" rx="5" ry="2.6" fill="${CREAM}" stroke="${INK}" stroke-width="1.8"/>
    <path d="M22 42 C21 54 22 64 26 69 L42 69 C46 64 47 54 46 42 Z" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
    <path d="M8 44 C8 24 20 13 34 13 C48 13 60 24 60 44 C60 48 56 49 52 48 C42 46 26 46 16 48 C12 49 8 48 8 44 Z" fill="${ROSE}" stroke="${INK}" stroke-width="2"/>
    <circle cx="20" cy="31" r="3.2" fill="${CREAM}"/>
    <circle cx="34" cy="22.5" r="3.6" fill="${CREAM}"/>
    <circle cx="48" cy="31" r="3" fill="${CREAM}"/>
    <circle cx="27" cy="40" r="2.1" fill="${CREAM}"/>
    <circle cx="41.5" cy="39.5" r="2.3" fill="${CREAM}"/>
    <g transform="translate(43 6) rotate(32) scale(.5)">${leafShape(OVAL, OVAL_VEINS, OCHRE, OCHRE_DARK)}</g>
    <g class="cr-blink">${eye(29, 55)}${eye(39, 55)}</g>
    <ellipse cx="26" cy="59.2" rx="2.6" ry="1.6" fill="${BLUSH}"/>
    <ellipse cx="42" cy="59.2" rx="2.6" ry="1.6" fill="${BLUSH}"/>
    <path d="M32 59.5 q2 2 4 0" stroke="${INK}" stroke-width="1.4"/>
    <g class="cr-write">
      <g transform="translate(46 57) rotate(-38)">
        <path d="M-2.8 -2.2 L0 -2.2 L0 2.2 L-2.8 2.2 Z" fill="${ROSE}" stroke="${INK}" stroke-width="1.3"/>
        <path d="M0 -2.2 L15 -2.2 L15 2.2 L0 2.2 Z" fill="${OCHRE}" stroke="${INK}" stroke-width="1.3"/>
        <path d="M15 -2.2 L19.5 0 L15 2.2 Z" fill="${CREAM}" stroke="${INK}" stroke-width="1.3"/>
        <path d="M18.2 -0.65 L19.5 0 L18.2 0.65 Z" fill="${INK}"/>
      </g>
      <ellipse cx="46.5" cy="58" rx="2.6" ry="2.2" fill="${CREAM}" stroke="${INK}" stroke-width="1.5"/>
    </g>
  </g>`,
);

/**
 * Two cats on an autumn log reading one book together: their tails curl into a
 * heart that softly beats, she nuzzles in, hearts rise and leaves drift down.
 */
export const READING_COUPLE = svg(
  "0 0 240 176",
  `<ellipse cx="120" cy="163" rx="94" ry="7" fill="#e6d4b4"/>
  <g class="cr-beat">
    <path d="M80 126 C50 116 46 70 62 46 C78 22 112 24 120 44" stroke="${INK}" stroke-width="9.5"/>
    <path d="M160 126 C190 116 194 70 178 46 C162 22 128 24 120 44" stroke="${INK}" stroke-width="9.5"/>
    <path d="M80 126 C50 116 46 70 62 46 C78 22 112 24 120 44" stroke="${CREAM}" stroke-width="6"/>
    <path d="M160 126 C190 116 194 70 178 46 C162 22 128 24 120 44" stroke="${GINGER}" stroke-width="6"/>
  </g>
  <g transform="translate(30 14) scale(.62)"><g class="cr-drift">${leafShape(MAPLE, MAPLE_VEINS, RUST, RUST_DARK)}</g></g>
  <g transform="translate(196 22) scale(.55)"><g class="cr-drift cr-d2">${leafShape(OVAL, OVAL_VEINS, OCHRE, OCHRE_DARK)}</g></g>
  <rect x="34" y="132" width="172" height="24" rx="12" fill="${BROWN}" stroke="${INK}" stroke-width="2"/>
  <path d="M50 141 h22 M86 149 h18 M128 141 h26 M164 149 h14" stroke="${BROWN_DARK}" stroke-opacity=".6" stroke-width="1.4"/>
  <ellipse cx="200" cy="144" rx="7" ry="11" fill="${BROWN_LIGHT}" stroke="${INK}" stroke-width="1.8"/>
  <ellipse cx="200" cy="144" rx="3.4" ry="5.8" stroke="${BROWN}" stroke-width="1.2"/>
  <g transform="translate(58 125) rotate(-18) scale(.42)">${leafShape(MAPLE, MAPLE_VEINS, LEAF_RED, "#8f3220")}</g>
  <path d="M70 134 C66 110 74 94 92 94 C110 94 118 110 114 134 Z" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
  <path d="M126 134 C122 110 130 94 148 94 C166 94 174 110 170 134 Z" fill="${GINGER}" stroke="${INK}" stroke-width="2"/>
  <ellipse cx="149" cy="120" rx="9" ry="11" fill="${GINGER_LIGHT}"/>
  <ellipse cx="81" cy="134.5" rx="6.5" ry="3.2" fill="${CREAM}" stroke="${INK}" stroke-width="1.7"/>
  <ellipse cx="103" cy="134.5" rx="6.5" ry="3.2" fill="${CREAM}" stroke="${INK}" stroke-width="1.7"/>
  <ellipse cx="137" cy="134.5" rx="6.5" ry="3.2" fill="${GINGER}" stroke="${INK}" stroke-width="1.7"/>
  <ellipse cx="159" cy="134.5" rx="6.5" ry="3.2" fill="${GINGER}" stroke="${INK}" stroke-width="1.7"/>
  <path d="M100 104 L120 108 L120 128 L100 124 Z M120 108 L140 104 L140 124 L120 128 Z" fill="${CREAM}" stroke="${INK}" stroke-width="1.8"/>
  <path d="M104 110.5 l12 2.4 M104 115.5 l12 2.4 M104 120.5 l8 1.6 M124 112.9 l12 -2.4 M124 117.9 l12 -2.4 M124 122.9 l8 -1.6" stroke="${INK}" stroke-opacity=".35" stroke-width="1.1"/>
  <path d="M120 128 l1.5 7" stroke="${ROSE_DARK}" stroke-width="1.8"/>
  <ellipse cx="100.5" cy="116" rx="4.6" ry="3.7" fill="${CREAM}" stroke="${INK}" stroke-width="1.6"/>
  <ellipse cx="139.5" cy="116" rx="4.6" ry="3.7" fill="${GINGER}" stroke="${INK}" stroke-width="1.6"/>
  <g transform="rotate(8 92 80)"><g class="cr-nuzzle">
    <path d="M74 70 L76 48 L92 62 Z M98 60 L110 46 L112 70 Z" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
    <path d="M76.8 66 L78 53 L87.5 61.5 Z M101.5 60.5 L108.6 52 L109.6 65.5 Z" fill="${BLUSH}"/>
    <circle cx="92" cy="80" r="21" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
    <path d="M100 61 L94 57.5 L94.6 64.5 Z M100 61 L106 57.6 L105.4 64.6 Z" fill="${ROSE}" stroke="${INK}" stroke-width="1.3"/>
    <circle cx="100" cy="61" r="1.8" fill="${ROSE_DARK}"/>
    <path d="M81 80 q4 -4.5 8 0 M95 80 q4 -4.5 8 0" stroke="${INK}" stroke-width="1.9"/>
    <ellipse cx="80" cy="87" rx="3.4" ry="2" fill="${BLUSH}"/>
    <ellipse cx="104" cy="87" rx="3.4" ry="2" fill="${BLUSH}"/>
    <path d="M90.4 85.6 L93.6 85.6 L92 87.4 Z" fill="${ROSE_DARK}"/>
    <path d="M88.5 89.2 q1.75 1.8 3.5 0 q1.75 1.8 3.5 0" stroke="${INK}" stroke-width="1.3"/>
  </g></g>
  <g transform="rotate(-7 150 78)">
    <path d="M132 68 L134 46 L150 60 Z M156 58 L168 44 L170 68 Z" fill="${GINGER}" stroke="${INK}" stroke-width="2"/>
    <path d="M134.8 64 L136 51 L145.5 59.5 Z M159.5 58.5 L166.6 50 L167.6 63.5 Z" fill="${BLUSH}"/>
    <circle cx="150" cy="78" r="21" fill="${GINGER}" stroke="${INK}" stroke-width="2"/>
    <path d="M145 60 l1 6 M150 59 l0 7 M155 60 l-1 6" stroke="${GINGER_DARK}" stroke-width="1.7"/>
    <ellipse cx="150" cy="88.5" rx="9" ry="6.5" fill="${CREAM}"/>
    <g class="cr-blink">${eye(141, 79, 1.9)}${eye(159, 79, 1.9)}</g>
    <ellipse cx="137" cy="86" rx="3.4" ry="2" fill="${BLUSH}"/>
    <ellipse cx="163" cy="86" rx="3.4" ry="2" fill="${BLUSH}"/>
    <path d="M148.4 84.6 L151.6 84.6 L150 86.4 Z" fill="${ROSE_DARK}"/>
    <path d="M146.5 88.2 q1.75 1.8 3.5 0 q1.75 1.8 3.5 0" stroke="${INK}" stroke-width="1.3"/>
  </g>
  <path d="M130 96 C140 101 158 101 167 96 L167 103 C158 108 140 108 130 103 Z" fill="${ROSE}" stroke="${INK}" stroke-width="1.6"/>
  <path d="M155 103 C158 108 161 113 160 119 L153.6 117 C154.6 112.4 153.6 107.6 151 104 Z" fill="${ROSE}" stroke="${INK}" stroke-width="1.6"/>
  <g transform="translate(107 31) scale(.34)"><path class="cr-heart" d="${HEART}" fill="${ROSE}"/></g>
  <g transform="translate(117.5 22) scale(.28)"><path class="cr-heart cr-d2" d="${HEART}" fill="${ROSE_DARK}"/></g>
  <g transform="translate(125 32) scale(.3)"><path class="cr-heart cr-d3" d="${HEART}" fill="${BLUSH}"/></g>`,
);

/** A hedgehog with a leaf and a flower on its spines; its nose sniffs. */
export const HEDGEHOG = svg(
  "0 0 80 54",
  `<ellipse cx="22" cy="46.5" rx="4.4" ry="2.4" fill="${SPINES}" stroke="${INK}" stroke-width="1.8"/>
  <ellipse cx="40" cy="46.5" rx="4.4" ry="2.4" fill="${SPINES}" stroke="${INK}" stroke-width="1.8"/>
  <path d="M10 44 L5 38 L11 35.5 L6 29 L13 27.5 L10 20 L18 21 L17 13 L24.5 16.5 L26 8.5 L32 14 L35.5 6.8 L40 13.5 L45 8 L47.5 15.5 L53.5 12 L54 20 L58 22 L56 44 Z" fill="${SPINES}" stroke="${INK}" stroke-width="2"/>
  <path d="M20 30 l4 -3 M30 24 l4 -3 M28 35 l4 -3 M40 22 l3 -3 M40 32 l3 -3" stroke="#6c4734" stroke-width="1.4"/>
  <g transform="translate(19 4) rotate(-22) scale(.55)">${leafShape(MAPLE, MAPLE_VEINS, RUST, RUST_DARK)}</g>
  <g fill="${ROSE}"><circle cx="38" cy="6.4" r="1.7"/><circle cx="40.4" cy="8.1" r="1.7"/><circle cx="39.5" cy="10.9" r="1.7"/><circle cx="36.5" cy="10.9" r="1.7"/><circle cx="35.6" cy="8.1" r="1.7"/></g>
  <circle cx="38" cy="8.8" r="1.2" fill="${OCHRE}"/>
  <g class="cr-sniff">
    <path d="M50 23 C58 21 68 28 73 34 C75.5 37 74 40 70.5 40.5 L54 44.5 C46 44 44 27 50 23 Z" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
    <circle cx="73.4" cy="37" r="2" fill="${INK}"/>
  </g>
  <g class="cr-blink">${eye(60, 31.5, 1.8)}</g>
  <ellipse cx="62" cy="36.5" rx="2.6" ry="1.5" fill="${BLUSH}"/>
  <ellipse cx="58" cy="46" rx="4.2" ry="2.3" fill="${SPINES}" stroke="${INK}" stroke-width="1.8"/>`,
);
