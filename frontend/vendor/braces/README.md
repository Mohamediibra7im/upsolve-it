Local security backport of micromatch/braces 3.0.3 (MIT).

Source: https://github.com/micromatch/braces/tree/3.0.3
Advisory: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm

Changes: cap brace and parenthesis nesting at 100 during parsing; validate caller-supplied AST depth and cycles before recursive compile, expansion, and stringify operations. Lower maxDepth values are supported. Normal expansion and stringify behavior is preserved.

The scoped package name identifies this maintained local derivative; it does not claim an upstream patched release. Remove this override when a reviewed upstream replacement is available. Regression tests run through npm run test:dependencies.
