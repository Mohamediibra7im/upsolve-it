'use strict';

const MAX_DEPTH = 100;

const failure = (code, message) => {
  const error = new SyntaxError(message);
  error.code = code;
  return error;
};

const maxDepth = options => {
  const requested = options && options.maxDepth;
  if (requested === undefined) return MAX_DEPTH;
  if (typeof requested !== 'number' || !Number.isFinite(requested) || requested < 0) {
    throw new TypeError('maxDepth must be a finite non-negative number');
  }
  return Math.min(MAX_DEPTH, requested);
};

const assertDepth = (depth, options) => {
  if (depth > maxDepth(options)) {
    throw failure('BRACES_MAX_DEPTH', 'Pattern exceeds the maximum nesting depth');
  }
};

const assertAst = (ast, options) => {
  const maximum = maxDepth(options);
  const active = new WeakSet();
  const stack = [{ node: ast, depth: ast && ast.type === 'root' ? 0 : 1 }];
  while (stack.length) {
    const { node, depth, exit } = stack.pop();
    if (!node || typeof node !== 'object') continue;
    if (exit) {
      active.delete(node);
      continue;
    }
    if (depth > maximum) assertDepth(depth, options);
    if (active.has(node)) throw failure('BRACES_INVALID_AST', 'Cyclic AST nodes are not supported');
    const parents = new WeakSet();
    let parent = node;
    let parentDepth = 0;
    while (parent && typeof parent === 'object') {
      if (parents.has(parent)) throw failure('BRACES_INVALID_AST', 'Cyclic AST parent links are not supported');
      if (parentDepth++ > maximum + 1) assertDepth(parentDepth - 1, options);
      parents.add(parent);
      parent = parent.parent;
    }
    if (!Array.isArray(node.nodes)) continue;
    active.add(node);
    stack.push({ node, depth, exit: true });
    for (let i = node.nodes.length - 1; i >= 0; i--) {
      const child = node.nodes[i];
      stack.push({ node: child, depth: depth + (child && Array.isArray(child.nodes) ? 1 : 0) });
    }
  }
};

module.exports = { assertDepth, assertAst };
