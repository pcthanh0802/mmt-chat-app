const localhost = true;
const url = `http://${localhost ? 'localhost' : '192.168.1.20'}:3528`

const token = localStorage.getItem('accessToken');
if(!token) window.location.replace('/auth');

const xhr = new XMLHttpRequest();
xhr.open("POST", `${url}/api/auth/verifyToken`);
xhr.setRequestHeader("Content-type", "application/json");
xhr.onload = function() {
    if(this.readyState == 4 && this.status != 200) {
        localStorage.removeItem('accessToken');
        window.location.replace('/auth');
    }
}
xhr.onerror = function() {
    localStorage.removeItem('accessToken');
    window.location.replace('/auth');
}
xhr.send(JSON.stringify({ token }));