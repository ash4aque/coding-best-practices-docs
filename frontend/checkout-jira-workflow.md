Checkout Jira Workflow
======================

Choosing a ticket to work on
----------------------------

Use the [Work board] to find tickets and change their status.

Tickets should be worked in the order they are stack-ranked in the backlog.

Priority rules for picking a ticket:

1. Ticket in the current sprint assigned to you.
2. Unassigned ticket in the current sprint.
3. Ticket in backlog assigned to you.
4. Unassigned ticket in backlog.

When you do pick up a ticket, make sure it is:

1. Assigned to you.
2. Added to the current sprint (use the [Planning board]).

Pull request process
--------------------

When you reach the point where you have completed work related to your ticket,
open a Pull Request against the `master` branch of the `atlas` repo.  Remember
to:

1. Write a description of the work done.  Length of the description should be
   roughly proportional to the change made, i.e. small change --> small
   description, big change --> big description.
2. Run a git-blame on the code that you changed.  Use the results of this to
   determine who to CC on your ticket.  Assign the ticket to a person who has
   a solid understanding of the pieces involved.
3. CC the UX team for approval if any changes are user-facing in any way.  A
   good rule of thumb: unless it is marked as a dev-only story, or is purely an
   internal refactor, UX team should be included on PR.  Until a catch-all alias
   is created, include the following people:
   `@jhessel @cbvelas @zhe @j2baron @l1turne @ptatine @dneela @sshar39 @uganti @stamhan @jdakoji @ksanthi`
4. If you've CC'd UX team, also include a screenshot of small changes, and/or a
   screencast for interactive changes.
5. Address comments from reviewers.
6. After all comments have been addressed, wait for approval from ticket assignee,
   the UX team, and the Meta-JS team.
7. Merge the PR.

See our [Git guide](https://gecgithub01.walmart.com/GlobalProducts/atlas/blob/master/docs/git-guide.md#code-reviews)
for more information.

### A note on UX pull request review process:

- If the PR is submitted before noon (PST): review should happen the same day (before midnight).
- If the PR is submitted after noon (PST): review should happen by noon the next day.

Merges _are blocked until UX approves_, or until the time window runs out as per above.
If you ask UX for a re-review, the same time windows apply (the clock "resets").

Simple fixes should be made in the same PR; Out-of scope or larger fixes should be ticketed out.

Ticket status
-------------

- When you start work on a ticket, move it to "Work in Progress".
- If you halt work on a ticket, move it to "Backlog".
- When you submit a PR, add a comment in the ticket with the PR URL.
- When your PR has been merged to master:
  - Move ticket to "Ready For Review"
  - Assign ticket to the reporter
  - Ping reporter on Slack

Life After Ready For Review
---------------------------

The ticket life cycle continues after it's passed off for review. If QA finds any defects, they will
move the ticket back to "Work in Progress" and notify you. To make sure you don't miss any reopened
tickets, regularly look at [Open tickets assigned to you].

Reopened tickets will have bugs associated with them in the "Issue Links" list. Once these bugs
have been fixed, assign the original ticket back to the reporter and ask them to re-verify.

After QA has verified the functionality, one of two things can happen:
- If it's a Bug, QA will put it in Done. Life cycle is over.
- It it's a Story, QA will assign to UX (@a0small) for UXAT (User Experience Acceptance Testing).

If UX find issues, a similar workflow to the above will ensue.

Once satisfied, UX then hands the ticket off to @jpahuja for final product owner validation.


[Planning board]: https://jira.walmart.com/secure/RapidBoard.jspa?rapidView=1916&view=planning&quickFilter=6600&quickFilter=9366
[Work board]: https://jira.walmart.com/secure/RapidBoard.jspa?rapidView=1916&quickFilter=8288
[Open tickets assigned to you]: https://jira.walmart.com/issues/?filter=15123
