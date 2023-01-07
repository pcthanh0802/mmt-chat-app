let username;
let socket;
let friends;
let otherUser;
let peer;
let sendChannel;
let peerConnected = false;
let fileChannel;

init();

document.addEventListener('DOMContentLoaded', () => {
    getFriendList();
    getPersonalInfo();
    document.getElementById('find-user-form').addEventListener('submit', (e) => findUserByUsername(e))
    document.getElementById('friends-btn').addEventListener('click', () => showFriendsList());
    document.getElementById('request-btn').addEventListener('click', () => showPendingRequest());
})

function init() {
    socket = io(url, {
        auth: {
            token: localStorage.getItem('accessToken')
        }
    })

    socket.on('new-connection', id => {
        handleOnlineStatus(id);
    })
    
    socket.on('online-list', list => {
        list.forEach(id => handleOnlineStatus(id))
    })
    
    socket.on('disconnect-client', id => {
        handleOfflineStatus(id);
        if(otherUser === id) handleDisconnect();
    });

    socket.on('offer', handleReceiveOffer)

    socket.on('answer', handleAnswer)

    socket.on('answer-received', id => { 
        peerConnected = true; 
        displayMessagePage(id);
    })

    socket.on('ice-candidate', handleNewIceCandidateMsg)

    socket.on('disconnect-peer', message => {
        handleDisconnect();
        Swal.fire({ text: `${message.callerUsername} has disconnected from you. You can now connect to other!` });
    });
}

function callUser(userId) {
    peer = createPeer(userId);
    sendChannel = peer.createDataChannel("sendChannel");
    sendChannel.binaryType = "arraybuffer";
    sendChannel.bufferedAmountLowThreshold = 0;
    sendChannel.onmessage = handleReceiveMessage;
}

function createPeer(userId) {
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302'
            }
        ]
    });

    peer.onicecandidate = handleIceCandidateEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userId);

    return peer;
}

function handleNegotiationNeededEvent(userId) {
    peer.createOffer()
        .then(offer => {
            return peer.setLocalDescription(offer);
        })
        .then(() => {
            const payload = {
                target: userId,
                caller: socket.id,
                callerUsername: username,
                sdp: peer.localDescription
            };
            socket.emit('offer', payload);
            console.log("93");
        })
        .catch(e => console.log(e));
}

function handleReceiveOffer(incoming) {
    // currently connected to another peer
    if(peerConnected) {
        socket.emit('answer', {
            target: incoming.caller,
            caller: socket.id,
            callerUsername: username,
            accept: false 
        })
        return;
    }

    console.log('109')

    Swal.fire({
        text:  `${incoming.callerUsername} wants to connect to you`,
        icon: 'warning',
        showCancelButton: true,
        })
            .then(result => {
                if(result.isConfirmed) {
                    peer = createPeer();
                    peer.ondatachannel = (e) => {
                        sendChannel = e.channel;
                        sendChannel.binaryType = "arraybuffer";
                        sendChannel.bufferedAmountLowThreshold = 0;
                        sendChannel.onmessage = handleReceiveMessage;
                    }
                    const desc = new RTCSessionDescription(incoming.sdp);
                    peer.setRemoteDescription(desc)
                        .then(() => peer.createAnswer())
                        .then(answer => peer.setLocalDescription(answer))
                        .then(() => {
                            const payload = {
                                target: incoming.caller,
                                caller: socket.id,
                                callerUsername: username,
                                sdp: peer.localDescription,
                                accept: true
                            }
                            otherUser = incoming.caller;
                            socket.emit('answer', payload)
                        })
                }
                else {
                    socket.emit('answer', {
                        target: incoming.caller,
                        caller: socket.id,
                        callerUsername: username,
                        accept: false 
                    })
                }
            });
}

function handleReceiveMessage(e) {
    if(typeof e.data == typeof 'string') {
        const incoming = JSON.parse(e.data);
        if(incoming.messageType === 1) {
            appendMessage(incoming.data, false);
            return;
        }
        else if(incoming.messageType === 2) {
            handleFileArrived(incoming.fileName);
            return;
        }
    }
    handleReceivingFile(e);
}

