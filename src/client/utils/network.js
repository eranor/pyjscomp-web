import axios from 'axios';

const userNotFoundMessage = 'User with this email was not found or wong password was used!';

const remapError = (error) => {
  if (error.msg === 'Invalid value') {
    return `${error.msg} for ${error.param}`;
  } else {
    return error.msg;
  }
};

export const submitLogin = async (user) => {
  try {
    const response = await axios.post('/api/auth/login', user);
    return { data: response.data };
  } catch (error) {
    if (error.response && error.response.data) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else {
      return {
        status: error.response.status,
        message: error.response.statusText,
      };
    }
  }
};

export const submitSignup = async (user) => {
  try {
    const user2 = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      role: user.role,
    };
    const response = await axios.post('/api/auth/sign_up', user2);
    return { result: true, data: response.data };
  } catch (error) {
    if (error.response.data) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else {
      return {
        status: error.response.status,
        message: error.response.statusText,
      };
    }
  }
};

export const checkIfCodeIsValid = async (code) => {
  try {
    const response = await axios.get(`/api/auth/validate_code?code=${code}`);
    return response.data;
  } catch (error) {
    if (error.response.data) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else {
      return {
        status: error.response.status,
        message: error.response.statusText,
      };
    }
  }
};

export const checkIfEmailUsed = async (email) => {
  try {
    const response = await axios.get(`/api/auth/user_exists?email=${email}`);
    return response.data;
  } catch (error) {
    if (error.response.data) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else {
      return {
        status: error.response.status,
        message: error.response.statusText,
      };
    }
  }
};

export const requestConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const getClassesForTeacher = async () => {
  try {
    const response = await axios.get('/api/class', requestConfig());
    return response.data;
  } catch (error) {
    if (error.response.data) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else {
      return {
        status: error.response.status,
        message: error.response.statusText,
      };
    }
  }
};

export const getAllClasses = async () => {
  try {
    const response = await axios.get('/api/class', requestConfig());
    return response.data;
  } catch (error) {
    if (error.response.data) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else {
      return {
        status: error.response.status,
        message: error.response.statusText,
      };
    }
  }
};

export const getClassesForStudent = async () => {
  try {
    const response = await axios.get('/api/user/classes', requestConfig());
    return response.data;
  } catch (error) {
    if (error.response.data) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else {
      return {
        status: error.response.status,
        message: error.response.statusText,
      };
    }
  }
};

export const createNewClass = async (classModel) => {
  try {
    const response = await axios.post('/api/class', classModel, requestConfig());
    return response.data;
  } catch (error) {
    if (error.response.data) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else {
      return {
        status: error.response.status,
        message: error.response.statusText,
      };
    }
  }
};

export const addUserToClass = async (classModel) => {
  try {
    const response = await axios.post('/api/user/add-to-class', classModel, requestConfig());
    return response.data;
  } catch (error) {
    if (error.response.data) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else {
      return {
        status: error.response.status,
        message: error.response.statusText,
      };
    }
  }
};

export const deleteClass = async ({ id, password }) => {
  try {
    const response = await axios.post(`/api/class/${id}`, { password }, requestConfig());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else {
      return {
        status: error.response.status,
        message: error.response.statusText,
      };
    }
  }
};

export const getStudentsForClass = async ({ classId }) => {
  try {
    const response = await axios.get(`/api/class/${classId}/students`, requestConfig());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else if (error.response) {
      return { status: error.response.status, message: error.response.statusText };
    } else {
      throw error;
    }
  }
};

export const getTasksForClass = async ({ classId }) => {
  try {
    const response = await axios.get(`/api/class/${classId}/tasks`, requestConfig());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else if (error.response) {
      return { status: error.response.status, message: error.response.statusText };
    } else {
      throw error;
    }
  }
};

export const updateUserData = async (userData) => {
  try {
    const response = await axios.post(`/api/user`, userData, requestConfig());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else {
      return {
        status: error.response.status,
        message: error.response.statusText,
      };
    }
  }
};

export const updateUserPassword = async ({ oldPassword, newPassword }) => {
  try {
    const response = await axios.post(`/api/user/change-password`, { oldPassword, newPassword }, requestConfig());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else {
      return {
        status: error.response.status,
        message: error.response.statusText,
      };
    }
  }
};

export const deleteUserAccount = async ({ password }) => {
  try {
    const response = await axios.post(`/api/user/delete-account`, { password }, requestConfig());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else {
      return {
        status: error.response.status,
        message: error.response.statusText,
      };
    }
  }
};

export const deleteUserFromClass = async ({ classId, studentId }) => {
  try {
    const response = await axios.delete(`/api/class/${classId}?studentId=${studentId}`, requestConfig());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else {
      return {
        status: error.response.status,
        message: error.response.statusText,
      };
    }
  }
};

export const deleteTask = async ({ taskId }) => {
  try {
    const response = await axios.delete(`/api/task/${taskId}`, requestConfig());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else {
      return {
        status: error.response.status,
        message: error.response.statusText,
      };
    }
  }
};

export const getSolutionsForStudent = async ({ uuid, taskId }) => {
  try {
    const config = requestConfig();
    config.params = {}
    if (uuid) {
      config.params.student = uuid;
    }
    if (taskId) {
      config.params.taskId = taskId;
    }
    const response = await axios.get(`/api/solution`, config);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else if (error.response) {
      return { status: error.response.status, message: error.response.statusText };
    } else {
      throw error;
    }
  }
};

export const updateSolutionAsTeacher = async ({ solutionId, status }) => {
  try {
    const response = await axios.get(`/api/solution/${solutionId}?status=${status}`, requestConfig());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else if (error.response) {
      return { status: error.response.status, message: error.response.statusText };
    } else {
      throw error;
    }
  }
};

export const getRulesForTask = async ({ taskId }) => {
  try {
    const response = await axios.get(`/api/rule?taskId=${taskId}`, requestConfig());
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      return { errors: Object.values(error.response.data.errors).map(remapError) };
    } else if (error.response) {
      return { status: error.response.status, message: error.response.statusText };
    } else {
      throw error;
    }
  }
};
