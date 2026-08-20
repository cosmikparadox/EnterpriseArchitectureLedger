# The Numbers Explained

### A companion to Part IX, for people who do not do maths

**By Abhineet Asthana. CC-BY 4.0. August 2026. Version 1.1c.**

*Companion to The Architecture Ledger: Part IX, the mathematics, v3.1c, research paper v1.1c and Canonical Thesis v2.1c.*

---

## Before you start

Part IX contains about twenty pieces of mathematics. This book teaches all of them, in order, using no mathematics.

I mean that literally. There are formulas in this book, but they sit in grey boxes marked "the formal version," and you can skip every single one and lose nothing. The argument lives in the prose.

One example runs through the whole book. A customer returns a pair of shoes. Everything gets explained on that one thing, so you are never learning a new idea and a new example at the same time.

Seventeen parts. Each introduces exactly one idea and uses it for the rest of the book.

```
 1. Why a range beats a number
 2. Splitting a bill
 3. How often things break
 4. Trusting your own data
 5. How bad it is when it breaks
 6. Putting the two together
 7. Things break together
 8. Blast radius
 9. What flexibility is worth
10. Money later is worth less
11. Being unsure about your own uncertainty
12. Why you cannot add any of it up
13. Whose boundaries are these?
14. Knowing whether you are wrong
15. Being wrong four times
16. The part I got most wrong
17. The part I got wrong again
```

**What changed at version 1.1.** Part 9 was rewritten from the ground up. In version 1.0 I described the idea at the heart of it as the framework's most distinctive claim. It is not distinctive. It has been in the standard textbooks of financial economics since 1994, and I had cited one of those textbooks elsewhere in the same work without noticing it said so. Part 16 explains that properly.

**What changed at version 1.1c, which is two rounds of changes at once.** This book skipped a version. The other three documents went to a "b" revision that this one never received, so v1.1c carries both sets of changes and there is no v1.1b of this book.

The first set adds three things nobody had written down. **The ledger does not add up**, which gets a whole new Part 12 because it is the first thing anyone asks for and the answer is no. **The boundaries are drawn by hand**, which gets Part 13, and which is the sharpest objection anyone has made to this work. And **the nearest predecessor listed six obstacles to doing any of this, not the three I had published**, which is now in Part 16.

The second set is one finding and it costs the framework an entire axis. **Everything in Parts 5 through 8, the whole business of putting money on risk and pushing it through a dependency map, is patented.** Granted in 2019, filed in 2018, by a company I had been citing since the first version without ever opening the document. Part 17 is new and explains it.

Parts 2, 5, 9, 11, 14 and 15 are updated to match. Everything else stands.

---

# Part 1. Why a range beats a number

## The question that starts everything

You process forty thousand product returns a month. Someone asks what a return costs you.

Suppose you answer: eighty-four pence.

That answer is almost certainly wrong, and worse, it is wrong in a way that hides how wrong it is. Some returns are simple. Some trigger a fraud check. Some involve a payment reversal that fails and retries. The cost is not one number. It is a spread of numbers, and the spread is the interesting part.

So the honest answer looks like this instead:

```
  Typical return               84p
  One in ten costs less than   69p
  One in ten costs more than   GBP 1.04
```

That is a distribution. It is the single most important idea in this entire framework, and everything else is built on it.

## Why this matters more than it sounds

A single number invites a false conversation. If you tell a CFO a return costs 84p, the next question is why it is not 70p. If you tell them the typical return costs 84p but one in ten costs over a pound and you do not fully know why, you are having a different and better conversation.

There is also a practical reason. When you combine numbers, ranges behave differently from single values. Two costs that are each "about a pound" can combine into something that is usually two pounds and occasionally eleven. You cannot see that coming if you only carry the averages.

## Three words you will need

**Median.** The middle. Half of returns cost less than this, half cost more. When someone says "typical," they usually mean this.

**Mean.** The average. Add everything up, divide by how many. This is *not* the same as the median, and Part 5 is entirely about why the gap between them matters enormously.

**Percentile.** A marker showing where you sit in the spread. The 99th percentile, written P99, is the level that only one in a hundred exceeds. It is your bad day.

```
+-----------+------------------------------------------+
| Median    | The typical case                         |
| Mean      | The average, which can be pulled around  |
|           | by rare extreme cases                    |
| P99       | Your bad day. One in a hundred is worse  |
+-----------+------------------------------------------+
```

Hold on to the fact that the median and the mean can be very far apart. It will matter more than anything else in this book.

---

# Part 2. Splitting a bill

## The shared restaurant problem

Six of you go to dinner. Five people share three bottles of wine. One person drinks water. The bill arrives.

Splitting it six ways is easy and unfair. Working out exactly who consumed what is fair and tedious. Every organisation running shared technology faces this problem every month, and most of them choose "split it six ways" because it is easier.

Your product return touches a payments service. So do four other business processes. The payments service costs GBP 2,400 a month. How much of that is yours?

## Two kinds of cost, which behave completely differently

**The part that changes with use.** Every time your return calls the payments service, it burns a bit of compute and moves a bit of data. More returns, bigger bill. This is like the wine: consumed, attributable, fair to charge for.

**The part that does not.** Some capacity is reserved and paid for whether anyone uses it or not. This is like the table booking and the corkage. It exists because the restaurant exists.

```
Payments service, GBP 2,400 a month

  Reserved capacity, paid regardless    GBP   900
  Usage-driven, scales with traffic     GBP 1,500
```

These get treated differently, and the reason is that only one of them is genuinely caused by you.

## Charging for the part you caused

For the usage-driven part, work out your share of whatever actually drives the cost. If your returns account for fourteen percent of the data moved through that service, you take fourteen percent of GBP 1,500. That is GBP 210.

The important word is **caused**. It is tempting to count calls, because calls are easy to count. But two processes making the same number of calls can differ enormously in cost if one of them moves far more data. Counting calls when the cost is driven by data is like splitting the wine bill by how many times each person raised their glass.

```
+---------------------------+---------------------------+
| WHAT YOU PAY FOR          | WHAT ACTUALLY DRIVES IT   |
+---------------------------+---------------------------+
| Computing                 | Processor time, memory    |
| Storage                   | Gigabytes held per month  |
| Moving data out           | Gigabytes transferred     |
| Per-request services      | Number of requests        |
| Reserved capacity         | Nothing. It is fixed.     |
+---------------------------+---------------------------+
```

That last row is the honest one. There is no fair way to divide a cost that nothing caused. You pick a rule, you write down that you picked it, and you never pretend it was discovered.

## The trap in the fixed part

You split the GBP 900 of reserved capacity equally across the five processes using the service. Each pays GBP 180. One process looks at its GBP 180 and decides the platform is too expensive, so it leaves.

Now four processes share GBP 900. Each pays GBP 225. It got more expensive for everyone still there, and nobody used any more of it. Another one leaves. Now it is GBP 300 each.

This is called a **death spiral**, and it happens because a cost that nothing caused got charged as though something did. The defence is simple: always report the fixed share separately from the usage-driven part, and never let anyone make a leave-or-stay decision on a number containing an arbitrary allocation.

## The uncomfortable consequence

Follow that through and you land somewhere unwelcome.

The more processes lean on a shared service, the bigger the arbitrary fixed share becomes as a proportion of what you charge them, and the less that total number means. But heavily shared services are exactly the ones where the big decisions happen. Nobody agonises over a component that one process uses. They agonise over the payments platform that five processes depend on.

**So the framework produces its least trustworthy cost number at precisely the point where the largest cost decisions get made.**

That is not a caveat to be buried. It is a real limit and nothing in this book fixes it. The usage-driven part stays reliable at shared services. The total does not.

## The thing your bill will never tell you

"What does a return cost us?" is a question about dividing up today's bill.

"What would it cost to add a new process alongside returns?" is a completely different question. It is about what would be *added*, not what gets *divided*. If the payments service has spare capacity, the answer might be almost nothing. If it would need a whole new deployment, the answer might be enormous.

