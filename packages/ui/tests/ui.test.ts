import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { Button } from "../src/Button";
import { IconButton } from "../src/IconButton";
import { Surface } from "../src/Surface";
import { VisuallyHidden } from "../src/VisuallyHidden";
import { Spinner } from "../src/Spinner";
import { InlineNotice } from "../src/InlineNotice";
import { SegmentedControl } from "../src/SegmentedControl";
import { Badge } from "../src/Badge";
import { ErrorState } from "../src/ErrorState";
import { EmptyState } from "../src/EmptyState";
import { Kbd } from "../src/Kbd";
import { SearchBox } from "../src/SearchBox";

describe("@meridian/ui Component Library", () => {
  it("renders Button with variant and loading states", () => {
    const htmlNormal = renderToString(React.createElement(Button, { variant: "primary" }, "Click me"));
    expect(htmlNormal).toContain("Click me");
    expect(htmlNormal).toContain("bg-[var(--color-accent)]");

    const htmlLoading = renderToString(
      React.createElement(Button, { loading: true }, "Submit")
    );
    expect(htmlLoading).toContain('aria-busy="true"');
    expect(htmlLoading).toContain("role=\"status\"");
  });

  it("renders IconButton with required aria-label", () => {
    const html = renderToString(
      React.createElement(IconButton, {
        "aria-label": "Recenter map",
        icon: React.createElement("span", null, "Icon")
      })
    );
    expect(html).toContain('aria-label="Recenter map"');
    expect(html).toContain("Icon");
  });

  it("renders Surface with elevation levels", () => {
    const htmlLevel1 = renderToString(
      React.createElement(Surface, { elevation: "level1" }, "Content")
    );
    expect(htmlLevel1).toContain("bg-[var(--color-level1)]");

    const htmlLevel3 = renderToString(
      React.createElement(Surface, { elevation: "level3" }, "Dialog")
    );
    expect(htmlLevel3).toContain("bg-[var(--color-level3)]");
  });

  it("renders VisuallyHidden with correct screen-reader clipping", () => {
    const html = renderToString(
      React.createElement(VisuallyHidden, null, "Hidden text")
    );
    expect(html).toContain("Hidden text");
    expect(html).toContain("clip:rect(0,0,0,0)");
  });

  it("renders Spinner with status role and accessible label", () => {
    const html = renderToString(React.createElement(Spinner, { label: "Fetching tiles" }));
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Fetching tiles"');
  });

  it("renders InlineNotice with proper alert / status semantics", () => {
    const htmlDanger = renderToString(
      React.createElement(InlineNotice, { variant: "danger", title: "Out of region", children: "Warning description" })
    );
    expect(htmlDanger).toContain('role="alert"');
    expect(htmlDanger).toContain("Out of region");

    const htmlInfo = renderToString(
      React.createElement(InlineNotice, { variant: "info", children: "Info details" })
    );
    expect(htmlInfo).toContain('role="status"');
  });

  it("renders SegmentedControl as radiogroup with checked states", () => {
    const html = renderToString(
      React.createElement(SegmentedControl, {
        ariaLabel: "Theme selection",
        value: "light",
        onChange: vi.fn(),
        options: [
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" }
        ]
      })
    );
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('role="radio"');
    expect(html).toContain('aria-checked="true"');
  });

  it("renders Badges for CVD categories", () => {
    const htmlCat1 = renderToString(
      React.createElement(Badge, { variant: "cat1" }, "Pothole")
    );
    expect(htmlCat1).toContain("var(--color-cat1-pothole)");
    expect(htmlCat1).toContain("Pothole");
  });

  it("renders ErrorState with alert role and message", () => {
    const html = renderToString(
      React.createElement(ErrorState, {
        title: "Connection Failed",
        message: "Tile server is not reachable on 127.0.0.1:8082"
      })
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain("Connection Failed");
    expect(html).toContain("127.0.0.1:8082");
  });

  it("renders EmptyState and Kbd elements", () => {
    const htmlEmpty = renderToString(
      React.createElement(EmptyState, {
        title: "No layers selected",
        description: "Enable layers from the panel above."
      })
    );
    expect(htmlEmpty).toContain("No layers selected");

    const htmlKbd = renderToString(React.createElement(Kbd, null, "Ctrl"));
    expect(htmlKbd).toContain("Ctrl");
    expect(htmlKbd).toContain("<kbd");
  });

  it("renders SearchBox with search role and label", () => {
    const html = renderToString(React.createElement(SearchBox, { value: "Sayaji Baug" }));
    expect(html).toContain('role="search"');
    expect(html).toContain('aria-label="Search"');
    expect(html).toContain('value="Sayaji Baug"');
  });
});
