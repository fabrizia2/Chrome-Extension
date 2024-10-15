// Fetch the current window ID
export async function currentWindow() {
  try {
    const window = await chrome.windows.getCurrent();
    return window.id;
  } catch (error) {
    console.error('Error fetching current window:', error);
  }
}

//Get all windows
export async function getAllWindows() {
  try {
    const windows = await chrome.windows.getAll({ populate: true });
    return windows;
  } catch (error) {
    console.error('Error fetching windows:', error);
  }
}

export async function deleteWindow(windowId) {
  try {
    await chrome.windows.remove(windowId);
  } catch (error) {
    console.error('Error deleting window:', error);
  }
}

export async function deleteTab(tabId) {
  try {
    await chrome.tabs.remove(tabId);
  } catch (error) {
    console.error('Error deleting tab:', error);
  }
}

export async function getTabsInGroup(groupId) {
  try {
    const tabs = await chrome.tabs.query({
      groupId: groupId,
    });
    return tabs;
  } catch (error) {
    console.error('Error getting tabs in group:', error);
  }
}

export async function deleteGroup(tabIds) {
  try {
    await chrome.tabs.ungroup(tabIds);
  } catch (error) {
    console.error('Error deleting group:', error);
  }
}

export async function discardTab(tabId) {
  try {
    await chrome.tabs.discard(tabId);
  } catch (error) {
    console.error('error deactivating tab:', error);
  }
}

export async function discardTabs(tabs) {
  try {
    for (const tab of tabs) {
      await discardTab(tab);
    }
  } catch (error) {
    console.error('Error deactivating tabs:', error);
  }
}

//creating tab groups
export async function createAddGroup(tabsIds, groupId = null, groupTitle = null, groupColor = null) {
  try {
    if (!groupId) {
      const groupId = await chrome.tabs.group({
        tabIds: tabsIds,
      })

      await chrome.tabGroups.update(groupId, {
        title: groupTitle,
        color: groupColor,
      });

    } else {
      await chrome.tabs.group({
        tabIds: tabsIds,
        groupId: groupId,
      })
    }

  } catch (error) {
    console.log('Error creating or adding to group:', error);
  }
}

//Get available groups
export async function getGroups() {
  try {
    const groups = await chrome.tabGroups.query({});
    return groups;
  } catch (error) {
    console.error('Error getting groups:', error);
  }
}

