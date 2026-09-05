"use client";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Link2,
  Play,
  ShieldCheck,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";

const SCENE_DURATION = 6500;
const ACTIVE_SCENE_COUNT = 2;

const GLASS_CARD_CLASS =
  "relative overflow-hidden border border-[#cbd0ff38] bg-[linear-gradient(145deg,rgba(30,29,71,0.64),rgba(13,18,43,0.42))] shadow-[0_28px_70px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.15),0_0_42px_rgba(110,73,255,0.16)] backdrop-blur-[18px] backdrop-saturate-[1.35]";

const NETWORK_PATHS = [
  {
    d: "M 40 180 Q 280 40 520 220",
    delay: "0s",
  },
  {
    d: "M 1380 150 Q 1120 30 890 240",
    delay: "1.4s",
  },
  {
    d: "M 50 690 Q 360 860 650 610",
    delay: "2.8s",
  },
  {
    d: "M 1390 700 Q 1080 850 790 590",
    delay: "4.2s",
  },
  {
    d: "M 220 80 Q 700 420 1220 100",
    delay: "5.6s",
  },
  {
    d: "M 170 820 Q 720 470 1270 820",
    delay: "7s",
  },
] as const;

const CONNECTION_POINTS = [
  { cx: 92, cy: 173 },
  { cx: 337, cy: 106 },
  { cx: 515, cy: 216 },
  { cx: 894, cy: 239 },
  { cx: 1139, cy: 88 },
  { cx: 1357, cy: 151 },
  { cx: 91, cy: 691 },
  { cx: 385, cy: 752 },
  { cx: 651, cy: 609 },
  { cx: 793, cy: 590 },
  { cx: 1087, cy: 758 },
  { cx: 1362, cy: 700 },
] as const;

const FLOATING_NODES = [
  {
    label: "in",
    className: "left-[7%] top-[16%]",
    delay: "0s",
  },
  {
    label: "WA",
    className:
      "left-[10%] top-[71%] hidden bg-[linear-gradient(145deg,rgba(35,205,126,0.52),rgba(17,51,48,0.4))] sm:grid",
    delay: "-3s",
  },
  {
    label: "@",
    className:
      "left-[32%] top-[29%] hidden bg-[linear-gradient(145deg,rgba(235,70,175,0.52),rgba(68,24,69,0.4))] lg:grid",
    delay: "-5s",
  },
  {
    label: "{ }",
    className: "bottom-[11%] left-[37%] hidden sm:grid",
    delay: "-2s",
  },
  {
    label: "AI",
    className:
      "right-[34%] top-[9%] hidden bg-[linear-gradient(145deg,rgba(60,207,255,0.5),rgba(24,50,71,0.42))] lg:grid",
    delay: "-7s",
  },
  {
    label: "CRM",
    className: "right-[6%] top-[18%] hidden sm:grid",
    delay: "-4s",
  },
  {
    label: "✓",
    className:
      "bottom-[15%] right-[9%] bg-[linear-gradient(145deg,rgba(65,226,156,0.48),rgba(20,59,50,0.42))]",
    delay: "-6s",
  },
  {
    label: "↗",
    className:
      "bottom-[8%] right-[34%] hidden bg-[linear-gradient(145deg,rgba(235,81,188,0.5),rgba(65,28,76,0.42))] sm:grid",
    delay: "-1s",
  },
] as const;

const QR_CELLS = Array.from(
  { length: 81 },
  (_, index) => ((index * 73 + 17) % 100) < 53,
);

const HOW_IT_WORKS_STEPS = [
  {
    title: "Create your intake page",
    description:
      "Set up a professional form so clients can share the details you actually need.",
    Icon: ClipboardList,
    iconClassName: "bg-cyan-400/15 text-cyan-200",
  },
  {
    title: "Share one private link",
    description:
      "Send a single link. Clients submit without creating an account.",
    Icon: Link2,
    iconClassName: "bg-fuchsia-400/15 text-fuchsia-200",
  },
  {
    title: "Review everything in one place",
    description:
      "Submissions land in your workspace, organized and ready to start.",
    Icon: ShieldCheck,
    iconClassName: "bg-emerald-400/15 text-emerald-200",
  },
] as const;

type SceneProps = {
  active: boolean;
};

