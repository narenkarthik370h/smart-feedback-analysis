const API = process.env.REACT_APP_API_URL;

const fetchUser = async () => {
  try {
    const res = await axios.get(`${API}/api/auth/me`);
    setUser(res.data.user);
  } catch (err) {
    console.error('Failed to fetch user:', err);
    logout();
  } finally {
    setLoading(false);
  }
};

const login = async (email, password) => {
  try {
    const res = await axios.post(`${API}/api/auth/login`, { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || 'Login failed'
    };
  }
};

const register = async (name, email, password) => {
  try {
    const res = await axios.post(`${API}/api/auth/register`, {
      name,
      email,
      password
    });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || 'Registration failed'
    };
  }
};