Confusing these two is one of the most common mistakes in this field, and an earlier version of Part IX made it. The first is called average cost. The second is called marginal cost. They are equal only in a world with no fixed costs, which is not this world.

**Remember the second one.** It comes back in Part 9, and it turns out to be the more trustworthy of the two tools for measuring flexibility. It also comes back in Part 12, where it turns out to be the only cost question that survives at all.

## One more warning about the headline claim

There is a sentence this framework leans on: architecture determines the machine resource consumed per unit of business work.

That sentence is arranged so that it cannot be false. You take your total bill, you divide out how much business you did, you divide out the price your vendor charges, and whatever is left over you call the architecture effect. But "whatever is left over" also contains changes in your workload mix, changes in your vendor's own performance, other tenants on shared hardware, and plain measurement error.

So the arithmetic proves only that the leftover is not volume and not list price. It does not prove the leftover is architecture. Showing that takes real evidence, of the kind Part 14 describes, and this framework has not gathered it yet.

---

# Part 3. How often things break

## Frequency, and why it is awkward

Your returns process depends on a payments service. Sometimes that service has a bad day. How often?

This sounds like an easy question and it is one of the hardest in the book, for a reason that has nothing to do with mathematics: **serious failures are rare, so you have almost no data about them.**

If something breaks every week, you have plenty of evidence. If it breaks once every four years, you might have seen it once. One observation is not much to build on.

## Rates, not probabilities

A **probability** is a chance that something happens, between zero and one. A **rate** is how many times something happens per unit of time, and it can exceed one. "Twenty percent chance this year" and "0.22 times per year" are close but not the same thing, and mixing them up quietly corrupts everything downstream.

Failure frequency is a rate. We will write it as events per year.

```
  0.18 events per year
  = roughly one event every five and a half years
```

## The unit trap that broke an earlier version

Here is a real error from Part IX version 2.0, included because it is instructive and because it is the kind of thing that survives review.

The framework had fourteen quarters of local observation. It plugged the number fourteen into a formula alongside rates expressed *per year*. Fourteen quarters is three and a half years, not fourteen years. The formula silently treated three and a half years of evidence as though it were fourteen.

The effect was to make local data look about two and a half times more informative than it was, which pulled the final answer noticeably in the wrong direction.

**The lesson is boring and expensive: write the units next to every number, always.** Not because you might forget, but because the person checking your work needs to see them.

---

# Part 4. Trusting your own data

This part contains the most elegant idea in the framework. It is worth reading slowly. It is also, after four rounds of audit, the only part of the risk machinery that has never needed correcting and the only part nobody else appears to have patented.

## The batting average problem

A baseball player comes up three times and gets two hits. His batting average is .667, which would make him the greatest hitter in history.

Obviously he is not. Three at-bats tells you almost nothing. But it does not tell you *nothing*. So how much should you believe it?

The answer cannot be "ignore it" and cannot be "believe it." It has to be a blend. And the blend has to shift as evidence accumulates: after three at-bats you mostly believe the league average, after three hundred you mostly believe him.

This is exactly your problem with failure rates.

## Your situation

```
Industry data says services like yours fail 0.18 times a year
Your own data: one failure in three and a half years,
  which is 0.286 times a year
```

Your own experience says you are worse than average. But it rests on a single event. Do you believe it?

## The insight: the weight should not be a choice

An earlier version of this framework had the analyst pick the weight. That is a disaster, because the answer moves enormously with the choice and there is no principled way to make it. Whoever picks the weight is picking the answer.

Insurance companies solved this problem in the 1960s. They face it constantly: this driver has had one accident, what premium do we charge? The technique is called **credibility theory**, and its central result is that the correct weight can be *computed* rather than chosen.

## What the weight depends on

**One: how much data you have.** More observation, more weight on your own experience. Obvious.

**Two, and this is the clever part: how different entities actually are from one another.**

In the first world, every service is basically alike and failures are random noise. Your one failure tells you almost nothing about *you*; it is just bad luck. You should lean heavily on the industry number.

In the second world, services differ enormously in quality, and each one's failure rate is stable and characteristic. Now your one failure is a real signal about which kind of service you have. You should lean on your own data.

```
Lots of genuine difference between services,
little noise within each        -> trust your own data more

Services all alike,
lots of random noise            -> trust the industry number more
```

That ratio has a name and a value. In this case it works out to about 2.33 years, which you can read as "your local experience needs to be worth more than 2.33 years before it starts outweighing the industry view."

## The blend

```
You have 3.5 years of evidence
The threshold is 2.33 years

Weight on your own data = 3.5 / (3.5 + 2.33) = 0.60

Answer = 0.60 x 0.286 + 0.40 x 0.18
       = 0.243 failures per year
```

Sixty percent your data, forty percent the industry. Nobody chose sixty. It fell out of how much evidence you have and how different services genuinely are.

> **The formal version.** With a Gamma prior and Poisson counts, the posterior mean is (alpha + x) / (beta + e), where x is events observed and e is exposure. This equals Z(x/e) + (1-Z)(alpha/beta) with Z = e/(e+k) and k = beta. The two expressions agree exactly, not approximately.

## Why the last line of that box matters enormously

There are two completely different ways to compute this: a Bayesian route and a credibility route. They come from different traditions and look nothing alike.

They give **exactly** the same answer. Not close. Identical.

That means the construction checks itself. If you build this and your two routes disagree, you have a bug, and you know it immediately without needing anyone to review your reasoning.

**Self-checking is worth more than elegance.** Most of the errors in this framework's history would have been caught instantly by a construction that could contradict itself. This one can. When an outside reviewer went looking for a contradiction in this section, there wasn't one.

## The honest caveat

With one observed event, the estimate of "how different are services from each other" is itself extremely shaky. The machinery is correct; the inputs are thin. The right response is to report the weight with its own uncertainty, or to state plainly that the inputs were assumed rather than measured.

And there is a second caveat that only becomes visible in Part 12. One observed failure tells you something useful about *this* service. It tells you absolutely nothing about whether this service and some other service tend to fail on the same day. That turns out to matter enormously.

---

# Part 5. How bad it is when it breaks

## The salary distribution everyone understands

Take a hundred people at random and write down their salaries. The median might be GBP 35,000. The mean might be GBP 48,000.

Why the gap? Because a handful of people earn enormously more, and they drag the average up without touching the middle. The typical person is nowhere near the average person.

This shape, with a floor at zero, a bulge on the left and a long tail stretching right, is called **right-skewed**. Salaries are like this. House prices are like this. Insurance losses are like this. And the cost of a technology failure is very much like this.

```
  many
    |  ####
    |  ######
    |  ########
    |  #########
    |  ##########____
    |  ----____________
  few |________________________________
     small     typical        enormous

        median here     mean over here somewhere
           ^                    ^
```

## Why this matters for you

Most failures of your payments service are annoying. A few are catastrophic. If you report only the average, you describe a failure that essentially never happens: it is too expensive to be typical and too cheap to be the disaster you are actually worried about.

```
  Typical failure (median)     GBP   278,000
  Average failure (mean)       GBP   458,345
  Bad day (P99)                GBP 2,846,852
```

Those three numbers describe the same distribution. Quoting any one of them alone is misleading in a different direction.

## Two parts to the damage

**Direct damage.** The failure itself. Lost transactions, staff time, restoration.

**Knock-on damage.** What happens afterwards. Regulatory attention, customers leaving, a fine.

The knock-on part is what everyone forgets, and it is often larger than the direct part.

But there is a subtlety that an earlier version of Part IX got wrong. Knock-on damage does not happen every time. Most incidents do not produce a fine. So it is not simply added on; it is added on *multiplied by the chance it happens at all*. Treating it as always occurring overstates your losses, sometimes substantially.

## The ceiling, and why capping is dangerous

