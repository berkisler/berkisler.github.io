const demoStates = {
  value: {
    question: "Which home offers the best space-to-price trade-off?",
    answer:
      "Linden House has the lowest price per m² and the largest outdoor area. Canal Loft is more central, but costs 18% more per m².",
    citations: ["[Linden · price]", "[Linden · area]", "[Canal · location]"],
    metrics: [["Best value", "Linden"], ["Most central", "Canal"], ["Confidence", "High"]],
  },
  monthly: {
    question: "Compare the full monthly cost—not only the advertised rent.",
    answer:
      "Park Flat lists the lowest base rent, but its service costs are missing. Linden House is €110 more with all stated recurring costs included.",
    citations: ["[Park · rent]", "[Park · costs missing]", "[Linden · service costs]"],
    metrics: [["Known total", "Linden"], ["Lowest base", "Park"], ["Data gap", "Park costs"]],
  },
  verify: {
    question: "What should I verify before I book a viewing?",
    answer:
      "Ask Canal Loft about energy usage and sound insulation. Neither detail appears in the listing, and both could materially affect comfort and cost.",
    citations: ["[Canal · energy field]", "[Canal · description]", "[Listing captured today]"],
    metrics: [["Missing", "Energy use"], ["Unclear", "Insulation"], ["Action", "Ask agent"]],
  },
};

const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
    document.body.classList.toggle("nav-open", !open);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    });
  });
}

const demoButtons = document.querySelectorAll("[data-demo]");
const questionNode = document.querySelector("[data-demo-question]");
const answerNode = document.querySelector("[data-demo-answer]");
const citationsNode = document.querySelector("[data-demo-citations]");
const metricsNode = document.querySelector("[data-demo-metrics]");

demoButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const state = demoStates[button.dataset.demo];
    if (!state || !questionNode || !answerNode || !citationsNode || !metricsNode) return;

    demoButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    questionNode.textContent = state.question;
    answerNode.textContent = state.answer;
    citationsNode.replaceChildren(
      ...state.citations.map((citation) => {
        const span = document.createElement("span");
        span.textContent = citation;
        return span;
      }),
    );
    metricsNode.replaceChildren(
      ...state.metrics.map(([label, value]) => {
        const item = document.createElement("div");
        const labelNode = document.createElement("span");
        const valueNode = document.createElement("strong");
        labelNode.textContent = label;
        valueNode.textContent = value;
        item.append(labelNode, valueNode);
        return item;
      }),
    );
  });
});

const profile = window.PORTFOLIO_PROFILE || {};
document.querySelectorAll("[data-profile-link]").forEach((link) => {
  const key = link.dataset.profileLink;
  const value = profile[key];
  const label = document.querySelector(`[data-profile-label="${key}"]`);
  if (!value) {
    link.addEventListener("click", (event) => event.preventDefault());
    return;
  }

  link.removeAttribute("aria-disabled");
  if (key === "email") {
    link.href = `mailto:${value}`;
    if (label) label.textContent = value;
  } else {
    link.href = value;
    if (key === "linkedin") {
      link.target = "_blank";
      link.rel = "noreferrer";
      if (label) label.textContent = "View profile ↗";
    }
    if (key === "resume") {
      link.setAttribute("download", "Berke-Isler-Resume.pdf");
      if (label) label.textContent = "Download PDF ↓";
    }
  }
});

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const header = document.querySelector("[data-header]");
if (header) {
  const setHeaderState = () => header.classList.toggle("is-scrolled", window.scrollY > 18);
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });
}

const revealNodes = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  revealNodes.forEach((node) => observer.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}
