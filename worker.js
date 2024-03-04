/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');
dotenv.config();
const redis = require('redis');
const io = require('socket.io-client');
const axios = require('axios');

const ONE_MESSAGE_FROM_BULK_LIST_NAME = 'one_message_from_bulk';
const REFRESH_TOKEN_URL = '/api/auth/refresh_token/';
const USER_TYPE = 'AGENT';
const NEW_MESSAGE_EVENT_NAME = 'new_message';
const SOCKET_EVENTS = {
  CONNECT: 'connect',
  AUTH_ERROR: 'auth_error',
  CONNECT_ERROR: 'connect_error',
};
const PROCESS_EVENTS = {
  SIGINT: 'SIGINT',
  SIGTERM: 'SIGTERM',
  SIGQUIT: 'SIGQUIT',
};
const CONVERSATION_CHANNEL = {
  SMS: 'SMS',
};

// Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_SERVER_URL,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

redisClient.on('connect', () => {
  const listenForTasks = async () => {
    await redisClient
      .brPop(ONE_MESSAGE_FROM_BULK_LIST_NAME, 0)
      .then((value) => {
        emitNewMessage(JSON.parse(value?.element));

        listenForTasks();
      });
  };

  listenForTasks();
});

// Axios
const refreshAccessToken = async (refreshToken) => {
  const axiosInstance = axios.create({
    baseURL: process.env.VITE_API_BASE_URL,
  });

  return await axiosInstance({
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      Cookie: 'uid=' + refreshToken,
    },
    withCredentials: true,
    url: REFRESH_TOKEN_URL,
  }).then(async (response) => {
    return response?.data?.user?.access_token;
  });
};

// Socket
const connectSocket = (accessToken, refreshToken) => {
  return new Promise((resolve) => {
    let validAccessToken = accessToken;
    let socket = null;

    const updateValidAccessToken = async () => {
      validAccessToken = await refreshAccessToken(refreshToken);

      if (socket) {
        socket.disconnect();
        updateSocket();
      }
    };

    const updateSocket = () => {
      socket = io(process.env.VITE_API_BASE_URL, {
        extraHeaders: {
          Type: USER_TYPE,
          Authorization: validAccessToken,
        },
        withCredentials: true,
      });

      socket.on(SOCKET_EVENTS.AUTH_ERROR, updateValidAccessToken);
      socket.on(SOCKET_EVENTS.CONNECT_ERROR, updateValidAccessToken);

      socket.on(SOCKET_EVENTS.CONNECT, () => {
        resolve(socket);
      });

      socket.connect();
    };

    updateSocket();
  });
};

// Functionality
const emitNewMessage = async (value) => {
  const socket = await connectSocket(
    value.user.token,
    value.user.refresh_token,
  );

  socket.emit(NEW_MESSAGE_EVENT_NAME, {
    data: {
      text: value.text,
      conversation_channel: CONVERSATION_CHANNEL.SMS,
      contact_id: value.contact_id,
      workspace_id: value.workspace_id,
    },
    event_name: NEW_MESSAGE_EVENT_NAME,
  });

  socket.disconnect();
};

// Lifecycle
const signalHandler = () => {
  redisClient.quit();
  process.exit();
};

process.on(PROCESS_EVENTS.SIGINT, signalHandler);
process.on(PROCESS_EVENTS.SIGTERM, signalHandler);
process.on(PROCESS_EVENTS.SIGQUIT, signalHandler);

redisClient.connect();
