"use client";

import { useLayoutEffect } from "react";

let glassFilterSvgMounted = false;

/**
 * Injects a hidden SVG with glass refraction filters into <body>.
 * Mount once near the root of your app or in a Storybook decorator.
 *
 * Usage in CSS / inline style:
 *   backdropFilter: "blur(18px) url(#lg-refract) saturate(140%)"
 *
 * The SVG filter distorts BACKDROP pixels (what shows through the glass),
 * not the element itself — this is true optical refraction.
 */
export function GlassFilterDefs() {
  useLayoutEffect(() => {
    const FILTER_SVG_ID = "lg-filter-svg";
    if (glassFilterSvgMounted || document.getElementById(FILTER_SVG_ID)) {
      glassFilterSvgMounted = true;
      return;
    }

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = FILTER_SVG_ID;
    svg.setAttribute(
      "style",
      "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none",
    );
    svg.setAttribute("aria-hidden", "true");

    svg.innerHTML = `
      <defs>
        <!--
          lg-refract: subtle turbulence ripple for UI surfaces (backdrop-filter on Firefox).
        -->
        <filter id="lg-refract" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.022" numOctaves="1" seed="5" result="noise"/>
          <feGaussianBlur in="noise" stdDeviation="1.5" result="softNoise"/>
          <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="6" xChannelSelector="R" yChannelSelector="G"/>
        </filter>

        <!--
          lg-glass: full macOS-style liquid glass distortion.
          Apply as filter: url(#lg-glass) on the ELEMENT (not backdrop-filter).
          Works in Chrome, Safari, Firefox.
          Combines: fractalNoise turbulence + gaussian blur + displacement + specular lighting.
        -->
        <filter
          id="lg-glass"
          x="0%" y="0%" width="100%" height="100%"
          filterUnits="objectBoundingBox"
          color-interpolation-filters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01 0.01"
            numOctaves="1"
            seed="5"
            result="turbulence"
          />
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5"/>
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0"/>
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5"/>
          </feComponentTransfer>
          <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap"/>
          <feSpecularLighting
            in="softMap"
            surfaceScale="5"
            specularConstant="1"
            specularExponent="100"
            lighting-color="white"
            result="specLight"
          >
            <fePointLight x="-200" y="-200" z="300"/>
          </feSpecularLighting>
          <feComposite
            in="specLight"
            operator="arithmetic"
            k1="0" k2="1" k3="1" k4="0"
            result="litImage"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softMap"
            scale="150"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <!--
          lg-glass-soft: same as lg-glass but scale=80 — for smaller elements.
        -->
        <filter
          id="lg-glass-soft"
          x="0%" y="0%" width="100%" height="100%"
          filterUnits="objectBoundingBox"
          color-interpolation-filters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.012"
            numOctaves="1"
            seed="14"
            result="turbulence"
          />
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5"/>
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0"/>
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5"/>
          </feComponentTransfer>
          <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap"/>
          <feSpecularLighting
            in="softMap"
            surfaceScale="5"
            specularConstant="1"
            specularExponent="100"
            lighting-color="white"
            result="specLight"
          >
            <fePointLight x="-200" y="-200" z="300"/>
          </feSpecularLighting>
          <feComposite
            in="specLight"
            operator="arithmetic"
            k1="0" k2="1" k3="1" k4="0"
            result="litImage"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softMap"
            scale="80"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <!--
          lg-glass-pill: title pill tuning.
          Stronger than lg-glass-soft, but still calmer than full lg-glass.
        -->
        <filter
          id="lg-glass-pill"
          x="0%" y="0%" width="100%" height="100%"
          filterUnits="objectBoundingBox"
          color-interpolation-filters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.011 0.011"
            numOctaves="1"
            seed="14"
            result="turbulence"
          />
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5"/>
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0"/>
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5"/>
          </feComponentTransfer>
          <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap"/>
          <feSpecularLighting
            in="softMap"
            surfaceScale="5"
            specularConstant="1"
            specularExponent="100"
            lighting-color="white"
            result="specLight"
          >
            <fePointLight x="-200" y="-200" z="300"/>
          </feSpecularLighting>
          <feComposite
            in="specLight"
            operator="arithmetic"
            k1="0" k2="1" k3="1" k4="0"
            result="litImage"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softMap"
            scale="120"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <!--
          lg-lens: convex radial lens (physical magnification).
          Apply as filter: url(#lg-lens) on element.
        -->
        <filter id="lg-lens" x="-50%" y="-50%" width="200%" height="200%">
          <feImage
            result="normalMap"
            x="0" y="0" width="100%" height="100%"
            href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3CradialGradient id='lm' cx='50%25' cy='50%25' r='75%25'%3E%3Cstop offset='0%25' stop-color='rgb(128,128,255)'/%3E%3Cstop offset='90%25' stop-color='rgb(255,255,255)'/%3E%3C/radialGradient%3E%3Crect width='100%25' height='100%25' fill='url(%23lm)'/%3E%3C/svg%3E"
          />
          <feDisplacementMap in="SourceGraphic" in2="normalMap" scale="-252" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
          <feMerge><feMergeNode in="displaced"/></feMerge>
        </filter>
      </defs>
    `;

    document.body.appendChild(svg);
    glassFilterSvgMounted = true;
  }, []);

  return null;
}
