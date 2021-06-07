const socket = io();

const container = document.getElementById('container')
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messageContainer = document.getElementById('message-container');
const nameForm = document.getElementById('name-form');
const nameInput = document.getElementById('name-input');
const modalContainer = document.getElementById('modal-container');
const joinLeft = document.querySelector('.join-left');
const moreOptionBtn = document.getElementById('more-option-button');
const moreOptionList = document.getElementById('more-option-list');
const moreOptionItem = document.querySelectorAll('.more-option-item');
const online = document.getElementById('online');
const onlineList = document.getElementById('online-list');
const onlineListItem = document.querySelectorAll('.online-list-item');
const onlineCount = document.getElementById('online-count');

nameForm.addEventListener('submit', e => {
    e.preventDefault();
    const userName = nameInput.value;
    modalContainer.style.animation = "fade-out 0.5s";
    container.style.animation = "fade-in 0.5s";
    setTimeout(() => {
        modalContainer.style.display = "none";
        container.style.opacity = "1";
        joinLeft.style.display = "block";
    }, 450);
    socket.emit('new-user-joined', userName);
})

messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const messageInp = messageInput.value;
    if(messageInp != "") {
        appendMessage(messageInp, 'message', 'right', 'You');
        socket.emit('send', messageInp);
        messageInput.value = '';
    }
})

window.addEventListener('click', e => {
    if(e.target != moreOptionList && e.target != onlineList && e.target != moreOptionBtn && moreOptionList.style.display == "block") {
        let count = 0;
        moreOptionItem.forEach(element => {
            if(e.target != element) {
                count++;
            }
        })
        onlineListItem.forEach(element => {
            if(e.target != element) {
                count++;
            }
        })
        if(count >= moreOptionItem.length + onlineListItem.length)  moreOptionList.style.display = "none";
    }

    if(e.target != online && e.target != onlineList && onlineList.style.display == "block") {
        let count = 0;
        onlineListItem.forEach(element => {
            if(e.target != element) {
                count++;
            }
        })
        if(count >= onlineListItem.length)  onlineList.style.display = "none";
    }
})

moreOptionBtn.addEventListener('click', () => {
    if(moreOptionList.style.display == "block") moreOptionList.style.display = "none";
    else moreOptionList.style.display = "block";
})

online.addEventListener('click', () => {
    if(onlineList.style.display == "block") onlineList.style.display = "none";
    else onlineList.style.display = "block";
})

messageInput.addEventListener('input', e => {
    socket.emit('on-type');
})

socket.on('user-joined', (name, users) => {
    onlineCount.innerHTML = Object.keys(users).length;
    appendUsers(users);
    appendMessage('joined the chat', 'join-left', 'center', name);
})

socket.on('receive', data => {
    appendMessage(data.message, 'message', 'left', data.name);
    let status = document.getElementById(`${data.id}`);
    status.innerHTML = '(online)';
})

socket.on('typing', id => {
    let status = document.getElementById(`${id}`);
    status.innerHTML = '(tping...)';
    setTimeout(() => {
        status.innerHTML ='(online)';
    }, 8000);
})

socket.on('user-left', (name, users) => {
    onlineCount.innerHTML = Object.keys(users).length;
    appendUsers(users);
    appendMessage('left the chat', 'join-left', 'center', name);
})

socket.on('online-users', users => {
    onlineCount.innerHTML = Object.keys(users).length;
    appendUsers(users);
})

const appendMessage = (message, type, position, sender) => {
    const messageElement = document.createElement('div');
    if(type == 'join-left') {
        messageElement.classList.add('join-left');
        messageElement.innerText = `${sender} ${message}`;
    }else if(type == 'message') {
        if(position == 'left') {
            message = `<div class="user-name">${sender}</div>${message}`;
        }
        messageElement.classList.add('message');
        messageElement.classList.add(position);
        messageElement.innerHTML = message;
    }
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

const appendUsers = users => {
    onlineList.innerHTML = '';
    for (const id in users) {
        if (Object.hasOwnProperty.call(users, id)) {
            let name = users[id];
            onlineList.innerHTML += `<li class="online-list-item">${name} <span class="status" id="${id}">(online)</span></li>`;
        }
    }
}