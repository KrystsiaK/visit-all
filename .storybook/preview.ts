import type { Preview } from "@storybook/nextjs-vite";
import { themes } from "storybook/theming";
import "../src/app/globals.css";

// Inject SVG glass-refraction filters once — available to all stories via
//   backdrop-filter: blur(Xpx) url(#lg-refract) saturate(Y%)
function injectGlassFilters() {
  if (typeof document === "undefined") return;
  if (document.getElementById("lg-filter-svg")) return;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "lg-filter-svg";
  svg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = `<defs>
    <!--
      lg-refract: turbulence noise → subtle glass ripple (UI default)
      blur BEFORE displacement → smooth organic distortion
    -->
    <filter id="lg-refract" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.018 0.022" numOctaves="1" seed="5" result="noise"/>
      <feGaussianBlur in="noise" stdDeviation="1.5" result="softNoise"/>
      <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="6" xChannelSelector="R" yChannelSelector="G"/>
    </filter>

    <!--
      lg-refract-strong: turbulence → strong lens warp
    -->
    <filter id="lg-refract-strong" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.016" numOctaves="1" seed="5" result="noise"/>
      <feGaussianBlur in="noise" stdDeviation="2.5" result="softNoise"/>
      <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="20" xChannelSelector="R" yChannelSelector="G"/>
    </filter>

    <!--
      lg-refract-self: self-displacement — the backdrop image warps itself.
      Uses SourceGraphic as BOTH input AND displacement map.
      Bright pixels pull right, dark pull left → unique per every background.
      blur AFTER displacement → edges smear organically after warp.
    -->
    <filter id="lg-refract-self" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="linearRGB" primitiveUnits="userSpaceOnUse">
      <feDisplacementMap in="SourceGraphic" in2="SourceGraphic" scale="18" xChannelSelector="R" yChannelSelector="B" result="warped"/>
      <feGaussianBlur in="warped" stdDeviation="2.5" edgeMode="none"/>
    </filter>
    <filter id="lg-lens" x="-50%" y="-50%" width="200%" height="200%">
      <feImage result="normalMap" x="0" y="0" width="100%" height="100%"
        href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3CradialGradient id='lm' cx='50%25' cy='50%25' r='75%25'%3E%3Cstop offset='0%25' stop-color='rgb(128,128,255)'/%3E%3Cstop offset='90%25' stop-color='rgb(255,255,255)'/%3E%3C/radialGradient%3E%3Crect width='100%25' height='100%25' fill='url(%23lm)'/%3E%3C/svg%3E"/>
      <feDisplacementMap in="SourceGraphic" in2="normalMap" scale="-120" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
      <feMerge><feMergeNode in="displaced"/></feMerge>
    </filter>
  </defs>`;
  document.body.appendChild(svg);
}
injectGlassFilters();

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "Theme",
      defaultValue: "light",
      toolbar: {
        icon: "mirror",
        items: ["light"],
        dynamicTitle: false,
      },
    },
  },
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "studio",
      values: [
        { name: "studio", value: "linear-gradient(180deg,#dcecf4 0%,#eef4f8 50%,#f7f7f3 100%)" },
        { name: "map-soft", value: "linear-gradient(180deg,#d7edf2 0%,#eaf3f1 52%,#f8f6ef 100%)" },
        { name: "paper", value: "#f8f7f3" },
      ],
    },
    docs: {
      theme: themes.light,
    },
    options: {
      storySort: {
          order: [
          "Liquid Glass",
          ["Glass Pill", "Overview"],
          "Shell Kit",
          ["Overview", "BaseShell", "BaseWidget", "TitlePill"],
          "Inputs",
          "Widgets",
        ],
      },
    },
    a11y: {
      test: "todo",
    },
  },
};

export default preview;
