## Java Testing Guide

This guide gives an introduction into writing/executing/debugging TestNG unit tests
in the Atlas projects.


### Directory Layout

Every project has its own set of Java test classes under `src/test/java/**/*Test.java`
and a configuration file `src/test/resources/testng.xml` which is just referencing the
test classes which we intend to run during the `mvn test` phase. 

```
 atlas-root
      |
      |--- homepage
      |       |--- src
      |       |     |--- main   Contains source classes
      |       |     |--- test
      |       |            |--- java
      |       |            |      |--- com/walmart/atlas/homepage/**/*Test.java    Java test classes
      |       |            |--- resources
      |       |                   |--- testng.xml    Referencing test classes for automated run
      |       |--- target
      |              |--- surefire-reports
      |                     |--- index.html   Test results (surefire is our test-runner)
      |                    ... 
      |--- checkout
      |       |
      |      ...
     ...
```


### Running the Tests

#### Command Line

`mvn test` will invoke the **surefire** test-runner plugin to execute the tests referenced
in `testng.xml`. You will see a similar output in the command line:

```
[INFO] --- maven-surefire-plugin:2.8:test (default-test) @ checkout ---
[INFO] Surefire report directory: /Users/aincze/Projects/atlas/checkout/target/surefire-reports
...
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.179 sec
```

If any tests fail, the command will fail and you will likely see an exception from
the failed test in the console. It may be necessary to see more verbose output,
in that case open the `target/surefire-reports/index.html` file in your browser.


#### IDE

To run individual test classes (or test methods) it is recommended to use an IDE.

##### IntelliJ IDEA

Make sure that the *TestNG* plugin is enabled. Open any test class and open the
context menu (right click) on either the class name or an individual method name
(annotated with `@Test`) and select `Run <classOrMethodName>Test`.


### Writing Tests

The following is a TestNG unit test template:

```java
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import static org.testng.Assert.*;

public class MyClassTest {

    private MyClass myClass;

    @BeforeMethod
    public void setup() throws Exception {
        myClass = new MyClass();
    }
    
    @Test
    public void convertsStringToLowercase() {
        // given
        String input = "UPPERCASE";
        myClass.configure(5);
        
        // when
        String lowercase = myClass.toLowercase(input);
        
        // then
        assertEquals(lowercase, "uppercase");
    }
    
    @Test
    public void describeWhatTheTestCaseDoesVerbosely() {
    }
    
    private void someHelper() {
    }
}
```

The following TestNG annotations are the most commonly used ones:
* `@Test`: Method which should be marked as a test case.
* `@BeforeMethod`: Method to run before *every* individual test method.
* `@AfterMethod`: Method to run after *every* individual test method.
* `@BeforeSuite`: Method to run *once* before anything else in this class.
* `@AfterSuite`: Method to run *once* after everything else in this class.

#### Naming Conventions

Because of the annotations there is no need to prefix/postfix method names with "test".
* The test class name is *always* the same as the class under test + "Test" (Example:
  `MyClass` => `MyClassTest`). They **must** reside in the same package as well
  (which is important to be able to access *protected* members of the class).
* Test method names should describe what is the tested functionality verbosely, but
  don't have to start with "should" (as in *mocha*).
* Try to follow the useful convention of dividing your test methods into three
  blocks: *given*, *when*, *then*. It is especially useful for longer, more
  complicated tests.

#### Assertions

Use assertions from `org.testng.Assert.*`. The most popular ones are:
* `assertTrue(booleanExpression)`
* `assertEquals(actual, expected)`: Pay attention to the argument order!

#### Mocking

By the definition of the unit test, your `MyClassTest` should always only test
functionality inside `MyClass`, but preferably nothing else in other classes.
To achieve this, a lot of times you will want to mock your dependencies. We use
**Mockito** for this.

Mocking a class means *Mockito* is creating an object instance which answers
to all the methods/fields of the mocked class, but with an empty behavior.
Behavior for methods can be defined, as well as assertions can be made
against how the mock object was interacted with (method calls, arguments).
See the full *Mockito* API [here](http://docs.mockito.googlecode.com/hg/latest/org/mockito/Mockito.html);

```java
// import static org.mockito.Mockito.*;
MyClass mockMyClass = mock(MyClass.class); // mock creation
when(mockMyClass.myMethod()).thenReturn("output"); // behavior definition
String output = mockMyClass.myMethod("input"); // interaction
verify(mockMyClass).myMethod("input"); // verification
```

In most cases it is not obvious how to get the tested class to use a mock
instead of the real-world dependency. In the following three different ways
of injecting a mock (in the order of preference) is presented for the
following example problem. We want to avoid the creation and interaction
with a real `Dependency` instance.

```java
public class MyClass {
    public void myMethod() {
        ...
        Dependency dependency = new Dependency();
        dependency.call();
        ...
    }
}
```

1. **Passing as argument**
   ```java
   public class MyClass {
       public void myMethod(Dependency dependency) {
           ...
       }
   }
   
   public class MyClassTest {
       @Test
       public void myTest() {
           // given
           MyClass myClass = new MyClass();
           Dependency mockDependency = mock(Dependency.class);

           // when
           myClass.myMethod(mockDependency);
       }
   }
   ```
2. **Injecting into field**
   ```java
   public class MyClass {
       protected Dependency dependency = new Dependency();

       public void myMethod() {
           ...
       }
   }
   
   public class MyClassTest {
       @Test
       public void myTest() {
           // given
           MyClass myClass = new MyClass();
           Dependency mockDependency = mock(Dependency.class);
           myClass.dependency = mockDependency;

           // when
           myClass.myMethod();
       }
   }
   ```
3. **Overriding class getter**
   ```java
   public class MyClass {
       public void myMethod() {
           ...
           Dependency dependency = getDependency();
           ...
       }
   
       protected Dependency getDependency() {
           return new Dependency();
       }
   }
   
   public class MyClassTest {
       @Test
       public void myTest() {
           // given
           final Dependency mockDependency = mock(Dependency.class);
           MyClass myClass = new MyClass() {
               @Override
               protected Dependency getDependency() {
                   return mockDependency;
               }
           };
           
           // when
           myClass.myMethod();
       }
   }
   ```

#### Testing Routes/Servlets

You could use *Mockito* to mock the servlet request/response objects, but
Spring already provides handy test classes:

```java
// import org.springframework.mock.web.*;
HttpServletRequest request = new MockHttpServletRequest();
HttpServletResponse response = new MockHttpServletResponse();
```
