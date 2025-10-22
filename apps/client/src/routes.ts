export const routes = {
  index: () => "/",
  search: {
    index: () => "/search",
  },
  dashboard: {
    index: () => "/dashboard",
  },
  auth: {
    login: () => "/login",
    register: () => "/register",
    otp: () => "/otp",
  },
  completeProfile: {
    index: () => "/complete-profile",
  },
};
