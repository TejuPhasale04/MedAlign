import React, { useState, useEffect, useCallback } from 'react';
import { 
  Text, FlatList, RefreshControl, StyleSheet, 
  View, SafeAreaView, StatusBar, ActivityIndicator, Dimensions 
} from 'react-native';

// TypeScript interfaces
interface FeedItem {
  entry_id: number;
  field1?: string;
  field2?: string;
  field3?: string;
  field4?: string;
  created_at?: string;
}

interface ChannelInfo {
  name?: string;
  updated_at?: string;
}

// Get screen width for dynamic scaling
const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [data, setData] = useState<FeedItem[]>([]);
  const [channelInfo, setChannelInfo] = useState<ChannelInfo>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://api.thingspeak.com/channels/2858135/feeds.json?api_key=SKW4Z74VMRJ9LHVP&results=10'
      );
      const result = await response.json();
      setData(result.feeds || []);
      setChannelInfo(result.channel || {});
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const renderItem = ({ item }: { item: FeedItem }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Data Entry (ID: {item.entry_id})</Text>
      <Text style={styles.cardText}>Shoulder 1: {item.field1 || 'N/A'}</Text>
      <Text style={styles.cardText}>Shoulder 2: {item.field2 || 'N/A'}</Text>
      <Text style={styles.cardText}>Upper Back: {item.field3 || 'N/A'}</Text>
      <Text style={styles.cardText}>Lower Back: {item.field4 || 'N/A'}</Text>
      <Text style={styles.cardTimestamp}>
        Created At: {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#0056b3" barStyle="light-content" /> 

      {/* Header */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{channelInfo?.name || 'Health Data Visualization'}</Text>
        <Text style={styles.updatedText}>
          Last Updated: {channelInfo?.updated_at ? new Date(channelInfo.updated_at).toLocaleString() : 'N/A'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0056b3" style={styles.loader} />
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.entry_id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8ECF4', 
  },
  titleContainer: {
    backgroundColor: '#0056b3', 
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  updatedText: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 5,
    textAlign: 'center',
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center',
  },
  card: {
    padding: 20,
    marginVertical: 10,
    width: width * 0.9, 
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  cardText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    color: '#444',
  },
  cardTimestamp: {
    fontSize: 14,
    color: '#777',
    marginTop: 12,
    textAlign: 'center',
  },
  loader: {
    marginTop: 50,
  },
});

export default HomeScreen;