function sceneClass(active: boolean, extraClassName = "") {
  return [
    "pointer-events-none absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-[1100ms] ease-out",
    active
      ? "translate-x-0 translate-y-0 scale-100 opacity-100"
      : "translate-x-[30px] translate-y-[20px] scale-[0.94] opacity-0",
    extraClassName,
  ]
    .filter(Boolean)
    .join(" ");
}

function CardShine() {
  return (
    <span className="landing-card-shine pointer-events-none absolute inset-0 z-[4] overflow-hidden rounded-[inherit]" />
  );
}

type OrbitBubbleProps = {
  animationClass: string;
  className: string;
  label: string;
};

function OrbitBubble({
  animationClass,
  className,
  label,
}: OrbitBubbleProps) {
  return (
    <span
      className={`${animationClass} absolute grid h-[46px] w-[46px] place-items-center rounded-full border border-white/20 text-[11px] font-extrabold text-white shadow-[0_16px_34px_rgba(0,0,0,0.34),0_0_25px_rgba(111,85,255,0.36)] backdrop-blur-xl ${className}`}
    >
      {label}
    </span>
  );
}

type DocumentCardProps = {
  animationClass: string;
  className: string;
  description: string;
  Icon: LucideIcon;
  iconClassName: string;
  status: string;
  statusClassName: string;
  title: string;
};

