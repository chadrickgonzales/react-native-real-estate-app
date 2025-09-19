import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { getProperties, testAppwriteSetup, testImageUpload } from '../lib/appwrite';
import seed from '../lib/seed';

const AppwriteTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const runTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testAppwriteSetup();
      setTestResult(result ? "✅ Setup test passed!" : "❌ Setup test failed!");
    } catch (error: any) {
      setTestResult(`❌ Test error: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const runImageTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testImageUpload();
      setTestResult(result ? "✅ Image upload test passed!" : "❌ Image upload test failed!");
    } catch (error: any) {
      setTestResult(`❌ Image test error: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const runSeed = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      await seed();
      setTestResult("✅ Database seeded with 60 properties successfully!");
    } catch (error: any) {
      setTestResult(`❌ Seed error: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const checkDatabase = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const allProperties = await getProperties({ filter: 'All', query: '', limit: 100 });
      const uniqueTypes = [...new Set(allProperties.map(p => p.type))];
      setTestResult(`📊 Database has ${allProperties.length} properties. Types: ${uniqueTypes.join(', ')}`);
    } catch (error: any) {
      setTestResult(`❌ Database check error: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <View className="p-4 bg-white rounded-lg shadow-md m-4">
      <Text className="text-lg font-rubik-bold text-black mb-4">
        Appwrite Setup Test
      </Text>
      
      <View className="space-y-2">
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={runTest}
            disabled={isTesting}
            className={`flex-1 py-3 px-4 rounded-lg ${
              isTesting ? 'bg-gray-400' : 'bg-blue-600'
            }`}
          >
            <Text className="text-white font-rubik-bold text-center">
              {isTesting ? 'Testing...' : 'Test Setup'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={runImageTest}
            disabled={isTesting}
            className={`flex-1 py-3 px-4 rounded-lg ${
              isTesting ? 'bg-gray-400' : 'bg-green-600'
            }`}
          >
            <Text className="text-white font-rubik-bold text-center">
              {isTesting ? 'Testing...' : 'Test Upload'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={runSeed}
            disabled={isTesting}
            className={`flex-1 py-3 px-4 rounded-lg ${
              isTesting ? 'bg-gray-400' : 'bg-purple-600'
            }`}
          >
            <Text className="text-white font-rubik-bold text-center">
              {isTesting ? 'Seeding...' : 'Seed Database'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={checkDatabase}
            disabled={isTesting}
            className={`flex-1 py-3 px-4 rounded-lg ${
              isTesting ? 'bg-gray-400' : 'bg-orange-600'
            }`}
          >
            <Text className="text-white font-rubik-bold text-center">
              {isTesting ? 'Checking...' : 'Check Database'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {testResult && (
        <Text className={`mt-4 text-center font-rubik ${
          testResult.includes('✅') ? 'text-green-600' : 'text-red-600'
        }`}>
          {testResult}
        </Text>
      )}
      
      <Text className="text-sm text-gray-600 mt-4">
        This will test your Appwrite configuration including:
        • Storage bucket setup
        • Database connection
        • Collection permissions
        • Seed database with 60 properties (30 rent, 30 sale)
      </Text>
    </View>
  );
};

export default AppwriteTest;
