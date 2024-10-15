# Tab Manager Chrome Extension

## Overview
The **Tab Manager** Chrome extension is designed to help users effectively manage their browser tabs, groups, and sessions. It allows you to organize tabs into groups, save entire browsing sessions, reopen them later, and even discard inactive tabs to save system resources. The extension is lightweight, user-friendly, and aims to streamline the way you navigate and organize your browsing workflow.

### Key Features:
- **Manage Browser Tabs**: View and manage open tabs across different windows.
- **Group Tabs**: Create, modify, and delete tab groups for better organization.
- **Save Browsing Sessions**: Save and reload entire sessions, including all open windows, tabs, and tab groups.
- **Discard Inactive Tabs**: Deactivate tabs that are not currently in use to save memory.

## Installation
This is a Chrome extension and requires Google Chrome browser to run. To install the extension:
1. Clone or download the repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the root folder of the downloaded repository.

The extension should now appear in your toolbar, and you can access it by clicking on the **Tab Manager** icon.

## Usage
Once the extension is installed, click on the **Tab Manager** icon to open the popup. The popup includes the following sections:

- **Open Tabs**: Displays all currently open tabs categorized by windows.
- **Tab Groups**: Displays all saved tab groups for easy access and management.
- **Saved Sessions**: Allows you to save the current browsing session and load previously saved sessions.

### Buttons and Controls
- **Save Current Session**: Saves all open windows, tabs, and tab groups into a session.
- **Open**: Opens a saved session, restoring all windows, tabs, and groups.
- **Delete**: Deletes a saved session from the storage.
- **Toggle Dropdown**: Shows or hides the tabs for a particular window or group.
- **Discard Tab**: Deactivates a tab to save memory.
- **Close Tab/Group/Window**: Closes the selected tab, group, or window.

### UI Overview
The UI is simple and intuitive. The following HTML structure outlines the major components:

- **Header**: Displays the extension title and icon.
- **Open Tabs Section**: Lists all currently open tabs across different browser windows.
- **Tab Groups Section**: Displays any groups of tabs that have been created or saved.
- **Saved Sessions Section**: Allows the user to save and load sessions.
- **Footer**: Contains credits for the icons used.

## Project Structure
The project contains the following files:

1. **index.html**
   - Contains the main popup UI layout for the extension. It includes sections for displaying open tabs, tab groups, and saved sessions.
   - Loads the `popup.js` script to handle user interactions in the extension popup.

2. **styles.css**
   - Provides the styling for the entire UI, including headers, buttons, sections, and individual tab elements.
   - Ensures a consistent visual theme, using jungle green and light grey colors to provide a clean look.

3. **popup.js**
   - Controls the popup's logic for displaying windows, tab groups, and saved sessions.
   - Handles the DOM interactions and button events such as saving sessions, deleting sessions, and grouping tabs.

4. **utils.js**
   - Contains helper functions for interacting with the Chrome API, such as getting all windows, tabs, and groups, saving sessions, deleting sessions, and discarding inactive tabs.
   - Functions include: `getAllWindows()`, `getGroups()`, `getSessions()`, `saveSession()`, `deleteSession()`, `openSavedSession()` among others.

5. **manifest.json**
   - Defines the extension's metadata, including permissions (e.g., tabs, storage, tabGroups) and the popup HTML file.
   - Configured as a **Manifest V3** extension to comply with the latest Chrome extension requirements.

6. **background.js**
   - Contains a simple listener for the extension installation event, logging a message when the extension is first installed.

## Permissions Explained
The extension requests several permissions to manage the tabs effectively:
- **"tabs"**: To interact with and manage tabs (e.g., get, create, remove).
- **"storage"**: To save and retrieve session information for future use.
- **"tabGroups"**: To create, modify, and delete tab groups.
- **"activeTab"**: To interact with the currently active tab.
- **"background"**: For background tasks like maintaining tab data.

## Scripts Overview

### utils.js
Contains utility functions that interact with the Chrome API:
- **`currentWindow()`**: Fetches the current window ID.
- **`getAllWindows()`**: Retrieves all browser windows along with their tabs.
- **`getGroups()`**: Retrieves all existing tab groups.
- **`saveSession(session)`**: Saves the given session (windows, tabs, groups) to Chrome storage.
- **`openSavedSession(session)`**: Opens a saved session by recreating the windows, tabs, and groups.

### popup.js
This script is executed when the popup is opened. It:
- Displays current tabs and windows using `displayWindowTabs()`.
- Loads tab groups and saved sessions.
- Handles user interactions like saving the current session (`saveCurrentSession()`), deleting sessions (`deleteSession()`), and opening saved sessions (`openSavedSession()`).

## How to Save and Load Sessions
1. **Saving a Session**:
   - Click on the "Save Current Session" button. This action will save the current windows, tabs, and groups.
   - The session will appear in the "Saved Sessions" section for future use.

2. **Loading a Session**:
   - Go to the "Saved Sessions" section in the popup.
   - Click the "Open" button next to the session you want to reload. This will recreate the saved windows, tabs, and groups.

## Future Enhancements
The following features may be added to enhance the extension:
1. **Session Renaming**: Allow users to rename saved sessions for better identification.
2. **Automatic Session Backup**: Implement a feature to periodically back up sessions automatically.
3. **Session Tags**: Users can tag sessions for easy filtering and searchability.
4. **Enhanced Error Handling**: More robust error handling for Chrome API failures, including user prompts.

## Known Limitations
- **Chrome Storage Limits**: The extension uses Chrome's storage, which has a limited quota. Saving a large number of sessions or many tabs in a session could exceed the quota.
- **Session Reloading Issues**: Tabs that require a login or session cookies may not restore properly without requiring user authentication again.
- **Tab Group ID Reuse**: Chrome may reuse tab group IDs, which can sometimes cause issues when restoring sessions if other tab groups are already present.

## Development and Contribution
If you'd like to contribute to this project:
1. Fork the repository and create your branch.
2. Make your changes, ensuring all functionality remains intact.
3. Submit a pull request for review.

### Dependencies
- **Chrome API**: The extension relies heavily on the Chrome Extensions API to manage tabs, groups, and sessions.

## Credits
- **Icons**: Tab icons are created by [Freepik - Flaticon](https://www.flaticon.com/free-icons/tab).

## License
This project is open-source and licensed under the MIT License.

---

Thank you for using the **Tab Manager** extension. We hope it helps simplify your browsing experience by allowing easy organization and management of your tabs and sessions.
