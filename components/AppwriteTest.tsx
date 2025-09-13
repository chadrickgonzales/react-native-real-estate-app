import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { testAppwriteSetup, testImageUpload } from '../lib/appwrite';

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

  return (
    <View className="p-4 bg-white rounded-lg shadow-md m-4">
      <Text className="text-lg font-rubik-bold text-black mb-4">
        Appwrite Setup Test
      </Text>
      
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
      </Text>
    </View>
  );
};

export default AppwriteTest;
