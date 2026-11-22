import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import MeridianApp from "../src/app/page";
import DesignSystemPage from "../src/app/design/page";
import { ThemeProvider } from "../src/lib/theme/ThemeProvider";

describe("Accessibility (A11y) & Semantic Structure", () => {
  it("MeridianApp renders valid main landmark and interactive regions", () => {
    const html = renderToString(
      React.createElement(ThemeProvider, null, React.createElement(MeridianApp))
    );

    // Must have <main> landmark
    expect(html).toContain("<main");
    // Must have accessible region name
    expect(html).toContain("Vadodara, India");
    // Must have tabs for Map, Layers, Status, About
    expect(html).toContain("Map");
    expect(html).toContain("Layers");
    expect(html).toContain("Status");
    expect(html).toContain("About");
  });

  it("DesignSystemPage renders accessible headings, landmarks, and roles", () => {
    const html = renderToString(
      React.createElement(ThemeProvider, null, React.createElement(DesignSystemPage))
    );

    // Header and main landmark
    expect(html).toContain("<header");
    expect(html).toContain("<main");
    // H1 heading
    expect(html).toContain("Meridian Design System");
    // Radiogroup for theme selector
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('aria-label="Theme Selector"');
    // Search input with accessible label
    expect(html).toContain('role="search"');
    expect(html).toContain('aria-label="Search"');
  });

  it("all interactive buttons have accessible text or aria-label", () => {
    const html = renderToString(
      React.createElement(ThemeProvider, null, React.createElement(DesignSystemPage))
    );
    // Verify no buttons exist without content or aria-label
    const emptyButtons = html.match(/<button(?![^>]*aria-label)[^>]*>\s*<\/button>/g);
    expect(emptyButtons).toBeNull();
  });
});
