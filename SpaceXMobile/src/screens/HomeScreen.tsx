import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, StyleSheet, SafeAreaView, TextInput, 
  TouchableOpacity, Alert, Modal, ActivityIndicator, RefreshControl, ScrollView 
} from 'react-native';
import spacexApi from '../api/spacexApi';

interface Capsule {
  id: number;
  serial: string;
  status: string;
  type: string;
  missions_count: number;
  flight_types_count: number;
}

const HomeScreen = () => {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => { fetchCapsules(); }, []);

  const fetchCapsules = async () => {
    try {
      const response = await spacexApi.get('/list/');
      setCapsules(response.data);
    } catch (err) { 
      Alert.alert("Erreur", "Impossible de charger les données"); 
    } finally { 
      setLoading(false); setRefreshing(false); 
    }
  };

  const getStatsByType = () => {
    const counts: { [key: string]: number } = {};
    capsules.forEach(c => { counts[c.type] = (counts[c.type] || 0) + 1; });
    return Object.entries(counts).map(([type, count]) => `${type}: ${count}`).join(' | ');
  };

  const handleDelete = (id: number) => {
    Alert.alert("Confirmation", "Supprimer cette capsule ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: async () => {
          try {
            await spacexApi.delete(`/list/${id}/`);
            fetchCapsules();
          } catch (e) { Alert.alert("Erreur", "Échec de la suppression"); }
      }}
    ]);
  };

  const handleUpdate = async () => {
    if (!selectedCapsule) return;
    try {
      await spacexApi.patch(`/list/${selectedCapsule.id}/`, {
        serial: selectedCapsule.serial,
        status: selectedCapsule.status,
        type: selectedCapsule.type,
        missions_count: selectedCapsule.missions_count 
      });
      setModalVisible(false);
      fetchCapsules();
      Alert.alert("Succès", "Capsule mise à jour !");
    } catch (err) { 
      Alert.alert("Erreur", "Vérifiez que le Serial est unique"); 
    }
  };

  const openDetails = (capsule: Capsule) => {
    setSelectedCapsule({...capsule}); 
    setModalVisible(true);
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#007AFF" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SpaceX Tracker</Text>
        <Text style={styles.statsText}>Répartition : {getStatsByType()}</Text>
      </View>

      <FlatList
        data={capsules}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCapsules(); }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.serial}>{item.serial}</Text>
              <Text style={[styles.status, {color: item.status === 'active' ? '#34C759' : '#FF3B30'}]}>
                {item.status}
              </Text>
            </View>
            <Text style={styles.type}>Modèle : {item.type}</Text>
            
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🚀 Missions: {item.missions_count}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>📊 Vols distincts: {item.flight_types_count}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.btnDetail} onPress={() => openDetails(item)}>
                <Text style={styles.btnTextInfo}>Détails / Éditer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(item.id)}>
                <Text style={styles.btnTextDanger}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Modifier la Capsule</Text>
              
              <Text style={styles.label}>Numéro de Série :</Text>
              <TextInput 
                style={styles.input}
                value={selectedCapsule?.serial}
                onChangeText={(text) => selectedCapsule && setSelectedCapsule({...selectedCapsule, serial: text})}
              />

              <Text style={styles.label}>Statut (active, retired, destroyed) :</Text>
              <TextInput 
                style={styles.input}
                value={selectedCapsule?.status}
                onChangeText={(text) => selectedCapsule && setSelectedCapsule({...selectedCapsule, status: text.toLowerCase()})}
              />

              <Text style={styles.label}>Modèle / Type :</Text>
              <TextInput 
                style={styles.input}
                value={selectedCapsule?.type}
                onChangeText={(text) => selectedCapsule && setSelectedCapsule({...selectedCapsule, type: text})}
              />

              <Text style={styles.label}>Nombre de Missions (Manuel) :</Text>
              <TextInput 
                style={styles.input}
                keyboardType="numeric"
                value={selectedCapsule?.missions_count.toString()}
                onChangeText={(text) => {
                  const val = parseInt(text) || 0;
                  selectedCapsule && setSelectedCapsule({...selectedCapsule, missions_count: val});
                }}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btnCancel}>
                  <Text style={styles.btnTextCancel}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleUpdate} style={styles.btnSave}>
                  <Text style={styles.btnTextSuccess}>Sauvegarder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ... Styles inchangés ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#DDD' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E' },
  statsText: { fontSize: 12, color: '#007AFF', marginTop: 5, fontWeight: '600' },
  card: { backgroundColor: '#FFF', marginHorizontal: 15, marginTop: 15, padding: 15, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  serial: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  status: { fontWeight: '700', textTransform: 'uppercase', fontSize: 11 },
  type: { color: '#636366', marginBottom: 12, fontSize: 14 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  badge: { backgroundColor: '#F2F2F7', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  badgeText: { fontSize: 11, color: '#3A3A3C', fontWeight: '600' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderColor: '#E5E5EA', paddingTop: 12 },
  btnDetail: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#EBF5FF', borderRadius: 8 },
  btnTextInfo: { color: '#007AFF', fontWeight: '600', fontSize: 13 },
  btnDelete: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#FFF0F0', borderRadius: 8 },
  btnTextDanger: { color: '#FF3B30', fontWeight: '600', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  modalContent: { backgroundColor: '#FFF', margin: 20, padding: 25, borderRadius: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 13, color: '#8E8E93', marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#F2F2F7', padding: 12, borderRadius: 10, marginBottom: 18, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btnCancel: { flex: 1, marginRight: 10, padding: 14, alignItems: 'center' },
  btnTextCancel: { color: '#8E8E93', fontWeight: '600' },
  btnSave: { flex: 1, backgroundColor: '#34C759', padding: 14, borderRadius: 12, alignItems: 'center' },
  btnTextSuccess: { color: '#FFF', fontWeight: 'bold' }
});

export default HomeScreen;