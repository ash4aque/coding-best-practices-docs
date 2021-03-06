## Atlas Tasks Facility

The `AtlasTasks` facility provides asynchronous task management. 
It's initialized for each request in a web application filter prior to handing control to the requested servlet. 

Tasks can create additional tasks; 
for example, templating tasks very often create one or more service call tasks to obtain the data to be rendered.

`AtlasTasks` supports not just creation of new tasks but the coordination of those tasks thereafter.

### Tasks

Tasks are implemented as threads allocated from a thread pool that is shared across the web
application.

There are several ways to start a new task within the context of the task group (see below).

```
Callable<Something> somethingTask = ...
AsyncResponse<Something> somethingAsyncResponse = AtlasTasks.submit(somethingTask);
AsyncResponse<OtherThing> otherThingAsyncResponse = AtlasTasks.submit(otherThingTask, 97);
AsyncResponse<AnotherThing> anotherThingAsyncResponse = 
        AtlasTasks.submit(anotherThingTask, 500L, TimeUnit.MILLISECONDS); 
``` 

### Responses

Tasks are implemented as `AsyncResponse` instances. Three methods may be used to retrieve the task result.

```
try {
    Something something = somethingAsyncResponse.fetch();
} catch (TimeoutException | InterruptedException | ExecutionException e) {
    ...
}
try {
    OtherThing otherThing = otherThingAsyncResponse.get();
} catch (ExecutionException e) {
    ...
}
AnotherThing anotherThing = anotherThingAsyncResponse.getOrNull();
```

The distinguishing feature of these three methods are how they handle exceptions generated by the processing:

* `fetch` exposes the task outcome without filtering, including `TimeoutException` when the task exceeds its deadline.
* `get` exposes the task outcome but substitutes `null` when a `TimeoutException` occurs.
* `getOrNull` returns the task outcome or `null` for any exceptions.

### Deadlines

Tasks have deadlines which are enforced when the `fetch`, `get` and `getOrNull` methods 
on the `AsyncResponse` instance is called.

As will be seen in the next section deadlines can be shortened but never extended.

Also, it is important to understand that when an asynchronous task is running and its deadline passes;
it's not affected: it is the consumer of that task's result which is affected when the deadline passes,
either by receiving a `TimeoutException`
or `null` depending on how that result is being retrieved. 
That means the underlying task keeps on running
until it either completes its processing or is canceled.

Note: that the web application filter which initializes the `AtlasTasks` instance before entry to the request servlet,
likewise shuts down the instance on the way out, including trying to cancel any remaining tasks that are still running.

Note: once a task begins execution, it often runs until it completes its processing or receives an unhandled exception.
A `[ZOMBIE TASK]` tagged log entry is created when such an enduring task attempts to spawn additional tasks or
attempts to access the original request or response objects or objects derived from them; e.g., the parameter map.

### Task Groups

Initially there's just one task group (an `AtlasTasks`instance) for a request. 
New tasks are added to that group, and,
in addition, each one of those tasks has its own task group containing any tasks it spawns.

Note: a task is not a member of its own task group, so that
when it chooses to wait for all its subtasks to complete their processing,
it doesn't end up waiting for itself to complete, which, were it otherwise,
would always result in a `TimeoutException` as it would never finish waiting for itself until its deadline passed.

New task groups can be created, too.

```
AtlasTasks additionTasks = new AtlasTasks();
AtlasTasks optionalTasks = new AtlasTasks(97);
AtlasTasks otherTasks = new AtlasTasks(500L, TimeUnit.MILLISECONDS); 
```

Previously, we've seen that each scheduled task, i.e., 
`AsyncResponse` instance, has its own deadline. 
Each task group has a deadline, too, which is the deadline of the parent `AsyncResponse` it belongs to
or parent `AtlasTask` instance when constructed directly.
None of the task group member `AsyncResponse` deadlines can exceed the deadline of the parent task group;
this represents the fact that no subtask should have a deadline that exceeds its own parent's deadline.

