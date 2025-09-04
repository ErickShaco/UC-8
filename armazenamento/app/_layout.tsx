import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Keyboard,
  Modal,
  Animated,
  Button,
  Easing,
} from "react-native";

import Feather from "@expo/vector-icons/Feather";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system";

import styles from "../styles/styles";

const NOTES_KEY = "@NOTAS";
const PIN_KEY = "user_pin";

export default function App() {
  const [hasPin, setHasPin] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [pinStep, setPinStep] = useState("enter");
  const [tempPin, setTempPin] = useState("");
  const [nota, setNota] = useState("");
  const [notas, setNotas] = useState([]);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  const abrirEdicao = (item) => {
    setItemSelecionado(item);
    setNota(item.text); // Preenche o campo com o texto da nota selecionada
  };

  useEffect(() => {
    (async () => {
      try {
        const savedPin = await SecureStore.getItemAsync(PIN_KEY);
        setHasPin(!!savedPin);
        setPinStep(savedPin ? "enter" : "set");
      } catch (_error) {
        setHasPin(false);
        setPinStep("set");
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(NOTES_KEY);
        if (raw) setNotas(JSON.parse(raw));
      } catch (_error) {}
    })();
  }, []);

  const persistNotas = async (list) => {
    setNotas(list);
    try {
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(list));
    } catch (_error) {
      Alert.alert("Erro", "Não foi possível salvar suas notas.");
    }
  };

  const clearNotas = () => {
    Alert.alert(
      "Limpar tudo",
      "Tem certeza que deseja apagar todas as notas?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => persistNotas([]),
        },
      ]
    );
  };

  const excluirNota = (item) => {
    Alert.alert(
      "Excluir Nota",
      "Tem Certeza que Deseja Excluir essa Nota??",
      [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          const novasNotas = notas.filter(n => n.id !== item.id);
          persistNotas(novasNotas);
        }
      }
    ]
    )
  }

  const exportBackup = async () => {
    try {
      const path = FileSystem.documentDirectory + "notes-backup.json";

      await FileSystem.writeAsStringAsync(path, JSON.stringify(notas), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      Alert.alert("Backup criado", `Arquivo salvo em:\n${path}`);
    } catch (_error) {
      Alert.alert("Erro", "Falha ao criar backup.");
    }
  };

  const showBackup = async () => {
    try {
      const path = FileSystem.documentDirectory + "notes-backup.json";

      const content = await FileSystem.readAsStringAsync(path);

      Alert.alert("Backup encontrado", content);
    } catch (_error) {
      Alert.alert("Erro", "Não foi possível abrir o backup.");
    }
  };
  const addNota = () => {
    const text = nota.trim();
    if (!text) return;
    const nova = { id: Date.now().toString(), text };
    persistNotas([nova, ...notas]);
    setNota("");
    Keyboard.dismiss();
  };

  const salvarEditNota = () => {
    const text = nota.trim();
    if (!text || !itemSelecionado) return;
    const novasNotas = notas.map((n) =>
      n.id === itemSelecionado.id ? { ...n, text } : n
    );
    persistNotas(novasNotas);
    setNota("");
    setItemSelecionado(null);
    Keyboard.dismiss();
  };

  const handlePinSubmit = async () => {
    const code = pinInput.trim();

    if (code.length < 4) {
      Alert.alert("PIN inválido", "Use pelo menos 4 dígitos.");
      return;
    }

    if (pinStep === "set") {
      setTempPin(code);
      setPinInput("");
      setPinStep("confirm");
      return;
    }

    if (pinStep === "confirm") {
      if (code !== tempPin) {
        Alert.alert("Não confere", "Os PINs não são iguais");
        return;
      }

      try {
        await SecureStore.setItemAsync(PIN_KEY, code, {
          keychainService: "appPin",
        });

        setHasPin(true);
        setPinStep("enter");
        setPinInput("");

        Alert.alert("Pronto", "PIN configurado com sucesso.");
      } catch (_error) {
        Alert.alert("Erro", "Não foi possível salvar o PIN");
      }
      return;
    }

    try {
      const savedPin = await SecureStore.getItemAsync(PIN_KEY);
      if (savedPin && code === savedPin) {
        setPinInput("");
      } else {
        Alert.alert("PIN incorreto", "Tente novamente.");
      }
    } catch (_error) {
      Alert.alert("Erro", "Falha ao verificar PIN.");
    }
  };

  if (hasPin === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Carregando…</Text>
      </View>
    );
  }

  if (!hasPin || pinStep !== "enter") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {pinStep === "set"
            ? "Crie um PIN"
            : pinStep === "confirm"
            ? "Confirme o PIN"
            : "Digite seu PIN"}
        </Text>

        <TextInput
          style={styles.input}
          value={pinInput}
          onChangeText={setPinInput}
          placeholder="PIN (mín. 4 dígitos)"
          keyboardType="numeric"
          secureTextEntry
          maxLength={10}
        />

        <TouchableOpacity style={styles.button} onPress={handlePinSubmit}>
          <Text style={styles.buttonText}>
            {pinStep === "enter" ? "Entrar" : "Salvar PIN"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Notas</Text>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={nota}
          onChangeText={setNota}
          placeholder="Escreva uma nota…"
          returnKeyType="done"
          onSubmitEditing={itemSelecionado ? salvarEditNota : addNota}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={itemSelecionado ? salvarEditNota : addNota}
        >
          <Text style={styles.buttonText}>
            {itemSelecionado ? "Salvar" : "+"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>{item.text} </Text>
            <View>
              <Feather
                onPress={() => abrirEdicao(item)}
                style={styles.iconEdit}
                name="edit-2"
                size={20}
                color="white"
              />
            </View> 
            <View>
              <Feather onPress={() => excluirNota(item)}  style={styles.iconEdit} name="trash" size={20} color="white" />
            </View>
          </View>
        )}
      />

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={clearNotas}
          style={[styles.button, styles.secondary]}
        >
          <Text style={styles.buttonText}>Limpar Tudo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={exportBackup}
          style={[styles.button, styles.secondary]}
        >
          <Text style={styles.buttonText}>Exportar Backup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={showBackup}
          style={[styles.button, styles.secondary]}
        >
          <Text style={styles.buttonText}>Mostrar Backup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
