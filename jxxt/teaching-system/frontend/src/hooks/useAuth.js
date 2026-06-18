import { useSelector, useDispatch } from 'react-redux';
import { login, register, logout, fetchUser } from '../store/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    login: (credentials) => dispatch(login(credentials)),
    register: (data) => dispatch(register(data)),
    logout: () => dispatch(logout()),
    fetchUser: () => dispatch(fetchUser()),
  };
};

export default useAuth;