import React, {memo, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {emailValidator, passwordValidator} from '../utilities/index.utilities';
import TextInput from '../components/TextInput.component';
import {Button} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import {useThunkDispatch} from '../state/hooks';
import {startLoading} from '../state/user/reducer';

const LoginScreen = () => {
  const [email, setEmail] = useState({value: 'user1@email.com', error: ''});
  const [password, setPassword] = useState({value: 'retailpulse', error: ''});
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useThunkDispatch();

  const onLoginPressed = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const emailError = emailValidator(email.value);
      const passwordError = passwordValidator(password.value);

      if (emailError || passwordError) {
        setEmail({...email, error: emailError});
        setPassword({...password, error: passwordError});
        return;
      }
      const confirmation = await auth().signInWithEmailAndPassword(
        email?.value,
        password?.value,
      );
      console.log('confirmation', confirmation);
      dispatch(startLoading());
      setIsLoading(false);
    } catch (error) {
      Alert.alert(
        'Invalid credentails',
        'Try with user1@email.com or user2@email.com',
      );
      console.log('error', error);

      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={text => setEmail({value: text, error: ''})}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        textContentType="emailAddress"
        keyboardType="email-address"
      />

      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={text => setPassword({value: text, error: ''})}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />

      <Button
        loading={isLoading}
        disabled={isLoading}
        mode="contained"
        onPress={onLoginPressed}>
        Login
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(LoginScreen);
