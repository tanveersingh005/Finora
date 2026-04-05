import { useEffect, useRef } from "react";
import gsap from "gsap";

export const CustomCursor = () => {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const ctx = gsap.context(() => {
      gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });
      gsap.set(followerRef.current, { xPercent: -50, yPercent: -50 });

      // 🔥 Use quickTo (PERFORMANCE BOOST)
      const moveCursorX = gsap.quickTo(cursorRef.current, "x", { duration: 0.1, ease: "power2.out" });
      const moveCursorY = gsap.quickTo(cursorRef.current, "y", { duration: 0.1, ease: "power2.out" });

      const moveFollowerX = gsap.quickTo(followerRef.current, "x", { duration: 0.5, ease: "power4.out" });
      const moveFollowerY = gsap.quickTo(followerRef.current, "y", { duration: 0.5, ease: "power4.out" });

      const onMouseMove = (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // 🔥 Sync with particles
        window.dispatchEvent(
          new CustomEvent("cursorMove", {
            detail: { x: mouseX, y: mouseY },
          })
        );

        moveCursorX(mouseX);
        moveCursorY(mouseY);

        moveFollowerX(mouseX);
        moveFollowerY(mouseY);
      };

      // 🔥 Hover Effects (buttons, links, cards)
      const onHover = () => {
        gsap.to(cursorRef.current, { scale: 1.8, duration: 0.2 });
        gsap.to(followerRef.current, { scale: 1.4, duration: 0.3 });
      };

      const onLeave = () => {
        gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
        gsap.to(followerRef.current, { scale: 1, duration: 0.3 });
      };

      // 🔥 Click effect
      const onClick = () => {
        gsap.to(cursorRef.current, { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 });
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mousedown", onClick);

      // Attach hover to interactive elements
      const interactiveElements = document.querySelectorAll(
        "button, a, input, .hover-target"
      );

      interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", onHover);
        el.addEventListener("mouseleave", onLeave);
      });

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mousedown", onClick);

        interactiveElements.forEach((el) => {
          el.removeEventListener("mouseenter", onHover);
          el.removeEventListener("mouseleave", onLeave);
        });
      };
    });

    return () => ctx.revert();
  }, []);

  // Disable cursor on mobile
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      {/* 🔵 Inner Dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-indigo-500 rounded-full mix-blend-difference pointer-events-none z-[9999]"
      />

      {/* 🔵 Outer Ring */}
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-10 h-10 border border-indigo-400/60 rounded-full mix-blend-difference pointer-events-none z-[9998]"
      />
    </>
  );
};