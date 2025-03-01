import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, ScrollView, View, ActivityIndicator, Dimensions 
} from 'react-native';
import { 
  PieChart, LineChart, BarChart, StackedBarChart, ProgressChart, ContributionGraph 
} from 'react-native-chart-kit';
import { Button, Text, DataTable, Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

const screenWidth = Dimensions.get('window').width;
const API_URL = `https://api.thingspeak.com/channels/2858135/feeds.json?api_key=SKW4Z74VMRJ9LHVP&results=10`;

const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#f5f5f5",
  backgroundGradientTo: "#e0e0e0",
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

export default function VisualizationScreen() {
  const [data, setData] = useState<{ name: string; population: number; color: string; legendFontColor: string; legendFontSize: number; }[]>([]);
  const [lineData, setLineData] = useState<{ labels: number[]; datasets: { data: number[]; color: (opacity?: number) => string; strokeWidth: number; }[]; } | null>(null);
  const [barData, setBarData] = useState<{ labels: string[]; datasets: { data: number[]; color: (opacity?: number) => string; strokeWidth: number; }[]; } | null>(null);
  const [stackedBarData, setStackedBarData] = useState<{ labels: string[]; datasets: { data: number[]; color: (opacity?: number) => string; strokeWidth: number; }[]; } | null>(null);
  const [progressData, setProgressData] = useState<{ data: number[] }>({ data: [] });
  const [contributionData, setContributionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`HTTP Status ${response.status}`);
      const result = await response.json();

      if (!result.feeds || !Array.isArray(result.feeds)) throw new Error('Invalid API Response');
      
      setData(processPieChartData(result.feeds));
      setLineData(processLineChartData(result.feeds));
      setBarData(processBarChartData(result.feeds));
      setStackedBarData(processBarChartData(result.feeds));
      setProgressData(processProgressChartData(result.feeds));
      setContributionData(processContributionChartData(result.feeds));
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchData();
  }, []);

  const processPieChartData = (feeds: any[]) => {
    let counts = { shoulder1: 0, shoulder2: 0, upperBack: 0, lowerBack: 0 };
    feeds.forEach(feed => {
      counts.shoulder1 += Number(feed.field1) || 0;
      counts.shoulder2 += Number(feed.field2) || 0;
      counts.upperBack += Number(feed.field3) || 0;
      counts.lowerBack += Number(feed.field4) || 0;
    });

    return [
      { name: 'Right Shoulder', population: counts.shoulder1, color: '#FF6384', legendFontColor: '#333', legendFontSize: 15 },
      { name: 'Left Shoulder', population: counts.shoulder2, color: '#36A2EB', legendFontColor: '#333', legendFontSize: 15 },
      { name: 'Upper Back', population: counts.upperBack, color: '#FFCE56', legendFontColor: '#333', legendFontSize: 15 },
      { name: 'Lower Back', population: counts.lowerBack, color: '#4CAF50', legendFontColor: '#333', legendFontSize: 15 },
    ];
  };

  const processLineChartData = (feeds: any[]) => ({
    labels: feeds.map((_, index) => index + 1),
    datasets: [
      {
        data: feeds.map(feed => Number(feed.field3) || 0),
        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
        strokeWidth: 2,
      }
    ]
  });

  const processBarChartData = (feeds: any[]) => ({
    labels: feeds.map((_, index) => `Label ${index + 1}`),
    datasets: [
      {
        data: feeds.map(feed => Number(feed.field1) || 0),
        color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
        strokeWidth: 2,
      }
    ]
  });

  const processProgressChartData = (feeds: { field3: any; }[]) => ({
    data: [
      Number(feeds[0]?.field3 || 0) / 100,
      Number(feeds[0]?.field3 || 0) / 100,
      Number(feeds[0]?.field3 || 0) / 100,
    ],
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Button mode="contained" onPress={fetchData} style={styles.refreshButton}>Refresh Data</Button>
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Pie Chart */}
        <Card style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Pie Chart: Posture Problem Distribution</Text>
          <PieChart
            data={data}
            width={screenWidth - 40}
            height={220}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            chartConfig={chartConfig}
          />
          <Text>💡 Maintain good posture and take breaks to avoid back issues.</Text>
        </Card>

        {/* Progress Chart */}
        <Card style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Progress Chart: Recovery Progress</Text>
          <ProgressChart
            data={progressData}
            width={screenWidth - 40}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={chartConfig}
          />
          <Text>💡 Keep up with daily exercises for continuous improvement.</Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContainer: { alignItems: 'center', paddingBottom: 20 },
  refreshButton: { marginTop: 10 },
  chartContainer: { width: '90%', padding: 16, marginVertical: 10, backgroundColor: '#FFF', borderRadius: 12, elevation: 3 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  errorText: { color: 'red', marginTop: 10 },
});
function processContributionChartData(feeds: any): React.SetStateAction<never[]> {
  throw new Error('Function not implemented.');
}

