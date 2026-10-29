
const socket = io('http://localhost:3000');

// ---------- DOM elements ----------
const usersList = document.getElementById('usersList');
const emptyChat = document.getElementById('emptyChat');
const chatHeader = document.getElementById('chatHeader');
const selectedUserName = document.getElementById('selectedUserName');
const selectedUserAvatar = document.getElementById('selectedUserAvatar');
const messagesContainer = document.getElementById('messagesContainer');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const searchUser = document.getElementById('searchUser');


const mediaPreview = document.getElementById('mediaPreview');
const previewImage = document.getElementById('previewImage');
const previewFileName = document.getElementById('previewFileName');
const removeMediaBtn = document.getElementById('removeMediaBtn');

// userId -> name (group chat mein sender ka naam dikhane ke liye)
let usersMap = {};

// ---------- Users list ----------
async function getAllUsers() {
    try {
        const loggedUser = Number(localStorage.getItem('loggedUser'));
        console.log('loggedUser', loggedUser);

        const response = await axios.get('http://localhost:3000/user/getAllUsers');
        console.log('API response:', response.data);

        const users = response.data;

        users.forEach(user => {
            usersMap[user.id] = user.name;
        });

        const filteredUsers = users.filter(
            user => Number(user.id) !== loggedUser
        );
        console.log('filteredUser', filteredUsers);

        usersList.innerHTML = '';

        filteredUsers.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';

            userItem.innerHTML = `
                <div class="user-avatar">
                    ${user.name.charAt(0).toUpperCase()}
                </div>
                <div class="user-info">
                    <h3></h3>
                </div>
            `;
            userItem.querySelector('h3').textContent = user.name;

            // Click on a user
            userItem.addEventListener('click', () => {
                setActiveItem(userItem);
                localStorage.setItem('selectedUser', user.id);
                openChat(user);
            });

            usersList.appendChild(userItem);
        });
    } catch (error) {
        console.log('Error fetching users:', error);
    }
}

// ---------- Groups list (users ke neeche) ----------
async function getMyGroups() {
    try {
        const loggedUser = Number(localStorage.getItem('loggedUser'));

        const response = await axios.get(
            `http://localhost:3000/group/getMyGroups/${loggedUser}`
        );
        console.log('groups response:', response.data);

        const groups = response.data.groups || [];

        groups.forEach(group => {
            const roomId = `group_${group.id}`;

            // group room join, taaki live messages mile
            socket.emit('join_room', roomId);

            const groupItem = document.createElement('div');
            groupItem.className = 'user-item';

            groupItem.innerHTML = `
                <div class="user-avatar">👥</div>
                <div class="user-info">
                    <h3></h3>
                    <p>Group</p>
                </div>
            `;
            groupItem.querySelector('h3').textContent = group.groupName;

            groupItem.addEventListener('click', () => {
                setActiveItem(groupItem);
                openGroupChat(group);
            });

            usersList.appendChild(groupItem);
        });
    } catch (error) {
        console.log('Error fetching groups:', error);
    }
}

// selected chat highlight
function setActiveItem(item) {
    document
        .querySelectorAll('.users-list .user-item')
        .forEach(el => el.classList.remove('active'));
    item.classList.add('active');
}

// ---------- Open chats ----------
function showChatArea(title, avatarText) {
    // Hide the initial screen
    emptyChat.style.display = 'none';

    // Show selected user's / group's details
    chatHeader.style.display = 'flex';
    selectedUserName.textContent = title;
    selectedUserAvatar.textContent = avatarText;

    // Clear previous messages
    messagesContainer.innerHTML = '';

    // Show the chat area
    messagesContainer.style.display = 'flex';
    messageForm.style.display = 'flex';
}

async function openChat(user) {
    const loggedUser = localStorage.getItem('loggedUser');
    const selectedUser = localStorage.getItem('selectedUser');
    const roomId = [loggedUser, selectedUser].sort().join('_');

    localStorage.setItem('roomId', roomId);
    socket.emit('join_room', roomId);
    console.log('roomId', roomId);

    showChatArea(user.name, user.name.charAt(0).toUpperCase());

    console.log('Selected user:', user.id);

    await loadMessages(roomId);
}

async function openGroupChat(group) {
    const roomId = `group_${group.id}`;

    localStorage.setItem('roomId', roomId);
    localStorage.removeItem('selectedUser');
    socket.emit('join_room', roomId);
    console.log('roomId', roomId);

    showChatArea(group.groupName, '👥');

    await loadMessages(roomId);
}

