import {
    currentWindow,
    getAllWindows,
    getGroups,
    displayTabs,
    getSessions,
    saveCurrentSession,
    deleteSession,
    openSavedSession
} from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const windowList = document.getElementById('windowList');
    const groupList = document.getElementById('groupList');
    const sessionList = document.getElementById('sessionList');
    const saveSessionBtn = document.getElementById('saveSessionBtn');


    // Display windows and their tabs with dropdown functionality
    async function displayWindowTabs(windows, currentWindowId) {
        try {
            windows.sort((a, b) => {
                if (a.id === currentWindowId) {
                    return -1; // Make sure current window goes first
                }
                if (b.id === currentWindowId) {
                    return 1;  // Current window stays ahead of others
                }
                return 0; // Leave other elements in the original order
            });

            await displayTabs(windows, 'window', windowList);

        } catch (error) {
            console.error('Error:', error);
        }

    }

    async function displayTabGroups() {
        try {
            const groups = await getGroups();
            await displayTabs(groups, 'group', groupList);
        } catch (error) {
            console.error('Error displaying groups:', error);
        }
    }

    async function main() {
        try {
            const windowId = await currentWindow();
            const windows = await getAllWindows();
            await displayWindowTabs(windows, windowId);
            await displayTabGroups();
            await loadSavedSessions(sessionList);
        } catch (error) {
            console.error('Main error:', error);
        }

    }

    // Function to load saved sessions and display them in the UI
    async function loadSavedSessions(list) {
        try {
            // Get the saved sessions from Chrome storage
            const sessions = await getSessions();

            // Clear any existing sessions in the list
            list.innerHTML = '';

            // Check if there are any saved sessions
            if (!sessions || sessions.length === 0) {
                const noSessionsMsg = document.createElement('div');
                noSessionsMsg.textContent = 'No saved sessions available.';
                list.appendChild(noSessionsMsg);
                return; // Exit if no sessions are available
            }

            // Iterate through each saved session and add it to the UI
            sessions.forEach(session => {
                const sessionDiv = document.createElement('div');
                sessionDiv.className = 'session';
                sessionDiv.textContent = session.name;

                // Create the Open button
                const openBtn = document.createElement('button');
                openBtn.className = 'button-small';
                openBtn.textContent = 'Open';
                openBtn.onclick = () => openSavedSession(session); // Call a function to open the session

                // Create the Delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'button-small';
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = async () => {
                    await deleteSession(session.name); // Delete the session from storage
                    sessionDiv.remove(); // Remove the session from the UI
                };

                // Append the buttons to the session div
                sessionDiv.appendChild(openBtn);
                sessionDiv.appendChild(deleteBtn);
                list.appendChild(sessionDiv); // Add the session div to the session list container
            });
        } catch (error) {
            console.error('Error loading sessions:', error);

            // Display an error message to the user
            const errorMsg = document.createElement('div');
            errorMsg.textContent = 'An error occurred while loading sessions. Please try again.';
            list.appendChild(errorMsg);
        }
    }

    saveSessionBtn.onclick = async () => {
        console.log('currently clicking save sesison');
        await saveCurrentSession();
    }

    main();
})