export async function displayTabs(containers, containerName, list) {
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
          await deleteGroup(tabIds);
        }
        containerMap[dynamicNameDiv].remove();
      };

      const discardBtn = document.createElement('button');
      discardBtn.className = 'button-small';
      discardBtn.textContent = '-';
      discardBtn.onclick = async () => {
        const tabsIds = [];
        tabs.forEach((tab) => {
          tabsIds.push(tab.id);
        })
        await discardTabs(tabsIds);
      };


      const moreButton = document.createElement('button');
      moreButton.innerHTML = '&#8942;'; // Unicode for more options
      moreButton.className = 'more-button';
      moreButton.style.display = 'none';

      const moreOptionsMenu = document.createElement('div');
      moreOptionsMenu.style.display = 'none';
      moreOptionsMenu.className = 'more-options-menu';
      if (containerName === 'window') {
        moreOptionsMenu.innerHTML = `
                  <ul>
                      <li id="closeAllTabs">Close Selected Tabs</li>
                      <li id="groupselectedTabIds">Group Selected Tabs</li>
                      <li id="deactivateAllTabs">Deactivate Selected Tabs</li>
                  </ul>
              `;
      } else if (containerName === 'group') {
        moreOptionsMenu.innerHTML = `
                  <ul>
                      <li id="closeAllTabs">Close Selected Tabs</li>
                      <li id="groupselectedTabIds">Move to another group</li>
                      <li id="deactivateAllTabs">Deactivate Selected Tabs</li>
                      <li id="removeselectedTabIds">Remove from group</li>
                  </ul>
              `;
        moreOptionsMenu.querySelector('#removeselectedTabIds').addEventListener('click', async () => {
          await deleteGroup(selectedTabIds);
        });
      }

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

      moreOptionsMenu.querySelector('#deactivateAllTabs').addEventListener('click', async () => {
        await discardTabs(selectedTabIds);
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

      createGroup.addEventListener('click', () => {
        inputDiv.style.display = 'block';
        groupList.style.display = groupList.style.display === 'none' ? 'block' : 'none';
      });

      const inputDiv = document.createElement('div');
      inputDiv.style.display = 'none';
      inputDiv.className = 'more-options-menu';

      const inputText = document.createElement('input');
      inputText.type = 'text';
      inputText.id = 'groupName';
      inputText.name = 'groupName';
      inputText.placeholder = 'Enter Group Name';

      const selectColor = document.createElement('select');
      selectColor.name = 'color';

      const defaultColor = document.createElement('option');
      defaultColor.textContent = 'please choose color';
      defaultColor.value = '';

      selectColor.appendChild(defaultColor);

      const tabGroupColors = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
      tabGroupColors.forEach((color) => {
        const colorOption = document.createElement('option');
        colorOption.value = color;
        colorOption.textContent = color.charAt(0).toUpperCase() + color.slice(1);
        selectColor.appendChild(colorOption);
      });

      inputDiv.appendChild(inputText);
      inputDiv.appendChild(selectColor);

      const submitGroupBtn = document.createElement('button');
      submitGroupBtn.textContent = 'Create Group';
      submitGroupBtn.className = 'button-small';
      submitGroupBtn.onclick = async () => {
        const groupName = inputText.value;
        const groupColor = selectColor.value;
        await createAddGroup(selectedTabIds, null, groupName, groupColor);
        inputDiv.style.display = 'none';
      };

      inputDiv.appendChild(submitGroupBtn);

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
        tabDiv.id = tab.id;

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
            if (idx !== -1) {
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

// Function to get sessions
export async function getSessions() {
  try {
    const result = await chrome.storage.sync.get('sessions');
    return result.sessions || []; // Return the sessions array or an empty array if it doesn't exist
  } catch (error) {
    console.error('Error getting sessions:', error);
    return [];
  }
}

// Function to save sessions
export async function saveSession(newSession) {
  try {
    // Retrieve existing sessions
    const sessions = await getSessions();
    sessions.push(newSession); // Append the new session to the list

    // Save updated sessions back to storage
    await chrome.storage.sync.set({ sessions: sessions });
    console.log('Session saved:', newSession.name);
  } catch (error) {
    console.error('Error saving session:', error);
  }
}


export async function saveCurrentSession() {
  try {
    // Get all open windows with their tabs
    const windows = await getAllWindows();

    // Get all tab groups
    const groups = await getGroups();

    // Create a session object with current details
    const session = {
      name: `Session ${new Date().toLocaleString()}`,
      windows: windows.map(window => ({
        id: window.id,
        tabs: window.tabs.map(tab => ({
          title: tab.title,
          url: tab.url,
        })),
      })),
      groups: groups.map(group => ({
        id: group.id,
        title: group.title,
        color: group.color,
        tabIds: group.tabIds,
      }))
    };

    // Save the new session
    await saveSession(session);

    console.log('Current session saved:', session.name);
  } catch (error) {
    console.error('Error Saving session:', error);
  }
}

// Function to delete a saved session by its name
export async function deleteSession(sessionName) {
  try {
    // Retrieve existing sessions from Chrome storage
    const sessions = await getSessions();

    // Filter out the session that matches the provided name
    const updatedSessions = sessions.filter(session => session.name !== sessionName);

    // Save the updated list back to storage
    await chrome.storage.sync.set({ sessions: updatedSessions });

    console.log(`Session "${sessionName}" deleted successfully.`);
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}

// Function to open a saved session
export async function openSavedSession(session) {
  try {
    // Iterate over each saved window in the session
    for (const savedWindow of session.windows) {
      // Create a new Chrome window for each saved window
      const createdWindow = await chrome.windows.create({
        focused: true, // The newly created window will be focused
      });

      // Iterate over each tab in the saved window and create it in the newly created Chrome window
      for (const tab of savedWindow.tabs) {
        await chrome.tabs.create({
          url: tab.url,
          windowId: createdWindow.id,
        });
      }
    }

    // Iterate over each group saved in the session
    for (const group of session.groups) {
      // Retrieve the tabs that were saved in this group
      const createdTabs = await chrome.tabs.query({
        url: group.tabIds.map(tabId => session.windows.flatMap(win => win.tabs).find(tab => tab.id === tabId)?.url).filter(url => url),
      });

      // Create a group with the tabs
      if (createdTabs.length > 0) {
        const createdGroupId = await chrome.tabs.group({
          tabIds: createdTabs.map(tab => tab.id),
        });

        // Set group properties (like title and color)
        await chrome.tabGroups.update(createdGroupId, {
          title: group.title,
          color: group.color,
        });
      }
    }

    console.log(`Session "${session.name}" opened successfully.`);
  } catch (error) {
    console.error('Error opening saved session:', error);
  }
}
