import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useAppSelector, useThunkDispatch} from '../state/hooks';
import {fetchStores} from '../state/store/reducer';
import {useNavigation} from '@react-navigation/native';
import {NavigationProps} from '../../App';
import {Button, Checkbox, Divider, Menu, Searchbar} from 'react-native-paper';
import useDebounce from '../hooks/useDebounce';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface IItem {
  name: string;
  id: string;
}

export interface IFilter {
  route: Array<string>;
  type: string;
}

const Item = ({name, id}: IItem) => {
  const navigation = useNavigation<NavigationProps>();
  const handlePress = useCallback(() => {
    if (id) {
      navigation.navigate('StoreDetail', {storeId: id});
    }
  }, [navigation, id]);

  return (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.8}
      onPress={handlePress}>
      <Text style={styles.title}>{name}</Text>
      <Image
        style={styles.itemImg}
        source={{uri: 'https://cdn-icons-png.flaticon.com/512/32/32213.png'}}
      />
    </TouchableOpacity>
  );
};

const Home = () => {
  const dispatch = useThunkDispatch();
  const user = useAppSelector(s => s.user);
  const stores = useAppSelector(s => s.store);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [visible, setVisible] = React.useState(false);
  const [filter, setFilter] = useState<IFilter>({
    route: [],
    type: '',
  });
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  useDebounce(
    () => {
      if (searchQuery) {
        dispatch(
          fetchStores({userId: user?.id, searchQuery: searchQuery, filter}),
        );
      }
    },
    [searchQuery],
    800,
  );

  const onChangeSearch = (query: string) => {
    if (!query) {
      dispatch(fetchStores({userId: user?.id, filter, clearRef: true}));
    }
    setSearchQuery(query);
    setFilter({
      route: [],
      type: '',
    });
  };

  function _renderFooter() {
    if (stores?.isLastDoc || searchQuery) {
      return null;
    }
    return (
      <Button
        style={styles.loadingBtn}
        onPress={getData}
        mode="contained"
        disabled={stores?.isLoading}
        loading={stores?.isLoading}>
        {stores?.isLoading ? 'Loading' : 'Load More'}
      </Button>
    );
  }

  const getData = useCallback(() => {
    if (stores?.isLoading || stores?.isLastDoc) return;

    dispatch(fetchStores({userId: user?.id, filter}));
  }, [dispatch, stores?.isLoading, stores?.isLastDoc, user?.id, filter]);

  useEffect(() => {
    if (user?.id) {
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleCheckBoxPress = (id: string, value: string) => () => {
    if (searchQuery) {
      setSearchQuery('');
    }
    let updatedFilter = filter;
    if (id === 'route') {
      const isChecked = filter?.route?.some(i => i === value);

      if (!isChecked) {
        updatedFilter = {...filter, route: [...filter.route, value]};
        setFilter(updatedFilter);
      } else {
        updatedFilter = {
          ...filter,
          route: filter.route.filter(i => i !== value),
        };
        setFilter(updatedFilter);
      }
    } else {
      updatedFilter = {...filter, type: filter?.type ? '' : value};
      setFilter(updatedFilter);
    }
    dispatch(
      fetchStores({userId: user?.id, filter: updatedFilter, clearRef: true}),
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.leftTxt}>User : {user.name}</Text>
      {/* <Text style={styles.txt}>STORES</Text> */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search"
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <Icon
              style={styles.filterIcon}
              onPress={openMenu}
              name="filter-variant"
              size={30}
            />
          }>
          <Text style={styles.menuTitle}>ROUTE</Text>
          <Divider />

          {['r1', 'r2', 'r3', 'r4', 'r5', 'r6']?.map(label => (
            <Checkbox.Item
              key={label}
              onPress={handleCheckBoxPress('route', label)}
              label={label}
              status={
                filter?.route?.some(i => i === label) ? 'checked' : 'unchecked'
              }
            />
          ))}
          <Text style={styles.menuTitle}>TYPE</Text>
          <Divider />
          <Checkbox.Item
            onPress={handleCheckBoxPress('type', 'General Store')}
            label="General Store"
            status={filter?.type ? 'checked' : 'unchecked'}
          />
        </Menu>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={stores?.stores}
        renderItem={({item}) => <Item name={item?.name} id={item.id} />}
        keyExtractor={item => item?.id}
        ListFooterComponent={_renderFooter}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {flex: 1, width: '100%', padding: 20, backgroundColor: 'white'},
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  searchbar: {
    flex: 1,
  },
  leftTxt: {
    marginBottom: 10,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  item: {
    backgroundColor: 'lightblue',
    marginTop: 6,
    padding: 18,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    flex: 1,
  },
  itemImg: {width: 20, height: 20},
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  footerloader: {margin: 15},
  footerBtn: {alignSelf: 'center', marginTop: 10},
  loadingBtn: {marginTop: 10},
  filterIcon: {marginLeft: 10},
  menuTitle: {padding: 10, fontWeight: 'bold'},
});
