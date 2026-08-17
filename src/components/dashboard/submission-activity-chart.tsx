"use client";

import {
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import {
  type PointerEvent,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import type { ContactStatus } from
  "@/lib/dashboard/types";

export type ActivityPoint = Readonly<{
  label: string;
  tick: string;
  weekday: string;
  lastSubmittedAt: string | null;
  count: number;
}>;

type StatusMixItem = Readonly<{
  status: ContactStatus;
  label: string;
  count: number;
}>;

type SubmissionActivityChartProps = Readonly<{
  activity: ActivityPoint[];
  thisWeek: number;
  statusMix: StatusMixItem[];
}>;

const CHART = {
  width: 420,
  height: 204,
  padX: 20,
  padTop: 22,
  padBottom: 44,
} as const;

function buildSmoothPath(
  points: Array<Readonly<{ x: number; y: number }>>,
) {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const controlX = (current.x + next.x) / 2;

    path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  return path;
}

function linearTrend(values: number[]) {
  const n = values.length;

  if (n < 2) {
    return {
      slope: 0,
      values,
    };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  values.forEach((y, x) => {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });

  const denominator = n * sumXX - sumX * sumX;
  const slope =
    denominator === 0
      ? 0
      : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return {
    slope,
    values: values.map(
      (_, x) => intercept + slope * x,
    ),
  };
}

function formatClock(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function mapY(
  value: number,
  maximum: number,
  innerHeight: number,
) {
  return (
    CHART.padTop +
    innerHeight -
    (Math.max(value, 0) / maximum) * innerHeight
  );
}

export function SubmissionActivityChart({
  activity,
  thisWeek,
  statusMix,
}: SubmissionActivityChartProps) {
  const reactId = useId();
  const strokeId = `${reactId}-stroke`;
  const fillId = `${reactId}-fill`;
  const glowId = `${reactId}-glow`;
  const trendId = `${reactId}-trend`;

  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const counts = activity.map((item) => item.count);
  const trend = linearTrend(counts);
  const maximum = Math.max(...counts, ...trend.values, 1);

  const innerWidth = CHART.width - CHART.padX * 2;
  const innerHeight =
    CHART.height - CHART.padTop - CHART.padBottom;

  const dailyPoints = useMemo(
    () =>
      activity.map((item, index) => {
        const x =
          activity.length === 1
            ? CHART.padX + innerWidth / 2
            : CHART.padX +
              (index / (activity.length - 1)) *
                innerWidth;

        return {
          x,
          y: mapY(item.count, maximum, innerHeight),
          ...item,
        };
      }),
    [activity, innerHeight, innerWidth, maximum],
  );

  const trendPoints = trend.values.map((value, index) => ({
    x: dailyPoints[index]?.x ?? CHART.padX,
    y: mapY(value, maximum, innerHeight),
  }));

  const linePath = buildSmoothPath(dailyPoints);
  const trendPath = buildSmoothPath(trendPoints);
  const areaPath = `${linePath} L ${dailyPoints[dailyPoints.length - 1]?.x ?? 0} ${
    CHART.height - CHART.padBottom
  } L ${dailyPoints[0]?.x ?? 0} ${
    CHART.height - CHART.padBottom
  } Z`;

  const selected =
    activeIndex === null
      ? null
      : dailyPoints[activeIndex];

  const previousWindow = counts
    .slice(0, Math.floor(counts.length / 2))
    .reduce((sum, value) => sum + value, 0);
  const recentWindow = counts
    .slice(Math.floor(counts.length / 2))
    .reduce((sum, value) => sum + value, 0);
  const changePercent =
    previousWindow === 0
      ? recentWindow > 0
        ? 100
        : 0
      : Math.round(
          ((recentWindow - previousWindow) /
            previousWindow) *
            100,
        );

  const trendState =
    trend.slope > 0.04
      ? "up"
      : trend.slope < -0.04
        ? "down"
        : "flat";

  const totalStatus = statusMix.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  function handlePointerMove(
    event: PointerEvent<SVGSVGElement>,
  ) {
    const bounds =
      event.currentTarget.getBoundingClientRect();
    const x =
      ((event.clientX - bounds.left) / bounds.width) *
      CHART.width;

    let nearest = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    dailyPoints.forEach((point, index) => {
      const distance = Math.abs(point.x - x);

      if (distance < nearestDistance) {
        nearest = index;
        nearestDistance = distance;
      }
    });

    setActiveIndex(nearest);
  }

  const TrendIcon =
    trendState === "up"
      ? TrendingUp
      : trendState === "down"
        ? TrendingDown
        : Minus;

  return (
    <article className="relative overflow-hidden rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-[var(--dash-card-shadow)] sm:p-6">
      <span
        className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-violet-500/18 blur-3xl"
        aria-hidden="true"
      />

      <span
        className="pointer-events-none absolute -bottom-24 left-8 h-40 w-40 rounded-full bg-cyan-400/14 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-[-0.02em]">
            Submission activity
          </h2>

          <p className="mt-1 text-xs text-[var(--dash-muted)]">
            14-day trend · {formatClock(now)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={[
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold",
              trendState === "up"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                : trendState === "down"
                  ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                  : "border-[var(--dash-border)] bg-[var(--dash-surface-strong)] text-[var(--dash-muted)]",
            ].join(" ")}
          >
            <TrendIcon className="h-3.5 w-3.5" />
            {changePercent > 0 ? "+" : ""}
            {changePercent}%
          </div>

          <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--dash-soft)]">
              This week
            </p>

            <p className="mt-0.5 text-lg font-black leading-none tracking-[-0.04em]">
              {thisWeek}
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-5">
        <svg
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          className="h-52 w-full overflow-visible"
          role="img"
          aria-label="Submission trend over the last fourteen days"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => {
            setActiveIndex(null);
          }}
        >
          <defs>
            <linearGradient
              id={strokeId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#7c5cff" />
              <stop offset="100%" stopColor="#35cfff" />
            </linearGradient>

            <linearGradient
              id={fillId}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="#7c5cff"
                stopOpacity="0.32"
              />
              <stop
                offset="55%"
                stopColor="#35cfff"
                stopOpacity="0.1"
              />
              <stop
                offset="100%"
                stopColor="#35cfff"
                stopOpacity="0"
              />
            </linearGradient>

            <linearGradient
              id={trendId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#35cfff" />
              <stop offset="100%" stopColor="#7c5cff" />
            </linearGradient>

            <filter
              id={glowId}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur
                stdDeviation="3.2"
                result="blur"
              />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((line) => {
            const y =
              CHART.padTop + innerHeight * (1 - line);

            return (
              <line
                key={line}
                x1={CHART.padX}
                x2={CHART.width - CHART.padX}
                y1={y}
                y2={y}
                stroke="currentColor"
                className="text-[var(--dash-border)]"
                strokeDasharray="3 6"
                strokeWidth="1"
              />
            );
          })}

          <path d={areaPath} fill={`url(#${fillId})`} />

          <path
            d={trendPath}
            fill="none"
            stroke={`url(#${trendId})`}
            strokeWidth="2"
            strokeDasharray="5 6"
            strokeLinecap="round"
            className="activity-trendline"
          />

          <path
            d={linePath}
            fill="none"
            stroke={`url(#${strokeId})`}
            strokeWidth="2.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${glowId})`}
            className="activity-daily-line"
          />

          {selected ? (
            <>
              <line
                x1={selected.x}
                x2={selected.x}
                y1={CHART.padTop}
                y2={CHART.height - CHART.padBottom}
                stroke={`url(#${strokeId})`}
                strokeWidth="1.2"
                strokeDasharray="3 4"
                opacity="0.75"
              />

              <circle
                cx={selected.x}
                cy={selected.y}
                r="6"
                fill="#35cfff"
                stroke="var(--dash-surface)"
                strokeWidth="2.6"
              />
            </>
          ) : null}

          {dailyPoints.map((point, index) => {
            const showTick =
              index === 0 ||
              index === dailyPoints.length - 1 ||
              index % 3 === 0;

            if (!showTick) {
              return null;
            }

            return (
              <g key={`${point.weekday}-${point.tick}`}>
                <text
                  x={point.x}
                  y={CHART.height - 22}
                  textAnchor="middle"
                  className="fill-[var(--dash-muted)] text-[8px] font-bold uppercase tracking-[0.12em]"
                >
                  {point.weekday}
                </text>

                <text
                  x={point.x}
                  y={CHART.height - 8}
                  textAnchor="middle"
                  className="fill-[var(--dash-soft)] text-[9px] font-bold tracking-[0.02em]"
                >
                  {point.tick}
                </text>
              </g>
            );
          })}
        </svg>

        {selected ? (
          <div
            className="pointer-events-none absolute top-0 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-popover)] px-2.5 py-1.5 text-xs shadow-[var(--dash-popover-shadow)]"
            style={{
              left: `min(calc(${(selected.x / CHART.width) * 100}% - 1.5rem), calc(100% - 8.5rem))`,
            }}
          >
            <p className="font-bold text-[var(--dash-text)]">
              {selected.count}{" "}
              {selected.count === 1
                ? "submission"
                : "submissions"}
            </p>

            <p className="mt-0.5 text-[10px] font-semibold text-[var(--dash-text)]">
              {selected.label}
            </p>

            <p className="text-[10px] text-[var(--dash-muted)]">
              {selected.lastSubmittedAt
                ? `Last at ${formatTime(selected.lastSubmittedAt)}`
                : "No submissions this day"}
            </p>
          </div>
        ) : null}
      </div>

      <div className="relative mt-3 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-[var(--dash-muted)]">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
          Daily
        </span>

        <span className="inline-flex items-center gap-2">
          <span className="h-px w-5 border-t-2 border-dashed border-cyan-400" />
          Trendline
        </span>
      </div>

      <div className="relative mt-5 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--dash-soft)]">
          Pipeline mix
        </p>

        {totalStatus === 0 ? (
          <p className="mt-1 text-sm font-bold">
            Waiting for the first contact
          </p>
        ) : (
          <>
            <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-[var(--dash-chart-track)]">
              {statusMix.map((item) => {
                if (item.count === 0) {
                  return null;
                }

                return (
                  <span
                    key={item.status}
                    className="h-full"
                    style={{
                      width: `${(item.count / totalStatus) * 100}%`,
                      background:
                        item.status === "pending"
                          ? "var(--dash-status-pending-text)"
                          : item.status === "contacted"
                            ? "var(--dash-status-contacted-text)"
                            : item.status === "qualified"
                              ? "var(--dash-status-qualified-text)"
                              : "var(--dash-status-archived-text)",
                    }}
                  />
                );
              })}
            </div>

            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold text-[var(--dash-muted)]">
              {statusMix.map((item) => (
                <span key={item.status}>
                  {item.label} {item.count}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </article>
  );
}