You might reason: this use case sits inside a business area worth GBP 890,000, so it cannot possibly lose more than that. Cap it there.

The instinct is right and the execution is dangerous. If you simply chop the distribution off at GBP 890,000, then any loss above that gets recorded as exactly GBP 890,000. Your bad-day figure stops being a real estimate and becomes the cap itself.

You have not made the risk smaller. You have made it invisible.

**The fix is to report how often the ceiling gets hit.** If your simulated losses hit the cap five percent of the time, that is not a footnote, it is the headline: either your bad days genuinely exceed what the business area is worth, which is alarming, or your valuation of the business area is wrong, which is also worth knowing.

The framework says that above roughly one percent, the bad-day figure should not be reported at all. **One percent is a house rule, not a discovery.** There is nothing magic about it. It is written down so that everyone uses the same one, and anyone is free to pick a different number as long as they say so and stick to it. Version 1.0 of this book implied it came from somewhere. It did not.

---

# Part 6. Putting the two together

## The multiplication

```
How often it happens          0.243 times a year
What it costs when it does    GBP 278,000 typical

Expected annual loss          about GBP 68,000
```

That is your annual risk from this one dependency, in pounds, which you can put in front of a finance director.

Notice it is not a colour. Most organisations govern this with a red-amber-green chart. A colour cannot be compared with a budget, cannot be added to another colour, and cannot be argued with. A distribution in pounds can do all three.

## But the multiplication has a trap

Frequency is a rate. Magnitude is a distribution. When you multiply a rate by a skewed distribution, the result is *more* skewed, not less.

This is why the reported output is never one number. It is:

```
{ P10, P50, mean, P90, P99, the method used,
  the random seed, how often the cap bound,
  which version of the dependency map it was
  computed against, who owns the boundaries,
  and where the assumptions are written down }
```

The seed is there so anyone can reproduce your exact figure. The assumption reference is there because every number in this framework rests on choices, and hiding them is how this entire field lost its credibility. The last two entries are new, and Part 13 explains why they had to be added.

---

# Part 7. Things break together

## The comfortable assumption

You have two components. Each fails about one percent of the time. What is the chance both fail together?

The obvious answer is one in ten thousand. Multiply the two.

That answer is correct only if the two failures have nothing whatsoever to do with each other. And in a technology estate, they almost always do. They share power. They share a network. They share a platform team having a bad week. They share a dependency you have forgotten about.

The real number might be one in five hundred. Twenty times higher than the comfortable assumption.

## Why this was the worst error in version 2.0

Version 2.0 of Part IX did something genuinely embarrassing. In one section it multiplied failure probabilities together, which assumes independence. In another section it insisted at length that failures are correlated and warned against methods that ignore this.

Both positions were stated confidently. They cannot both be true. The document was arguing with itself and nobody noticed, including me.

## The fix: name the shared thing

```
Step 1: given the shared thing is fine,
        how likely is each to fail? Multiply those.

Step 2: average over all the ways the shared
        thing might be having a bad day.
```

Independence turns out to be the special case where there is no shared thing. In an enterprise estate, there is always a shared thing.

## Tails, which is where this gets serious

Some ways of describing "these things move together" work fine in normal conditions and quietly fall apart in extreme ones. They effectively assume that in a genuine crisis, components go back to failing independently.

That is precisely backwards. The whole point of a crisis is that everything goes wrong at once.

The technical name for the property you need is **tail dependence**, and the practical instruction is short: whatever method you use to describe things moving together, check that it still describes them moving together in the worst one percent of cases. Several popular methods do not, and they are popular partly because they are convenient.

## A correction on the folklore

The first claim is that if you assume everything fails together and add up your worst cases, you overstate your risk. **Not quite.** If everything genuinely does move together, adding the worst cases gives exactly the right answer. It is a reference point, not an exaggeration.

The second is that with heavy tails, adding up risks can understate them. **True, but only under a specific condition**, one so extreme that the average loss is mathematically infinite. Quoting the warning without the condition turns a real result into a scary story.

---

# Part 8. Blast radius

## The counting problem

Your payments service fails. What else stops working, and what is the total damage?

Trace the dependencies. Order service depends on payments. Notification service depends on order service. Fraud checking depends on payments directly. Add up the damage across all of them.

Except you have just double-counted, because two of those paths run through the same component, and you counted its damage twice.

## The fix that has existed since the 1960s

Earlier versions of this framework treated double-counting as an open research problem. It is not, and has not been for sixty years. Nuclear engineering and aviation solved it, because they had to.

The principle is simple enough to state in one line: **add up the individual cases, subtract the overlaps, add back the double-overlaps, and continue alternating.**

For anything realistically sized there is a computational structure that does this exactly rather than approximately. It is called a binary decision diagram, and the only thing you need to know about it is that it gets the right answer with shared components rather than a close-enough one.

## The assumption nobody checked

All this machinery assumes something called **monotonicity**: that a component failing can only ever make the overall system worse. It is such a natural assumption that it is rarely stated.

Modern systems violate it constantly, and deliberately.

Think of a fuse box. A fuse blowing is a component failing. It is also the thing that stops your house burning down. The failure made the outcome *better*.

Software is now full of fuses. Circuit breakers cut off a struggling service so it can recover. Retries paper over transient faults. Fallbacks serve degraded results instead of nothing. Load shedding drops low-value traffic to protect high-value traffic. Every one of these is a component "failing" in a way that helps.

```
+-------------------------------+---------------------------+
| IF YOUR SYSTEM HAS            | THE STANDARD TOOL         |
+-------------------------------+---------------------------+
| Simple dependency chains      | Works fine                |
| Retries, circuit breakers,    | Does not represent your   |
| fallbacks, graceful           | system. Use a state-based |
| degradation                   | model instead.            |
+-------------------------------+---------------------------+
```

**Check which world you are in before you pick the tool.** The maths does not warn you. It produces a confident number either way.

This turns out to be one of the very few things in Parts 5 to 8 that somebody else has not already claimed. See Part 17.

## Loops

Service A calls service B, which calls service A. Dependency chains assume you never go round in a circle, and real systems go round in circles all the time.

Some methods handle feedback **over time** by taking snapshots and linking them. What they do not handle is two things depending on each other *simultaneously*, which still requires a different family of tools.

An earlier version claimed loops were impossible to handle. Wrong. The next version claimed they were fine. Also wrong. The truth needed more words than either.

## What got deleted

One method was removed entirely rather than fixed.

It came from physics, where it describes how a network falls apart as you remove pieces. It is elegant and it is genuinely useful for networks that are enormous and randomly wired.

Your architecture is neither. It is a few thousand components, deliberately designed, with hubs and tiers and redundancy someone chose on purpose. The method's assumptions do not hold, so its answers do not mean anything.

**Removing a method is a legitimate result.** A framework that only ever adds techniques is not being audited. When an outside reviewer checked whether this removal had been over-cautious, the answer came back that it was correct.

---

# Part 9. What flexibility is worth

**This part was rewritten completely at version 1.1.** In version 1.0 I opened it by calling it the framework's most distinctive claim. That was wrong and Part 16 explains how wrong. The ideas below are useful and worth understanding. They are not mine, and I should not have implied they were.

**And at version 1.1c it carries more weight than it should have to.** After Part 17, this is the only part of the book describing something that nobody else is already doing. That is not a promotion. It is what is left.

## The hotel booking

You are booking a hotel for a conference in six months.

The refundable rate is GBP 220 a night. The non-refundable rate is GBP 180.

The GBP 40 difference is not an administrative fee. It is the price of being able to change your mind. You are buying the *right* to cancel without the *obligation* to. That is an option, and GBP 40 is what the hotel thinks it is worth.

You already understand option pricing. That is genuinely the whole idea.

## The thing that makes options valuable

Now ask when that GBP 40 is worth paying.

If your plans are locked and certain, it is a waste. You will never cancel, so you have bought nothing.

If your plans are chaotic, it is a bargain. The messier the future, the more that right to change your mind is worth.

