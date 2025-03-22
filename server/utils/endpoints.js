export const AUTH_ROUTES = {
  SIGNUP: "/signup",
  LOGIN: "/login",
  VERIFY_EMAIL: "/verifyEmail",
  VERIFY_JWT: "/verifyJWT",
};

export const SOCIAL_ROUTES = {
  SEND_REQUEST: "/send-request",
  ACCEPT_REQUEST: "/accept-request",
  REJECT_REQUEST: "/reject-request",
};

export const USER_ROUTES = {
  GET_USERS: "/",
  GET_NOTIF: "/notif",
  GET_USER: "/me"
}

export const CHAT_ROUTES = {
  CREATE: "/create",
  SEND: "/sendMessage",
  GET: "/getMessages/:conversationId",
  GET_CONVO: "/"
};

export const MEET_ROUTES = {
  REQUEST: "/request",
  ACCEPT: "/accept/:meetingId/:time",
  CANCEL: "/cancel/:meetingId",
};

export const AVATAR_ROUTES = {
  GET_AVATARS: "/",
  GET_AVATAR: "/:id"
}

export const API_ROUTES = {
  USER: "/api/user",
  SOCIAL: "/api/social",
  CHAT: "/api/chat",
  MEETING: "/api/meet",
  AVATAR: "/api/avatar",
  COMPLAINT: "/api/complaint"
};