function handleAnswer(message) {
    if(message.accept){
        const desc = new RTCSessionDescription(message.sdp);
        peer.setRemoteDescription(desc).catch(e => console.log(e));
        peerConnected = true;
        socket.emit('answer-received', otherUser);
        Swal.fire({
            text: 'Peer connected',
            icon: 'success'
        });
        sendChannel = peer.createDataChannel("sendChannel");
        sendChannel.binaryType = "arraybuffer";
        sendChannel.bufferedAmountLowThreshold = 0;
        sendChannel.onmessage = handleReceiveMessage;
        displayMessagePage(message.caller);
    } 
    else {
        Swal.fire({
            text: 'Connection offer rejected',
            icon: 'error'
        })
        peer.close();
        peer = null;
    }
}

function handleIceCandidateEvent(e) {
    if(e.candidate) {
        const payload = {
            target: otherUser,
            candidate: e.candidate
        }
        socket.emit('ice-candidate', payload)
    }
}

function handleNewIceCandidateMsg(incoming) {
    const candidate = new RTCIceCandidate(incoming);

    peer.addIceCandidate(candidate).catch(e => console.log(e));
}

function getFriendList() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${url}/api/user/friends`);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem('accessToken')}`);
    xhr.onload = function() {
        if(this.status == 200 && this.readyState == 4) {
            const response = JSON.parse(xhr.response);
            friends = response.map(res => res.id);
            displayFriendList(response);
        }
    }
    xhr.send();
}

function displayFriendList(friendsList) {
    const listContainer = document.getElementById("friend-container");
    let innerHtml = ``;
    friendsList.forEach(friend => {
        const element = `
            <div id="online-user-${friend.id}" class="optionBar__user" data-id="${friend.id}" data-username="${friend.username}" data-image="${friend.image}">
                <div>
                    <span class="status offline"></span>
                    <img src="${ friend.image ? friend.image : './assets/server1.jpg' }" alt="avatar" />
                </div>  
                <span>${friend.username}</span>
            </div>
        `
        innerHtml += element;
    });
    listContainer.innerHTML = innerHtml;
    friendsList.forEach(friend => {
        const element = document.getElementById(`online-user-${friend.id}`);
        element.addEventListener('click', (e) => {
            console.log(e.target);
            if(!peerConnected) {
                Swal.fire({
                    text: `Do you want to connect to user ${element.dataset.username}?`,
                    showCancelButton: true,
                })
                    .then(result => {
                        if(result.isConfirmed) {
                            callUser(element.dataset.id);
                            otherUser = element.dataset.id;
                            Swal.fire({
                                text: 'Waiting...',
                                showSpinner: true,
                                allowOutsideClick: false,
                                showConfirmButton: false
                            })
                        }
                    });
            }
        });
    })
}

