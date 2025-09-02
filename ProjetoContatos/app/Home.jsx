import { View, Text, Image, Pressable,} from 'react-native'
import { Link } from 'expo-router';
import styles from '../styles/styles'

export default function Home() {
    return (
        <View style={styles.container}>

        <View style={styles.subContainer}>
            <Image 
            style={styles.image}
            source={require('../assets/images/pokebola.png')}/>

                <Text style={styles.title}> Bem Vindo ao App de Pokemon </Text>

                <Text style={styles.description}> Veja seus Pokemons preferidos </Text>

                <View style={styles.buttonView}>

                <Link href={'/Pokemons'}>
                <Pressable style={styles.button}>
                    <Text style={styles.textButton}> Ver lista de Pokemons </Text>
                </Pressable>
                </Link>

                </View>
        </View>

        </View>
    )
}