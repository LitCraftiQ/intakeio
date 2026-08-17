"use client";

import { useEffect, useRef } from "react";

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const prefersReduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(
      window.devicePixelRatio || 1,
      2,
    );

    type Particle = {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      a: number;
      tw: number;
    };

    let particles: Particle[] = [];

    const resize = () => {
      dpr = Math.min(
        window.devicePixelRatio || 1,
        2,
      );
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = prefersReduce
        ? 60
        : Math.min(
            320,
            Math.floor((width * height) / 6500),
          );

      particles = Array.from(
        { length: density },
        () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.4 + 0.3,
          vx: (Math.random() - 0.5) * 0.15,
          vy: -Math.random() * 0.18 - 0.03,
          a: Math.random() * 0.6 + 0.2,
          tw: Math.random() * Math.PI * 2,
        }),
      );
    };

    resize();
    window.addEventListener("resize", resize);

    let raf = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.tw += 0.02;

        if (particle.y < -5) {
          particle.y = height + 5;
          particle.x = Math.random() * width;
        }

        if (particle.x < -5) {
          particle.x = width + 5;
        }

        if (particle.x > width + 5) {
          particle.x = -5;
        }

        const alpha =
          particle.a *
          (0.6 + 0.4 * Math.sin(particle.tw));

        ctx.beginPath();
        const grad = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.r * 6,
        );
        grad.addColorStop(
          0,
          `rgba(200, 220, 255, ${alpha})`,
        );
        grad.addColorStop(
          1,
          "rgba(200, 220, 255, 0)",
        );
        ctx.fillStyle = grad;
        ctx.arc(
          particle.x,
          particle.y,
          particle.r * 6,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha + 0.2)})`;
        ctx.arc(
          particle.x,
          particle.y,
          particle.r,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      if (!prefersReduce) {
        raf = requestAnimationFrame(render);
      }
    };

    raf = requestAnimationFrame(render);

    const onMove = (event: MouseEvent) => {
      const cx =
        (event.clientX / window.innerWidth - 0.5) *
        2;
      const cy =
        (event.clientY / window.innerHeight - 0.5) *
        2;

      if (orb1Ref.current) {
        orb1Ref.current.style.transform =
          `translate3d(${cx * 24}px, ${cy * 20}px, 0)`;
      }

      if (orb2Ref.current) {
        orb2Ref.current.style.transform =
          `translate3d(${cx * -30}px, ${cy * -22}px, 0)`;
      }
    };

    if (
      !prefersReduce &&
      window.matchMedia("(pointer: fine)").matches
    ) {
      window.addEventListener("mousemove", onMove);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener(
        "mousemove",
        onMove,
      );
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(600px 400px at 20% 30%, oklch(0.5 0.2 265 / 0.35), transparent 60%), radial-gradient(700px 500px at 80% 70%, oklch(0.55 0.18 220 / 0.35), transparent 60%), radial-gradient(500px 400px at 50% 90%, oklch(0.5 0.2 300 / 0.3), transparent 60%)",
          backgroundSize: "200% 200%",
          animation: "gradient-shift 22s ease-in-out infinite",
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div
        ref={orb1Ref}
        className="absolute -left-24 top-[-6rem] h-[28rem] w-[28rem] rounded-full will-change-transform"
        style={{ animation: "float-slower 22s ease-in-out infinite" }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, oklch(0.7 0.18 265 / 0.55), oklch(0.7 0.16 220 / 0.4), oklch(0.65 0.18 300 / 0.55), oklch(0.7 0.18 265 / 0.55))",
            filter: "blur(40px)",
            animation: "orb-rotate 60s linear infinite",
          }}
        />
        <div
          className="absolute inset-4 rounded-full border"
          style={{
            borderColor: "oklch(1 0 0 / 0.15)",
            background:
              "radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.14), oklch(1 0 0 / 0.02) 60%)",
            backdropFilter: "blur(20px)",
            boxShadow:
              "inset 0 1px 0 oklch(1 0 0 / 0.2), 0 0 80px oklch(0.7 0.18 265 / 0.35)",
          }}
        />
      </div>

      <div
        ref={orb2Ref}
        className="absolute -right-32 bottom-[-8rem] h-[32rem] w-[32rem] rounded-full will-change-transform"
        style={{ animation: "float-slow 18s ease-in-out infinite" }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 180deg, oklch(0.65 0.18 220 / 0.55), oklch(0.7 0.17 300 / 0.4), oklch(0.7 0.18 265 / 0.55), oklch(0.65 0.18 220 / 0.55))",
            filter: "blur(50px)",
            animation: "orb-rotate 90s linear infinite reverse",
          }}
        />
        <div
          className="absolute inset-6 rounded-full border"
          style={{
            borderColor: "oklch(1 0 0 / 0.14)",
            background:
              "radial-gradient(circle at 70% 30%, oklch(1 0 0 / 0.14), oklch(1 0 0 / 0.02) 60%)",
            backdropFilter: "blur(20px)",
            boxShadow:
              "inset 0 1px 0 oklch(1 0 0 / 0.2), 0 0 100px oklch(0.65 0.18 220 / 0.35)",
          }}
        />
      </div>
    </div>
  );
}
