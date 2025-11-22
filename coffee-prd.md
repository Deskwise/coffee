Of course. This is the perfect next step. Before writing a single line of code, creating a comprehensive Product Requirements Document (PRD) ensures that the vision is clearly defined, agreed upon, and can serve as the single source of truth for the entire project.

Here is an exhaustive PRD based on our entire conversation.

---

## **Product Requirements Document: Timbercreek Men's Connect**

*   **Version:** 1.0
*   **Date:** November 17, 2025
*   **Author:** Gemini AI (in collaboration with the project visionary)
*   **Status:** Finalized Blueprint

### 1. **Introduction & Vision**

**1.1. Overview**
Timbercreek Men's Connect is a mobile-first web application designed to foster community and build unlikely friendships within the men's group at Timbercreek Church. The core purpose is to facilitate one-on-one, 60-minute coffee meetings between men who might not otherwise connect.

**1.2. Problem Statement**
Within any large community group, individuals tend to gravitate towards familiar faces. This creates social circles that can be difficult to penetrate, leaving many men without a deep sense of connection to the broader group. There is a need for a tool that intentionally and systematically engineers new connections in a low-pressure, safe, and engaging way.

**1.3. Goal & Vision**
The goal is to create a seamless, engaging platform that removes the friction and awkwardness of asking someone new to meet. By creating a "blind match" system, the app will encourage men to step outside their comfort zones, leading to a more integrated, supportive, and resilient men's ministry.

### 2. **User Roles & Personas**

The application will support three distinct user roles with specific permissions.

**2.1. Member (Standard User)**
*   **Description:** The primary user of the app. A man in the Timbercreek Church men's group.
*   **Permissions & Abilities:**
    *   Create and manage their own profile.
    *   Post up to 3 available timeslots per week.
    *   View and accept available timeslots from other members.
    *   View the leaderboard and their own rank.
    *   Submit new location suggestions for admin approval.
    *   Cancel confirmed meetings and delete their own un-booked timeslots.

**2.2. Leader**
*   **Description:** A trusted member of the men's group responsible for community engagement.
*   **Permissions & Abilities:**
    *   All permissions of a "Member."
    *   Ability to create and post group-wide announcements.

**2.3. Administrator**
*   **Description:** The primary owner and manager of the application.
*   **Permissions & Abilities:**
    *   All permissions of a "Leader."
    *   Access to a full administrative dashboard with app-wide analytics.
    *   Ability to view all meeting details (who, when, where).
    *   Full user management (add, remove, change roles).
    *   Full location management (add, remove, edit, and approve/deny member submissions).

### 3. **Core Features & Functionality**

**3.1. User Profile**
*   Each user will have a profile with:
    *   **Custom Name:** Should be recognizable to the group.
    *   **Profile Picture:** Optional but encouraged.
    *   **Short Bio:** A few sentences to introduce themselves.

**3.2. Scheduling & Matching System**
*   **Calendar Interface:** A mobile-first, weekly calendar view. Users can scroll forward to view and schedule up to one month in advance.
*   **Posting Availability:**
    *   Users can post up to 3 available timeslots per week.
    *   Each slot can be set for a **30-minute** or **60-minute** duration (default is 60).
    *   A "Repeat Weekly" option will allow a user to post a recurring timeslot automatically.
*   **Blind Match:** When viewing the calendar, a Member will see available times but **will not see the name** of the person who posted it.
*   **Accepting a Meeting:** A Member can tap on an available slot and confirm to accept the meeting.
*   **The Reveal:** Upon confirmation, both parties will receive an immediate SMS notification revealing who they are meeting with, along with the time and location. The meeting is then locked in on the in-app calendar.
*   **Deleting Timeslots:** Users can delete any of their *un-booked* timeslots at any time.

