import {
  parseAtcoderStatement,
  parseCodeforcesStatement,
} from './statement-parser';

// Small pages written for these tests, with the markup the judges use.
const codeforcesPage = `<html><body><div class="problemindexholder">
<div class="problem-statement"><div class="header"><div class="title">D. Sum It</div>
<div class="time-limit"><div class="property-title">time limit per test</div>2 seconds</div>
<div class="memory-limit"><div class="property-title">memory limit per test</div>256 megabytes</div></div>
<div><p>Given $$$n \\le 10^5$$$ numbers, print their <span class="tex-font-style-bf">sum</span>.</p>
<p onclick="steal()">See <a href="/blog/entry/1" onclick="x()">the blog</a> and <a href="javascript:alert(1)">this</a>.</p>
<script>alert('x')</script><img src="//espresso.codeforces.com/a.png" onerror="alert(1)" style="width:9px">
<iframe src="https://evil.example"></iframe></div>
<div class="input-specification"><div class="section-title">Input</div><p>One line.</p></div>
<div class="output-specification"><div class="section-title">Output</div><p>One number.</p></div>
<div class="sample-tests"><div class="section-title">Examples</div>
<div class="sample-test">
<div class="input"><div class="title">Input</div><pre>
<div class="test-example-line test-example-line-even">2</div><div class="test-example-line test-example-line-odd">1 2</div></pre></div>
<div class="output"><div class="title">Output</div><pre>3
</pre></div>
<div class="input"><div class="title">Input</div><pre>1<br>5<br></pre></div>
<div class="output"><div class="title">Output</div><pre>5</pre></div>
</div></div>
<div class="note"><div class="section-title">Note</div><p>Easy.</p></div>
</div></div></body></html>`;

const atcoderPage = `<html><body><div class="col-sm-12">
<span class="h2">E - Dice Product 3 <a class="btn" href="/x">Editorial</a></span><hr/>
<p>Time Limit: 2 sec / Memory Limit: 1024 MiB</p>
<div id="task-statement"><span class="lang">
<span class="lang-ja"><div class="part"><section><h3>問題文</h3><p>日本語</p></section></div></span>
<span class="lang-en"><p>Score : <var>500</var> points</p>
<div class="part"><section><h3>Problem Statement</h3><p>Find the probability modulo <var>998244353</var>.</p></section></div>
<div class="part"><section><h3>Sample Input 1</h3><pre>6
</pre></section></div>
<div class="part"><section><h3>Sample Output 1</h3><pre>239578645
</pre><p>One of the possible procedures.</p></section></div>
<div class="part"><section><h3>Sample Input 2</h3><pre>7
</pre></section></div>
<div class="part"><section><h3>Sample Output 2</h3><pre>0
</pre></section></div>
</span></span></div></div></body></html>`;

const htmlOf = (
  parsed: { sections: { kind: string; html: string }[] },
  kind: string,
) => parsed.sections.find((s) => s.kind === kind)?.html ?? '';

describe('parseCodeforcesStatement', () => {
  const parsed = parseCodeforcesStatement(codeforcesPage)!;

  it('reads the name, the limits and every sample', () => {
    expect(parsed).toMatchObject({
      title: 'Sum It',
      timeLimit: '2 seconds',
      memoryLimit: '256 megabytes',
    });
    expect(parsed.samples).toEqual([
      { input: '2\n1 2\n', output: '3\n' },
      { input: '1\n5\n', output: '5\n' },
    ]);
  });

  it('splits the statement into its parts and keeps the formulas', () => {
    expect(parsed.sections.map((s) => s.kind)).toEqual([
      'story',
      'input',
      'output',
      'note',
    ]);
    expect(htmlOf(parsed, 'story')).toContain(
      'Given $$$n \\le 10^5$$$ numbers',
    );
    expect(htmlOf(parsed, 'story')).toContain('<b>sum</b>');
    expect(htmlOf(parsed, 'input')).toBe('<p>One line.</p>');
    expect(htmlOf(parsed, 'note')).toBe('<p>Easy.</p>');
  });

  it('gives a part it has no name for its own title', () => {
    const interactive = codeforcesPage.replace(
      '<div class="note">',
      '<div><div class="section-title">Interaction</div><p>Ask.</p></div><div class="note">',
    );
    expect(parseCodeforcesStatement(interactive)!.sections).toContainEqual({
      kind: 'other',
      title: 'Interaction',
      html: '<p>Ask.</p>',
    });
  });

  it('lets nothing through that could run or frame something', () => {
    const story = htmlOf(parsed, 'story');
    for (const bad of [
      '<script',
      'alert',
      'onclick',
      'onerror',
      'javascript:',
      '<iframe',
      'style=',
    ])
      expect(story).not.toContain(bad);
    expect(story).toContain(
      '<a href="https://codeforces.com/blog/entry/1" target="_blank" rel="noreferrer noopener">the blog</a>',
    );
    expect(story).toContain(
      '<img src="https://espresso.codeforces.com/a.png" />',
    );
  });

  it('is null for a page without a statement', () => {
    expect(
      parseCodeforcesStatement('<html><body>Just a moment…</body></html>'),
    ).toBeNull();
  });
});

describe('parseAtcoderStatement', () => {
  const parsed = parseAtcoderStatement(atcoderPage)!;

  it('reads the English statement, the limits and the samples with their explanations', () => {
    expect(parsed).toMatchObject({
      title: 'Dice Product 3',
      timeLimit: '2 sec',
      memoryLimit: '1024 MiB',
    });
    expect(parsed.samples).toEqual([
      {
        input: '6\n',
        output: '239578645\n',
        note: '<p>One of the possible procedures.</p>',
      },
      { input: '7\n', output: '0\n' },
    ]);
    expect(parsed.sections).toEqual([
      {
        kind: 'story',
        html: '<p>Find the probability modulo <var>998244353</var>.</p>',
      },
    ]);
  });

  it('falls back to the only language a page has', () => {
    const japaneseOnly = atcoderPage.replace(
      /<span class="lang-en">[\s\S]*<\/span><\/span><\/div>/,
      '</span></div>',
    );
    expect(parseAtcoderStatement(japaneseOnly)!.sections[0].html).toContain(
      '日本語',
    );
  });
});
