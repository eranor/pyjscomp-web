export const userModel = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordAgain: '',
  code: '',
  role: 'student',
};

export const errorsModel = {
  firstName: [],
  lastName: [],
  email: [],
  code: [],
  password: [],
  passwordAgain: [],
  role: [],
};

export const classModel = {
  name: '',
  teacher: '',
};

export function setCurrentUser(data) {
  localStorage.setItem('loggedInUser', JSON.stringify(data.user));
  localStorage.setItem('token', data.token);
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem('loggedInUser'));
}

export function deleteCurrentUser() {
  localStorage.removeItem('loggedInUser');
  localStorage.removeItem('token');
}
