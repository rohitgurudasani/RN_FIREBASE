import {Image, StyleSheet, Text, View} from 'react-native';
import React, {useMemo} from 'react';
import {useAppSelector, useThunkDispatch} from '../state/hooks';
import {ScreenProps} from '../../App';
import {launchImageLibrary} from 'react-native-image-picker';
import {updateStore} from '../state/store/reducer';
import {Button} from 'react-native-paper';

export default function StoreDetail({route}: ScreenProps<'StoreDetail'>) {
  const dispatch = useThunkDispatch();

  const stores = useAppSelector(s => s.store);
  const user = useAppSelector(s => s.user);

  console.log(route?.params?.storeId);

  const store = useMemo(
    () => stores?.stores?.find(s => s.id === route?.params?.storeId),
    [route?.params?.storeId, stores?.stores],
  );

  const handleUploadImage = async () => {
    try {
      const result = await launchImageLibrary({mediaType: 'photo'});
      console.log('result', result);
      if (result.didCancel) {
      }
      const file = result?.assets?.[0];
      if (file?.uri) {
        dispatch(
          updateStore({
            storeId: route.params.storeId,
            fileName: file?.fileName!,
            fileUri: file?.uri,
            userId: user?.id,
          }),
        );
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{store?.name}</Text>
      {store?.imageUrl && (
        <View>
          <Image style={styles.image} source={{uri: store?.imageUrl}} />
        </View>
      )}
      <Button
        loading={stores.isLoading}
        disabled={stores.isLoading}
        mode="contained"
        onPress={handleUploadImage}>
        Upload Image
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, width: '100%', padding: 20},
  image: {width: '100%', height: 100, marginBottom: 10},
  text: {marginBottom: 20, fontWeight: 'bold'},
});
