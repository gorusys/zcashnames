import { describe, it, expect } from "vitest";
import {
  claimPayload,
  buyPayload,
  listPayload,
  delistPayload,
  updatePayload,
  buildClaimMemo,
  buildBuyMemo,
  buildListMemo,
  buildDelistMemo,
  buildUpdateMemo,
} from "../src/memo.js";

describe("signing payloads", () => {
  it("claimPayload", () => {
    expect(claimPayload("alice", "u1addr")).toBe("CLAIM:alice:u1addr");
  });

  it("buyPayload", () => {
    expect(buyPayload("alice", "u1buyer")).toBe("BUY:alice:u1buyer");
  });

  it("listPayload", () => {
    expect(listPayload("alice", 100000000, 1)).toBe("LIST:alice:100000000:1");
  });

  it("delistPayload", () => {
    expect(delistPayload("alice", 2)).toBe("DELIST:alice:2");
  });

  it("updatePayload", () => {
    expect(updatePayload("alice", "u1new", 3)).toBe("UPDATE:alice:u1new:3");
  });
});

describe("memo builders", () => {
  it("buildClaimMemo", () => {
    expect(buildClaimMemo("alice", "u1addr", "sig123")).toBe(
      "ZNS:CLAIM:alice:u1addr:sig123",
    );
  });

  it("buildBuyMemo", () => {
    expect(buildBuyMemo("alice", "u1buyer", "sig456")).toBe(
      "ZNS:BUY:alice:u1buyer:sig456",
    );
  });

  it("buildListMemo", () => {
    expect(buildListMemo("alice", 100000000, 1, "sigABC")).toBe(
      "ZNS:LIST:alice:100000000:1:sigABC",
    );
  });

  it("buildDelistMemo", () => {
    expect(buildDelistMemo("alice", 2, "sigDEF")).toBe(
      "ZNS:DELIST:alice:2:sigDEF",
    );
  });

  it("buildUpdateMemo", () => {
    expect(buildUpdateMemo("alice", "u1new", 3, "sigGHI")).toBe(
      "ZNS:UPDATE:alice:u1new:3:sigGHI",
    );
  });
});

describe("memo builder validation", () => {
  it("rejects invalid name", () => {
    expect(() => buildClaimMemo("ALICE", "u1addr", "sig")).toThrow("Invalid name");
    expect(() => buildBuyMemo("-bad", "u1addr", "sig")).toThrow("Invalid name");
    expect(() => buildListMemo("no spaces", 100, 1, "sig")).toThrow("Invalid name");
    expect(() => buildDelistMemo("", 1, "sig")).toThrow("Invalid name");
    expect(() => buildUpdateMemo("al--ice", "u1new", 1, "sig")).toThrow("Invalid name");
  });

  it("rejects empty address in buildClaimMemo", () => {
    expect(() => buildClaimMemo("alice", "", "sig")).toThrow("address must not be empty");
    expect(() => buildClaimMemo("alice", "  ", "sig")).toThrow("address must not be empty");
  });

  it("rejects empty address in buildBuyMemo", () => {
    expect(() => buildBuyMemo("alice", "", "sig")).toThrow("buyer address must not be empty");
  });

  it("rejects empty address in buildUpdateMemo", () => {
    expect(() => buildUpdateMemo("alice", "", 1, "sig")).toThrow("new address must not be empty");
  });
});
