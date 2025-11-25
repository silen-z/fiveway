export type NodeId = string;

export function createGlobalId(head: NodeId, ...tail: NodeId[]): NodeId {
  return [head, ...tail].join("/");
}

export function scopedId(scope: NodeId, nodeId: NodeId): NodeId {
  if (nodeId.startsWith("#")) {
    return nodeId;
  }

  return createGlobalId(scope, nodeId);
}

export function isParent(parentId: NodeId, childId: NodeId): boolean {
  return childId.startsWith(parentId + "/");
}

export function directChildId(parentId: NodeId, descendantId: NodeId): NodeId | null {
  if (!isParent(parentId, descendantId)) {
    return null;
  }

  const slash = descendantId.indexOf("/", parentId.length + 1);
  if (slash === -1) {
    return descendantId;
  }

  return descendantId.substring(0, slash);
}

export function idsToRoot(nodeId: NodeId, cb: (id: NodeId) => boolean | void): void {
  const cont = cb(nodeId);
  if (cont === false) {
    return;
  }

  for (;;) {
    const idx = nodeId.lastIndexOf("/");
    if (idx === -1) {
      return;
    }

    nodeId = nodeId.substring(0, idx);
    if (cb(nodeId) === false) {
      return;
    }
  }
}

export function convergingPaths(node1: NodeId, node2: NodeId, cb: (id: NodeId) => void): void {
  if (node1 !== node2) {
    idsToRoot(node2, (id) => {
      if (isParent(id, node1)) {
        return false;
      }

      cb(id);
    });
  }

  idsToRoot(node1, cb);
}

if (import.meta.vitest) {
  const { expect, test, vi } = import.meta.vitest;

  test("createGlobalId", () => {
    expect(createGlobalId("#/container", "item")).toBe("#/container/item");
  });

  test("scopedId", () => {
    expect(scopedId("#/container", "item")).toBe("#/container/item");
    expect(scopedId("#/container", "#/item")).toBe("#/item");
  });

  test("isParent", () => {
    expect(isParent("#", "#/item")).toBe(true);
    expect(isParent("#/one", "#/two/item")).toBe(false);
    expect(isParent("#/container", "#/container/item")).toBe(true);

    expect(isParent("#/container", "#/containeritem")).toBe(false);
    expect(isParent("#/container", "#/containeri")).toBe(false);
  });

  test("directChildId", () => {
    expect(directChildId("#/container", "#/container/item/nested")).toBe("#/container/item");
    expect(directChildId("#/container", "#/container/item")).toBe("#/container/item");
    expect(directChildId("#/container", "#/another/item/nested")).toBeNull();
  });

  test("idsToRoot", () => {
    const callback = vi.fn();

    idsToRoot("#/something/a/test", callback);

    expect(callback).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenNthCalledWith(1, "#/something/a/test");
    expect(callback).toHaveBeenNthCalledWith(2, "#/something/a");
    expect(callback).toHaveBeenNthCalledWith(3, "#/something");
    expect(callback).toHaveBeenNthCalledWith(4, "#");
  });

  test("idsToRoot: stop on false", () => {
    const callback = vi.fn((id) => {
      if (id === "#/something") {
        return false;
      }
    });

    idsToRoot("#/something/a/test", callback);

    expect(callback).toHaveBeenCalledTimes(3);
  });

  test("convergingPaths", () => {
    const callback = vi.fn();

    convergingPaths(
      "#/shared/another-shared/item1",
      "#/shared/another-shared/container/item2",
      callback,
    );

    expect(callback).toHaveBeenCalledTimes(6);
    expect(callback).toHaveBeenCalledWith("#/shared/another-shared/container/item2");
    expect(callback).toHaveBeenCalledWith("#/shared/another-shared/container");
    expect(callback).toHaveBeenCalledWith("#/shared/another-shared/item1");
    expect(callback).toHaveBeenCalledWith("#/shared/another-shared");
    expect(callback).toHaveBeenCalledWith("#/shared");
    expect(callback).toHaveBeenCalledWith("#");
  });
}