Whereas `fetch`, `get` or `getOrNull` methods on `AsyncResponse` instances 
enforce their individual deadlines. the `complete` and `next` methods 
on an `AtlasTasks` instance enforce its overall deadline and not the individual deadlines 
of the member `AsyncResponse` instances.

Finally, task groups allow managing a group of tasks as a whole. One method, `complete`,
returns once all the member tasks finish their processing or the group's deadline is exceeded. 
Individual results are not accessible using this method.
Two other methods,
`hasNext` and `next` allow accessing the retrieving completed tasks until the task group or the tasks have been returned
or until its deadline is exceeded.

### Page and Ajax APIs

the `Page` and `Ajax` Atlas APIs support `callService`, `callMapUrl` and `callStringUrlCall`. 
Additional, `Page` supports `callView`. All these methods are equivalent of call:
```
AtlasTasks.submit(task, 97);
```
Meaning execute this task, with a deadline that is 97% of the current deadline. At each level, therefore,
the deadline is shortened by 3% for any subtask; this ensures that the parent task will have some time
to process the results of its subtasks, even if they exceed their deadlines.

## Asynchronous Strategies

So much of Atlas activities is waiting for external resources to be returned.

### A Single Asynchronous Task Case

Even when a single service call is required for a request, say, in the context of an `Ajax` call,
it is still critical to spawn an asynchronous task to execute it.
This approach allows for a deadline to be imposed on the service call task, 
which if it is exceeded can allow for a timely response to be generated 
even while freeing up limited web application container resources.

```
public class AcmeAjax extends Ajax {
    public AcmeAjax(...) {
        super(request, response, appContext);
        ...
    }
    
    public void respond() throws TimeoutException, InterruptedException, ExecutionException {
        Callable<Something> somethingTask = ...
        AsyncResponse<Something> somethingAsyncResponse = AtlasTasks.submit(somethingTask);
        // block on the something task completion
        Something something = somethingAsyncResponse.fetch();
        writeJsonObject(something);
    }
}
```

### Multiple Asynchronous Tasks Case

Multiple, independent tasks can be started at once and then in the simplest case, 
the results can be individually retrieved.

```
AsyncResponse<Something> somethingAsyncResponse = AtlasTasks.submit(somethingTask);
AsyncResponse<OtherThing> otherThingAsyncResponse = AtlasTasks.submit(otherThingTask);
AsyncResponse<AnotherThing> anotherThingAsyncResponse = AtlasTasks.submit(anotherThingTask); 

Something something = somethingAsyncResponse.fetch();
OtherThing otherThing = otherThingAsyncResponse.fetch();
AnotherThing anotherThing = anotherThingAsyncResponse.fetch();
``` 

Another approach, where the results are not individually signficant, the tasks are started
and the group is allowed to complete (or timeout, as the case maybe).

```
AtlasTasks.submit(somethingTask);
AtlasTasks.submit(otherThingTask);
AtlasTasks.submit(anotherThingTask); 

// block on all three tasks completing or the original deadline passing
AtlasTasks.completeAll();
writeJsonObject(context);
```

Or a mixture of task groups and individual tasks may be utilized.

```
AsyncResponse<Something> somethingAsyncResponse = AtlasTasks.submit(somethingTask);

AtlasTasks optionalTasks = new AtlasTasks(95);
optionalTasks.add(otherThingTask);
optionalTasks.add(anotherThingTask); 

somethingAsyncResponse.fetch(); // success or exception
optionalTasks.complete(); // success or deadline is up
```

Or, one could wait for one or the another task to complete, within a task group. The loop will continue until
all of its tasks have completed and been returned or the task group's deadline has passed.

```
AtlasTasks competingTasks = new AtlasTasks(95);
competingTasks.add(otherThingTask);
competingTasks.add(anotherThingTask); 

while (competingTasks.hasNext()) {
    Object result = competingTasks.next();
    if (result != null) {
        return result;
    }
}
```
