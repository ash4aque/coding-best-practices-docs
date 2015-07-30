# Global Products Atlas Project (Gradle Guide)

## Introduction

[Gradle](http://www.gradle.org/) is a next generation build tool. Gradle is *essentially* a DSL for writing build scripts using [Groovy](http://groovy.codehaus.org/).

## Gradle CLI
The command to invoke Gradle within Atlas is `./gradlew <opts> <list of tasks>`. One option we recommend is the `-q` which is "quiet mode". This is usually followed by a list of tasks that you wish Gradle to perform. Here are a few examples -

- `atlas$ ./gradlew –q clean` [quiet, clean. Cleans all artifacts produced by previous runs of `./gradlew`]
- `atlas$ ./gradlew –q clean test war` [quiet, clean, run tests and build war]

**Use the `clean` option judiciously** - Gradle is intelligent about what tasks can be skipped to promote more efficient builds. Use `clean` only if you feel that your project's build state has gone awry.

Other options available are `-d` [debug] and `-s` [stacktrace]. You can use them like so

- `atlas$ ./gradlew -d clean test` [**combined** run of `clean` and `test` with noisy debug mode enabled]

##Quick Command Reference
This is a list of tasks that you will find useful when interacting with Gradle 

- **Generic/Java specific tasks**
	- `./gradlew -q tasks`  [Lists all available tasks]
	- `./gradlew -q clean` [Cleans all artifacts produced by previous runs of `./gradlew`]
	- `./gradlew -q test` [Run Tests]
	- `./gradlew -q compileJava` [Compile Java source files]

- **Grunt/Bash wrappers**
	- `./gradlew -q go` [Invokes `frontend/GO` under the covers]

- **Deploy/Publish tasks**
	- `./gradlew -q war` [prepare war for all "sub-project"s]
	- `./gradlew -q deployWar` [Generates and copies each "sub-project" wars to the Tomcat web application deploy directory]
	- `./gradlew -q live` [This is similar to `grunt live` - it watches your Java source and pushes recently edited files to the `webapps` directory of your Tomcat instance - See [here](#live) for more information]
	- `./gradlew -q live -PonlyWatch=account,cart,checkout` [This task is similar to live but watches only checkout module for changes. Note that atlas-core,module-engine and static are always watched on all 'live' tasks, delimit modules with commas]
	- `./gradlew -q publish` [Publishes **all** artifacts to nexus - Mainly for CI purposes]

**You can invoke Gradle with only the letters corresponding to the camel-cased letters of task names.** For e.g. `./gradlew -q cJ` is equivalent `./gradlew compileJava`. We often find `./gradlew -q dW` to be useful which runs `deployWar`.

At the "sub-project" level you can query and run tasks just like you are the "root" level. For example, within the "project" track

- `$ ./gradlew -q product:tasks` [List available tasks for product "sub-project"]
- `$ ./gradlew -q product:war` [Create the 'product' war. War files are placed at build/libs/*.war]
- `$ ./gradlew -q product:deployWar` [Deploy the 'product' war to local Tomcat instance]
- `$ ./gradlew -q product:dW` [Similar to the previous command, except using "shortcuts"]

## Motivation

- Build speed

	Both Maven and Gradle leverage the notion of "incremental builds". That is, only portions of the build that need to run are run by the tool. Unfortunately both tools need to wake up the JVM in order to get work done.

	Gradle realizes this, and offers us something called a `gradle daemon`. This "daemon" essentially runs a "warmed up" Gradle process in the background that attempts to reduce the Gradle startup time. This means snappier builds and improved developer experience.

	Furthemore the Gradle team is constantly looking for ways to make Gradle faster (and more intelligent) and the daemon is a critical component in this area.

	You can read more about the daemon [here](http://www.gradle.org/docs/current/userguide/gradle_daemon.html) but perhaps it might suffice to say that we are leveraging the daemon for Atlas builds, and any improvements the Gradle team makes to it will (hopefully) be something we can take advantage of

- End user experience

	Gradle's command line is (arguably) easier to grasp than Maven's. This is partly due to the Gradle team's efforts, and partly due to the imperative nature (see "Declarative nature vs. imperative") of Gradle. Writing "wrapper" tasks with sensible (and overrideable) defaults is easy in Gradle. Other features include aliasing tasks, explicitly or implicitly sequencing tasks and writing highly custom tasks (which tend to be Groovy code).

- Build developer experience

	We mentioned that Gradle is *essentially* a DSL for writing your build in Groovy. This makes Gradle files easy to parse since they are typically more succinct that POM files which makes them easier to write and maintain (See "Declarative nature vs. imperative")

- Declarative nature vs. imperative

	Maven is inherently declarative while Gradle is imperative. To the extent that end users are concerned this should be (and is) transparent (in both Maven and Gradle). However when working on the build itself it is often easier to work with the imperative nature of Gradle when it comes to adding functionality that the original authors did not originally dream up.

	An example of this would be invoking a shell script or the `main` method of a Java class from the build. In Maven this requires us to leverage a plugin. We then have to "configure" the plugin to make this happen. Within Gradle we have the full power of Groovy, which allows us to do something as simple as `"ls -al".execute().text` and we are there.

	This discussion is not meant to take away the power of plugins, but rather demonstrate that if a project (and Atlas is such a project) requires us to do something outside of the original intention of the tool, it is (arguably) easier in Gradle than Maven.

## Getting Started

There are **no** installation steps required. We are leveraging the [Gradle Wrapper](http://www.gradle.org/docs/current/userguide/gradle_wrapper.html), which means that the first invocation of Gradle on your machine will first check to see if you have the right version of Gradle installed. If not, Gradle will automatically download and install the right version of Gradle for you.

Furthermore, the Gradle wrapper files are checked into source control which guarantees that all of us are using the *exact* same version and distribution of Gradle.


### First time

`cd` into the directory where you have the `atlas` source code checked out, and simply run `./gradlew`. The wrapper will first inspect your system to see if Gradle is installed, and if not, download and install it. The following listing shows an edited console output of what you might see

```
$ ./gradlew
Downloading http://<some-url>/gradle-1.11-bin.zip
......................
Unzipping ~/.gradle/wrapper/dists/gradle-1.11-bin/4h5v8877arc3jhuqbm3osbr7o7/gradle-1.11-bin.zip to ~/atlas/local-gradle/gradle-1.11-bin/4h5v8877arc3jhuqbm3osbr7o7
Set executable permissions for: ~/atlas/local-gradle/gradle-1.11-bin/4h5v8877arc3jhuqbm3osbr7o7/gradle-1.11/bin/gradle
Parallel execution with configuration on demand is an incubating feature.
:buildSrc:compileJava UP-TO-DATE
:buildSrc:compileGroovy UP-TO-DATE
:buildSrc:processResources UP-TO-DATE
:buildSrc:classes UP-TO-DATE
:buildSrc:jar UP-TO-DATE
:buildSrc:assemble UP-TO-DATE
:buildSrc:compileTestJava UP-TO-DATE
:buildSrc:compileTestGroovy UP-TO-DATE
:buildSrc:processTestResources UP-TO-DATE
:buildSrc:testClasses UP-TO-DATE
:buildSrc:test UP-TO-DATE
:buildSrc:check UP-TO-DATE
:buildSrc:build UP-TO-DATE
:atlas is getting tests from [task ':test']
:help

Welcome to Gradle 1.11.

To run a build, run gradlew <task> ...

To see a list of available tasks, run gradlew tasks

To see a list of command-line options, run gradlew --help

BUILD SUCCESSFUL

Total time: 1 mins 39.118 secs
```

If you were to look under `atlas/local-gradle/` directory you would find the the `bin` directory of the local Gradle install

**WARNING:** The `local-build` directory is one of Git's `ignored` directories. This means that if you were ever to run a `git clean -xdf` you will lose this directory. Needless to say, the next time you are to invoke a `gradlew` command Gradle will be forced to download the `bin` directory all over again so outside of having to wait a bit - no harm done.

## Developer usage

Using Gradle is not that much different from using Maven, except **all** commands start with `./gradlew` instead of `mvn`. There `build.gradle` file located at the root level of `atlas`, and "track" specific `.gradle` files located under each `sub-project` (for e.g. `account/account.gradle`). These would be the definitive places to go looking to see what our Gradle files are capable of.

**Note:** Some of you might already have Gradle installed, and may be tempted to run `gradle <task>` - We emphasize that you use `./gradlew` instead of `gradle` to stay consistent with everyone else.


### A minor suggestion

We also suggest running `./gradlew` with the `-q` which implies "quiet" mode. This reduces the already succinct Gradle command line output to be even more terse.

**Note:** This can be sometimes a tad disconcerting. For example, running `./gradlew -q test` will run all the tests and quietly shut down if all the tests passed. Gradle feels that if all the tests passed there is nothing to report to the user! Worry not though - if Gradle feels there is something you must *absolutely* know if will notify you on the command line. In this case, no news is good news :)

### Listing all tasks

Gradle commands are generally very intuitive. For example, `./gradlew -q war` (at the root level) will recursively build the `war` artifacts for each of the "tracks". If you were within a specific track, then `./gradlew -q war` will *only* build the war artifact for that track.

If you are not sure of what command to run you can ask Gradle what it is capable of. Running a `./gradlew -q tasks` will list all the tasks available for you to run. Keep an eye out for the following groups because these will be the ones you will be using the most

- `Build tasks`
- `Deployment tasks`

To see what a particular track might have to offer (this happens very infrequently) you can simply tack on the name of the sub-project when asking Gradle questions. For example, `./gradlew -q :account:tasks` will only report the tasks specific to the "account" track

#### <a id="live">`gradle live` \[Incubating Feature<sup><a href="#incubating">1</a></sup>\]</a>

In an effort to improve developer experience with Java source code, we have introduced a task called `live`

As you might have inferred, this attempts to be `grunt live`'s cousin for Java source code. This task is a blocking task on the CLI. It monitors all the relevant Java source code (and associated files such as `web.xml`) and attempts to hot-deploy the code to Tomcat's `webapps` directory on a `save`.

To use `gradle live` follow these steps [**NOTE:** The assumption here is that you have Tomcat installed via `homebrew` as highlighted in the Atlas [README](https://gecgithub01.walmart.com/GlobalProducts/atlas/blob/master/README.md#getting-started) -  If your Tomcat is in a non-standard location then `TOMCAT_WEBAPPS_DIR` **needs** to be set]

- Clear out the `tomcat/libexec/webapps` directory of any Maven generated artifacts
- Start tomcat with `catalina run`
- (In one terminal) - `cd frontend/`, then `grunt live` \[This step is optional\]
- (In another terminal) - `./gradlew -q deployWar`. Once that is done, `./gradlew -q live`

Now editing a Java file in the source code *should* be automatically compiled, copied over to the correct `webapps` directory and the context of that "track" should be restarted.

## Conclusion

This is a beta document to be revamped as we get more and more input. Any and all testing of these scripts is appreciated. Here is the core team - reach out with questions or suggestions

- Raju <RGandhi@walmart.com> or on Slack as @[raju](https://walmartlabs.slack.com/team/raju) - Awesome Documentation Writer
- Joseph <JNusairat@walmart.com> or on Slack as @[jnusairat](https://walmartlabs.slack.com/team/jnusairat) - Gradle Guru
- Ranjith <rviswanathan@walmart.com> or on Slack as @[ranjith.v](https://walmartlabs.slack.com/team/ranjith.v) - On site (San Bruno) Gradle Lead
- Tim O'Brien <TObrien@walmart.com> or on Slack as @[tim.obrien](https://walmartlabs.slack.com/team/tim.obrien) - All Maven (Or "All things Maven" depending on your perspective)

## Footnotes

<a id="incubating"></a>[1] - Blatantly stolen from [Gradle](http://www.gradle.org/docs/current/userguide/feature_lifecycle.html#sec:incubating_state)
