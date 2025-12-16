import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import chatReducer from "./slices/chatSlice";
import { authApi } from "./api/authApi";
import { chatApi } from "./api/chatApi";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import localForage from "localforage";


const authPersistConfig = {
  key: "auth",
  storage: localForage,
  whitelist: ["token", "user"], 
};

const chatPersistConfig = {
  key: "chat",
  storage: localForage,
  whitelist: ["messages"], 
};


const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  chat: persistReducer(chatPersistConfig, chatReducer),
  [authApi.reducerPath]: authApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
});


export const store = configureStore({
  reducer: persistReducer(
    {
      key: "root",
      storage: localForage,
      blacklist: [authApi.reducerPath, chatApi.reducerPath],
    },
    rootReducer
  ),

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authApi.middleware, chatApi.middleware),
});


export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
