import { View, Text, StyleSheet, ScrollView } from 'react-native';

const teamMembers = [
  { name: 'الاء سيد صادق سيد', id: '2127411', email: 'alaasayed2003115@gmail.com', github: 'alaasayedsadek' },
  { name: 'كريم محمد قرنى امين', id: '2027064', email: 'kimotheone168@gmai.com ', github: 'Kareem-Koga' },
  { name: 'فاطمه الزهراء على', id: '2127241', email: 'fatmaali8053@gmail.com', github: 'FatmaEl-zahraaali' },
  { name: 'الاء اسامه خليفه', id: '2227083', email: 'alaakhalifa2910@gmail.com', github: 'AlaaOsama-29' },
  { name: 'صلاح الدين اشرف حسن', id: '2127383', email: '', github: '' },
  { name: 'هاجر مجدى عامر', id: '2127242', email: 'hagermagdy380@gmail.com', github: 'hagermagdy380' },

];

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Team members </Text>
      {teamMembers.map((member, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.name}>{member.name}</Text>
          <Text style={styles.info}>ID: {member.id}</Text>
          {member.email ? <Text style={styles.info}>📧 {member.email}</Text> : null}
          {member.github ? <Text style={styles.info}>🔗 <Text style={styles.link}>{member.github}</Text></Text> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8f8f8',
  },
  info: {
    color: '#ccc',
    fontSize: 14,
  },
  link: {
    color: '#1e90ff',
    textDecorationLine: 'underline',
  },
});
