import { resolveFlag } from "../resolve";

describe("resolveFlag", () => {
  it("prefers a local override over remote and default", () => {
    expect(resolveFlag("ai-photo-tutor", false, true)).toEqual({
      value: false,
      source: "override",
    });
    expect(resolveFlag("ai-photo-tutor", true, false)).toEqual({
      value: true,
      source: "override",
    });
  });

  it("falls back to the remote value when no override is set", () => {
    expect(resolveFlag("ai-photo-tutor", undefined, false)).toEqual({
      value: false,
      source: "remote",
    });
    expect(resolveFlag("ai-photo-tutor", undefined, true)).toEqual({
      value: true,
      source: "remote",
    });
  });

  it("falls back to the registry default when neither override nor remote exist", () => {
    // ai-photo-tutor defaults to true in the registry.
    expect(resolveFlag("ai-photo-tutor", undefined, undefined)).toEqual({
      value: true,
      source: "default",
    });
  });
});
