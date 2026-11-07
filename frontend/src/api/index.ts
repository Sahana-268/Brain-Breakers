import api from './axiosInstance';

export const syllabusApi = {
  getAll: () => api.get('/syllabus/'),
  getLevel: (n: number) => api.get(`/syllabus/${n}`),
};

export const studentApi = {
  getMyProfile: () => api.get('/students/my'),
  listAll: () => api.get('/students/'),
  getProgress: (id: number) => api.get(`/students/${id}/progress`),
  updateLevel: (id: number, level: number) =>
    api.patch(`/students/${id}/level?level=${level}`),
};

export const examApi = {
  list: () => api.get('/exams/'),
  get: (id: number) => api.get(`/exams/${id}`),
  create: (data: object) => api.post('/exams/', data),
  startAttempt: (examId: number) => api.post(`/exams/${examId}/attempt`),
  submit: (examId: number, attemptId: number, answers: object) =>
    api.post(`/exams/${examId}/submit/${attemptId}`, answers),
};

export const resultsApi = {
  myResults: () => api.get('/results/my'),
  examResults: (examId: number) => api.get(`/results/exam/${examId}`),
};

export const competitionApi = {
  list: () => api.get('/competitions/'),
  create: (data: object) => api.post('/competitions/', data),
  register: (compId: number) => api.post(`/competitions/${compId}/register`),
};

export const leaderboardApi = {
  global: (limit = 50) => api.get(`/leaderboard/?limit=${limit}`),
  competition: (compId: number) => api.get(`/leaderboard/competition/${compId}`),
};

export const practiceApi = {
  logSession: (data: object) => api.post('/practice/sessions', data),
  mySessions: () => api.get('/practice/sessions/my'),
};

export const usersApi = {
  updateProfile: (data: object) => api.patch('/users/me', data),
  changePassword: (data: object) => api.post('/users/me/change-password', data),
  updateStudentProfile: (data: object) => api.patch('/users/me/student-profile', data),
  listAll: () => api.get('/users/'),
  toggleActive: (id: number) => api.patch(`/users/${id}/toggle-active`),
};

