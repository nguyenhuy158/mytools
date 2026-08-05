import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HistorySection } from "~/components/HistorySection";

const setup = (over: Partial<Parameters<typeof HistorySection>[0]> = {}) => {
  const onRestore = vi.fn();
  const onRemove = vi.fn();
  const onClear = vi.fn();
  render(
    <HistorySection
      history={["first entry", "second entry"]}
      onRestore={onRestore}
      onRemove={onRemove}
      onClear={onClear}
      renderItem={(item) => <p>{item as string}</p>}
      {...over}
    />,
  );
  return { onRestore, onRemove, onClear };
};

describe("HistorySection", () => {
  it("renders one card per entry", () => {
    setup();
    expect(screen.getByText("first entry")).toBeTruthy();
    expect(screen.getByText("second entry")).toBeTruthy();
  });

  it("renders nothing when the history is empty", () => {
    const { container } = render(
      <HistorySection
        history={[]}
        onRestore={vi.fn()}
        onRemove={vi.fn()}
        onClear={vi.fn()}
        renderItem={() => null}
      />,
    );
    expect(container.firstChild).toBe(null);
  });

  it("exposes a remove and a restore control per entry", () => {
    setup();
    expect(screen.getAllByLabelText("Remove")).toHaveLength(2);
    expect(screen.getAllByLabelText("Restore")).toHaveLength(2);
  });

  it("uses the supplied labels", () => {
    setup({ removeLabel: "Xóa khỏi lịch sử", restoreLabel: "Dùng lại" });
    expect(screen.getAllByLabelText("Xóa khỏi lịch sử")).toHaveLength(2);
    expect(screen.getAllByLabelText("Dùng lại")).toHaveLength(2);
  });

  it("removes the entry it was clicked on", () => {
    const { onRemove, onRestore } = setup();
    screen.getAllByLabelText("Remove")[1].click();
    expect(onRemove).toHaveBeenCalledWith(1);
    // Removing must not also restore — the click is stopped from the card.
    expect(onRestore).not.toHaveBeenCalled();
  });

  it("restores the entry it was clicked on", () => {
    const { onRestore, onRemove } = setup();
    screen.getAllByLabelText("Restore")[0].click();
    expect(onRestore).toHaveBeenCalledWith("first entry");
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("still restores when the card itself is clicked", () => {
    const { onRestore } = setup();
    screen.getByText("second entry").click();
    expect(onRestore).toHaveBeenCalledWith("second entry");
  });

  it("keeps the actions visible without hover, for touch screens", () => {
    // The bug this guards: `opacity-0 group-hover:opacity-100` with no
    // breakpoint made delete unreachable on a phone, which never hovers.
    setup();
    const bar = screen.getAllByLabelText("Remove")[0].parentElement!;
    const classes = bar.className.split(/\s+/);
    expect(classes).not.toContain("opacity-0");
    expect(classes).not.toContain("group-hover:opacity-100");
    // A desktop-only reveal is fine.
    expect(classes).toContain("md:opacity-0");
  });

  it("gives the actions a touch-sized target", () => {
    // 44px on touch, tightened only from md up.
    setup();
    for (const label of ["Remove", "Restore"]) {
      const classes = screen.getAllByLabelText(label)[0].className;
      expect(classes, label).toContain("w-11");
      expect(classes, label).toContain("h-11");
    }
  });

  it("clears everything from the header button", () => {
    const { onClear } = setup({ clearLabel: "Clear All" });
    screen.getByText("Clear All").click();
    expect(onClear).toHaveBeenCalled();
  });
});
