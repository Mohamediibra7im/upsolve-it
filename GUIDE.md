# Comprehensive Usage Guide

Welcome to the Upsolve.it manual. This document provides detailed operating instructions and design explanations for all systems and protocols within the platform.

## Table of Contents

1. [Getting Started](#getting-started)
   - [Creating an Account](#creating-an-account)
   - [Codeforces Verification](#codeforces-verification)
   - [Syncing Profile](#syncing-profile)
2. [Core Training Engine](#training-engine)
   - [Training Modes](#training-modes)
   - [Solving Problems](#solving-problems)
   - [Session Results](#session-results)
3. [Upsolve Challenge](#upsolve-challenge)
   - [Upsolving Arena](#upsolving-arena)
   - [Tracking Progress](#tracking-progress)
4. [Learning Trail](#learning-trail)
   - [Roadmap Structure](#roadmap-structure)
   - [Level Unlock Gates](#level-gates)
5. [Gamification & Progress](#progression-system)
   - [XP and Levels](#xp-levels)
   - [Leaderboards](#leaderboards)
   - [Tactical Levels](#tactical-levels)
6. [Social & Identity](#social-features)
   - [Friends System](#friends-system)
   - [Profile Portals](#profile-portals)
7. [Support & Console](#support-console)
   - [Signal Support Console](#signal-support)
   - [System Notifications](#system-notifications)

---

## Getting Started <a name="getting-started"></a>

### Creating an Account <a name="creating-an-account"></a>

To create an identity on Upsolve.it:

1. Navigate to the register section on the home page.
2. Enter your Codeforces handle. The handle must match your active Codeforces ID.
3. Choose a secure password for account authentication.
4. Complete the sign-up process. The system will create your dashboard profile shell.

### Codeforces Verification <a name="codeforces-verification"></a>

Before you can access protected training sectors, you must verify your identity to ensure profile ownership:

1. Start the Codeforces Verification Quest.
2. The platform will output a temporary timed verification code.
3. Open your Codeforces profile settings, and paste this verification code into the **First Name** field.
4. Click verify. The system scans the Codeforces API, confirms the code matches the First Name on your profile, verifies your handle, and awards you 50 XP and a Verified Badge.

### Syncing Profile <a name="syncing-profile"></a>

Your rating, solved problems, and submission history are automatically synced at session initialization. You can manually request a sync at any time:

1. Click on your profile avatar in the navigation bar.
2. Click Sync Profile.
3. The platform will fetch your latest contest ratings, active rank, and submission histories directly from Codeforces to update your dashboard dashboards.

---

## Core Training Engine <a name="training-engine"></a>

The training engine is the tactical execution center of Upsolve.it. It allows you to run customized training sessions.

### Training Modes <a name="training-modes"></a>

Upsolve.it supports five tactical training modes:

- **Ladder Mode**: Classic rating-based training. Best for steady progress. Curated blocks where the difficulty index increases as you solve them.
- **Weakness Mode**: Targets specific tags where your historical stats show lower success rates, forcing you to patch tactical gaps.
- **Speed Mode**: Solve lower-rated problems under strict countdown timers to train your quick-coding reflexes under pressure.
- **Contest Simulation**: Simulates standard contest situations with hidden problem ratings, strict timers, and final review only.
- **Endurance Mode**: Longer sessions with more problems, designed for deep weekend practice over long training intervals.

### Solving Problems <a name="solving-problems"></a>

During an active session:

1. The platform generates problems matching your selected training parameters.
2. Each problem includes a link to the corresponding Codeforces task, rating level, tag classifications, and a session timer.
3. Click Open Problem to open and solve it inside your local IDE environment.
4. Submit your code on Codeforces.
5. Return to the Upsolve.it console. The platform automatically queries the Codeforces API in real-time, monitoring your submission history to automatically update the problem status to "Accepted" or "Wrong Answer" / "Judging" without requiring manual inputs.

### Session Results <a name="session-results"></a>

Completing a session logs your results to database telemetry:

- Solved problems accrue XP rewards relative to difficulty.
- Attempted but unsolved problems are automatically compiled and transferred into your Upsolve Arena list.
- Mode performance stats (average time, success rate, points) are recalculated and plotted on your statistics dashboard.

---

## Upsolve Challenge <a name="upsolve-challenge"></a>

### Upsolving Arena <a name="upsolving-arena"></a>

The Upsolve Arena is a dedicated sector focused on conquering problems you previously failed to solve:

- Problems are automatically pushed here from failed training runs.
- The arena organizes tasks by difficulty and category tags.
- Focus on resolving these tasks to continuously break rating plateaus.

### Tracking Progress <a name="tracking-progress"></a>

1. Click Solve Now on any problem in your list.
2. After passing the problem on Codeforces, click Verify Solve.
3. The system queries your submission history. If successful, the problem is cleared from the list and bonus XP is awarded to your profile.

---

## Learning Trail <a name="learning-trail"></a>

### Roadmap Structure <a name="roadmap-structure"></a>

The Roadmap is a curated curriculum designed to transition competitive programmers from beginners to masters:

- Topic levels are structured as a sequence of topic nodes (e.g., Graph Theory, Dynamic Programming, Mathematics).
- Each node includes tutorial material, reference templates, and a targeted set of training problems.
- Earn significant XP gains by completing all problems in a node.

### Level Unlock Gates <a name="level-gates"></a>

Progress is gated by sequential checkpoints:

- Advanced levels are accessible immediately once published by administrators (certain levels can be restricted by admins to specific users).
- Within each level, topic nodes are unlocked sequentially: completing the curriculum problems inside a topic unlocks the next topic node.

---

## Gamification & Progress <a name="progression-system"></a>

### XP and Levels <a name="xp-levels"></a>

Almost all operations on the console yield experience points:

- Solving problems: Earn XP based on Codeforces rating levels.
- Verification quests: Bonus XP.
- Roadmap node completion: Significant XP blocks.
- Levelling up increases your rank classification visible on your profile header.

### Leaderboards <a name="leaderboards"></a>

The Leaderboard logs overall community performance metrics:

- Compare your level, rating, and solved problems counts against the community.
- View leaderboards filtered by weekly, monthly, or all-time XP gains.

### Tactical Levels <a name="tactical-levels"></a>

Your performance is mapped to specific CP ranks:

- Easy (800-1200): Recruit level.
- Medium (1200-1600): Specialist level.
- Hard (1600-2000): Expert level.
- Expert (2000-2400): Candidate Master level.

---

## Social & Identity <a name="social-features"></a>

### Friends System <a name="friends-system"></a>

- Send and accept friend requests by handle.
- View your friends' active dashboard charts, stats summaries, and progress.
- Monitor active training sessions and upsolve metrics of fellow operators.

### Profile Portals <a name="profile-portals"></a>

Your public profile is your operator card. It displays:
- Level progression and rank status.
- Activity heatmap showing daily practice consistency and total solved counts.
- Codeforces rating milestones.
- Active friend connections.

---

## Support & Console <a name="support-console"></a>

### Signal Support Console <a name="signal-support"></a>

For technical diagnostics, bugs, or system feedback, use the Signal Support Console:

- Compose contact requests directly from the help center.
- Requests are dispatched directly to admin mailboxes.
- Once resolved, admin responses are dispatched directly to your registered email address.

### System Notifications <a name="system-notifications"></a>

The notification center broadcasts targeted alerts:

- Click the floating action bell icon (or navigate to /whats-new) to open the notification board.
- View platform announcements.
- Version logs and new feature drops.
- Scheduled maintenance outages.
- Direct messages from admin operators.
