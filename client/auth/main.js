const localhost = true;
const url = `http://${localhost ? 'localhost' : '192.168.1.20'}:3528`

const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const toRegisterButton = document.getElementById('toRegister');
const toLoginButton = document.getElementById('toLogin');

function displayLoginForm() {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    document.title = 'Log in | MMT Chat App';
}

toRegisterButton.addEventListener('click', () => {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    document.title = 'Register | MMT Chat App';
});

toLoginButton.addEventListener('click', () => {
    displayLoginForm();
})

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = loginForm.querySelector("input[name = 'username']").value;
    const password = loginForm.querySelector("input[name = 'password']").value;
    const errorDisplays = [
        loginForm.querySelector("#login-username-err"),
        loginForm.querySelector("#login-pw-err")
    ];

    errorDisplays.forEach(error => {
        error.innerHTML = "";
        error.parentElement.classList.remove("invalid");
    })

    const displayErrorMessage = (errElement) => {
        errElement.innerHTML = "This field must not be left blank"
        errElement.parentElement.classList.add("invalid")
    } 

    // form validation
    if(username == '' && password == ''){
        errorDisplays.forEach(err => displayErrorMessage(err));
        return;
    }
    else {
        if(username == '') {
            displayErrorMessage(errorDisplays[0]);
            return;
        }
        else if(password == '') {
            displayErrorMessage(errorDisplays[1]);
            return;
        }
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${url}/api/auth/login`, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onload = function() {
        if(this.readyState == 4){
            if(this.status == 200){
                const response = JSON.parse(xhr.response);
                localStorage.setItem("accessToken", response.accessToken);
                window.location.href = '/chat'
            }
            else Swal.fire({
                title: "Error",
                text: xhr.responseText,
                icon: "error"
            });
        }
    }
    xhr.send(JSON.stringify({
        username: username,
        password: password
    }))
})

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = registerForm.querySelector("input[name = 'username']").value;
    const email = registerForm.querySelector("input[name = 'email']").value;
    const password = registerForm.querySelector("input[name = 'password']").value;
    const errorDisplays = [
        registerForm.querySelector("#reg-username-err"),
        registerForm.querySelector("#reg-email-err"),
        registerForm.querySelector("#reg-pw-err")
    ];

    errorDisplays.forEach(error => {
        error.innerHTML = "";
        error.parentElement.classList.remove("invalid");
    })

    const displayErrorMessage = (errElement, msg) => {
        errElement.innerHTML = msg;
        errElement.parentElement.classList.add("invalid")
    } 

    let formValidated = true;
    function validateForm() {
        // validate username
        if(username == '') {
            displayErrorMessage(errorDisplays[0], "This field should not be left blank");
            formValidated = false;
        }
        else if(username.length < 7){
            displayErrorMessage(errorDisplays[0], "Username must has at least 6 characters")
            formValidated = false;
        }
        // validate email
        if(email == '') {
            displayErrorMessage(errorDisplays[1], "This field must not be left blank");
            formValidated = false;
        }
        else if(!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
            displayErrorMessage(errorDisplays[1], "The email is not in a correct form");
            formValidated = false;
        }
        // validate password
        if(password == '') {
            displayErrorMessage(errorDisplays[2], "This field must not be left blank");
            formValidated = false;
        }
        else if(!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/g)) {
            displayErrorMessage(errorDisplays[2], "Password must has at least 8 characters with at least a number");
            formValidated = false;
        }
    }
    validateForm();
    if(!formValidated) return;

    // send register information to server
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${url}/api/auth/register`, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onload = function() {
        if(this.readyState == 4){
            if(this.status == 201) {
                registerForm.querySelector("input[name = 'username']").value = '';
                registerForm.querySelector("input[name = 'email']").value = '';
                registerForm.querySelector("input[name = 'password']").value = '';
                Swal.fire({
                    title: "Success",
                    text: "Account created successfully. Now you can log into our system and chat!",
                    icon: "success"
                }).then(() => displayLoginForm());
            }
            else Swal.fire({
                title: "Error",
                text: xhr.responseText,
                icon: "error"
            });
        }
    }
    xhr.send(JSON.stringify({
        username,
        email,
        password
    }))
})