**Uncertainty makes flexibility more valuable, not less.** This is the single most counterintuitive idea in finance and it is completely obvious in a hotel booking. People who have never thought about volatility already act on it every time they book a flight.

## Turning it round, which is not as clever as I thought

Ordinary option thinking asks what a flexibility you *hold* is worth. This framework asks the opposite question: what did you destroy?

You commit to a proprietary payments platform. It is a good decision on today's terms. But you have just made a future move dramatically more expensive. You booked the non-refundable rate.

What did that cost you? Not the price difference on the booking. The value of the cancellation right you no longer have.

**In version 1.0 I presented that reversal as new. It is not new.** The standard textbook on investment under uncertainty, published in 1994, says in plain terms that when a firm makes a commitment it cannot undo, it kills the option to wait, and that the value of the killed option belongs in the cost of the decision. A separate 1994 paper prices exactly the freedom to switch when switching has a cost. Both are in the canon. Both were in my own reference list.

So what follows is a technique for measuring something well understood, in a place where nobody had bothered to measure it. That is a smaller claim and it is the true one.

## The service charge problem

There is a bigger issue underneath, and it took an outside audit to surface it.

You go for dinner. The bill says GBP 80, service included. You leave a twenty percent tip on top.

You have just paid for service twice.

That is what version 1.0 of this framework was doing. Economists have a definition of "switching cost," and it is broad. When they say switching cost, they already mean everything that makes moving painful: the migration work, the retraining, the contracts, the compatibility problems, *and the value of the freedom you gave up*. The freedom is already on the bill.

Version 1.0 computed the freedom separately and reported it alongside a switching cost figure. Anyone adding those two together was tipping on a service charge.

## What replaces it: split the bill, do not add to it

The fix is not to throw the idea away. It is to stop treating it as an extra and start treating it as a **division**.

```
The total pain of changing your mind splits in two:

  The bill part      What it actually costs to move.
                     Migration work, retraining,
                     getting your data out. A known
                     number. An engineer can estimate it.

  The freedom part   The value of the ability to move
                     that you no longer have. Depends
                     on how uncertain the future is and
                     how long your horizon is.
```

**You are not adding a number. You are splitting one number into two.** You cannot double-count something you have divided.

## Why the split is worth doing

Because the two halves respond to completely different things, and most organisations only ever manage one of them.

The bill part falls when you invest in tooling, abstraction layers and migration automation. That is what platform teams do, and they can show you the savings.

The freedom part falls for entirely different reasons: when your horizon shortens, when the world gets more predictable, or when the alternative you gave up turns out to be worth less than you thought. No amount of migration tooling touches it.

So a programme that halves the cost of moving and reports that it has doubled the organisation's flexibility may have done nothing of the sort. That is the claim worth making, and it is a modest one.

## How it is measured

Build one model of what the freedom to switch is worth. Run it twice.

```
Run 1: with the cost of moving as it would have
       been under a standard, portable design    GBP 180,000

Run 2: with the cost of moving as this decision
       actually makes it                         GBP 640,000
```

Everything else held identical, especially the time horizon.

```
Value of switching freedom, run 1          GBP 426,004
Value of switching freedom, run 2          GBP 144,547
                                           -----------
The freedom part                           GBP 281,457
The bill part (640,000 - 180,000)          GBP 460,000
                                           -----------
Total pain of changing your mind           GBP 741,457
```

**That last line replaces a switching-cost estimate. It never gets added to one.**

## Two honesty requirements

**Say what you are comparing against.** "Destroyed GBP 281,000 of flexibility" is meaningless on its own. Compared with *what*? A different vendor? Building it yourself? Doing nothing? The answer changes completely.

**And at version 1.1c, saying it is no longer enough.** The comparison now has to be an alternative that was genuinely on the table at the time, and you have to be able to point at the document where somebody wrote it down: a design decision record, a rejected vendor proposal, a board paper, dated at or before the decision. A comparison invented afterwards by the person doing the analysis does not count, however sensible it sounds.

The reason is uncomfortable and worth stating. The answer moves in a completely predictable direction with the comparison you choose. Pick a frictionless enough alternative and you can produce any freedom number you like. Writing it down was never a control. It was a disclosure. Requiring evidence is the control.

This will bite. On older decisions the paper trail is usually thin, and the honest response in that case is to report nothing rather than to reconstruct a plausible alternative.

**Do not add these up across your estate.** If you compute this for forty decisions and total them, the sum will be too large. Part 12 explains why, and it is worse than it sounds.

## The cliff, which is now a stopping rule

Here is a subtlety that version 1.0 mentioned and then ignored.

You might expect the freedom number to rise smoothly as moving gets more expensive. It does not. Because you cannot get switching costs back once you have paid them, there is a range where making moving somewhat more expensive changes nothing at all, because you were not going to switch anyway. Then past a point, the value drops sharply.

Picture a cliff edge on an otherwise flat plateau.

Version 1.0 noted this and reported the two numbers anyway. That is not good enough. If your two measurement points sit on opposite sides of the cliff, the difference between them is telling you where you put your pins, not what your decision cost.

**The rule now is: draw the whole line before quoting any two points on it.** And if the cliff falls between them, report nothing.

## Which tool to reach for first

There is a much simpler measure of flexibility, and Part 2 already introduced it: what would it cost to add the next thing?

That number is metered. You can watch it. It needs no model of the future, no volatility, no discount rate and no argument about what counts as a switching cost.

**Use it whenever you can.** Everything in this Part 9 is the fallback for when the thing you might build does not exist yet, so there is nothing to measure. Version 1.0 treated this part as the headline. It should have been the reserve.

---

# Part 10. Money later is worth less

## Two rates, not one

A hundred pounds today is worth more than a hundred pounds in three years. Everyone knows this. Bringing a future amount back to today's terms is called discounting.

The part that is less widely known, and that broke version 2.0 of Part IX, is that **not all future money gets discounted the same way.**

A hundred pounds you are *certain* to receive in three years is worth more than a hundred pounds you *might* receive in three years. Risk costs you something on top of time.

So in the hotel analogy: the *benefit* of being able to cancel is uncertain, because you do not know whether your plans will change. The *cancellation fee* is a known number written on the booking. Those two do not deserve the same treatment.

## The error, plainly

Version 2.0 took the whole calculation, worked out the net benefit, and then discounted the lot at the safe rate.

That treats an uncertain benefit as though it were guaranteed money. It makes flexibility look more valuable than it is.

```
Correct, two rates            GBP 281,457
Version 2.0, one rate         GBP 326,782
                              -----------
Overstatement                 about 16%
```

The correct method discounts the uncertain benefit at a risk-adjusted rate and the known cost at the safe rate, **separately, before** working out whether you would switch at all. An outside reviewer checked this against the published method and confirmed the two-rate structure.

## A claim that got withdrawn

Version 2.0 also boasted that its method needed no volatility input, which sounded like a considerable advantage.

It was not true. The method simulates thousands of possible futures, and how *spread out* those futures are is exactly volatility, just entering by a different door. The estimation problem moved. It did not vanish.

That correction is in the document because a framework that claims to have eliminated a hard problem is almost always hiding it.

## One more thing

There is a mismatch worth naming, because it is the sort of thing a finance person will spot in thirty seconds.

The framework wants to estimate how uncertain the future is by looking at how much your cloud bill has bounced around historically. That is a measurement of the real world.

Option pricing, in its most familiar form, does not work in the real world. It works in a carefully constructed imaginary one where nobody demands to be paid for taking risk, which is a mathematical trick that makes the sums come out right for things that trade on markets.

You cannot feed a real-world measurement into an imaginary-world formula and get anything meaningful out. The method used here is specifically one of the few that is built to take real-world inputs, which is the only reason any of this is legitimate. Swap in a more standard option formula while keeping the same volatility number and you produce a figure that means nothing at all.

---

# Part 11. Being unsure about your own uncertainty

