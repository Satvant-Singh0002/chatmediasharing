const API_URL = 'http://localhost:3000';

const usersList = document.getElementById('usersList');
const searchUser = document.getElementById('searchUser');
const groupNameInput = document.getElementById('groupName');
const selectedCount = document.getElementById('selectedCount');
const createBtn = document.getElementById('createBtn');
const backBtn = document.getElementById('backBtn');
const groupError = document.getElementById('groupError');

const loggedUser = Number(localStorage.getItem('loggedUser'));

let allUsers = [];                 // all users except logged-in user
const selectedUsers = new Set();   // selected user ids

// Back to chats
backBtn.addEventListener('click', () => {
    window.location.href = 'users.html';
});

function showError(message) {
    groupError.textContent = message;
}

// Fetch users from database
async function loadUsers() {
    try {
        const response = await axios.get(`${API_URL}/user/getAllUsers`);
        allUsers = response.data.filter(
            user => Number(user.id) !== loggedUser
        );
        renderUsers(allUsers);
    } catch (error) {
        console.log('Error fetching users:', error);
        showError('Failed to load users');
    }
}

// Render users with checkbox
function renderUsers(users) {
    usersList.innerHTML = '';

    if (users.length === 0) {
        usersList.innerHTML =
            '<p style="padding:20px;text-align:center;color:#667781;">No users found</p>';
        return;
    }

    users.forEach(user => {
        const isSelected = selectedUsers.has(Number(user.id));

        const userItem = document.createElement('div');
        userItem.className = 'user-item' + (isSelected ? ' selected' : '');

        userItem.innerHTML = `
            <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
            <div class="user-info">
                <h3></h3>
            </div>
            <input type="checkbox" class="user-checkbox" ${isSelected ? 'checked' : ''}>
        `;

        // textContent is used so names can't inject HTML
        userItem.querySelector('h3').textContent = user.name;

        const checkbox = userItem.querySelector('.user-checkbox');

        const toggle = (checked) => {
            const id = Number(user.id);
            if (checked) {
                selectedUsers.add(id);
            } else {
                selectedUsers.delete(id);
            }
            userItem.classList.toggle('selected', checked);
            selectedCount.textContent = selectedUsers.size;
            showError('');
        };

        // Click on the checkbox itself
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            toggle(checkbox.checked);
        });

        // Click anywhere on the row
        userItem.addEventListener('click', () => {
            checkbox.checked = !checkbox.checked;
            toggle(checkbox.checked);
        });

        usersList.appendChild(userItem);
    });
}

// Search filter (selection is kept while searching)
searchUser.addEventListener('input', () => {
    const text = searchUser.value.trim().toLowerCase();
    const filtered = allUsers.filter(user =>
        user.name.toLowerCase().includes(text)
    );
    renderUsers(filtered);
});

// Create group
createBtn.addEventListener('click', async () => {
    const groupName = groupNameInput.value.trim();

    if (!groupName) {
        showError('Please enter a group name');
        return;
    }

    if (selectedUsers.size < 1) {
        showError('Please select at least 1 user');
        return;
    }

    // logged-in user is always part of the group
    const members = [...selectedUsers, loggedUser];

    try {
        createBtn.disabled = true;
        createBtn.textContent = 'Creating...';

        // Backend (groupController) "groupName" key expect karta hai
        await axios.post(`${API_URL}/group/createGroup`, {
            groupName: groupName,
            createdBy: loggedUser,
            members
        });

        // Group ban gaya -> chats page par jao, wahan users ke saath group bhi dikhega
        window.location.href = 'users.html';
    } catch (error) {
        console.log('Error creating group:', error);
        showError(
            error.response?.data?.message || 'Failed to create group'
        );
        createBtn.disabled = false;
        createBtn.textContent = 'Create Group';
    }
});

loadUsers();