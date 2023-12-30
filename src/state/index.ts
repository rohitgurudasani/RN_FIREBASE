import {ThunkDispatch} from 'redux-thunk';
import {reducers} from './reducers';
import {Action} from 'redux';
import {configureStore} from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: reducers,
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type ThunkAppDispatch = ThunkDispatch<AppState, any, Action>;
