import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  SafeAreaView 
} from 'react-native';
import spacexApi from '../api/spacexApi';


interface Capsule {
  id: number;
  serial: string;
  status: string;
  type: string;
}

const HomeScreen = () => {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCapsules();
  }, []);

  const fetchCapsules = async () => {
    try {
      setError(null);

      const response = await spacexApi.get('/list/'); 
      setCapsules(response.data);
    } catch (err: any) {
      console.error("Erreur de récupération :", err);
      setError("Impossible de charger les capsules. Vérifie ton serveur Django.");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des données SpaceX...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <Text style={styles.retryText} onPress={fetchCapsules}>Réessayer</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Capsules SpaceX</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{capsules.length} trouvées</Text>
        </View>
      </View>

      <FlatList
        data={capsules}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.serialLabel}>Série :</Text>
              <Text style={styles.serialValue}>{item.serial}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.cardRow}>
              <Text style={styles.detailLabel}>Statut :</Text>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#4CD964' : '#FF3B30' }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.cardRow}>
              <Text style={styles.detailLabel}>Type :</Text>
              <Text style={styles.detailValue}>{item.type}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune capsule enregistrée dans la base de données.</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#D1D1D6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#1C1C1E' },
  badge: { backgroundColor: '#007AFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  listContent: { padding: 15 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  serialLabel: { fontSize: 14, color: '#8E8E93', fontWeight: '600' },
  serialValue: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  divider: { height: 1, backgroundColor: '#E5E5EA', marginVertical: 8 },
  detailLabel: { fontSize: 14, color: '#3A3A3C' },
  detailValue: { fontSize: 14, fontWeight: '500', color: '#1C1C1E' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  loadingText: { marginTop: 10, color: '#8E8E93' },
  errorText: { color: '#FF3B30', textAlign: 'center', fontSize: 16, marginBottom: 10 },
  retryText: { color: '#007AFF', fontWeight: 'bold', fontSize: 18 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#8E8E93', fontSize: 16 }
});

export default HomeScreen;