## Two completely different kinds of not knowing

Roll a fair die. You do not know what you will get. No amount of study will help, because the uncertainty is in the world. Call this **irreducible**.

Now someone hands you a die and says it might be loaded. You do not know the odds. But you *could* find out, by examining it. Call this **reducible**.

Both feel like uncertainty. Only one of them can be fixed by doing work.

```
+---------------+-----------------------+------------------+
| KIND          | EXAMPLE               | CAN YOU FIX IT?  |
+---------------+-----------------------+------------------+
| Irreducible   | Whether a component   | No. It is the    |
|               | fails next Tuesday    | world.           |
+---------------+-----------------------+------------------+
| Reducible     | Whether your          | Yes. Go and      |
|               | architecture diagram  | look at the      |
|               | matches reality       | real system.     |
+---------------+-----------------------+------------------+
```

## Measuring how wrong your map is

```
Dependencies in the documentation:  A->B, B->C, C->D
Dependencies actually observed:     A->B, B->C, C->E, A->F

Appearing in both:      2
Appearing in either:    5
Appearing in only one:  3

Drift = 3/5 = 0.60, meaning sixty percent disagreement
```

Dividing by "appears in either" matters. An earlier version divided by only one of the two lists, which could produce a drift above one hundred percent and gave a different answer depending on which list you called the reference. This version is symmetric and bounded, and it is a proper mathematical distance.

## The error I want you to understand

Version 1.0 said: our map is stale, so add money to the expected loss.

That was wrong. A bad map does not make fires bigger. It makes your *estimate* shakier. Those are different claims, and only one of them is true.

Version 2.0 corrected it to: a stale map does not change your average, it just widens your range.

**That was also wrong**, and it took an independent audit to catch, because it sounds so reasonable.

## Why the average does move

Think about a commute. Normally forty minutes. Some days traffic is light and you save ten. Some days there is an accident and you lose ninety.

Are your good days and bad days symmetric? No. Traffic can only be *so* good, because there is a floor. It can be arbitrarily bad, because there is no ceiling.

So if you become *more uncertain* about traffic, you are not adding equal amounts of better and worse. You are adding a little bit of better and a lot of worse. **Your average commute gets longer, even though your typical commute does not change.**

Losses work exactly this way. They have a floor at zero and no ceiling. Widening your uncertainty adds far more possible disaster than possible relief, and that drags the average up.

## What actually happens

```
                     median         average        bad day
Perfect knowledge    GBP 278,000    GBP 458,345    GBP 2,846,852
11% drift            GBP 278,000    GBP 469,572    GBP 3,009,717
                     no change      +2.5%          +5.7%
```

Read that bottom row carefully, because it is the most useful thing in this book.

A stale map leaves your typical case exactly where it was. It nudges your average up by two and a half percent. And it pushes your bad day up by nearly six.

**The tail moves about twice as fast as the average.** That is the fingerprint of not-knowing, as opposed to bad-luck, and it is the reason a single expected-loss figure conceals the effect entirely.

At twenty-five percent drift the average is up thirteen percent and the bad day is up thirty-two. Drift does not hurt you in a straight line.

All three rows were recomputed independently during the audit and came back correct.

## What re-mining does not buy you

Here is something version 1.0 did not say and should have.

Going and looking at the real system reduces your uncertainty about what the system looks like **today**. It tells you nothing whatsoever about whether the decision you made eighteen months ago was a good one, because the framework holds no record of past decisions matched against what happened afterwards.

Reducing your uncertainty about the present is not the same as learning. Part 16 comes back to this, because it turns out to be the one objection to this entire framework that has no answer at all.

## The claim that got withdrawn with it

Version 2.0 cited banking regulators as support for adding a safety margin for model uncertainty.

The guidance actually says close to the opposite. It warns that institutions should be careful about applying conservatism broadly, because in complex models the effect of an add-on is often neither obvious nor intuitive, and something that looks cautious may not be if the underlying model is wrong in the first place.

If you genuinely want to report a figure above your best estimate, that is a legitimate decision with a proper name in insurance practice. It has to be declared separately, with its size stated. What it cannot be is folded in and presented as a measurement.

*(Small note: the specific guidance cited was replaced by a newer version in April 2026. The substance is unchanged, but anyone quoting it should cite the current one.)*

## Someone is already selling part of this

There is a product on the market that compares what your infrastructure is supposed to cost against what it actually costs, and prices the gap. That is drift, priced, shipped, today.

It is not the same as what this part does. That product gives you a difference in cost. This part gives you a change in the shape of your risk, mostly in the tail. They complement each other.

But the distinction is thinner than version 1.0 of this book implied, and you should know that before anyone points it out to you.

---

# Part 12. Why you cannot add any of it up

**This part is new at version 1.1c. It answers the first question every executive asks, and the answer is no.**

## The question

You have now got three numbers against one business process: what it costs, what it risks, and what flexibility it consumed. You do the same for the other two hundred processes in the estate.

Someone senior says: good, now total it up. What is the estate worth? What is our exposure?

**You cannot. There is no total.** Not a difficult total, not an approximate total. There is no arithmetic in this framework that produces one, and asking for it is one of the things the framework is required to refuse.

That is a serious limitation and it is stated here rather than discovered later by someone hostile.

## Three separate reasons, one per axis

The uncomfortable part is that there is no single reason. There are three, they are unrelated to each other, and each one is enough on its own. If there were one reason you could go looking for one fix.

**Cost: you would be counting the same thing more than once.**

Go back to the restaurant. Five processes share the payments service. You charged each of them a share. Now add up all five shares.

If you instrumented all five, you get back what the service costs, but only because you declared a split that adds to one. That is not a measurement, it is an accounting identity you created.

And if you only instrumented three of the five, which is the normal situation, your total is neither what the estate costs nor a proper share of it. It is a sum over an incomplete list, and it depends entirely on how many processes you happened to measure.

Worse, if the question is "what would we save by shutting these down," the answer is not the sum of what you charged them. Shutting them down does not release the reserved capacity and does not delete the shared service. The only cost question that survives is a marginal one, asked about one specific change at a time.

**Risk: adding up losses assumes something false.**

Two processes each have a bad day worth GBP 2 million. What is your bad day across both?

It is not GBP 4 million. GBP 4 million is the answer if both always go wrong together, which is one extreme. If they never go wrong together, the answer is much closer to GBP 2 million. The truth is somewhere in between, and getting it requires knowing how the two move as a pair.

Knowing how they move as a pair requires having observed times when they both went wrong. Part 4 pointed out you might have seen one failure per process in three and a half years. That is enough to say something about each one on its own. It is exactly zero information about the pair.

So the method for combining risks exists and is well understood. The data almost never does.

**Flexibility: freedoms overlap, and adding them counts the same escape twice.**

You commit to the payments platform. Five processes ride on it. You compute the freedom you destroyed, from the point of view of each of the five, and add them up.

You have just valued one escape route five times. There is one commitment and one decision to leave the platform. It is not five separate freedoms. It is one freedom that five processes happen to benefit from.

There is also a deeper mathematical result behind this, from 1993, which says that a collection of options is always worth less than the sum of the options valued separately. Adding option values is not an approximation. It is an error.

## What you can do instead

Refusing to total is not refusing to be useful.

```
+-------------------------+------------------------------------+
| YOU CAN                 | ON CONDITION                       |
+-------------------------+------------------------------------+
| RANK                    | One axis at a time. "Which five    |
|                         | processes carry the most tail      |
|                         | risk" is a completely answerable   |
|                         | question and often the one that    |
|                         | actually drives action.            |
+-------------------------+------------------------------------+
| COMPARE TWO             | One axis at a time, showing both   |
|                         | ranges rather than two point       |
|                         | estimates.                         |
+-------------------------+------------------------------------+
| TRACK ONE OVER TIME     | Same process, same axis, and see   |
|                         | Part 13 for the catch.             |
+-------------------------+------------------------------------+
| COMBINE ONE AXIS BY A   | Cost: only on a marginal basis,    |
| NAMED METHOD            | one change at a time.              |
|                         | Risk: only where you genuinely     |
|                         | have joint observations.           |
|                         | Flexibility: never.                |
+-------------------------+------------------------------------+
```

