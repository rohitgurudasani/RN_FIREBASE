import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {IFilter} from '../../screens/Home.screen';

let ref: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null =
  null;
export const cleanRef = () => {
  ref = null;
};

export const fetchStores = createAsyncThunk(
  'store/fetchStores',
  async (data: {
    userId: string;
    searchQuery?: string;
    filter: IFilter;
    clearRef?: boolean;
  }) => {
    try {
      if (data?.clearRef) {
        ref = null;
      }
      let query = firestore()
        .collection('users')
        .doc(data?.userId)
        .collection('stores')
        .orderBy('name', 'asc');

      if (data?.searchQuery) {
        query = query
          .where('name', '>=', data.searchQuery.toUpperCase())
          .where('name', '<=', data.searchQuery.toUpperCase() + '\uf8ff');
      } else if (data?.filter?.route?.length) {
        query = query
          .where('route', 'in', data?.filter?.route)
          .startAfter(ref ? ref : 0);
      } else {
        query = query.startAfter(ref ? ref : 0);
      }

      const storeDocs = await query.limit(15).get();

      const documents: Array<IStore> = [];
      storeDocs.forEach(doc => {
        documents.push({id: doc.id, ...(doc.data() as any)});
      });
      console.log('documents', data, documents?.length);
      let isLastDoc = false;
      if (storeDocs.size) {
        ref = storeDocs.docs[storeDocs.docs.length - 1];
      } else {
        isLastDoc = true;
      }

      if (data?.searchQuery) {
        ref = null;
      }
      return {
        documents,
        isLastDoc: isLastDoc,
        searchQuery: data?.searchQuery,
        clearRef: data?.clearRef,
      };
    } catch (error) {
      console.log('error', error);
    }
  },
);

export const updateStore = createAsyncThunk(
  'store/updateStore',
  async (data: {
    storeId: string;
    fileName: string;
    fileUri: string;
    userId: string;
  }) => {
    const reference = storage().ref(data?.fileName);
    await reference.putFile(data?.fileUri);
    const uploadedUrl = await reference.getDownloadURL();
    console.log('uploadedUrl', uploadedUrl);

    await firestore()
      .collection('users')
      .doc(data?.userId)
      .collection('stores')
      .doc(data?.storeId)
      .set({imageUrl: uploadedUrl}, {merge: true});
    return {url: uploadedUrl, storeId: data?.storeId};
  },
);

interface IStore {
  id: string;
  address: string;
  area: string;
  name: string;
  route: string;
  type: string;
  imageUrl?: string;
}

interface IState {
  stores: Array<IStore>;
  isLoading: boolean;
  error: string;
  isLastDoc: boolean;
}
const initialState: IState = {
  stores: [],
  isLoading: false,
  error: '',
  isLastDoc: false,
};
const userSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    resetStore() {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchStores.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(fetchStores.fulfilled, (state, action) => {
      state.isLoading = false;
      if (Array.isArray(action?.payload?.documents)) {
        if (action?.payload?.searchQuery || action?.payload?.clearRef) {
          state.stores = action.payload.documents;
        } else {
          state.stores = [...state.stores, ...action?.payload?.documents];
        }
      }
      state.isLastDoc = action?.payload?.isLastDoc!;
    });
    builder.addCase(fetchStores.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action?.error?.message!;
    });
    builder.addCase(updateStore.fulfilled, (state, action) => {
      state.isLoading = false;
      state.stores = state?.stores?.map(st => {
        if (st?.id === action.payload.storeId) {
          return {...st, imageUrl: action.payload.url};
        }
        return st;
      });
    });
    builder.addCase(updateStore.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(updateStore.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action?.error?.message!;
    });
  },
});
export const {resetStore} = userSlice.actions;
export default userSlice.reducer;
