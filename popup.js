document.addEventListener('DOMContentLoaded', () => {
    const windowList = document.getElementById('windowList');
    const groupList = document.getElementById('groupList');
    const sessionList = document.getElementById('sessionList');
    const saveGroupBtn = document.getElementById('saveGroupBtn');
    const saveSessionBtn = document.getElementById('saveSessionBtn');
    const clearAllTabsBtn = document.getElementById('clearAllTabsBtn');
    const clearAllGroupsBtn = document.getElementById('clearAllGroupsBtn');
    const clearAllSessionsBtn = document.getElementById('clearAllSessionsBtn');

    // Fetch the current window ID
    async function currentWindow() {
        try {
            const window = await chrome.windows.getCurrent();
            return window.id;
        } catch (error) {
            console.error('Error fetching current window:', error);
        }
    }

    //Get all windows
    async function getAllWindows() {
        try {
            const windows = await chrome.windows.getAll({ populate: true });
            return windows;
        } catch (error) {
            console.error('Error fetching windows:', error);
        }
    }

    async function deleteWindow(windowId) {
        try {
            await chrome.windows.remove(windowId);
        } catch (error) {
            console.error('Error deleting window:', error);
        }
    }

    async function deleteTab(tabId) {
        try {
            await chrome.tabs.remove(tabId);
        }catch (error) {
            console.error('Error deleting tab:', error);
        }
    }

    async function getTabsInGroup(groupId) {
        try {
            const tabs = await chrome.tabs.query({
                groupId: groupId,
            });
            return tabs;
        }catch (error) {
            console.error('Error getting tabs in group:', error);
        }
    }

    async function deleteGroup(tabIds) {
        try {
            console.log('We are deleting groups with tabs:', tabIds);
            await chrome.tabs.ungroup(tabIds);
        } catch (error){
            console.error('Error deleting group:', error);
        }
    }

    async function discardTab(tabId) {
        try {
            await chrome.tabs.discard(tabId);
        } catch (error) {
            console.error('error deactivating tab:', error);
        }
    }

    async function discardTabs(tabs) {
        try {
            for (const tab of tabs) {
                await discardTab(tab.id);
            }
        } catch (error) {
            console.error('Error deactivating tabs:', error);
        }
    }

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

    async function main() {
        try {
            const windowId = await currentWindow();
            const windows = await getAllWindows();
            await displayWindowTabs(windows, windowId);
            await displayTabGroups();
        } catch (error) {
            console.error('Main error:', error);
        }
        
    }

    //creating tab groups
    async function createAddGroup(tabsIds, groupId = null) {
        try {
            console.log(tabsIds);
            if (!groupId) {
                await chrome.tabs.group({
                    tabIds: tabsIds,
                })
            } else {
                await chrome.tabs.group({
                    tabIds: tabsIds,
                    groupId : groupId,
                })
            }
            
        } catch (error) {
            console.log('Error creating or adding to group:', error);
        }
    }

    //Get available groups
    async function getGroups() {
        try {
            const groups = await chrome.tabGroups.query({});
            return groups;
        } catch (error) {
            console.error('Error getting groups:', error);
        }
    }

    async function displayTabs(containers, containerName, list) {
        try {
            let containerMap = {};
                      
            
            for (const [index, container] of containers.entries()) {
                const selectedTabIds = [];
                const dynamicNameDiv = `${containerName}Div`;
                containerMap[dynamicNameDiv] = document.createElement('div');
                containerMap[dynamicNameDiv].className = `${containerName}`;

                const dynamicNameHeader = `${containerName}Header`;
                const dynamicTitle = document.createElement('span');

                containerMap[dynamicNameHeader] = document.createElement('div');
                containerMap[dynamicNameHeader].className = `${containerName}-header`;
                const tabs = [];
                if (containerName === 'window') {
                    tabs.push(...container.tabs);
                    const currentWindowId = await currentWindow();
                    dynamicTitle.textContent = container.id === currentWindowId ? 'Current Window' : `Window ${index + 1}`;
                } else if (containerName === 'group') {
                    const tabsInGroup = await getTabsInGroup(container.id);
                    tabs.push(...tabsInGroup);
                    dynamicTitle.textContent = container.title;
                }

                const toggleButton = document.createElement('button');
                toggleButton.innerHTML = '&#9660;'; // Unicode for down arrow
                toggleButton.className = 'toggle-button';
                toggleButton.onclick = () => {
                    tabListDiv.style.display = tabListDiv.style.display === 'none' ? 'block' : 'none';
                    toggleButton.innerHTML = tabListDiv.style.display === 'none' ? '&#9660;' : '&#9650;'; // Change arrow direction
                };

                const closeBtn = document.createElement('button');
                closeBtn.className = 'button-small';
                closeBtn.textContent = 'X';
                closeBtn.onclick = async () => {
                    if (containerName === 'window') {
                        await deleteWindow(container.id);
                    } else if (containerName === 'group') {
                        const tabIds = [];
                        tabs.forEach((tab) => {
                            tabIds.push(tab.id);
                            
                        });
                        console.log('tabids:', tabIds);
                        await deleteGroup(tabIds);
                    }
                    containerMap[dynamicNameDiv].remove();
                };

                const discardBtn = document.createElement('button');
                discardBtn.className = 'button-small';
                discardBtn.textContent = '-';
                discardBtn.onclick = async () => {
                    await discardTabs(tabs);
                };
                
                
                const moreButton = document.createElement('button');
                moreButton.innerHTML = '&#8942;'; // Unicode for more options
                moreButton.className = 'more-button';
                moreButton.style.display = 'none';

                const moreOptionsMenu = document.createElement('div');
                moreOptionsMenu.style.display = 'none';
                moreOptionsMenu.className = 'more-options-menu';
                moreOptionsMenu.innerHTML = `
                    <ul>
                        <li id="closeAllTabs">Close Selected Tabs</li>
                        <li id="groupselectedTabIds">Group Selected Tabs</li>
                        <li id="deactivateAllTabs">Deactivate Selected Tabs</li>
                    </ul>
                `;

                //moreButton.appendChild(moreOptionsMenu);

                moreButton.onclick = () => {
                    // Toggle the visibility of the options menu
                    moreOptionsMenu.style.display = moreOptionsMenu.style.display === 'none' ? 'block' : 'none';

                };

                moreOptionsMenu.querySelector('#closeAllTabs').addEventListener('click', async () => {
                    for (const tabId of selectedTabIds) {
                        await deleteTab(tabId);
                    }
                    containerMap[dynamicNameDiv].remove();
                });

                const selectedGroupList = moreOptionsMenu.querySelector('#groupselectedTabIds');
                const groups = await getGroups();
                const groupList = document.createElement('ul');
                groupList.style.display = 'none';
                groupList.className = 'more-options-menu';
               
                for (const group of groups) {
                    const listGroup = document.createElement('li');
                    //listGroup.id = group.id;
                    listGroup.textContent = group.title;
                    listGroup.addEventListener('click', async () => {
                        await createAddGroup(selectedTabIds, group.id);
                        moreOptionsMenu.style.display = 'none';
                    })
                    groupList.appendChild(listGroup);
                }
                const createGroup = document.createElement('li');
                createGroup.textContent = 'New Group';
                const inputDiv = document.createElement('div');
                inputDiv.style.display = 'none';
                inputDiv.className = 'more-options-menu';
                const inputText = document.createElement('input');
                inputText.type = 'text';
                inputText.id = 'groupName';
                inputText.name = 'groupName';

                const inputLabel = document.createElement('label');
                inputLabel.for = 'groupName';

                const selectColor = document.createElement('select');
                selectColor.name = 'color';
                const defaultColor = document.createElement('option');
                defaultColor.textContent = 'please choose color';
                defaultColor.value = '';

                inputDiv.appendChild(inputLabel);
                inputDiv.appendChild(inputText);
                inputDiv.appendChild(selectColor);
                selectColor.appendChild(defaultColor);

                createGroup.appendChild(inputDiv)

                const tabGroupColors = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
                for (const color of tabGroupColors) {
                    const colorDiv =  document.createElement('div');
                    colorDiv.classList.add('color');
                    colorDiv.style.backgroundColor = color;
                    colorDiv.textContent = ` ${color} `;

                    const colorOption = document.createElement('option');
                    colorOption.value = color;

                    colorOption.appendChild(colorDiv);
                    selectColor.appendChild(colorOption);
                }
                selectColor.addEventListener('change', () => {
                    selectColor.value = value;
                })
                createGroup.addEventListener('click', async () => {
                    await createAddGroup(selectedTabIds);
                    chrome.tabGroups.onCreated.addListener((group) => {
                        inputDiv.style.display = inputDiv.style.display === 'none' ? 'block' : 'none';
                        group.title = inputText.value;
                        group.color = selectColor.value;
                    })
                    inputDiv.style.display = 'none';
                })
                createGroup.appendChild(inputDiv);
                groupList.appendChild(createGroup);
                selectedGroupList.appendChild(groupList);

                selectedGroupList.addEventListener('click', async () => {
                   groupList.style.display = groupList.style.display === 'none' ? 'block' : 'none'; 
                });
    
                containerMap[dynamicNameHeader].appendChild(toggleButton);
                containerMap[dynamicNameHeader].appendChild(dynamicTitle);
                containerMap[dynamicNameHeader].appendChild(closeBtn);
                containerMap[dynamicNameHeader].appendChild(discardBtn);
                containerMap[dynamicNameHeader].appendChild(moreButton);
                containerMap[dynamicNameHeader].appendChild(moreOptionsMenu);
                containerMap[dynamicNameDiv].appendChild(containerMap[dynamicNameHeader]);

                const tabListDiv = document.createElement('div');
                tabListDiv.className = 'tab-list';
                tabListDiv.style.display = 'none'; // Start with tabs hidden
    
                
                tabs.forEach((tab) => {
                    const tabDiv = document.createElement('div');
                    tabDiv.className = 'tab';
                    
                    const checkBoxDiv = document.createElement('div');
                    const checkBox = document.createElement('input');
                    checkBoxDiv.className = 'box';
                    checkBox.type = 'checkbox';
                    checkBox.id = tab.id;
                    checkBox.name = 'Tabs';
                    //checkBox.value = tab;
                    
                    checkBox.addEventListener('change', () => {

                        if (checkBox.checked) {
                            selectedTabIds.push(tab.id);
                            moreButton.style.display = 'block';
                        } else {
                            const idx = selectedTabIds.indexOf(tab.id);
                            if (idx !== -1 ) {
                                selectedTabIds.splice(idx, 1);
                            }
                            if (selectedTabIds.length === 0) {
                                moreButton.style.display = 'none';

                            }
                            
                        }
                    })

                    checkBoxDiv.appendChild(checkBox);

                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'button-smal';
                    closeBtn.textContent = 'X';
                    closeBtn.onclick = async () => {
                        await deleteTab(tab.id);
                        tabDiv.remove();
                    };

                    const tabTitle = document.createElement('span');
                    tabTitle.textContent = tab.title;
    
                    tabDiv.appendChild(checkBoxDiv);
                    tabDiv.appendChild(tabTitle);
                    tabDiv.appendChild(closeBtn);
                    tabListDiv.appendChild(tabDiv);
                });

                containerMap[dynamicNameDiv].appendChild(tabListDiv);
                list.appendChild(containerMap[dynamicNameDiv]);
            }
        } catch (error) {
            console.error('error displaying tabs:', error);
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


    main();
    /*/ Load saved tab groups
    getGroups((tabGroups) => {
        if (tabGroups) {
            tabGroups.forEach((group) => {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'tab-group';
                groupDiv.textContent = group.name;
                const openBtn = document.createElement('button');
                openBtn.className = 'button-small';
                openBtn.textContent = 'Open';
                openBtn.onclick = () => openTabs(group.tabs);
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'button-small';
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = () => {
                    deleteTabGroup(group.name);
                    groupDiv.remove();
                };
                groupDiv.appendChild(openBtn);
                groupDiv.appendChild(deleteBtn);
                groupList.appendChild(groupDiv);
            });
        }
    });

    // Load saved sessions
    getSessions((sessions) => {
        if (sessions) {
            sessions.forEach((session) => {
                const sessionDiv = document.createElement('div');
                sessionDiv.className = 'session';
                sessionDiv.textContent = session.name;
                const openBtn = document.createElement('button');
                openBtn.className = 'button-small';
                openBtn.textContent = 'Open';
                openBtn.onclick = () => openTabs(session.tabs);
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'button-small';
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = () => {
                    deleteSession(session.name);
                    sessionDiv.remove();
                };
                sessionDiv.appendChild(openBtn);
                sessionDiv.appendChild(deleteBtn);
                sessionList.appendChild(sessionDiv);
            });
        }
    });

    // Save current tabs as a group
    saveGroupBtn.onclick = () => {
        chrome.tabs.query({}, (tabs) => {
            const tabGroup = {
                name: `Group ${new Date().toLocaleString()}`,
                tabs: tabs.map(tab => ({ title: tab.title, url: tab.url }))
            };
            saveTabGroup(tabGroup);
        });
    };

    // Save current session
    saveSessionBtn.onclick = () => {
        chrome.tabs.query({}, (tabs) => {
            const session = {
                name: `Session ${new Date().toLocaleString()}`,
                tabs: tabs.map(tab => ({ title: tab.title, url: tab.url }))
            };
            saveSession(session);
        });
    };

    // Clear all tabs
    clearAllTabsBtn.onclick = () => {
        chrome.tabs.query({}, (tabs) => {
            const tabIds = tabs.map(tab => tab.id);
            chrome.tabs.remove(tabIds);
            tabList.innerHTML = '';
        });
    };

    // Clear all groups
    clearAllGroupsBtn.onclick = () => {
        chrome.storage.sync.set({ tabGroups: [] }, () => {
            groupList.innerHTML = '';
        });
    };

    // Clear all sessions
    clearAllSessionsBtn.onclick = () => {
        chrome.storage.sync.set({ sessions: [] }, () => {
            sessionList.innerHTML = '';
        });
    };
});

// Function to save tab groups
function saveTabGroup(tabGroup) {
    getGroups((tabGroups) => {
        tabGroups = tabGroups || [];
        tabGroups.push(tabGroup);
        chrome.storage.sync.set({ tabGroups: tabGroups }, () => {
            console.log('Tab group saved');
            location.reload();
        });
    });
}

// Function to get tab groups
function getGroups(callback) {
    chrome.storage.sync.get(['tabGroups'], (result) => {
        callback(result.tabGroups);
    });
}

// Function to delete a tab group
function deleteTabGroup(groupName) {
    getGroups((tabGroups) => {
        tabGroups = tabGroups.filter(group => group.name !== groupName);
        chrome.storage.sync.set({ tabGroups: tabGroups }, () => {
            console.log('Tab group deleted');
        });
    });
}

// Function to save sessions
function saveSession(session) {
    getSessions((sessions) => {
        sessions = sessions || [];
        sessions.push(session);
        chrome.storage.sync.set({ sessions: sessions }, () => {
            console.log('Session saved');
            location.reload();
        });
    });
}

// Function to get sessions
function getSessions(callback) {
    chrome.storage.sync.get(['sessions'], (result) => {
        callback(result.sessions);
    });
}

// Function to delete a session
function deleteSession(sessionName) {
    getSessions((sessions) => {
        sessions = sessions.filter(session => session.name !== sessionName);
        chrome.storage.sync.set({ sessions: sessions }, () => {
            console.log('Session deleted');
        });
    });
}

// Function to open tabs from a list of URLs
function openTabs(tabs) {
    tabs.forEach((tab) => {
        chrome.tabs.create({ url: tab.url });
    });*/
})
