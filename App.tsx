/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useCallback, useEffect} from 'react';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {Home, Login} from './src/screens/index.screen';
import StoreDetail from './src/screens/StoreDetail.screen';
import {useAppSelector, useThunkDispatch} from './src/state/hooks';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {
  endLoading,
  fetchUser,
  startLoading,
  userLogout,
} from './src/state/user/reducer';
import LoadingScreen from './src/screens/Loading.screen';
import {NavigationContainer} from '@react-navigation/native';
import {IconButton} from 'react-native-paper';
import {cleanRef, resetStore} from './src/state/store/reducer';

export type RootStackParamList = {
  Home: undefined;
  StoreDetail: {storeId: string};
  Login: undefined;
};
type StackScreens = keyof RootStackParamList;

export type NavigationProps = NativeStackNavigationProp<
  RootStackParamList,
  StackScreens
>;

export type ScreenProps<ScreenName extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, ScreenName>;

function App(): React.JSX.Element {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const user = useAppSelector(state => state.user);
  const dispatch = useThunkDispatch();

  function _renderLogoutBtn() {
    return (
      <IconButton
        icon="power"
        iconColor={'rgb(200,0,0)'}
        size={30}
        onPress={async () => {
          try {
            auth().signOut();
            dispatch(userLogout());
            dispatch(resetStore());
            cleanRef();
          } catch (error) {}
        }}
      />
    );
  }

  const onAuthStateChanged = useCallback(
    (userData: FirebaseAuthTypes.User | null) => {
      console.log('userData', userData);

      if (userData?.uid) {
        dispatch(fetchUser(userData?.uid));
      } else {
        dispatch(endLoading());
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    dispatch(startLoading());
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return () => {
      subscriber();
      cleanRef();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onAuthStateChanged]);

  if (user?.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user?.id ? (
          <>
            <Stack.Screen
              name="Home"
              component={Home}
              options={{
                headerRight: _renderLogoutBtn,
              }}
            />
            <Stack.Screen name="StoreDetail" component={StoreDetail} />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={Login}
            options={{headerShown: false}}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
