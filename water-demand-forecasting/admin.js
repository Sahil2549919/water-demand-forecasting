document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const loginView = document.getElementById('loginView');
  const adminView = document.getElementById('adminView');
  const adminGreeting = document.getElementById('adminGreeting');
  const logoutBtn = document.getElementById('logoutBtn');

  const setLoggedIn = (userName) => {
    loginView.classList.add('hidden');
    adminView.classList.remove('hidden');
    adminGreeting.textContent = userName || 'Operations Manager';
  };

  const setLoggedOut = () => {
    loginView.classList.remove('hidden');
    adminView.classList.add('hidden');
    loginError.textContent = '';
  };

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('usernameInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        loginError.textContent = result.error || 'Login failed';
        return;
      }

      setLoggedIn(result.user.name);
    } catch (error) {
      loginError.textContent = 'Connection error. Please retry.';
    }
  });

  logoutBtn.addEventListener('click', () => {
    setLoggedOut();
  });

  setLoggedOut();
});