What you cannot do is produce one number for the estate, and you certainly cannot add across the three axes. There is no exchange rate between a monthly cost, an annual loss distribution and a freedom valued over a three-year horizon. Nothing in this framework attempts to invent one.

## The honest way to say this

**A measurement that cannot be added up is still a measurement. It is not a management system.**

That sentence is carried word for word in the formal specification, and it is the fairest summary of what this whole framework is. It tells you which processes are worst and by how much. It cannot tell you what the estate is worth.

Some organisations will find that unusable, and that is a completely reasonable judgement rather than a failure to understand the point.

## Two people got here first

I did not notice this before anyone else, and version 1.0 of this book implied otherwise by not mentioning it at all.

The nearest predecessor to this work, a German dissertation from 2007, states plainly that where two architecture measures overlap in their effects, their value contributions cannot simply be added, and proposes a settlement mechanism between them to stop the double counting. He had the problem in 2007 and a partial fix that this framework does not have.

And the patent family described in Part 17 claims, as a granted invention, aggregating losses across assets in what it calls a nonlinear sum. So by 2018 the non-additivity of correlated loss was not merely known, it was owned.

## The part that is my own fault

There is a sting in this and it only became visible at version 1.1c.

The risk half of this problem is not a law of nature. It is a consequence of a choice I made. If you never cut the estate into separate business processes in the first place, and instead simulate a failure spreading across the whole dependency map in one go, the combined answer falls out directly and you never need to know how any pair moves together.

That is exactly what the patent family in Part 17 does. It is a cleaner solution, and it is available to them because they do not chop the map into declared pieces before they start.

**So my hardest aggregation problem is partly self-inflicted, by the choice described in the next part.**

---

# Part 13. Whose boundaries are these?

**This part is new at version 1.1c and it is the sharpest objection anyone has raised to this work.**

## The claim I had been making

Throughout this book there is an implied contrast. Other people draw diagrams by hand and then reason about them. This framework watches the actual system and derives its map from what really happens. Observed, not asserted. That is the pitch.

It is half true, and I had not noticed which half.

## What is actually observed and what is not

The dependency map is genuinely mined. Nobody drew it. It comes from watching real traffic between real services, and it updates itself.

But every number in this book is computed for "one business process inside one named business area." Processing a product return, inside returns and reverse logistics.

**Where did "returns and reverse logistics" come from?**

It came from people in a room. Somebody drew a boundary around a set of activities and gave it a name. That is a hand-built diagram. It is precisely the kind of artefact this framework criticises the 2007 dissertation for relying on.

So the honest description is that this is a **hybrid**: a machine-observed structure with a hand-drawn boundary laid on top of it. Earlier versions implied a purity it does not have.

## Why this matters rather than being a quibble

Because the boundary decides the answers.

```
Where you put the boundary decides:
  which costs land inside your number and which
    land in somebody else's
  how far a failure is allowed to spread before you
    stop counting it
  which commitments count as yours
```

Move the boundary and every figure in this book moves with it. Nobody is doing anything dishonest. There is simply no single correct place to draw it.

## The partial defence, which is genuinely partial

There is a reasonable answer and it is worth understanding exactly how far it goes.

The two artefacts change at wildly different rates. A business area decomposition usually already exists, is owned by people outside the technology function, and is revised maybe once a year. A dependency map changes every week and is not reliably known to anybody.

So: draw the slow-moving thing by hand, watch the fast-moving thing by machine. That is a sensible division of labour, and it puts the hand-drawn part somewhere it can be argued with, rather than buried inside a model.

But notice what that defence does and does not license. If your boundary has not moved in a year, then a change in your numbers this quarter cannot have come from the boundary. So **it defends statements about movement.** It does not defend statements about level. "Our returns process costs 84p a return" depends entirely on where the boundary sits. "Our returns process got twelve percent more expensive this quarter" does not.

## Two rules that follow

**The boundary is now a recorded field, with a named owner.** Every figure gets reported alongside who drew the boundaries it was computed against, and when they last changed them. Same treatment as the comparison in Part 9.

**And the person doing the measuring is not allowed to draw them.** If the same party sets the boundaries and computes the figures, they are choosing where the costs fall and how far failures spread, which is to say they are choosing the answer. If that is the situation, the framework says do not publish a number at all.

## The map moves while you are measuring it

A related problem, and it is unsolved.

The dependency map is re-derived continuously, which is the point. So when this quarter's number differs from last quarter's, there are two possible reasons and they are tangled together: the architecture changed, or the map of it changed. Possibly both.

The framework has no concept of "as at" and no way of freezing the map. So strictly, no two readings are perfectly comparable, and every trend line it produces is confounded at every single point.

What has been done about it is this: every number now carries a stamp saying which version of the map it was computed against, and comparing across two versions either comes with an explicit statement of which of the two causes you are attributing the change to, or gets refused.

**That makes the problem visible. It does not solve it.** A framework whose central promise is measurement over time has an unresolved problem at its centre, and you should know that.

## And once it is a target

There is a last thing, which is old and general and applies to every metric ever invented.

The moment the cost-per-return figure becomes something architects are judged on, it stops measuring architecture and starts measuring what architects do to the number.

The levers are not exotic and there are three:

```
  choose a different thing to call the cost driver
  put the boundary so the expensive parts fall outside
  choose a flattering comparison in Part 9
```

The framework has no anti-gaming machinery. What it has is that all three of those are recorded fields, so somebody can argue with them, and the evidence rule in Part 9 removes the third one.

**Being able to see it is not the same as preventing it.** Anyone who controls the declarations can still pick their answer within a defensible range, and this book would rather say so than pretend otherwise.

---

# Part 14. Knowing whether you are wrong

## The test that proves nothing

Here is a way to check whether the freedom number means anything: components with high scores should turn out to be expensive to change. Look at what actually happened and see if the relationship holds.

If it holds, the framework works.

Except it will always hold, and the test is worthless.

The freedom number is built partly *from* the cost of changing things. So you would be checking whether the cost of change predicts the cost of change. It will, perfectly, whether or not the underlying theory is true.

This is called **circularity**, and it is one of the most common ways a plausible-looking validation turns out to be empty.

## The familiar version

Do expensive private schools produce better exam results?

Compare the results. Private school pupils do better. Proven?

No. Wealthier and more education-focused families choose private schools. You have not measured what the school does. You have measured who goes there.

You need something that shuffles pupils between schools for reasons unconnected to their families. Only then does the comparison mean anything.

## What a real test needs

```
Something that changed lock-in for reasons
  nobody in the team chose
  e.g. a vendor repricing, a regulatory mandate

A comparison group unaffected by that change

Evidence the two groups behaved alike beforehand

Outcomes measured from change records,
  not from the model that is being tested
```

And one requirement that is easy to skip and fatal to skip: **the outside event must affect the outcome only through the thing you are measuring.** A vendor repricing might directly change the cost of moving, quite apart from any effect on flexibility. If so, the whole design collapses and proves nothing again.

Version 2.0 listed three requirements and declared the problem solved. It was not. A list of desirable properties is not a research design.

## The framework's own kill switch

Every serious framework should say what would make it wrong. This one has ten such statements. One of them is the framework's weak point, and version 1.0 stated it badly.

The old version said: the freedom number is a different thing from the cost of moving, and if it turns out to move in lockstep with the cost of moving, we are wrong.

That was almost meaningless, because the freedom number is *calculated from* the cost of moving. It cannot possibly be unrelated to it. Asking whether it is related is like asking whether your speed is related to how fast you are going.

The new version asks something the framework can genuinely fail:

