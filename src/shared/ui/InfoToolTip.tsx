import {
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "react";

type Position = "auto" | "top" | "bottom" | "left" | "right";

interface InfoTooltipProps {
  description: string;
  position?: Position;
  icon?: string;
  title?: string;
  iconSize?: number;
  className?: string;
  popupClassName?: string;
}

const GAP = 10;
const EDGE_PADDING = 12;

export default function InfoTooltip({
  description,
  position = "auto",
  icon="fa-info",
  title,
  iconSize = 14,
  className = "",
  popupClassName = "",
}: InfoTooltipProps) {
  // hovering  -> shown while mouse is over icon/popup (auto-hides on mouse leave)
  // pinned    -> shown after a click, stays open until outside click / Esc
  const [hovering, setHovering] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovering || pinned;

  const [resolvedPosition, setResolvedPosition] = useState<Exclude<Position, "auto">>(
    position === "auto" ? "top" : position
  );
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 260 });

  const wrapperRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const computePosition = useCallback(() => {
    const iconEl = iconRef.current;
    if (!iconEl) return;

    const iconRect = iconEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const popupWidth = Math.min(280, vw - EDGE_PADDING * 2);
    const popupHeight = popupRef.current?.offsetHeight || 90;

    const space = {
      top: iconRect.top,
      bottom: vh - iconRect.bottom,
      left: iconRect.left,
      right: vw - iconRect.right,
    };

    let side: Exclude<Position, "auto"> = position === "auto" ? "top" : position;

    if (position === "auto") {
      const fits = {
        top: space.top >= popupHeight + GAP,
        bottom: space.bottom >= popupHeight + GAP,
        left: space.left >= popupWidth + GAP,
        right: space.right >= popupWidth + GAP,
      };
      if (fits.bottom) side = "bottom";
      else if (fits.top) side = "top";
      else if (fits.right) side = "right";
      else if (fits.left) side = "left";
      else {
        side = (Object.keys(space) as (keyof typeof space)[]).reduce((a, b) =>
          space[a] > space[b] ? a : b
        ) as Exclude<Position, "auto">;
      }
    }

    let top = 0;
    let left = 0;

    if (side === "top") {
      top = iconRect.top - popupHeight - GAP;
      left = iconRect.left + iconRect.width / 2 - popupWidth / 2;
    } else if (side === "bottom") {
      top = iconRect.bottom + GAP;
      left = iconRect.left + iconRect.width / 2 - popupWidth / 2;
    } else if (side === "left") {
      top = iconRect.top + iconRect.height / 2 - popupHeight / 2;
      left = iconRect.left - popupWidth - GAP;
    } else if (side === "right") {
      top = iconRect.top + iconRect.height / 2 - popupHeight / 2;
      left = iconRect.right + GAP;
    }

    left = Math.max(EDGE_PADDING, Math.min(left, vw - popupWidth - EDGE_PADDING));
    top = Math.max(EDGE_PADDING, Math.min(top, vh - popupHeight - EDGE_PADDING));

    setResolvedPosition(side);
    setCoords({ top, left, width: popupWidth });
  }, [position]);

  useLayoutEffect(() => {
    if (open) computePosition();
  }, [open, computePosition]);

  useEffect(() => {
    if (!open) return;

    const handleReposition = () => computePosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        popupRef.current &&
        !popupRef.current.contains(target)
      ) {
        setPinned(false);
        setHovering(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPinned(false);
        setHovering(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open, computePosition]);

  const arrowStyles: Record<Exclude<Position, "auto">, string> = {
    top: "bottom-[-6px] left-1/2 -translate-x-1/2 border-t-white border-l-transparent border-r-transparent border-b-transparent",
    bottom:
      "top-[-6px] left-1/2 -translate-x-1/2 border-b-white border-l-transparent border-r-transparent border-t-transparent",
    left: "right-[-6px] top-1/2 -translate-y-1/2 border-l-white border-t-transparent border-b-transparent border-r-transparent",
    right:
      "left-[-6px] top-1/2 -translate-y-1/2 border-r-white border-t-transparent border-b-transparent border-l-transparent",
  };

  return (
    <span
      className={`relative inline-flex ${className}`}
      ref={wrapperRef}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <button
        ref={iconRef}
        type="button"
        aria-label="More information"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setPinned((prev) => !prev);
        }}
        style={{ width: iconSize, height: iconSize, fontSize: iconSize * 0.65 }}
        className="cursor-pointer inline-flex items-center justify-center rounded-full p-2
         bg-slate-200 text-slate-600 font-semibold leading-none hover:bg-slate-300 focus:outline-none focus:ring-2
          focus:ring-slate-400 focus:ring-offset-1 transition-colors shrink-0"
      >
        {/* {icon ?? "?"} */}
        <i className = {`fas ${icon}`} />
      </button>

      {open && (
        <div
          ref={popupRef}
          role="tooltip"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            width: coords.width,
            zIndex: 9999,
          }}
          className={`rounded-lg bg-white text-slate-800 text-sm shadow-xl border border-slate-200 px-3.5 py-3 ${popupClassName}`}
        >
          <div
            className={`absolute w-0 h-0 border-[6px] ${arrowStyles[resolvedPosition]}`}
          />
          {title && <p className="font-semibold mb-1 text-slate-900">{title}</p>}
          <p className="text-slate-700 leading-snug whitespace-pre-wrap">
            {description}
          </p>
        </div>
      )}
    </span>
  );
}

/*
USAGE:

<InfoTooltip description="Percentage discount applied on top of base fee structure." />

<InfoTooltip
  position="left"          // 'auto' | 'top' | 'bottom' | 'left' | 'right'
  title="Admission No."
  description="Auto-generated per active book, resets only on new book creation."
  icon="fa-info"                 // optional, defaults to "?"
/>

Behavior:
- Hover icon -> preview opens, closes automatically when mouse leaves (icon & popup)
- Click icon -> pins it open regardless of mouse position
- Click outside / Esc -> closes (both hover + pinned state cleared)
*/