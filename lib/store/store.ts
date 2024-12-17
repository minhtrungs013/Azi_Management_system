// app/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import counterReducer from './features/counterSlice';
import projectSlice from './features/projectSlice';
import taskSlice from './features/taskSlice';
import notificationSlice from './features/notificationSlice';
// export const store = configureStore({
//   reducer: {
//     auth: counterReducer,
//   },
// });


// Configuration for redux-persist
const persistConfig = {
  key: 'root', // Key to identify the persisted data
  storage, // Use localStorage as default
};

const persistedReducer = persistReducer(persistConfig, counterReducer);

const store = configureStore({
  reducer: {
    auth: persistedReducer, // Replace your authReducer with the persisted reducer
    project: projectSlice, // Replace your authReducer with the persisted reducer
    task: taskSlice, // Replace your authReducer with the persisted reducer
    notification: notificationSlice, // Replace your authReducer with the persisted reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});


export const persistor = persistStore(store); 
// Define RootState and AppDispatch types for use throughout your app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;