```
CLAIM      Splitting the pain of changing your mind into
           a bill part and a freedom part tells you
           something you did not already know.

WRONG IF   The freedom part turns out to be roughly the
           same proportion of the bill part every time.
           Then it is just the bill part multiplied by a
           constant, and you learned nothing.

           Or the freedom part is so small, or so
           uncertain, that it disappears into the error
           bars.

IF WRONG   Delete Part 9. Measure flexibility using the
           "what would the next thing cost" number from
           Part 2, which is metered and needs none of
           this machinery.
```

That is a real test with a real consequence. The old one was not.

**And after Part 17 it is close to the only test that matters.** If Part 9 goes, there is nothing left in this book that somebody else is not already doing.

## The second kill switch, and it is bigger

There is a newer one, added because of an objection in Part 16 that has no answer.

Every number in this book is measured right now. This month's bill, this month's risk, today's valuation. But architectural decisions take years to show their effects.

So it is possible that the cost-per-return figure wobbles around for reasons that have nothing to do with architecture at all, and that the real signal is far too slow for anyone to see on a monthly measurement.

```
CLAIM      When the architecture changes, the
           cost-per-return figure moves in response,
           at some delay short enough to observe.

WRONG IF   There is no relationship at any delay you
           can see.

IF WRONG   The number is noise. Not just the cost
           number: all three axes, because they all
           sit on the same map and the same boundary.
           This is not a chapter deletion. It is the
           end of the practice.
```

Two warnings about running that test. The record of architectural changes must be built from change logs or from differences between successive maps, and never from cost data, because a change series built from billing will agree with the cost figure automatically and prove nothing. And the map-version problem in Part 13 bites hardest here, because a delay is exactly what a moving map confounds.

## And the test that has not been written

Part 13 says the hand-drawn boundary might be doing all the work. That is a genuine possibility and there is currently **no test for it**.

The shape of the test is obvious enough: two competent people, one estate, boundaries drawn independently, compare the resulting numbers. If they differ materially, the framework is measuring the decomposition rather than the architecture.

It is not written, and it is not written because designing it properly means deciding what "differ materially" means and how you sample the people, and doing that badly would be worse than admitting the gap. It is recorded as a gap.

---

# Part 15. Being wrong four times

## The record

```
Version 1.0   four errors serious enough to invalidate results
Version 2.0   fixed those four, introduced three more
Version 3.0   fixed those three plus five others,
              removed two methods entirely
Version 3.1   fixed nine more, including the biggest one
Version 3.1b  added three limits nobody had written down
Version 3.1c  found an entire axis already belonged
              to somebody else
```

Twenty-nine logged corrections across the specification, plus sixteen retired framework claims.

## The cause, which was the same every time

Not one of these errors came from failing to understand the mathematics. Every single one came from the same move: something was taken on trust that could have been checked by opening a document.

```
Versions 1.0 and 2.0    a METHOD sounded authoritative,
                        so it was used unread

Version 3.0             a GAP was assumed to exist, and
                        nobody looked in the obvious place

Version 3.1a            a SUMMARY of a source was treated
                        as the source

Version 3.1b            a CITATION was treated as a reading.
                        The patent had been in the reference
                        list since the first version
```

**The failure mode was confidence, not ignorance.** That is worth saying plainly because it is the more dangerous of the two. Ignorance is visible to the person who has it.

Four rules came out of it, in the order they were learned:

```
Not having looked is not the same as it not being there
Having cited something is not the same as having read it
Having a summary of something is not having read it
And a source that grades its own reliability
  has told you nothing
```

That last one is new. When the patent question in Part 17 was first investigated, the investigation came back with its findings and a confidence rating it had assigned to itself. The findings turned out to be correct. The confidence rating was worthless at the time it was given, because a thing that reads a document and then rates its own reading is just telling you how sure it feels.

## Why any of this is in a published document

Enterprise architecture has been trying to quantify itself for thirty years. The attempts are mostly remembered as elaborate spreadsheets that nobody maintained past the consultant's departure. Any new attempt inherits that suspicion and deserves to.

Against that background, a polished result with no visible working is the *least* persuasive thing you could present, because the obvious question is who checked it, and the honest answer is usually nobody.

A visible correction sequence answers a different question: what happens to this framework when it turns out to be wrong?

## But it is not the achievement

Version 1.0 of this book, and the research paper it accompanies, went further than that and said the correction log was the most defensible thing the work had produced.

**That has been withdrawn, and it should have been obvious.**

Keeping a list of your mistakes is basic hygiene. It is what you are supposed to do. Presenting it as the headline result is a way of changing the subject, and the subject it changes is that a central claim did not survive.

The log stays. It is evidence that the work responds to being wrong. It is not the point of the work.

---

# Part 16. The part I got most wrong

This part was new at version 1.1 and it is the reason for that version.

## What happened

The framework was published. Before showing it to anyone whose opinion mattered, it was put through a deliberately hostile review: find the errors, find the missed prior work, do not be kind.

Most of it held. The arithmetic was recomputed independently and came back correct. The references were real.

One thing did not hold, and it was the thing I had been leading with.

## The claim

The framework had seven parts. For each one I had asked: is anyone already doing this? For six of them the honest answer was yes, or partly. For one I had written that nobody was doing it commercially, and I had made that the headline: the idea of measuring what a commitment *destroys* rather than what an option *creates*.

The review found it in a 1994 textbook. Not an obscure one. The standard reference on making investment decisions under uncertainty, which states plainly that an irreversible commitment kills the option to wait, and that the value of what was killed belongs in the cost. A second 1994 paper prices exactly the situation where switching costs money.

Both were already in my reference list. I had cited them for other things.

## Why that is worse than not knowing

If I had never heard of those books, this would be an ordinary gap in reading, and the fix would be to read more.

That is not what happened. I had them open. I quoted them elsewhere. What I never did was check my claim of originality against the field I was borrowing the idea from.

**Believing something is not there is a claim, and it needs checking exactly like any other.** It feels different because there is nothing to check against, which is precisely the trap. The absence of a thing you have not looked for feels identical to the absence of a thing that is not there.

## The predecessor, read properly at last

There is a German dissertation from 2007 on managing IT architectures by their value. It is the closest thing to this work that exists, and for a long time I had only a summary of it.

When it was finally read at source, two things came out.

**The good news.** He does not do what this framework does. His architecture map is drawn by hand. He puts no money on risk. And on flexibility, which was supposed to be my ground, he says explicitly that improvements in flexibility are too difficult to calculate and to put a price on, so he carries them as a qualitative benefit instead. He walked away from the axis rather than occupying it.

**The bad news, and it is the more important half.** He lists **six** obstacles to valuing architecture directly, concludes it cannot be done, and goes an indirect route instead. Three earlier documents of mine said he listed three. That was taken from a summary and published without anyone opening the book.

Here they are, and where this framework stands on each.

```
+------------------------+----------------------------------+
| HIS OBSTACLE           | WHERE THIS FRAMEWORK STANDS      |
+------------------------+----------------------------------+
| Architecture is too    | ANSWERED. Everything here is     |
| far from where the     | measured per business process    |
| money is made          | per unit of business done.       |
+------------------------+----------------------------------+
| You cannot measure the | NOT ANSWERED. DODGED. This       |
| value contribution     | framework never calculates a     |
| itself                 | value contribution. It reports   |
|                        | three things and refuses to      |
|                        | combine them. Part 12 is the     |
|                        | same admission from the other    |
|                        | direction.                       |
+------------------------+----------------------------------+
| You cannot attribute   | PARTLY. The map settles the      |
| an outcome to any one  | technical half. His objection is |
| cause                  | wider: reorganisations happen at |
|                        | the same time, costs and         |
|                        | benefits land in different       |
|                        | departments, people behave       |
|                        | opportunistically, and the       |
|                        | market moves underneath. None of |
|                        | those four is answered.          |
+------------------------+----------------------------------+
| The data does not      | ANSWERED, BUT NOT BY ME. In      |
| exist                  | 2007 it did not. Metered         |
|                        | billing and distributed tracing  |
|                        | made it cheap. Credit goes to    |
|                        | twenty years of instrumentation, |
|                        | not to this framework. And       |
|                        | somebody else acted on it in     |
|                        | 2018. See Part 17.               |
+------------------------+----------------------------------+
| You cannot forecast    | PARTLY. His point is that the    |
| what an architecture   | uses appear later and nobody     |
| will be worth          | foresees them. That is           |
|                        | optionality by another name, and |
|                        | pricing flexibility without      |
|                        | forecasting the payoff is what   |
|                        | Part 9 is for. The limit is that |
|                        | Part 9 estimates uncertainty by  |
|                        | looking backwards.               |
+------------------------+----------------------------------+
| The effects arrive     | NOT ANSWERED AT ALL.             |
| years later            | See below.                       |
+------------------------+----------------------------------+
```

