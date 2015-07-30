There are several ways to prevent being blocked by missing backend data when working on a new feature.

* If your work is pure frontend (html/js/css), you can start by hardcoding the data in the Handlebars template itself.
* You can create fake data at the Java level, creating a dummy object that you pass to your template.  This dummy object can be a plain HashMap, or it can be an instance of a real class, which you create and then populate explicitly.  [Here's an example of populating a real object]
(../../../../atlas/commit/10fb2087ecc9ed425a07d5d7eaed34b210ce6d97#L0L163).  Be sure to mark the code with "// FAKE DATA" so we can track it.
* If you need to pass in additional data to a template but there's no field to put that data in because you're relying on a DTO from @Services, create a separate plain HashMap to hold your new data, and pass that to the template along with your DTO object.  Again, mark the code with a loud "FAKE DATA" comment for tracking.
* You can create mock data directly in your Backbone Model.  [Here's an example in Checkout app](../../../../atlas/commit/44398cb640e55055dbf445943763275a7a93cd5f#L0R59).  Leave a loud comment in your code for tracking.
* You can work with QE team (contact Anna Koh or Jackie Fong) to put json payloads in the LISA mocking tool, which can be used in place of real backend services.
