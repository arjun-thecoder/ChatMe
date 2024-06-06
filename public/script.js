document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const chatScreen = document.getElementById('chat-screen');
    const usernameInput = document.getElementById('username');
    const loginButton = document.getElementById('login-button');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const messagesDiv = document.getElementById('messages');
    const usersList = document.getElementById('users');

    let ws;
    let userId;

    loginButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (username) {
            ws = new WebSocket('ws://localhost:3000');
            ws.onopen = () => {
                ws.send(JSON.stringify({ type: 'login', username }));
            };

            ws.onmessage = (message) => {
                const data = JSON.parse(message.data);
                switch (data.type) {
                    case 'login':
                        if (data.success) {
                            userId = data.userId;
                            loginScreen.style.display = 'none';
                            chatScreen.style.display = 'flex';
                        }
                        break;
                    
                    case 'message':
                        displayMessage(data);
                        break;
                    
                    case 'userList':
                        updateUserList(data.users);
                        break;
                }
            };
        }
    });

    sendButton.addEventListener('click', () => {
        const text = messageInput.value.trim();
        if (text && ws) {
            ws.send(JSON.stringify({ type: 'message', text }));
            messageInput.value = '';
        }
    });

    function displayMessage(data) {
        const messageEl = document.createElement('div');
        messageEl.textContent = `${data.username}: ${data.text}`;
        messagesDiv.appendChild(messageEl);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function updateUserList(users) {
        usersList.innerHTML = '';
        users.forEach(user => {
            const userEl = document.createElement('li');
            userEl.textContent = user;
            usersList.appendChild(userEl);
        });
    }
});