function displayMessagePage(id) {
    const userItem = document.getElementById(`online-user-${id}`);
    const username = userItem.dataset.username;
    const image = userItem.dataset.image;
    const messageContainer = document.getElementById('chat-container');

    const chatboxHtml = `
        <div>
            <div class="chatHeader">
                <div class="chatHeader__left">
                    <span class="chatHeader__Dm">@</span>
                    <h3 id="header-name">${username}</h3>
                </div>
                <div class="chatHeader__right">
                    <input class="form-control" type="file" id="file-inp">
                    <button type="button" class="btn btn-primary" id="send-file-btn" disabled>Send</button>                    
                    <button type="button" class="btn btn-danger" id="disconnect-btn">Disconnect</button>
                </div>
            </div>
        </div>
        <div id="message-container" class="chat__messages" data-id="${id}" data-username="${username}" data-image="${image}"></div>
        <div class="chat__input">
            <!-- <label for="upload-file" class="fas fa-plus-circle fa-lg"></label> -->
            <!-- <input id="upload-file" type='file' style='display: none'> -->
            <form id="sendMessage" data-id="${id}">
                <input class="sendMessage" type="text" placeholder="Message @${username}" name="message" autocomplete="off">
                <button class="chat__inputButton" type="submit">Send</button>
            </form>
        </div>
    `

    messageContainer.innerHTML = chatboxHtml;
    const sendMessageForm = document.querySelector('#sendMessage');
    sendMessageForm.addEventListener('submit', e => {
        e.preventDefault();
        const message = sendMessageForm.querySelector("input[name = 'message']").value;
        if(message === '') return;

        sendChannel.send(JSON.stringify({
            messageType: 1,
            data: message
        }));
        appendMessage(message);

        sendMessageForm.querySelector("input[name = 'message']").value = '';
        sendMessageForm.querySelector("input[name = 'message']").focus();
    })

    document.getElementById('disconnect-btn').addEventListener('click', () => {
        Swal.fire({
            text: 'Do you want to end this peer connection?',
            showCancelButton: true,
            icon: 'warning'
        }).then(result => {
            if(result.isConfirmed) {
                socket.emit('disconnect-peer', {
                    target: otherUser,
                    caller: socket.id,
                    callerUsername: username
                });
                handleDisconnect();
                document.getElementById('disconnect-btn').remove();
                document.getElementById('send-file-btn').remove();
                document.getElementById('file-inp').remove();
                document.querySelector("#sendMessage > input[name = 'message']").disabled = true;
            }
        })
    });

    document.getElementById('file-inp').addEventListener('change', handleInputFileChange);
    document.getElementById('send-file-btn').addEventListener('click', handleSendFileClick);
}

function getPersonalInfo() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${url}/api/user`);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem('accessToken')}`);
    xhr.onload = function() {
        if(this.status == 200 && this.readyState == 4) {
            displayPersonalInfo(JSON.parse(xhr.response)[0]);
        }
    }
    xhr.send();
}

function displayPersonalInfo(info) {
    username = info.username;
    const container = document.getElementById('profile-container');
    container.innerHTML = `
        <div>
            <span class="status"></span>
            <img src="${ info.image ? info.image : './assets/server1.jpg' }" alt="avatar" />
        </div>
        <div class="optionBar__profileInfo">
            <h3>${info.username}</h3>
            <p>${info.email}</p>
        </div>
    `
}

