import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {AppDispatch, AppState, ThunkAppDispatch} from './index';

export const useThunkDispatch = () => useDispatch<ThunkAppDispatch>();
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
