## Atlas Java Code Style

### Table of Contents

* [General Conventions](#general-conventions)
* [Example](#example)
* [Checkstyle](#checkstyle)

### General Conventions

We are basing are rules off the [standard Java style](http://www.oracle.com/technetwork/java/javase/documentation/codeconvtoc-136057.html).

* **Spacing / Newlines**
    * 120 characters max. per line. (It is a soft limit, and few characters more is always tolerated - even many more if it's justified)
    * 4 character spaced indents (No tabs)
    * No trailing whitespace
    * Add a space after the keywords `if`, `for`, `while`
    * When a line is wrapped, the hanging lines are indented **8** spaces (except when it is a method header or other special case)
    * All files should end with a newline

* **Practices**
    * Decompose your code! Methods longer than 25 lines are suspect and
      should probably be decomposed into smaller (testable) methods or
      actual classes.

* **Comments**
    * JavaDoc-style comments are required as class, field and method comments (where it is necessary)
    * `//` comments are used inside methods to enhance understanding of logic
    * *Only* use JavaDoc when it actually improves understanding
    * Please do *not* write unnecessary JavaDoc like `/** Returns the ID */ getId()` because it is causes unnecessary bloating

* **Curly braces**
    * Always use curly braces around single-line conditional and loop statements.
    * Brace placement should follow the ["One True Brace Style"](https://en.wikipedia.org/wiki/Indent_style#Variant:_1TBS)

* **Naming**
    * Use descriptive (though not overly verbose) class, field and method names. Optimally the names should be self-documenting,
      thus not requiring JavaDoc at all
    * Normal fields and variables should be `camelCased`
    * Static final fields (constants) should be declared using `TITLE_CASE`
    * Unit test classes should be suffixed with `Test` and be in the same package as the source class

### Example

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SearchParameters {

    private static final Logger LOGGER = LoggerFactory.getLogger(MyClass.class);

    private static final String BACKEND_ADDRESS = "http://backend";

    private String searchQuery;

    public String buildBackendSearchUrl() {
        if (searchQuery != null) {
            return BACKEND_ADDRESS + searchQuery;
        } else {
            LOGGER.warn("No search query was defined");
            return null;
        }
    }

    /**
     * The only reason for JavaDoc if the name of the method in the context of this class
     * is not communicating the intent, or if you want to describe exact meaning of input
     * arguments or return values.
     *
     * Please note the syntax:
     *  - "@param <parameter name (NOT type!)> <not obvious description>"
     *  - "@returns <not obvious description (NOT the return type, that is obvious from the method signature)>"
     *  - "@throws <exception type> <in what (not obvious) case is the exception thrown>"
     *
     * A JavaDoc does not have to necessarily include all of these! Only include parts which enhance understanding.
     *
     * @param seed Value used to initialize the DUAL_EC_DRBG algorithm
     * @returns The string representation of Pi with 1000 decimal accuracy
     */
    private String calculatePi(int seed) {
        ...
    }
}
```

### Checkstyle

We are using the *Checkstyle* tool to verify that our code obeys to the above specified conventions. Checkstyle can be
executed for any project using the command

    mvn checkstyle:check

Checkstyle verification is integrated into the `./VERIFY_CODEBASE` script.

Most common encountered problems:

* `Line contains a tab character.`
  **Solution**: Convert TAB characters to 4 spaces. Configure your IDE not to use TABs, and use 4 spaces identation.
* `Utility classes should not have a public or default constructor.`
  **Solution**: Declare a private constructor for the utility class (class with only static methods) (preferably
  place it at the bottom of the class). Also, mark the class as final: `public final ClassName { ... }`

  ```java
  private ClassName() {
      // Exits only to prevent instantiation
  }
  ````
* `Line has trailing spaces.`
  **Solution**: Remove the trailing spaces after the marked lines. Configure your IDE to strip trailing spaces automatically.
* `Name 'logger' must match pattern '^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$'.`
  **Solution**: Constant fields must be `UPPER_CASED`.
* `Name 'NUM_BASIC' must match pattern '^[a-z][a-zA-Z0-9]*$'.`
  **Solution**: If the field is intended to be a constant, properly mark it as `static final`. If not, properly name it `camelCased`.
* `'private' modifier out of order with the JLS suggestions.`
  **Solution**: Use the preferred order of modifiers, for example: `public static final String`.
* `Unused import - com.walmart.services.common.model.money.MoneyType.`
  **Solution**: Remove the unused import.