function DocumentCard({
  animationClass,
  className,
  description,
  Icon,
  iconClassName,
  status,
  statusClassName,
  title,
}: DocumentCardProps) {
  return (
    <div
      className={`${GLASS_CARD_CLASS} ${animationClass} absolute min-h-[126px] w-[220px] rounded-[20px] p-[18px] ${className}`}
    >
      <CardShine />

      <div className="relative z-[2] flex items-start gap-3">
        <span
          className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[11px] text-white shadow-[0_0_20px_rgba(103,115,255,0.28)] ${iconClassName}`}
        >
          <Icon className="h-[19px] w-[19px]" aria-hidden="true" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
          <strong className="text-[13px] font-bold leading-tight text-white">
            {title}
          </strong>

          <span className="max-w-[145px] text-[10px] leading-[1.4] text-white/55">
            {description}
          </span>
        </div>
      </div>

      <span
        className={`relative z-[2] mt-[15px] inline-flex rounded-full border px-[9px] py-[5px] text-[9px] font-bold uppercase tracking-[0.04em] ${statusClassName}`}
      >
        {status}
      </span>
    </div>
  );
}

function ProfileScene({ active }: SceneProps) {
  return (
    <div className={sceneClass(active, "[perspective:900px]")}>
      <div
        className={`${GLASS_CARD_CLASS} landing-profile-card w-[min(360px,78%)] rounded-[26px] p-6`}
      >
        <CardShine />

        <div className="relative z-[2] flex items-center gap-3.5">
          <div className="h-[54px] w-[54px] shrink-0 rounded-full bg-[radial-gradient(circle_at_35%_28%,#ffd0f0,#c066ff_46%,#4131b8_100%)] shadow-[0_0_0_5px_rgba(255,255,255,0.06),0_0_22px_rgba(192,93,255,0.48)]" />

          <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-left">
            <strong className="truncate text-sm font-semibold text-white">
              New client received
            </strong>

            <span className="truncate text-[11px] text-white/50">
              Complete intake ready to review
            </span>
          </div>

          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#52e8aa] text-xs font-black text-[#082319] shadow-[0_0_16px_rgba(82,232,170,0.6)]">
            ✓
          </span>
        </div>

        <div className="relative z-[2] mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium text-white/65">
            Project verified
          </span>

          <span className="rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-medium text-emerald-200">
            Ready to review
          </span>
        </div>
      </div>

      <OrbitBubble
        animationClass="landing-orbit-one"
        className="left-[14%] top-[12%] bg-[rgba(54,114,255,0.72)]"
        label="in"
      />

      <OrbitBubble
        animationClass="landing-orbit-two"
        className="right-[11%] top-[22%] bg-[rgba(31,202,119,0.65)]"
        label="WA"
      />

      <OrbitBubble
        animationClass="landing-orbit-three"
        className="bottom-[17%] left-[12%] bg-[rgba(237,74,170,0.68)]"
        label="@"
      />

      <OrbitBubble
        animationClass="landing-orbit-four"
        className="bottom-[12%] right-[13%] bg-[rgba(108,76,255,0.72)]"
        label="↗"
      />
    </div>
  );
}

function QrScene({ active }: SceneProps) {
  return (
    <div
      className={sceneClass(
        active,
        "gap-3.5 sm:gap-7 lg:gap-[38px]",
      )}
    >
      <div className="landing-document-stack">

        <div className="landing-glass-card landing-document landing-document-one">
          <span className="landing-card-shine" />
          <span className="landing-document-icon" />
          <span className="landing-document-line landing-document-line-long" />
          <span className="landing-document-line landing-document-line-short" />
        </div>

        <div className="landing-glass-card landing-document landing-document-two">
          <span className="landing-card-shine" />
          <span className="landing-document-icon" />
          <span className="landing-document-line landing-document-line-long" />
          <span className="landing-document-line landing-document-line-short" />
        </div>
           
        <div className="landing-glass-card landing-document landing-document-three">
          <span className="landing-card-shine" />
          <span className="landing-document-icon" />
          <span className="landing-document-line landing-document-line-long" />
          <span className="landing-document-line landing-document-line-short" />
        </div>
      </div>

      <div className="relative h-[245px] w-[205px] scale-[0.78] sm:h-[265px] sm:w-[235px] sm:scale-90 lg:h-[275px] lg:w-[245px] lg:scale-100">
        <DocumentCard
          animationClass="landing-document-one"
          className="left-0 top-0 -rotate-[8deg]"
          description="Contact and company information"
          Icon={UserRound}
          iconClassName="bg-gradient-to-br from-cyan-400 to-indigo-500"
          status="Captured"
          statusClassName="border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
          title="Client details"
        />

        <DocumentCard
          animationClass="landing-document-two"
          className="left-[22px] top-[70px] rotate-[1deg]"
          description="Goals, budget and requirements"
          Icon={ClipboardList}
          iconClassName="bg-gradient-to-br from-violet-500 to-fuchsia-500"
          status="Organized"
          statusClassName="border-cyan-300/20 bg-cyan-400/10 text-cyan-200"
          title="Project brief"
        />

        <DocumentCard
          animationClass="landing-document-three"
          className="left-[5px] top-[140px] rotate-[7deg]"
          description="Validated and safely received"
          Icon={ShieldCheck}
          iconClassName="bg-gradient-to-br from-emerald-400 to-cyan-500"
          status="Protected"
          statusClassName="border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
          title="Secure submission"
        />
      </div>

      <div
        className={`${GLASS_CARD_CLASS} landing-qr-card h-[142px] w-[142px] rounded-[25px] p-[15px] sm:h-[156px] sm:w-[156px] sm:p-4 lg:h-[168px] lg:w-[168px] lg:p-[18px]`}
      >
        <CardShine />

        <div className="grid h-full w-full grid-cols-9 gap-0.5 rounded-[13px] bg-white/95 p-[9px]">
          {QR_CELLS.map((activeCell, index) => (
            <span
              key={index}
              className={`rounded-[1px] ${
                activeCell ? "bg-[#14152a]" : "bg-transparent"
              }`}
            />
          ))}
        </div>

        <span className="landing-scan-line absolute left-[14px] right-[14px] top-5 z-[5] h-0.5 rounded-full bg-[linear-gradient(90deg,transparent,#68ffd0,transparent)] shadow-[0_0_8px_#68ffd0,0_0_18px_rgba(104,255,208,0.7)]" />
      </div>
    </div>
  );
}

function AnalyticsScene({ active }: SceneProps) {
  return (
    <div className={sceneClass(active)}>
      <div className="landing-glass-card landing-analytics-card">
        <span className="landing-card-shine" />

        <div className="landing-analytics-header">
          <div>
            <span className="landing-copy-line landing-copy-line-long" />
            <span className="landing-copy-line landing-copy-line-short" />
          </div>

          <span className="landing-status-dot" />
        </div>

        <div className="landing-mini-card-grid">
          <span />
          <span />
          <span />
        </div>

        <div className="landing-chart">
          <span className="landing-chart-grid landing-chart-grid-one" />
          <span className="landing-chart-grid landing-chart-grid-two" />
          <span className="landing-chart-grid landing-chart-grid-three" />

          <svg
            viewBox="0 0 420 150"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="landing-chart-gradient"
                x1="0"
                x2="1"
              >
                <stop offset="0%" stopColor="#42d8ff" />
                <stop offset="50%" stopColor="#7c5cff" />
                <stop offset="100%" stopColor="#ef5cff" />
              </linearGradient>
            </defs>

            <path
              className="landing-chart-area"
              d="M0 132 C55 122 80 92 125 104 C175 118 208 45 250 62 C300 82 330 22 420 14 L420 150 L0 150 Z"
            />

            <path
              className="landing-chart-line"
              d="M0 132 C55 122 80 92 125 104 C175 118 208 45 250 62 C300 82 330 22 420 14"
            />
          </svg>
        </div>
      </div>

      <span className="landing-data-particle-one absolute left-[8%] top-[17%] h-2 w-2 rounded-full bg-[#76dfff] shadow-[0_0_8px_#76dfff,0_0_18px_rgba(118,223,255,0.65)]" />

      <span className="landing-data-particle-two absolute bottom-[20%] right-[8%] h-2 w-2 rounded-full bg-[#76dfff] shadow-[0_0_8px_#76dfff,0_0_18px_rgba(118,223,255,0.65)]" />

      <span className="landing-data-particle-three absolute bottom-[9%] left-[22%] h-2 w-2 rounded-full bg-[#76dfff] shadow-[0_0_8px_#76dfff,0_0_18px_rgba(118,223,255,0.65)]" />
    </div>
  );
}

type HowItWorksModalProps = {
  onClose: () => void;
};

function HowItWorksModal({ onClose }: HowItWorksModalProps) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center px-4 py-8"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-[#050610]/80 backdrop-blur-md"
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-it-works-title"
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#cbd0ff38] bg-[linear-gradient(145deg,rgba(30,29,71,0.92),rgba(13,18,43,0.88))] p-5 text-left shadow-[0_28px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl sm:p-6"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200/80">
              Client intake
            </p>

            <h2
              id="how-it-works-title"
              className="mt-2 text-xl font-extrabold tracking-[-0.04em] text-white [font-family:var(--font-display)] sm:text-2xl"
            >
              How it works
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <ol className="mt-5 flex flex-col gap-3">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3.5 sm:p-4"
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${step.iconClassName}`}
              >
                <step.Icon className="h-5 w-5" aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  <span className="mr-2 text-white/35">
                    {index + 1}.
                  </span>
                  {step.title}
                </p>

                <p className="mt-1 text-sm leading-6 text-white/55">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <Link
          href="/register"
          className="group mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,oklch(0.68_0.2_340),oklch(0.55_0.24_292))] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_oklch(0.6_0.24_300/0.65)] transition duration-200 hover:opacity-95"
        >
          Create your intake page

          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>,
    document.body,
  );
}

