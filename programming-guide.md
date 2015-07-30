## Atlas programming guide

### Overview

Atlas is the frontend server for the walmart.com redesign. Architectural notes are [here](https://confluence.walmart.com/display/USGPUD/New+Site+Frontend+Architecture).

Atlas repo: [https://gecgithub01.walmart.com/GlobalProducts/atlas](https://gecgithub01.walmart.com/GlobalProducts/atlas)

#### Table of Contents

* [Core Technologies](#core-technologies)
* [Multiple Sub-projects](#multiple-sub-projects)
* [Project Layout](#project-layout)
* [Development Guide](#development-guide)
    * [Workflow](#backend-maven--java)
    * [Frontend JS / CSS](#frontend-js--css)
    * [Backend Maven / Java](#backend-maven--java)
* [General Conventions](#general-conventions)
* [Code Style Conventions](#code-style-conventions)

### Core Technologies

* Java server, Tomcat 7
* Lightweight use of Spring framework
* Handlebars for HTML templates
* jQuery
* Thorax for advanced JS
* Stylus for CSS
* Grunt (node) for compiling Stylus into CSS

### Multiple Sub-projects

Atlas is split up into several sub-projects. Each corresponds to one page on the site, or a related group of pages. Each sub-project is a Java WAR. It can be deployed independently of the other projects.  For example, the homepage is separate from checkout, and can be deployed on its own schedule, on different machines, etc.

Each project is a directory inside the Atlas repo, and has its own pom.xml file.

### Project Layout

An Atlas project has the following directory structure:

```
{appname}/pom.xml
{appname}/src/main/java/com/walmart/atlas/{appname}/pages
{appname}/src/main/java/com/walmart/atlas/{appname}/routes
{appname}/src/main/java/com/walmart/atlas/{appname}/services
{appname}/src/main/java/com/walmart/atlas/{appname}/views
{appname}/src/main/webapp/resources/data/{appname}
{appname}/src/main/webapp/resources/img
{appname}/src/main/webapp/gen/css/{appname}
{appname}/src/main/webapp/{appname}/views/{Appname}/js
{appname}/src/main/webapp/WEB-INF
{appname}/src/main/webapp/WEB-INF/spring
{appname}/src/test/resources
{appname}/src/test/webapp/resources/{appname}/views/{Appname}/js
```

#### Directories

`{appname}/src/main/java/com/walmart/atlas/{appname}/pages`

> This contains the Java code, handlebars template, and any stylus, for each
> page within this project.  It also includes a `package.json` file, which holds
> metadata for the page. At this point, this should **not** include JavaScript
> for pages.

`{appname}/src/main/java/com/walmart/atlas/{appname}/routes`

> This contains a `Routes.java` file, which maps URLs to pages (as defined
> above).

`{appname}/src/main/java/com/walmart/atlas/{appname}/services`

> This contains Java code for connecting to backend services.  Note that the
> Atlas renderer will automatically parallelize multiple calls to backend
> services.

`{appname}/src/main/java/com/walmart/atlas/{appname}/views`

> A typical page is made up of a number of smaller UI components.  These are
> held in the `views` directory.  Each view directory contains a `package.json`
> file, similar to that of the enclosing page, as well as one of more handlebars
> templates, and stylus files.

#### Atlas Project JavaScript

JavaScript code is not placed under the
`{appname}/src/main/java/com/walmart/atlas/{appname}` paths, instead going into
webapp paths for the *views*.

JavaScript (code and tests) should be placed in webapp views as follows:

```
{appname}/src/main/webapp/{appname}/views/{Appname}/js
{appname}/src/test/webapp/{appname}/views/{Appname}/js
```

Examples:

```
product/src/main/webapp/product/views/Product/js/item-header.js
product/src/test/webapp/product/views/Product/js/item-header.spec.js
```


### Workflow

**All** Developers in Atlas (projects or SPAs) that modify any
JavaScript, **client**-side Handlebars, or Stylus files, must follow the
following workflow:

* After development, before checking in code, re-generate all JS/CSS:

```
$ frontend/GO
```

* Before creating a **pull request**, run the following safety checks:

```
$ ./VERIFY_CODEBASE
```

* After a pull request is approved, **before merging to master**, make sure
  to update to current master, resolve conflicts, regenerate, check one last
  time, and **only then** merge if there are no other errors.

```
# Regenerate the world.
$ frontend/GO

# Check for any file changes that need to be commited.

# After all commits, run the final check.
$ ./VERIFY_CODEBASE

# If VERIFY_CODEBASE succeeds, you are clear to merge your branch to master!
```

**Note - ulimit**: If you get an error on a Mac in PhantomJS complaining about something like:
`Unable to open file '/var/folders/v_/jyfsrsws0kg7q5ywnyt8wyxdd_7sv7/T/1389125451203.7356'`
then set a higher file limit with something like: `$ ulimit -n 10000` in the terminal
in which you are running the script.


### Frontend JS / CSS

The frontend JS/CSS code for SPAs (cart / checkout) and Atlas Projects
(product, etc.) is generally controlled by Grunt tasks for all workflows
(code generation, testing, etc.). See the following docs to get started:

* [Development Guide](./frontend/development.md): Substantive guide to writing
  JS against Atlas projects. Make sure to read this before you start hacking
  on JS.

* [Injected JS/CSS](./frontend/injection.md): See this if you are in any
  way integrating JS/CSS code that is not a part of the Atlas repository
  (regardless of whether or not Walmart or a third party wrote it).

* [Test Guide](./frontend/test.md): Tasks for writing and running
  frontend unit tests (the dev-specific tests outside of QA's scope). This
  applies to both the Cart/Checkout SPAs and all Atlas project JS.

* [Build Guide](./frontend/build.md): Tasks for building and
  checking all JS/CSS throughout the entire repo.

* [SPA Guide](./frontend/spa-dev.md): Tasks for developing the
  Cart / Checkout SPAs.


### Backend Java

See the following docs to get started:

* [Development Guide](./backend/development.md): Substantive guide to writing
  Java against Atlas projects. Make sure to read this before you start hacking
  on Java.

* [Test Guide](./backend/test.md): Tasks for writing and running
  backend unit tests (the dev-specific tests outside of QA's scope).

* [Build Guide](./backend/build.md): Tasks for building and
  checking all Java throughout the entire repo.


### General Conventions

* [Debugging Guide](./debugging-guide.md): Describes debugging practices,
and how to write easy to debug code.

### Code Style Conventions

A consistent code style is enforced across the whole Atlas project. Please read
 the relevant guides to familiarize yourself with them:

* [JavaScript](code-style/javascript.md)
* [CSS (Stylus)](code-style/css.md)
* [Java](code-style/java.md)
