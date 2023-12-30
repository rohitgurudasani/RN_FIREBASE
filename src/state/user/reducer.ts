import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string) => {
    const usersDoc = await firestore().collection('users').doc(userId).get();
    if (usersDoc.exists) {
      return {...usersDoc.data(), id: userId};
    }
  },
);

const initialState = {
  id: '',
  name: '',
  stores: [],
  isLoading: true,
  error: '',
};
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    userLogout() {
      return initialState;
    },
    startLoading(state) {
      state.isLoading = true;
    },
    endLoading(state) {
      state.isLoading = false;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchUser.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      return {...state, isLoading: false, ...(action.payload || {})};
    });
    builder.addCase(fetchUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action?.error?.message!;
    });
  },
});
export const {userLogout, startLoading, endLoading} = userSlice.actions;
export default userSlice.reducer;
