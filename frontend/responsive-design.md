## Responsive and Mobile CSS in Atlas

This guide is a set of global guidelines and best practices for responsive and
mobile CSS in Atlas.

### Table of Contents

* [Layout](#layout)
    * [Basics](#basics)
    * [Grid](#grid)
    * [Layout Abstractions](#layout-abstractions)
* [Utilities](#utilities)
    * [Pull](#pull)
    * [Hide Content](#hide-content)
    * [Display](#display)
* [Media Queries](#media-queries)
* [Conditional Styles](#conditional-styles)
* [Variables](#variables)
    * [Breakpoints](#breakpoints)
* [Mixins](#mixins)
    * [Set Font Size](#set-font-size)
    * [Remify](#remify)
    * [Emify](#emify)

### Layout

#### Basics

As a general rule, avoid fixed pixel widths whenever possible for page and
component layout. Components should be flexible, adapting to the width of the
screen. Percentage-based layouts (built with the grid system, generally) are
preferable to fixed pixel widths.

#### Grid

We use a responsive grid system tuned to our major breakpoints for page layout.
To use, add a `.grid` element to the page with `.[size-prefix]-col[col-width]`
elements as children.

The grid is 12 columns wide, allows multiple rows without creating "row"
container elements, and includes classes to offset columns, pushing them to the
right.

To start a grid, use un-prefixed `.col[col-width]` elements for your columns.
The width declared here will apply for all screen sizes. From there, add
additional classes to target progressively larger screens. Adding
`.m-col[col-width]` will apply the new column width to any devices *larger* than
the `$screen-m` breakpoint.

If no default `.col[col-width]` class is applied, the column unit will take up
the full width of its container (equivalent to `.col12`) until any breakpoint
column classes are applied.

Thorough Example:

```
<div class="grid">
  <div class="col6 m-col3 l-col4 xl-col2"></div>
  <div class="col6 m-col3 l-col4 xl-col2"></div>
  <div class="col12 m-col6 l-col4 xl-col4 xl-offset4"></div>
</div>
```

This structure of this grid shifts dramatically between breakpoints.

On screens more narrow than `$screen-m` (our base size), it renders two columns
that are half the width of the page (`.col6`) and one full width column below it
(`col12`).

After the first breakpoint, it renders two columns that are one fourth as wide
as the page (`.m-col3`) with a third next to them that is half the width
(`.m-col6`).

After the second breakpoint, it renders three columns that are one third of the
screen width (`.l-col4`).

After the third breakpoint, it renders two columns that are one sixth of the
screen width (`.xl-col2`) and a third that is one third (`.xl-col4`) that is
pushed three columns to the right, leaving a 3 column blank space between it and
the other columns (`.xl-offset4`).

This example is thorough but contrived. More realistic usage might look
something like this:

```
<div class="grid">
  <div class="col6 l-col3"></div>
  <div class="col6 l-col3"></div>
  <div class="col12 l-col6"></div>
</div>
```

For more information and examples, see the [Style
Guide](http://walmartlabs.github.io/web-style-guide/#2-grid).

#### Layout Abstractions

In some situations, powerful layout abstractions like `.arrange` and `.stack`
can be better tools than the grid system, particularly for intra-component (as
opposed to page-wide) layout. The `.arrange` component uses `display:
table-cell` to build robust, flexible layouts. Some use cases include:

- Laying out several components in a row that should take up their natural width
  (buttons, or icons) next to another that should fill the remaining space (form
  inputs).
- Creating a navigation bar in which every option should take up an equal width,
  no matter how many items are added.
- As a robust replacement for the media object, allowing you to pin an image to
  the right of left of a body of text.

The `.stack` component acts as a vertical version of `.arrange`, allowing you to
lay out a component with an element pinned to the bottom of it

These components are both available for all screen sizes at present. If there is
a need, they could be easily converted to media-query specific versions.

### Utilities

For responsive and small screen designs, favor media-query specific utility
classes. These utilities are applied at different screen sizes and allow you to
easily hide, display, or move content. These classes apply to all screen sizes
by default. Media-query specific versions use standardized suffixes to apply to
different screen sizes.

Most of these utilities are also available as mixins. As a general rule, prefer
explicit utility classes to mixins whenever possible. Mixins result in more
generated code than utilities, and are more difficult to debug because the
source of styles in a running web page is not as immediately apparent.

For more information on all of the utilities available (including non-responsive
utilities), see the [Style
Guide](http://walmartlabs.github.io/web-style-guide/#16-utilities).

#### Pull

`.pull-[direction]-[size]` applies `float` to elements with the given direction
for the given screen size.

[Style Guide](http://walmartlabs.github.io/web-style-guide/#16.2-pull)

Examples:

- `.pull-right` (Applies `float: right` to all screen sizes)
- `.pull-left-m` (Applies `float: left` to screens wider than `$screen-m`)
- `.pull-right-l` (Applies `float: right` to screens wider than `$screen-l`)
- `.pull-none-xl` (Applies `float: none` to screens wider than `$screen-xl`)

#### Hide Content

`.hide-content-[size]` applies `display: none !important` to elements for the
given screen size.

[Style Guide](http://walmartlabs.github.io/web-style-guide/#16.6-hide-content)

Possible values:

- `.hide-content` (Applies `display: none` to all screen sizes)
- `.hide-content-m` (Applies `display: none` to screens wider than `$screen-m`)
- `.hide-content-l` (Applies `display: none` to screens wider than `$screen-l`)
- `.hide-content-xl` (Applies `display: none` to screens wider than
  `$screen-xl`)

#### Display

`.display-[value]-[size]` applies `display` for the given value at the given
screen size.

[Style Guide](http://walmartlabs.github.io/web-style-guide/#16.7-display)

Examples:

- `.display-block` (Applies `display: block` to all screen sizes)
- `.display-inline-m` (Applies `display: inline` to screens wider than
  `$screen-m`)
- `.display-inline-block-l` (Applies `display: inline-block` to screens wider
  than `$screen-l`)
- `.display-block-xl` (Applies `display: block` to screens wider than
  `$screen-xl`)

Note: To hide content, use `.hide-content`. There is no `.display-none` class.

### Media Queries

When writing responsive CSS, write styles targeting mobile devices with
`min-width` media queries adding additional styles for larger screens. This
approach tends to lead to less CSS that is easier to understand and debug than
the opposite. As a general rule, when developing for larger screens you tend to
add more than you take away.

Media queries should be nested within or included directly after the selector
that they refer to. Avoid grouping large amounts of CSS into monolithic media
queries at the end of files (or worse, in separate files altogether). Thanks to
`gzip`, code bloat from repeated media query declarations is minimal, and it
helps keep code clear and easy to read.

We have three major breakpoints, each of which has a variable assigned to it
(see [Breakpoints](#breakpoints)). Generally, media query styles should be kept
to these major breakpoints.

If there are exceptions, feel free to write small minor breakpoints to address
specific use cases. To write a minor breakpoint, use the [`emify()`](#emify)
mixin to convert the `px` value of your `min-width` or `max-width` to `em`.

Please document all minor media queries with comments explaining why they are
necessary.

Example:

```
.component {
  display: block;
  padding: 10px;

  background: orange;

  @media (min-width: $screen-m) {
    display: inline-block;
    border-radius: 4px;
  }
}
```

### Conditional Styles

For mobile applications, we are going to use Stylus conditional statements to
generate different built CSS for different environments. In the short term, we
will use conditional classes for this behavior while the build system is
finalized:

- `._isIos`
- `._isAndroid`
- `._isWeb`

These classes can be applied to the `html` element of a page to turn on styles
for that environment.

In CSS, any styles particular to an environment should be nested under the class
pertaining to it. Stylus's "Parent Reference" feature makes this easy.

Example:

```
.btn {
  padding: 1em;

  color: $blue;

  ._isIos & {
    background: none;
  }

  ._isAndroid & {
    border: 1px solid #bbb;
  }

  _.isWeb & {
    border-radius: 4px;
  }
}
```

### Variables

#### Breakpoints

We have three major breakpoint variables:

- `$screen-m` (544px)
- `$screen-l` (768px)
- `$screen-xl` (992px)

These breakpoints are primarily meant for use in `min-width` media queries. For
`max-width` media queries, use these alternate versions:

- `$screen-m-max` (543px)
- `$screen-l-max` (767px)
- `$screen-xl-max` (991px)

Each `max` variable is 1px more narrow than the normal version, preventing
overlap between `min-width` and `max-width` media queries.

For more information, see the [Style
Guide](http://walmartlabs.github.io/web-style-guide/#4.2-responsive-breakpoints).

### Mixins

#### Set Font Size

The `set-font-size($value)` mixin takes font sizes as `px` for convenience and
converts them to `rem` values, with the `px` value added as a fallback for old
browsers. All font sizing should use this mixin, unless there is a particular
use case in which an element should be sized with `em` values instead.

[Style Guide](http://walmartlabs.github.io/web-style-guide/#15.11-set-font-size)

#### Remify

The `remify($value)` mixin takes a `px` value and converts it to `rem`, for use
cases other than font sizing.

[Style Guide](http://walmartlabs.github.io/web-style-guide/#15.12-remify)

#### Emify

The `emify($value)` mixin takes a `px` value and converts it to `em`. `emify()`
should only be used when adding minor breakpoints, because `rem` values cannot
be used in breakpoints. In all other cases, use `remify()` instead.

[Style Guide](http://walmartlabs.github.io/web-style-guide/#15.13-emify)
