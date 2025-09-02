import {View, Text, Image, Pressable} from "react-native"
import styles from "../styles/styles"


export default function ContactCard({item, onPress}){
    return(
        <Pressable onPress={onPress}  style={styles.card}>
            <Image source={item.photo} style={styles.avatar} />
            <View>
                <Text>{item.name}</Text>
                <Text>{item.type}</Text>
            </View>

        </Pressable>
    )
}