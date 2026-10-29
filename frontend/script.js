
const container = document.querySelector('.container');

document.querySelector('.signup-btn').addEventListener('click', () => {
    container.classList.add('active');
});

document.querySelector('.login-btn').addEventListener('click', () => {
    container.classList.remove('active');
});

// Signup form
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    const userObj = {
        name,
        email,
        phone,
        password
    };

    try {
        const response = await axios.post(
            'http://localhost:3000/user/addUser',
            userObj
        );

        document.getElementById('signupForm').reset();
        alert('Signup successfully');

    } catch (error) {
        console.log('Signup error:', error);

        if (error.response && error.response.status === 409) {
            alert('User already exists');
        } else {
            alert('Something went wrong');
        }
    }
});

// Login form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailorphone = document.getElementById('emailorphone').value.trim();
    const password = document.getElementById('loginPassword').value;

    const loginObj = {
        emailorphone,
        password
    };

    try {
        const response = await axios.post(
            'http://localhost:3000/user/login',
            loginObj
        );

        console.log('Full response:', response.data);

        // Save logged-in user's ID
        const userId = response.data.id;

        if (userId === undefined || userId === null) {
            console.error('User ID is missing from login response');
          
            return;
        }

        localStorage.setItem('loggedUser', userId);

        console.log('Saved ID:', localStorage.getItem('loggedUser'));

        document.getElementById('loginForm').reset();

        alert('Login successfully');

        // Navigate only after successful login and ID storage
        window.location.href = 'users.html';

    } catch (error) {
        console.log('Login error:', error);

        if (error.response && error.response.status === 401) {
            alert('Invalid email/phone or password');
        } else if (error.response && error.response.status === 404) {
            alert('User not found');
        } else if (error.response && error.response.status === 400) {
            alert('Email/phone and password are required');
        } else {
            alert('Something went wrong while login');
        }
    }
});