// ---------- Search (users + groups dono) ----------
searchUser.addEventListener('input', () => {
    const text = searchUser.value.trim().toLowerCase();

    document.querySelectorAll('.users-list .user-item').forEach(item => {
        const name = item.querySelector('h3').textContent.toLowerCase();
        item.style.display = name.includes(text) ? 'flex' : 'none';
    });
});

// ---------- Socket connection ----------
socket.on('connect', () => {
    console.log('socket connected', socket.id);
});

socket.on('connect_error', (error) => {
    console.log('Connection error', error.message);
});

socket.on('disconnect', () => {
    console.log('socket disconnected');
});

// ---------- Send message ----------
// messageForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
   
//     const file = mediaInput.files[0];

//     // If media is selected, send media
//     if (file) {
//         await sendMedia();
//         return;
//     }
//     const message = messageInput.value.trim();
//     if (!message) {
//         return;
//     }

//     const senderId = localStorage.getItem('loggedUser');
//     const roomId = localStorage.getItem('roomId');

//     socket.emit('personal_message', {
//         senderId,
//         roomId,
//         message
//     });

//     messageInput.value = '';
// });

messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = mediaInput.files[0];

    if (file) {
        await sendMedia();
        mediaPreview.style.display = 'none';
        previewImage.removeAttribute('src');
        previewFileName.textContent = '';
        return;
    }

    const message = messageInput.value.trim();

    if (!message) return;

    socket.emit('personal_message', {
        senderId: Number(localStorage.getItem('loggedUser')),
        roomId: localStorage.getItem('roomId'),
        message
    });

    messageInput.value = '';
});

// ---------- Message element (group mein sender ka naam bhi) ----------
// function createMessageElement(msg, roomId) {
//     const loggedUser = Number(localStorage.getItem('loggedUser'));
//     const isMine = Number(msg.senderId) === loggedUser;

//     const el = document.createElement('div');
//     el.classList.add(isMine ? 'sent-message' : 'received-message');

//     if (roomId.startsWith('group_') && !isMine) {
//         const name = document.createElement('small');
//         name.textContent = usersMap[msg.senderId] || 'User';
//         name.style.cssText =
//             'display:block;color:#008f83;font-weight:bold;margin-bottom:3px;';
//         el.appendChild(name);
//     }

//     const text = document.createElement('span');
//     text.textContent = msg.message;
//     el.appendChild(text);

//     return el;
// }
async function createMessageElement(msg, roomId) {
    const loggedUser = Number(localStorage.getItem('loggedUser'));
    const isMine = Number(msg.senderId) === loggedUser;

    const el = document.createElement('div');
    el.classList.add(isMine ? 'sent-message' : 'received-message');

    if (roomId.startsWith('group_') && !isMine) {
        const name = document.createElement('small');
        name.textContent = usersMap[msg.senderId] || 'User';
        name.style.cssText =
            'display:block;color:#008f83;font-weight:bold;margin-bottom:3px;';
        el.appendChild(name);
    }

    if (msg.mediaUrl && msg.mediaType) {
        const response = await axios.get(
            'http://localhost:3000/media/url',
            { params: { key: msg.mediaUrl } }
        );

        const url = response.data.url;
        let media;

        if (msg.mediaType.startsWith('image/')) {
            media = document.createElement('img');
            media.src = url;
            media.alt = 'Shared image';
            media.style.cssText =
                'max-width:250px;max-height:250px;display:block;border-radius:8px;';
        } else if (msg.mediaType.startsWith('video/')) {
            media = document.createElement('video');
            media.src = url;
            media.controls = true;
            media.style.cssText = 'max-width:250px;display:block;';
        } else if (msg.mediaType.startsWith('audio/')) {
            media = document.createElement('audio');
            media.src = url;
            media.controls = true;
        } else {
            media = document.createElement('a');
            media.href = url;
            media.textContent = 'Download / Open document';
            media.target = '_blank';
            media.rel = 'noopener noreferrer';
        }

        el.appendChild(media);
    } else if (msg.message) {
        const text = document.createElement('span');
        text.textContent = msg.message;
        el.appendChild(text);
    }

    return el;
}

