import React, { useState, useEffect, useCallback } from 'react';
import { View, 
  Image, 
  Text,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useDispatch } from 'react-redux';
import styles from './styles';

import Feather from 'react-native-vector-icons/Feather';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import logoImg from '../assets/logo.png';
import { Colors } from 'react-native-paper';

import UserConfirmScreen from './UserConfirm/UserConfirmScreen';
import * as botActions from '../../store/actions/bot';
import * as userActions from '../../store/actions/user';

const BotsSelectScreen = props => {
  const [isLoading, setIsLoading] = useState(true);
  const [confirmedUser, setConfirmedUser] = useState(false);
  const [error, setError] = useState();
  const [botList, setBotList] = useState();
  const dispatch = useDispatch();

  const confirmUser = () => {
    console.log('usuari confirmado')
    setConfirmedUser(true);
  }

  const bfunction = props.navigation.getParam('function');
  const tdata = props.navigation.getParam('data');

  const loadBots = useCallback(async () => {
    // console.log('aqui!\n');
    setError(null);
    setIsLoading(true);
    try {
      const res = await dispatch(botActions.getBotList());
      // console.log(res);
      const bots = res.map((bot) => {return {...bot, selected: true}});
      setBotList(bots);
      setIsLoading(false);
    } catch (err) {
      // console.log(err.message.code, 'err a');
      setIsLoading(false);
      setError(err.message);
    }
    
  }, [dispatch, setIsLoading, setError]);

  useEffect(() => {
    setIsLoading(true);
    loadBots().then(() => {
      setIsLoading(false);
    });
  }, [dispatch, loadBots]);

  useEffect(() => {
    if (error) {
      Alert.alert('Pempp!', error, [{ text: 'Ok' }]);
    }
  }, [error]);

  function toggle(id){
    var test = botList.map((item) => {
      if(item.id === id){
        item.selected = !item.selected;
      }

      return item;
    });

    setBotList(test)
  }

  async function tweet(){
    var botSelected = botList.filter((bot) => bot.selected);
    botSelected = botSelected.map((bot) => bot.id);
    
    if(botSelected.length === 0){
      Alert.alert('Pempp!', 'Escolha ao menos um bot', [{ text: 'Ok' }]);
      return;
    }

    setIsLoading(true);

    try{
      let res;
      
      switch(bfunction){
        case 'follow':
          res = await dispatch(botActions.follow(botSelected, tdata));
          break;
        case 'like':
          res = await dispatch(botActions.like(botSelected, tdata));
          break;
        case 'retweet':
          res = await dispatch(botActions.retweet(botSelected, tdata));
      }

      dispatch(userActions.new_handle(tdata));
      setIsLoading(false);
      props.navigation.pop();
    }catch(e){
      setIsLoading(false);
      setError(e.message);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.contentCenter}>
        <ActivityIndicator size="large" color={Colors.blue200} />
      </View>);
  }

  if (!confirmedUser) {
    return (
    <UserConfirmScreen
    confirmUser={confirmUser}
    />);
  }

  return (
    <View style={styles.screen}> 
    <View style={styles.container}>
      <Image style={styles.imagem} source={logoImg}/>
      <Text>Escolha um ou mais bots 
        para realizar a ação {bfunction}>{tdata}</Text>

      <FlatList 
        style={styles.list}
        showsVerticalScrollIndicator={false}
        data={botList}
        keyExtractor={botItem => botItem.handle}
        renderItem={(bot) => {
          bot = bot.item;

          return(
          <TouchableOpacity onPress={toggle.bind(this, bot.id)}>
            <View style={styles.listContainer}>
              <Image style={styles.profile} source={{ uri: bot.profileImage }} />
              <View style={styles.names}>
              <Text style={styles.nameProfile}>{bot.name}</Text>
              <Text >{bot.handle}</Text>
              </View>

              <Feather style = {styles.icon} name = {bot.selected ? "disc" : "circle"}
               size={16} color={!bot.selected ? "#657786" : "#1DA1F2"}/>
          
            </View>
          </TouchableOpacity>
        )}}
      />
      <View style={styles.actions}>
        <TouchableOpacity 
        style={styles.button} 
        onPress={tweet.bind(this)}
        >
          <Text style={styles.buttonText}>Prosseguir</Text>
        </TouchableOpacity>

        <TouchableOpacity style={ [styles.button, {backgroundColor: '#657786'}] } onPress={() => {props.navigation.pop()} }>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
  );
};

export default BotsSelectScreen;