export function LandingHero() {
  const stageRef = useRef<HTMLElement>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const closeHowItWorks = useCallback(() => {
    setHowItWorksOpen(false);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reduceMotion.matches) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveScene(
        (current) => (current + 1) % ACTIVE_SCENE_COUNT,
      );
    }, SCENE_DURATION);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reduceMotion.matches) {
      return;
    }

    let animationFrame: number | null = null;

    const updateParallax = (event: PointerEvent) => {
      const horizontal = event.clientX / window.innerWidth - 0.5;
      const vertical = event.clientY / window.innerHeight - 0.5;

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }

      animationFrame = window.requestAnimationFrame(() => {
        stage.style.setProperty(
          "--deep-x",
          `${horizontal * -12}px`,
        );

        stage.style.setProperty(
          "--deep-y",
          `${vertical * -12}px`,
        );

        stage.style.setProperty(
          "--middle-x",
          `${horizontal * -24}px`,
        );

        stage.style.setProperty(
          "--middle-y",
          `${vertical * -24}px`,
        );

        stage.style.setProperty(
          "--front-x",
          `${horizontal * -38}px`,
        );

        stage.style.setProperty(
          "--front-y",
          `${vertical * -38}px`,
        );
      });
    };

    const resetParallax = () => {
      stage.style.setProperty("--deep-x", "0px");
      stage.style.setProperty("--deep-y", "0px");
      stage.style.setProperty("--middle-x", "0px");
      stage.style.setProperty("--middle-y", "0px");
      stage.style.setProperty("--front-x", "0px");
      stage.style.setProperty("--front-y", "0px");
    };

    window.addEventListener("pointermove", updateParallax, {
      passive: true,
    });

    document.documentElement.addEventListener(
      "mouseleave",
      resetParallax,
    );

    return () => {
      window.removeEventListener("pointermove", updateParallax);

      document.documentElement.removeEventListener(
        "mouseleave",
        resetParallax,
      );

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  const handleVideoError = (
    event: SyntheticEvent<HTMLVideoElement>,
  ) => {
    event.currentTarget.style.display = "none";
  };

  return (
    <main
      ref={stageRef}
      className="landing-stage relative isolate min-h-[100svh] w-full overflow-hidden text-white [font-family:var(--font-body)]"
    >
      <h1 className="sr-only">Client Intake Platform</h1>

      <div className="landing-deep-layer absolute inset-0 z-0 transition-transform duration-100">
        <div className="landing-mesh absolute -inset-[16%]" />
      </div>

      {/*
        Replaceable landing video:
        public/landing/hero-bg.mp4
      */}
      <video
        className="landing-background-video absolute inset-0 z-[1] h-full w-full object-cover opacity-30 mix-blend-screen"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        onError={handleVideoError}
        aria-hidden="true"
      >
        <source src="/landing/hero-bg.mp4" type="video/mp4" />
      </video>

      <div className="landing-middle-layer absolute inset-0 z-[3] transition-transform duration-100">
        <div className="landing-workspace absolute inset-[-4%_-5%_-5%_16%] overflow-hidden opacity-20 mix-blend-soft-light">
          <Image
            src="/landing/hero-workspace.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="landing-workspace-image object-cover object-center"
          />
        </div>

        <div className="landing-grid absolute -inset-20 opacity-[0.18] sm:opacity-25 lg:opacity-30" />

        <svg
          className="absolute -inset-[2%] h-[104%] w-[104%] overflow-visible opacity-50 sm:opacity-60 lg:opacity-[0.72]"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="landing-network-gradient"
              x1="0"
              x2="1"
            >
              <stop
                offset="0%"
                stopColor="#695cff"
                stopOpacity="0"
              />

              <stop
                offset="46%"
                stopColor="#9d72ff"
                stopOpacity="0.9"
              />

              <stop
                offset="72%"
                stopColor="#4cdcff"
                stopOpacity="0.75"
              />

              <stop
                offset="100%"
                stopColor="#4cdcff"
                stopOpacity="0"
              />
            </linearGradient>

            <filter id="landing-network-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {NETWORK_PATHS.map((path) => (
            <path
              key={path.d}
              d={path.d}
              className="landing-network-path"
              style={{ animationDelay: path.delay }}
            />
          ))}

          {CONNECTION_POINTS.map((point) => (
            <g key={`${point.cx}-${point.cy}`}>
              <circle
                cx={point.cx}
                cy={point.cy}
                r="9"
                className="landing-network-node-glow"
              />

              <circle
                cx={point.cx}
                cy={point.cy}
                r="3.5"
                className="landing-network-node"
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="landing-front-layer pointer-events-none absolute inset-0 z-[6] transition-transform duration-100">

      {/* =========================================================
          DESKTOP VISUALS
          ========================================================= */}
      <div
        id="platform-preview"
        className="absolute inset-0 hidden lg:block"
        aria-hidden="true"
      >

        {/* =======================================================
            LEFT SIDE
            Client details
            Project brief
            Secure submission
            QR card
            ======================================================= */}
        <div className="absolute inset-y-0 left-[3%] w-[44%] xl:left-[5%] xl:w-[40%]">
          <QrScene active={activeScene === 1} />
        </div>


        {/* =======================================================
            RIGHT SIDE
            New client received
            Orbit bubbles
            Analytics
            ======================================================= */}
        <div className="absolute inset-y-0 right-[3%] w-[44%] xl:right-[5%] xl:w-[40%]">
          <ProfileScene active={activeScene === 0} />

          <AnalyticsScene active={activeScene === 2} />
        </div>

      </div>


      {/* =========================================================
          MOBILE + TABLET

          Do NOT split the visuals on smaller screens.
          Keep them centered.
          ========================================================= */}
      <div
        className="absolute inset-x-0 top-[52%] h-[430px] -translate-y-1/2 lg:hidden"
        aria-hidden="true"
      >
        <ProfileScene active={activeScene === 0} />

        <QrScene active={activeScene === 1} />

        <AnalyticsScene active={activeScene === 2} />
      </div>


      {/* =========================================================
          FLOATING SMALL NODES

          LinkedIn
          WhatsApp
          Email
          AI
          CRM
          Check
          Arrow
          etc.

          These stay spread around the FULL screen.
          ========================================================= */}
      <div
        className="absolute inset-0 opacity-45 sm:opacity-65 lg:opacity-100"
        aria-hidden="true"
      >
        {FLOATING_NODES.map((node) => (
          <span
            key={node.label}
            className={`
              landing-node
              absolute
              h-11
              w-11
              place-items-center
              rounded-[14px]
              border
              border-white/15
              bg-[linear-gradient(
                145deg,
                rgba(106,85,255,0.52),
                rgba(22,27,58,0.38)
              )]
              text-[10px]
              font-extrabold
              tracking-[-0.02em]
              text-white/90
              shadow-[
                0_14px_34px_rgba(0,0,0,0.32),
                inset_0_1px_0_rgba(255,255,255,0.16),
                0_0_28px_rgba(107,84,255,0.25)
              ]
              backdrop-blur-[13px]
              ${node.className}
            `}
            style={{
              animationDelay: node.delay,
            }}
          >
            {node.label}
          </span>
        ))}
      </div>

      </div>

      <div className="pointer-events-none absolute inset-0 z-[8]" />

      <div className="pointer-events-none absolute inset-0 z-[9]" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[18%]" />

      <section className="relative z-20 flex min-h-[100svh] items-center justify-center px-5 py-20 text-center sm:px-6 sm:py-24">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80 shadow-[0_12px_40px_-18px_rgba(124,92,255,0.8)] backdrop-blur-md">
            <ShieldCheck
              className="h-4 w-4 text-emerald-300"
              aria-hidden="true"
            />

            Secure intake, simplified
          </div>

          <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-white [font-family:var(--font-display)] sm:mt-7 sm:text-5xl">
            Collect every detail

            <span className="mt-1 block bg-[linear-gradient(90deg,oklch(0.78_0.15_220),oklch(0.68_0.21_320))] bg-clip-text text-transparent">
              Start every project with clarity.
            </span>
          </h2>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Your professional identity, one link
          </div>

          <div className="mt-6 w-full max-w-lg rounded-2xl border border-[#cbd0ff28] bg-[linear-gradient(145deg,rgba(30,29,71,0.46),rgba(13,18,43,0.3))] px-5 py-5 text-left shadow-[0_20px_50px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md sm:px-6">
            <div className="flex item-center justify-between">
              <ul className="flex flex-col gap-3">
                <li className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-400/15 text-cyan-200">
                    <ClipboardList className="h-4 w-4" aria-hidden="true" />
                  </span>

                  <span className="text-sm font-semibold text-cyan-100 sm:text-[15px]">
                    Capture the information that matters
                  </span>
                </li>

                <li className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-fuchsia-400/15 text-fuchsia-200">
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                  </span>

                  <span className="text-sm font-semibold text-fuchsia-100 sm:text-[15px]">
                    Understand what your client needs
                  </span>
                </li>
              </ul>
              <img src="/logo2.png" alt="Intakeio" className=" w-15 h-15 rounded-lg" />
            </div>

            <p className="mt-4 border-t border-white/10 pt-4 text-pretty text-sm leading-6 text-white/55 sm:text-[15px] sm:leading-7">
              Give clients a simple way to share their information and project
              requirements, while you keep everything organized in one private
              workspace.
            </p>
          </div>

          <div className="mt-8 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:mt-9 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,oklch(0.68_0.2_340),oklch(0.55_0.24_292))] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_oklch(0.6_0.24_300/0.65)] transition duration-200 hover:scale-[1.02] hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070814] sm:px-7 sm:text-base"
            >
              Create your intake page

              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>

            <button
              type="button"
              onClick={() => {
                setHowItWorksOpen(true);
              }}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-18px_rgba(0,0,0,0.9)] backdrop-blur-md transition duration-200 hover:scale-[1.02] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070814] sm:px-7 sm:text-base"
            >
              See how it works

              <span className="grid h-6 w-6 place-items-center rounded-full border border-white/15 bg-white/5">
                <Play
                  className="h-3 w-3 fill-current"
                  aria-hidden="true"
                />
              </span>
            </button>
          </div>
        </div>
      </section>

      {howItWorksOpen ? (
        <HowItWorksModal onClose={closeHowItWorks} />
      ) : null}
    </main>
  );
}