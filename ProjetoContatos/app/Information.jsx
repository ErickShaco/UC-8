import { View, Text, Image } from "react-native";
import styles from "../styles/styles";

export default function Information({route}) {
  const item = route?.params?.item || {
    name: "Aplicativo de listar Pokemons",
    photo: require("../assets/images/pokebola.png"),
    info: "Este app é uma demonstração de navegação com React Native e Drawe",
  };

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={item.photo} />

      <Text style={styles.title}> {item.name} </Text>
      <Text style={styles.description}> {item.info} </Text>
    </View>
  );
}
