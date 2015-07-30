## Atlas CSS Code Style

We maintain a living CSS style guide and pattern library based on [KSS](http://warpspire.com/kss/).
To update the style guide, run `grunt style-guide-live` in your terminal. This command will start a
connect server running the style guide. Open http://localhost:9000 in your browser to see the guide.

Guide sections are generated from two sources:

1. KSS comment blocks in stylesheets located in `frontend/styles`.
2. Markdown documents in `docs/style-guide/prose`.

Guide markup examples are generated from HTML files in `docs/style-guide/markup-samples`.

To access the guide, you can open `docs/style-guide/index.html` in a web browser or start a local
server in that directory (with Grunt or otherwise).

### Table of Contents

* [Whitespace](#whitespace)
* [Comments](#comments)
* [Stylus](#stylus)
* [Naming Conventions and Structure](#naming-conventions-and-structure)
* [Organization](#organization)
* [Declaration Block Order](#declaration-block-order)
* [Declaration Order](#declaration-order)
* [Example](#example)

### Whitespace

* 2 character spaced indents. (No tabs.)
* No trailing whitespace.
* Include one blank line between each ruleset.
* Include one space after `:` and before `{`.
* Include line breaks around rulesets.
* Write each declaration on its own line.

### Comments

* Use `//` for comment blocks.
* Place comment blocks on their own line above rulesets.
* If a comment relates only to a single property, you can include a brief comment block on the
  property line.
* Comment lines should be no more than 80 columns long.
* Divide stylesheets into sections using comment blocks formatted like this:

```
/* ==========================================================================
   Fonts
   ========================================================================== */
```

### Stylus

* Stylus is white-space sensitive and has very flexible rules about punctuation. We do not. Include
  all normal CSS punctuation, including curly braces, colons, semicolons, and commas.
* Namespace-prefixed class identifiers are __strongly__ preferred over nested rules.
* Don't nest rules more than two levels deep unless you have a good reason.
* Include `@extend` statements at the top of rulesets, followed by mixins.

### Naming Conventions and Structure

CSS modules should be as reusable as possible. Modules should have a descriptive high-level name
that will act as a prefix for modifier classes and child classes. For example, the class `.btn`
works in conjunction with the modifier class `.btn-primary`, and the class `.media` can contain the
child classes `.media-object` and `.media-body`.

In order to promote style re-use, HTML IDs are never used for styling elements. Using an ID instead
of a class means making an unneccesary assumption that a given element will only exist a single time
on a given page.

### Organization

CSS modules should be grouped into related Stylus files that are concatenated together during
builds. All global variables should be placesd in `variables.styl`, all global mixins should be
placed in `mixins.styl`. Base element styles (without classes) should be defined in `main.styl`.

### Declaration Block Order

Declaration blocks within Stylus modules should be grouped alphabetically at the highest level.
Modifier classes should be listed directly after the declaration that they apply to, followed by
child classes.

```
.adder {}

.module {}

.module-primary {}

.module-header {}
```

### Declaration Order

Similar properties should be grouped together in the following order:

1. Positioning (including z-index)
2. Display and Box-Model (including borders)
3. Other (alphabetically)

Properties within these groups should follow the order of the following example. Note that borders
go last in the 'Display and Box-Model' group, that the 'Other' group is alphabetical and that any
directional properties should be listed in a clockwise order starting from the top or top left.

Include a line break between each property group for readability.

### Example

```
// An example ruleset for the style guide.
.module {
  mixin();

  content: "\0000"
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  float: none;
  display: block;
  overflow: hidden;
  width: 40px;
  height: 40px;
  margin: 5px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;

  background: #eee;
  color: #333;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 0 #fff;

  > li {
    margin-top: 0;
    margin-bottom: 0;
  }
}
```
