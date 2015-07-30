## Maven / Java Build Guide

The build steps and dependency handling for all Java code in Atlas is handled
by Apache Maven 3.

All of the tracks are assigned an individual project (homepage, search, checkout, ...)
which all follow the Maven convention:

```
 atlas-root
      |
      |--- homepage
      |       |
      |       |--- src      Contains all source files
      |       |--- target   Generated files during build. The `clean` phase removes this directory.
      |       |--- pom.xml  Maven project definition file
      |
      |--- checkout
      |       |
      |      ...
     ...
      |--- pom.xml  Parent project definition file
```

The root (parent) project is not a real project with sources, but is just an aggregation
of all the children describing dependencies and build steps which are common
to all tracks. Running Maven commands for the parent will effectively run the command
for all the children, nothing more.
The projects are described by their `pom.xml` *(Project Object Model)*
files. This includes the dependencies and build (compilation/testing/packaging)
configuration.

To execute any Maven goal, you can use the following commands:

```
 cd <atlas|homepage|checkout|...>  Cd into any project (or atlas-root to run goal for all projects)
                      mvn <phase>  Run goals assigned to <phase> using `./pom.xml` (in current directory)

                                 or

  mvn -f homepage/pom.xml <phase>  Alternatively specify pom file as argument (without cd-ing there)
```

As you can see, you can execute maven goals either in the parent (in which case
it will be executed for all children), or you can execute it selectively for individual
tracks.

**Tips:** Additional Maven parameters include:
* `-U` Force check for new versions of dependencies from Nexus (otherwise they are not
  re-checked for 24 hours since last check).
* `-T 1C` Parallel execution (1 thread per CPU core). Useful when executing Maven
  in the root.


##### Build entire project from scratch from command-line

`mvn clean install tomcat7:deploy`

##### Build a sub-project after editing Java code only in sub-project directory

E.g., for product/:

`mvn -f product/pom.xml tomcat7:deploy`

##### Build a sub-project after editing java code in atlas-core

E.g., to rebuild product/ page:

`mvn -f atlas-core/pom.xml install -f product/pom.xml tomcat7:deploy`

This rebuilds and installs the **atlas-core WAR overlay**.  This is a special WAR in the codebase which 
gets merged into each sub-project WAR.  The install command copies it to your local Maven repository (~/.m2/)
from where it is merged in on subsequent builds and build steps.


### Maven Phases

The most commonly used lifecycle phases and their exact behavior (full details
[here](http://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)):

* Clean Lifecycle
    * `mvn clean`: Deletes the `target` directory.

* Default Lifecycle
    * `mvn compile`: Compile all (main+test) Java sources from `src` into `target`.
      Fails if any Java file is unable to compile.
    * `mvn test`: Runs the unit tests described
      in `src/test/resources/testng.xml`. Fails if any one of the unit tests fails.
    * `mvn package`: Creates an artifact (in our
      case a *war* file) in `target/<project name>.war`. This file is a *zip* archive
      containing compiled classes and other resources.
    * `mvn install`: Copies the packaged *war* file into your local Maven repository:
      `~/.m2/repository/`.

**Important:** The phases inside a lifecycle are dependent on each other. For example:
`mvn install` will in fact execute **all** prior phases of the default lifecycle as well:
*compile, test, package*.


### Dependency Management

#### Nexus

Sonatype Nexus is a repository management software, which is acting as a secure
proxy to the public Maven repository for third party dependencies, as well as
serving (and providing storage for) Walmart repository.

To configure the Walmart GEC Nexus repository for your Maven installation,
use the following command:

```
curl http://htmllab-linux.corp.walmart.com/atlas/settings.xml > ~/.m2/settings.xml
```

When you are compiling your code, maven will download all dependencies from the
Walmart Nexus. When our Jenkins job builds Atlas, it will upload the latest
artifacts to Nexus, which are in turn are made available on Nexus (used for
example by the OneOps deployment).

```
                             Public maven repositories
                             [http://mvnrepository.com]
                                         |
                                         | (Third party deps)
                                         v
                                   Walmart Nexus
                 [http://gec-maven-nexus.walmart.com/nexus/index.html]
                  |                     ^                           |
                  | (All deps)          | (Atlas artifacts)         |  (Atlas artifacts)
                  v                     |                           v
              Developers             Jenkins                 OneOps Deployment
                       
```