function appendMessage(message, fromself = true) {
    const messageContainer = document.getElementById('message-container');
    const messageHtml = `
        <div class="message">
            <img src="./assets/server1.jpg" alt="avatar">
            <div class="message__info">
                <h4>${fromself ? "Me" : messageContainer.dataset.username}<span class="message__timestamp">${(new Date()).toLocaleString('en-UK')}</span></h4>
                <p>${message}</p>
            </div>
        </div>
    `
    messageContainer.innerHTML += messageHtml;
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function handleOnlineStatus(id) {
    if(friends.includes(id)) {
        const statusElement = document.querySelector(`#online-user-${id} > div > span`);
        statusElement.classList.remove('offline');
    }
}

function handleOfflineStatus(id) {
    if(friends.includes(id)) {
        const statusElement = document.querySelector(`#online-user-${id} > div > span`);
        statusElement.classList.add('offline');
        // document.querySelector(`#online-user-${id}`).remove();
    }
}

function showFriendsList() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${url}/api/user/friends`);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem('accessToken')}`);
    xhr.onload = function() {
        if(this.status == 200) {
            const result = JSON.parse(xhr.response);
            document.getElementById("modal-title").innerHTML = 'Friends';
            if(result.length == 0) {
                document.getElementById("modal-body").innerHTML = 'No friend available';
            }
            else {
                let innerHtml = `
                    <table id="request-table" class="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" style="width: 55px; height: 55px;"></th>
                                <th scope="col"></th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                result.forEach(req => {
                    innerHtml += `
                        <tr id="${req.id}-req" data-id="${req.id}">
                            <th scope="row">
                                <img src="${req.image ? req.image : './assets/server1.jpg'}" width="48px" height="48px">
                            </th>
                            <td>${req.username}</td>
                        </tr>                    
                    `
                })
                innerHtml += '</tbody></table>';
                document.getElementById("modal-body").innerHTML = innerHtml;
            }
            const modal = new bootstrap.Modal(document.getElementById('modal'), {});
            modal.show();
        }
    }
    xhr.send();
}

function showPendingRequest() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${url}/api/friends-request`);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem('accessToken')}`);
    xhr.onload = function() {
        if(this.status == 200) {
            const result = JSON.parse(xhr.response);
            document.getElementById("modal-title").innerHTML = 'Pending Friends Request';
            if(result.length == 0) {
                document.getElementById("modal-body").innerHTML = 'No pending request available';
            }
            else {
                let innerHtml = `
                    <table id="request-table" class="table table-hover">
                        <thead>
                        <tr>
                            <th scope="col" style="width: 55px; height: 55px;"></th>
                            <th scope="col"></th>
                            <th scope="col" style="width: 400px"></th>
                        </tr>
                        </thead>
                        <tbody>
                `;
                result.forEach(req => {
                    innerHtml += `
                        <tr id="${req.id}-req" data-id="${req.id}">
                            <th scope="row">
                                <img src="${req.image ? req.image : './assets/server1.jpg'}" width="48px" height="48px">
                            </th>
                            <td>${req.username}</td>
                            <td>
                                <button type="button" class="btn btn-success">Accept</button>
                                <button type="button" class="btn btn-danger">Reject</button>
                            </td>
                        </tr>                    
                    `
                })
                innerHtml += '</tbody></table>';
                document.getElementById("modal-body").innerHTML = innerHtml;

                const accepts = document.querySelectorAll('.btn-success');
                const rejects = document.querySelectorAll('.btn-danger');

                accepts.forEach(acc => acc.addEventListener('click', (e) => handleFriendRequest(e, true)));
                rejects.forEach(rej => rej.addEventListener('click', e => handleFriendRequest(e, false)));
            }

            const modal = new bootstrap.Modal(document.getElementById('modal'), {});
            modal.show();
        }
    }
    xhr.send();
}

function handleFriendRequest(e, accept) {
    const id = e.target.parentElement.parentElement.dataset.id;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${url}/api/friends-request/${accept ? 'accept' : 'reject'}?id=${id}`);
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem('accessToken')}`);
    xhr.onload = function() {
        if(this.status == 200) document.getElementById(`${id}-req`).remove();
    }
    xhr.send();
}

function findUserByUsername(e) {
    e.preventDefault();
    const findForm = document.getElementById('find-user-form');
    const value = findForm.querySelector("input[name = 'username']").value;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${url}/api/user?username=${value}`);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem('accessToken')}`);
    xhr.onload = function() {
        if(this.status == 200 && this.readyState == 4) {
            displaySearchResult(JSON.parse(xhr.response));
        }
    }
    xhr.send();
}

function displaySearchResult(list) {
    document.getElementById("modal-title").innerHTML = 'Search result';
    if(list.length == 0) {
        document.getElementById("modal-body").innerHTML = 'No pending request available';
    }
    else {
        let innerHtml = `
            <table id="request-table" class="table table-hover">
                <thead>
                <tr>
                    <th scope="col" style="width: 55px; height: 55px;"></th>
                    <th scope="col"></th>
                    <th scope="col" style="width: 400px"></th>
                </tr>
                </thead>
                <tbody>
        `;
        list.forEach(user => {
            innerHtml += `
                <tr id="${user.id}-search-result" data-id="${user.id}">
                    <th scope="row">
                        <img src="${user.image ? user.image : './assets/server1.jpg'}" width="48px" height="48px">
                    </th>
                    <td>${user.username}</td>
                    <td>
                        ${
                            user.friendStatus == 0 ? '<button type="button" class="btn btn-primary">Send request</button>' 
                            : user.friendStatus == 1 ? '<button type="button" class="btn btn-warning" disabled>Request sent</button>'
                            : user.friendStatus == 2 ? '<button type="button" class="btn btn-warning" disabled>Request pending</button>'
                            : '<button type="button" class="btn btn-success" disabled>Friend</button>'
                        }
                        
                    </td>
                </tr>                    
            `
        })
        innerHtml += '</tbody></table>';
        document.getElementById("modal-body").innerHTML = innerHtml;

        if(document.querySelector('.btn.btn-primary'))
            document.querySelector('.btn.btn-primary').addEventListener('click', (e) => handleSendRequest(e));
    }

    const modal = new bootstrap.Modal(document.getElementById('modal'), {});
    modal.show();
}

function handleSendRequest(e) {
    const id = e.target.parentElement.parentElement.dataset.id;
    console.log(id);
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${url}/api/friends-request/send?id=${id}`);
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem('accessToken')}`);
    xhr.onload = function() {
        if(this.status == 200) {
            e.target.remove();
        }
    }
    xhr.send();
}

function handleDisconnect() {
    sendChannel.close();
    sendChannel = null;
    peer.close();
    peer = null;
    otherUser = null;
    peerConnected = false;
    receivedBuffer = [];
    receivedByte = 0;
    receivedFile = {};

    document.getElementById('disconnect-btn').remove();
    document.getElementById('file-inp').remove();
    document.getElementById('send-file-btn').remove();
    document.querySelector("#sendMessage > input[name = 'message']").disabled = true;
}

function handleInputFileChange() {
    const fileUpload = document.getElementById('file-inp');
    const sendFileBtn = document.getElementById('send-file-btn');
    sendFileBtn.disabled = (fileUpload.files.length == 0);
}

const byteLengthThreshold = 31457280; // largest size to send

function handleSendFileClick() {
    const fileUpload = document.getElementById('file-inp');
    const file = fileUpload.files[0];

    // handle too large file
    if(file.size > byteLengthThreshold) {
        Swal.fire({
            title: "File is too large",
            text: "Your file must be below 50MB",
            icon: "error"
        });
        fileUpload.value = null;
        document.getElementById('send-file-btn').disabled = true;
        return;
    }

    sendChannel.send(JSON.stringify({
        name: file.name,
        type: file.type,
        size: file.size
    }))

    const chunkSize = 16384;
    let offset = 0;

    file.arrayBuffer().then(buffer => {
        const send = () => {
            while (buffer.byteLength) {
                if (sendChannel.bufferedAmount > sendChannel.bufferedAmountLowThreshold) {
                    sendChannel.onbufferedamountlow = () => {
                        sendChannel.onbufferedamountlow = null;
                        send();
                    };
                    return;
                }
                const chunk = buffer.slice(0, chunkSize);
                buffer = buffer.slice(chunkSize, buffer.byteLength);
                sendChannel.send(chunk);
                offset += chunkSize;
                
            }
        }

        send();
    })

    // reset files list and disable Send file button
    fileUpload.value = null;
    fileUpload.disabled = true;
    document.getElementById('send-file-btn').disabled = true;
}

let receivedFile = {};
let receivedByte = 0;
let receivedBuffer = [];

function handleReceivingFile(e) {
    if (receivedFile["name"] == undefined) {
        const file = JSON.parse(e.data);
        receivedFile = file;
        return;
    }

    receivedBuffer.push(e.data);
    receivedByte += e.data.byteLength;

    if (receivedByte == receivedFile["size"]) {
        const blob = new Blob(receivedBuffer, { type: receivedFile["type"] });
        appendMessage(`<a href='${URL.createObjectURL(blob)}' download='${receivedFile['name']}'>${receivedFile['name']}</a>`, false);

        // signal to sender that file has fully arrived to enable the other's file input bar again
        sendChannel.send(JSON.stringify({
            messageType: 2,
            fileName: receivedFile['name']
        }))

        receivedBuffer = [];
        receivedByte = 0;
        receivedFile = {};
    }
}

function handleFileArrived(fileName) {
    document.getElementById('file-inp').disabled = false;
    appendMessage(`<i>Sent ${fileName}</i>`);
}