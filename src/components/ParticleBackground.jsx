import React, { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useSelector } from "react-redux";

export const ParticleBackground = ({ overlayClass = "fixed inset-0" }) => {
  const [init, setInit] = useState(false);
  const theme = useSelector((state) => state.ui.theme);

  // ✅ Initialize particles engine
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  // ✅ Sync GSAP cursor with particles
  useEffect(() => {
    const handleCursor = (e) => {
      const { x, y } = e.detail;

      const container = window.tsParticlesContainer;
      if (container && container.interactivity) {
        container.interactivity.mouse.position = { x, y };
        container.interactivity.status = "mousemove";
      }
    };

    window.addEventListener("cursorMove", handleCursor);

    return () => window.removeEventListener("cursorMove", handleCursor);
  }, []);

  // 🎨 Dynamic colors (premium palette)
  const particleColors =
    theme === "dark"
      ? ["#6366F1", "#8B5CF6", "#22D3EE"]
      : ["#1E1B4B", "#3B0764", "#115E59"]; // Extremely dark colors to contrast sharply against light BG

  const options = {
    background: {
      color: { value: "transparent" },
    },
    fpsLimit: 120,

    interactivity: {
      detectsOn: "window",
      events: {
        onHover: {
          enable: true,
          mode: ["grab", "attract"],
        },
      },
      modes: {
        grab: {
          distance: 180,
          links: {
            opacity: 0.25,
          },
        },
        attract: {
          distance: 180,
          duration: 0.4,
          factor: 5,
          speed: 3,
        },
      },
    },

    particles: {
      color: {
        value: particleColors,
      },

      links: {
        enable: true,
        color: theme === "dark" ? "#6366F1" : "#1E1B4B",
        distance: 140,
        opacity: theme === "dark" ? 0.15 : 0.6,
        width: 1,
      },

      move: {
        enable: true,
        random: true,
        speed: 1.8,
        straight: false,
        outModes: {
          default: "out",
        }
      },

      number: {
        density: {
          enable: true,
        },
        value: 80,
      },

      opacity: {
        value: theme === "dark" ? { min: 0.4, max: 0.9 } : { min: 0.5, max: 1 },
        animation: {
          enable: true,
          speed: 0.5,
          sync: false,
        },
      },

      shape: {
        type: "circle",
      },

      size: {
        value: { min: 1.5, max: 2.5 },
      },

      shadow: {
        enable: theme === "dark", // Disable harsh shadows in light mode so it blends natively
        color: theme === "dark" ? "#818CF8" : "transparent",
        blur: theme === "dark" ? 15 : 0,
      },
    },

    detectRetina: true,
  };

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      particlesLoaded={(container) => {
        window.tsParticlesContainer = container; // Safely bind the active V3 DOM Container
      }}
      options={options}
      className={`${overlayClass} z-[0] pointer-events-none opacity-80`}
    />
  );
};