Two of six are open admissions of failure. That is the count and it belongs in the open rather than in a footnote.

## The one with no answer

Every quantity in this book is measured now. This month's bill. Today's risk. A valuation taken this afternoon.

If the effects of architectural decisions genuinely take years to show up, then a monthly reading might be measuring noise around a signal far too slow to see, and **the framework would have no way of telling the difference from the inside.**

It interacts badly with Part 11 too. Going and re-checking the map sharpens your picture of the present, and no picture of the present tells you whether last year's decision was right.

The second kill switch in Part 14 exists because of this obstacle. It does not answer it. It tests whether the framework survives it.

## Why his conclusion does not settle it, and why that is a weak defence

He decided the value of an architecture cannot simply be calculated and went indirect instead.

The response here is not that he was wrong. It is that one of his six obstacles has been removed since 2007 by better instrumentation, and that this framework declines to compute the thing he was after, a single value figure, and reports three separate things it never adds up.

That is a smaller ambition, not a solved problem. A reader should treat the difference between 2007 and now as mostly a difference in available data rather than in insight.

---

# Part 17. The part I got wrong again

**This part is new at version 1.1c and it costs the framework an entire axis.**

## What I checked, and what I found

Two patent numbers had been sitting in my documents since the first version, listed as belonging to a family that might overlap with this work. They had never been verified. It was on the list of things to do.

When they were finally looked up, both turned out to be real granted patents that have nothing whatsoever to do with this framework. One is about corruption in datasets. The other calculates the cost of cyber attacks with no dependency map at all. They had simply been cited wrongly, and the wrong citation had been copied forward through four published versions.

That is embarrassing and it is not the problem.

The problem is what happened when, having got that far, somebody finally opened the patents that *were* the right ones.

## What the patents say

There is a family of five patents, all continuations of one another, filed in March 2018 and granted from 2019 onwards. Both halves were read: the claims, which say what is owned, and the specification, which describes what was actually built.

The claims cover, in order:

```
building a dependency map of assets and the things
  they depend on
running thousands of simulations across that map
starting each one with a failure drawn from a
  probability distribution
letting the failure spread along the dependencies,
  with a probability on each link that the next thing
  goes down given that this thing went down
working out the money lost at each point
adding it all up across assets, across companies,
  and across whole portfolios
stopping the simulation once the answer settles down
```

Read that list against Parts 5, 6, 7 and 8 of this book.

And then the specification, which is where it stops being arguable. It describes producing a curve showing the chance of losing more than any given amount, **denominated in US dollars**, with a worked example about whether losing more than a million dollars more often than once a century is acceptable.

That is not adjacent to what this framework does on risk. It is the same thing, granted, eight years ago.

## What that means

**Everything in Parts 5 through 8 is a correct implementation of something that belongs to somebody else.**

None of the mathematics is wrong. Not one formula changes. What changes is that I can no longer describe any of it as something this framework brings.

The word I had been using in my own documents was that the patents "constrained" the work, meaning I should cite them and get legal advice before filing anything. That word was doing a lot of hiding. They do not constrain it. They occupy it.

## What is different, stated narrowly

There are real differences and they are worth stating precisely, because overstating them is exactly the mistake that got me here.

```
THEIR MAP IS FROM THE OUTSIDE. Their assets are
internet addresses, domain names and servers. Their
dependencies are hosting providers and software
versions. They work it out by observing the internet.
It is a map of who you depend on in the outside world.

THIS MAP IS FROM THE INSIDE. Services calling
services, observed from your own traffic, narrowed to
the ones a specific business process actually touches.

THEIRS COUNTS PER ASSET, weighted by how important
that asset is to whoever owns it.

THIS COUNTS PER BUSINESS PROCESS, with cost expressed
per unit of business done.

THEY HAVE NO COST AXIS AND NO FLEXIBILITY AXIS.
```

Those are genuine differences and they are differences of *scope*, not of technique. Same machinery, pointed at a different thing, for a different reader. Their customers are insurers and investors. This framework's imagined customer is an architect arguing with a finance director.

That is a real distinction. It is not the distinction I had been claiming.

## The two things that hurt most

**The timing argument got weaker.** Part 16 says the framework is possible now and was not possible in 2007, because instrumentation arrived. That is true. But I had been implying the gap stayed open until somebody thought of this. It did not. It closed in 2018, and the people who closed it went and sold it to insurers.

**Part 12's hardest problem is partly mine.** They aggregate risk across a whole portfolio. They can do that because they simulate one big map in one go and the combined answer falls straight out. I cut the estate into declared business areas first, and then need a statistical object I almost never have the data to build. The wall I run into in Part 12 is a wall I built.

## What is actually left

Four things, honestly ordered, and only one of them has a test attached.

```
1  The boundary and the unit: measuring per business
   process per unit of business done, rather than per
   asset. Hand-drawn, per Part 13. No test exists.

2  The map: internal service calls rather than
   outside-in exposure. No test exists.

3  The split in Part 9: separating the bill part of
   changing your mind from the freedom part. This is
   the only thing in this book nobody else is doing.
   The test is in Part 14 and it can come back no.

4  Estimating how uncertain the future is from your
   own telemetry. Open only in the sense that nobody
   has been found doing it, which is exactly the kind
   of evidence that has now collapsed twice.
```

That is the whole of it. Two untested claims about where you point the machinery, one untested claim about a split, and one thing that is only open because nobody has looked hard enough yet.

## What to take away

If you read nothing else in this book, eight things.

**Carry ranges, not numbers.** A single figure hides how much you do not know, which is usually the important part.

**Name your units.** Fourteen quarters is not fourteen years, and that one slip corrupted an entire calculation that had already passed review.

**Check whether the tool matches your world.** Failure maths assumes breaking things only makes things worse. Your circuit breakers exist precisely because that is false.

**Know what you cannot add up.** Three numbers on the same page in the same currency are not three numbers you may total. Currency is a shared language, not permission to do arithmetic.

**Know who drew the boundaries.** If the person doing the measuring also decides where the lines go, they have chosen the answer, and no amount of careful mathematics downstream repairs that.

**When something sounds authoritative, go and read the original.** Three failed versions of the specification came from not doing that.

**When you think you are first, that is also a claim.** Check it against the primary literature of whatever field you borrowed the idea from, not the field you happen to work in. Being first is the easiest thing in the world to believe and the hardest to verify, because you are looking for something that is not there.

**And a citation is not a reading.** This is the one that cost the most. I had the patent numbers. I had described them, accurately as far as the description went, in four published versions. Opening the actual document took an afternoon and moved an entire axis of this framework from mine to somebody else's. The document had been sitting in my own reference list the whole time.

---

*This companion explains Part IX v3.1c. Where the two disagree, Part IX is the specification and this book is the explanation.*

*Every method described here belongs to someone else: insurance, reliability engineering, finance, econometrics, and in the case of Parts 5 to 8, a granted patent family. The contribution is the assembly, and at version 1.1c the assembly is smaller than at version 1.1, which was smaller than at version 1.0.*
