const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createRequire } = require('node:module');
const braces = createRequire(require.resolve('micromatch'))('braces');

for (const method of ['parse', 'compile', 'expand', 'stringify']) {
  for (const [open, close] of [['{', '}'], ['(', ')']]) {
    test(`${method} rejects excessive ${open}${close} nesting with a bounded validation error`, () => {
      const pattern = open.repeat(4500) + 'a,b' + close.repeat(4500);
      assert.throws(() => braces[method](pattern), error => error.code === 'BRACES_MAX_DEPTH');
    });
  }
}

test('normal brace expansion and regex compilation retain their behavior', () => {
  assert.deepEqual(braces.expand('src/{app,lib}/{a,b}.ts'), ['src/app/a.ts', 'src/app/b.ts', 'src/lib/a.ts', 'src/lib/b.ts']);
  const matcher = new RegExp('^' + braces.compile('src/{app,lib}/*.ts').replace('*', '.*') + '$');
  assert.ok(matcher.test('src/app/page.ts'));
  assert.ok(matcher.test('src/lib/utils.ts'));
  assert.equal(matcher.test('src/vendor/page.ts'), false);
  assert.equal(braces.stringify('{1..8}', { escapeInvalid: true }), '{1..8}');
  assert.deepEqual(braces.expand('{1..3}'), ['1', '2', '3']);
});

test('quoted and escaped literal brackets are accepted', () => {
  const literal = '{'.repeat(200) + 'a' + '}'.repeat(200);
  assert.equal(braces.compile('"' + literal + '"'), literal);
  assert.equal(braces.stringify('[' + literal + ']'), '[' + literal + ']');
});

test('caller-supplied deep ASTs are checked before recursive processing', () => {
  for (const method of ['compile', 'expand', 'stringify']) {
    let node = { type: 'text', value: 'a' };
    for (let i = 0; i < 4500; i++) node = { type: 'paren', nodes: [node] };
    assert.throws(() => braces[method](node), error => error.code === 'BRACES_MAX_DEPTH');
  }
});

for (const method of ['parse', 'compile', 'expand', 'stringify']) {
  test(`${method} enforces depth boundaries and stricter limits`, () => {
    assert.doesNotThrow(() => braces[method]('('.repeat(100) + 'a' + ')'.repeat(100)));
    assert.throws(() => braces[method]('('.repeat(101) + 'a' + ')'.repeat(101)), error => error.code === 'BRACES_MAX_DEPTH');
    assert.throws(() => braces[method]('((a))', { maxDepth: 1.5 }), error => error.code === 'BRACES_MAX_DEPTH');
  });
}
for (const method of ['compile', 'expand', 'stringify']) {
  test(`${method} rejects cyclic AST nodes and parent links`, () => {
    const ast = { type: 'root', nodes: [] }; ast.nodes.push(ast);
    assert.throws(() => braces[method](ast), error => error.code === 'BRACES_INVALID_AST');
    const node = { type: 'text', value: 'a' }; node.parent = node;
    assert.throws(() => braces[method](node), error => error.code === 'BRACES_INVALID_AST');
  });
}
test('both build tool consumers resolve the patched implementation', () => {
  for (const consumer of ['chokidar', 'micromatch']) {
    const fromConsumer = createRequire(require.resolve(consumer));
    assert.equal(fromConsumer('braces/package.json').version, '3.0.3-patch.1');
    assert.throws(() => fromConsumer('braces').expand('('.repeat(4500)), error => error.code === 'BRACES_MAX_DEPTH');
  }
});
