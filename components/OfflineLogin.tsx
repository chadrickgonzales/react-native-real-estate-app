import { offlineAuth, OfflineUser } from '@/lib/offline-auth';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface OfflineLoginProps {
  onLogin: (user: OfflineUser) => void;
}

const OfflineLogin: React.FC<OfflineLoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string) => {
    try {
      setLoading(true);
      const user = await offlineAuth.loginWithEmail(email);
      
      if (user) {
        onLogin(user);
        Alert.alert('Success', `Welcome back, ${user.name}!`);
      } else {
        Alert.alert('Error', 'User not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const sampleUsers = offlineAuth.getAvailableUsers();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Offline Development</Text>
        <Text style={styles.subtitle}>Choose a sample user to continue</Text>
      </View>

      <View style={styles.usersContainer}>
        {sampleUsers.map((user) => (
          <TouchableOpacity
            key={user.$id}
            style={styles.userCard}
            onPress={() => handleLogin(user.email)}
            disabled={loading}
          >
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userRole}>
                {user.role === 'owner' ? '🏠 Property Owner' : '👤 Tenant'}
              </Text>
              <Text style={styles.userPreferences}>
                {user.preferences.propertyTypes.join(', ')} • 
                Max ₱{user.preferences.maxPrice.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 These are sample users for offline development
        </Text>
        <Text style={styles.footerText}>
          All data is stored locally on your device
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  usersContainer: {
    padding: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
    marginBottom: 4,
  },
  userPreferences: {
    fontSize: 12,
    color: '#6c757d',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default OfflineLogin;
