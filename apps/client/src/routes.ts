export const routes = {
  index: () => "/",
  search: {
    index: () => "/search",
  },
  dashboard: {
    index: () => "/dashboard",
  },
  modules: {
    index: (query: { tab?: string } = {}) => {
      const searchParams = new URLSearchParams();
      if (query.tab) {
        searchParams.append("tab", query.tab);
      }
      const queryString = searchParams.toString();
      return `/modules${queryString ? `?${queryString}` : ""}`;
    },
    id: (moduleId: string) => `/modules/${moduleId}`,
  },
  content: {
    index: () => "/content",
  },
  billing: {
    index: () => "/billing",
  },
  profile: {
    index: () => "/profile",
  },
  auth: {
    login: () => "/login",
    register: () => "/register",
    otp: () => "/otp",
    callback: () => "/auth/callback",
  },
  completeProfile: {
    index: () => "/complete-profile",
  },
  privacy: {
    googleDataPolicy: () => "/google-data-policy",
  },
};
