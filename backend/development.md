## Java Development Guide

### Atlas Toolkit

The *Atlas Toolkit* is a small set of functions and parent classes that
make writing front-end web apps easier. Specifically, they make it
easier to call back-end services asynchronously. It includes the classes
`Route`, `Page`, `View`.

Extensive Confluence documentation is [here](https://confluence.walmart.com/display/USFEATLAS/Atlas+Toolkit).

### Code Quality

#### Sonar

SonarQube is a static code analysis tool. Every Jenkins build is generating
a new report, which can be browsed [here](http://sdc-d1-sonar-app1.qa.gecwalmart.com:9000/dashboard/index/66493).

Displayed metrics:
* **Code coverage:** During the execution of Java unit tests the executed lines
  for all source files are recorded and can be browsed for individual files.
  Both package and project level coverage (in percent of covered lines) is displayed
  as well.
* **Violations:** Violations are potentially problem causing constructs affecting
  performance, vulnerability or going against the convention. In the source code view,
  it is possible to click on a violation's name to see a short explanation giving more
  details about the violation. (It sometimes happens that a violation can be justified,
  in this case it can be marked as false positive and will not be shown in the future).
* **Code Duplication:** Duplicated code accross the project can be found using this feature.

#### Best practices

Most of these are actually reported by Sonar as violations:

* Make sure you know the difference between `.equals()` and `==`. Only use the second
  one when comparing primitive types (`int`, `boolean`, but not `Integer`, `Boolean`,
  `String`, etc).
* When comparing using `.equals()`, prefer a constant value as the first object. This
  way even if your other object is `null`, you will not run into `NullPointerException`.
  Example: `"Fixed value".equals(page.getParam("id"))`.
* String concatenation is much more performant when done using a `StringBuilder` than
  the `+` operator.

### Logging

**Note:** Soon the *LogMon* system will take over the place of the currently used *slf4j*
but until then use this convention.

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MyClass {
    private static final Logger LOGGER = LoggerFactory.getLogger(MyClass.class);

    public void myMethod() {
        // Use the debug/info/warn/error levels appropriately
        LOGGER.info("Calling API");
        // You can substitute arguments using curly braces
        LOGGER.debug("Time: {}, Code: {}", time, code);
        try {
        } catch (IOException e) {
            // Always log exceptions like this (Exception as second argument)
            // You CANNOT use the curly braces substitution here
            LOGGER.error("Could not load file: " + fileName, e);
        }
    }
}
```

