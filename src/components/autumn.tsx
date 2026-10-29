import type { CSSProperties } from "react";
import { HEDGEHOG, LEAVES, MUSHROOM, SLEEPY_FOX, SQUIRREL, TEACUP } from "./autumn-art";
import { Critter } from "./critter";

// The site's autumn friends. Each is a small hand-drawn SVG with one quiet idle
// motion; size and place them with className.

type Props = { className?: string };

/** Inline art from ./autumn-art (constant markup, never user input). */
function Art({ svg }: { svg: string }) {
  return <span className="contents" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function Squirrel({ className }: Props) {
  return (
    <Critter className={className}>
      <Art svg={SQUIRREL} />
    </Critter>
  );
}

export function SleepyFox({ className }: Props) {
  return (
    <Critter className={className}>
      <Art svg={SLEEPY_FOX} />
    </Critter>
  );
}

export function TeaCup({ className }: Props) {
  return (
    <Critter className={className}>
      <Art svg={TEACUP} />
    </Critter>
  );
}

export function Mushroom({ className }: Props) {
  return (
    <Critter className={className}>
      <Art svg={MUSHROOM} />
    </Critter>
  );
}

export function Hedgehog({ className }: Props) {
  return (
    <Critter className={className}>
      <Art svg={HEDGEHOG} />
    </Critter>
  );
}

// Leaves drifting down the margins either side of a centered column. Negative
// delays start them mid-fall; `rest` is where each sits when motion is reduced.
const FALLING: {
  leaf: keyof typeof LEAVES;
  left: string;
  size: number;
  fall: number;
  delay: number;
  flutter: number;
  rest: string;
}[] = [
  { leaf: "maple", left: "4%", size: 26, fall: 14, delay: -3, flutter: 3.4, rest: "12%" },
  { leaf: "heart", left: "11%", size: 20, fall: 17, delay: -9, flutter: 2.8, rest: "58%" },
  { leaf: "oval", left: "18%", size: 18, fall: 15, delay: -12, flutter: 3.1, rest: "34%" },
  { leaf: "redMaple", left: "80%", size: 24, fall: 16, delay: -6, flutter: 3.3, rest: "22%" },
  { leaf: "oval", left: "88%", size: 20, fall: 13, delay: -1, flutter: 2.9, rest: "64%" },
  { leaf: "heart", left: "94%", size: 18, fall: 18, delay: -14, flutter: 3.6, rest: "40%" },
];

export function FallingLeaves({ className = "" }: Props) {
  return (
    <Critter className={`h-[380px] overflow-hidden ${className}`}>
      {FALLING.map((f, i) => (
        <span
          key={i}
          className="leaf-fall"
          style={
            {
              left: f.left,
              "--fall": `${f.fall}s`,
              "--delay": `${f.delay}s`,
              "--rest": f.rest,
            } as CSSProperties
          }
        >
          <span
            className="leaf-flutter"
            style={{ width: f.size, height: f.size, "--flutter": `${f.flutter}s` } as CSSProperties}
          >
            <Art svg={LEAVES[f.leaf]} />
          </span>
        </span>
      ))}
    </Critter>
  );
}