// ---------- Receive message ----------
socket.on('received_message', async(data) => {
    console.log('Message received from', data);

    const roomId = localStorage.getItem('roomId');

    // Check if message belongs to currently open chat
    if (data.roomId !== roomId) {
        return;
    }

    // messagesContainer.appendChild(createMessageElement(data, roomId));
    // messagesContainer.scrollTop = messagesContainer.scrollHeight;
    const element = await createMessageElement(data, roomId);
    messagesContainer.appendChild(element);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// ---------- Load old messages ----------
async function loadMessages(roomId) {
    try {
        messagesContainer.innerHTML = '';

        const response = await axios.get(
            `http://localhost:3000/messages/getMessages/${roomId}`
        );
        const messages = response.data.messages;

        // messages.forEach(msg => {
        //     messagesContainer.appendChild(createMessageElement(msg, roomId));
        // });

        // messagesContainer.scrollTop = messagesContainer.scrollHeight;
        for (const msg of messages) {
    const element = await createMessageElement(msg, roomId);
    messagesContainer.appendChild(element);
}

messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.log('Failed to load messages:', error);
    }
}

// ---------- 3 dots menu (Create Group) ----------
const menuBtn = document.getElementById('menuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const createGroupBtn = document.getElementById('createGroupBtn');

menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.style.display =
        dropdownMenu.style.display === 'none' ? 'block' : 'none';
});

// bahar click karne par dropdown band
document.addEventListener('click', () => {
    dropdownMenu.style.display = 'none';
});

createGroupBtn.addEventListener('click', () => {
    window.location.href = 'creategroup.html';
});

// ---------- Start: pehle users, phir unke neeche groups ----------
(async function init() {
    await getAllUsers();
    await getMyGroups();
})();
// media select part
const mediaInput = document.getElementById('mediaInput');
const attachMediaBtn = document.getElementById('attachMediaBtn');

attachMediaBtn.addEventListener('click', () => {
    mediaInput.click();
});

mediaInput.addEventListener('change', () => {
    const file = mediaInput.files[0];

    if (file) {
        console.log('Selected file:', file.name);
        console.log('File type:', file.type);
    }
});


async function sendMedia() {
    try {
        const file = mediaInput.files[0];

        if (!file) {
            alert('Please select media first');
            return;
        }

        const formData = new FormData();
        formData.append('media', file);

        const response = await axios.post(
            'http://localhost:3000/media/upload',
            formData
        );
        const senderId=Number(localStorage.getItem('loggedUser'));
        const roomId=localStorage.getItem('roomId');
        const mediaUrl=response.data.key;
        const mediaType=response.data.mediaType;

        socket.emit('personal_media_message',{
            senderId,
            roomId,
            mediaUrl,
            mediaType
        })

         console.log('Media sent successfully');

        mediaInput.value = '';

    } catch (error) {
        console.error(
            'Media upload failed:',
            error.response?.data || error.message
        );
    }
}


// mediaInput.addEventListener('change', () => {
//     if (mediaInput.files.length > 0) {
//         sendMedia();
//     }
// });
mediaInput.addEventListener('change', () => {
    const file = mediaInput.files[0];

    if (file) {
        console.log('Selected file:', file.name);
        // Abhi send nahi karna
    }
});


// ---------- Receive media_message ----------
// socket.on('received_media',(data)=>{
//     console.log('received_media',data);
// })
socket.on('received_media', async (data) => {
    try {
        const currentRoomId = localStorage.getItem('roomId');

        if (data.roomId !== currentRoomId) {
            return;
        }

        const messageElement = await createMessageElement(
            data,
            currentRoomId
        );

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

    } catch (error) {
        console.error('Failed to display received media:', error);
    }
});

attachMediaBtn.addEventListener('click', () => {
    mediaInput.click();
});

mediaInput.addEventListener('change', () => {
    const file = mediaInput.files[0];

    if (!file) return;

    mediaPreview.style.display = 'flex';
    previewFileName.textContent = file.name;

    if (file.type.startsWith('image/')) {
        previewImage.src = URL.createObjectURL(file);
        previewImage.style.display = 'block';
    } else {
        previewImage.removeAttribute('src');
        previewImage.style.display = 'none';
    }
});

removeMediaBtn.addEventListener('click', () => {
    mediaInput.value = '';
    mediaPreview.style.display = 'none';
    previewImage.removeAttribute('src');
    previewImage.style.display = 'none';
    previewFileName.textContent = '';
});