**3.3. Location Management**
*   **Proximity-Based Sorting:** Locations will be presented in a list and on a map, sorted by distance from the Timbercreek Church address (1961 Old North Gate Rd, Colorado Springs, CO 80921).
*   **Dual View:** Users can toggle between a "List View" and a "Map View" to select a location.
*   **Curated & Vetted Locations:**
    *   The app will be pre-loaded with a list of approved, "sit-down" style coffee shops and cafes that encourage conversation. **Drive-thru locations are explicitly excluded.**
    *   **Pre-loaded List:** Bella's Bagels, Scheels (Cafe), Glen Eyrie Bookstore, Crepe Amour, The Ice Cream Mill, Kava Tava by Shane, 1979 Coffee, Loyal Coffee, The Gathering Stones, Wesley Owens Coffee & Cafe, Third Space Coffee, Carnelian Coffee Co., Serranos Coffee Company.
*   **Admin Approval System:** Members can submit new public locations. These submissions enter a "pending" queue in the Admin Dashboard for an Administrator to approve or deny, ensuring safety and appropriateness.

**3.4. Notifications & Communication**
*   **SMS Integration (via Twilio):**
    1.  **Match Confirmation:** Instant SMS sent to both users upon a successful match.
    2.  **Reminder:** Automated SMS sent to both users one hour prior to the meeting.
    3.  **Cancellation Alert:** Instant SMS sent to a user if the other party cancels the meeting.
*   **Announcements:** Leaders and Admins can post announcements that appear on the Member's main dashboard.

**3.5. Meeting Lifecycle Management**
*   **Cancellation:** A user can cancel a confirmed meeting in case of an emergency. This action will trigger the SMS cancellation alert to the other user.
*   **.ics Calendar Integration:** The initial match notification will include a downloadable `.ics` file, allowing users to add the event to their native phone calendar (Google/Apple) with one tap.
*   **Google Maps Integration:** The location field in the `.ics` file will contain a direct link to Google Maps for easy navigation.

**3.6. Gamification**
*   **Leaderboard:** A leaderboard will be displayed to encourage participation. Points will be awarded for:
    *   Posting a timeslot.
    *   Accepting a meeting.
    *   Completing a meeting.
    *   Adding a new location that gets approved.

### 4. **Non-Functional Requirements**

**4.1. Design & User Experience (UI/UX)**
*   **Theme:** A modern, clean **dark theme**.
*   **Branding:** The Timbercreek Church logo will be used subtly, keeping the primary focus on the user experience.
*   **Platform:** The application must be a **mobile-first** web experience, perfectly usable on any modern smartphone browser.

**4.2. Technology Stack**
*   **Frontend (AI Studio Prototype):** To be built with **HTML, CSS, and plain JavaScript** to function within the AI Studio sandbox environment.
*   **Backend (Full Production App):** A server-side component is required. Recommended to be hosted on **Google Cloud Run**.
    *   **Logic:** Node.js or similar server-side JavaScript environment.
    *   **Database:** A NoSQL or SQL database (e.g., Google Firestore, PostgreSQL) to store all user, meeting, and location data.
*   **Third-Party APIs:**
    *   **Twilio:** For all SMS functionality.
    *   **Google Places API:** For the admin feature of searching and cleanly adding new locations.

**4.3. Security**
*   User authentication must be secure.
*   All API keys (Twilio, Google Places) must be stored securely on the server-side component and never exposed in the frontend code.
*   The admin approval process for new locations is a critical safety feature.

### 5. **Success Metrics**

The success of the app will be measured by:
*   **Engagement:** Number of weekly active users.
*   **Connection:** Number of successfully completed meetings per week/month.
*   **Adoption:** Percentage of the men's group that has created a profile.
*   **Qualitative Feedback:** Testimonials from men about the new friendships they have formed.

### 6. **Future Considerations (Version 2.0)**

*   **Group Meetings:** Allow a user to post a timeslot for up to 3 or 4 men.
*   **Post-Meeting Feedback:** A simple, private feedback mechanism.
*   **Conversation Themes:** Allow the user posting the time to suggest an optional theme (e.g., "Faith & Work," "Family," "Hobbies").
*   **Push Notifications:** A native app version could supplement SMS with push notifications.

---
