import icons from '@/constants/icons'
import { useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { Image, TextInput, TouchableOpacity, View } from 'react-native'

const Search = () => {
  const params = useLocalSearchParams<{ query?: string }>()
  const [search, setSearch] = useState(params.query)

  const handleSearch = (text: string) => setSearch(text)

  return (
    <View className="flex flex-row justify-between w-full px-4 rounded-lg bg-accent-100 border border-primary-100 mt-5 py-2">

      <View className="flex-row items-center py-2">

        <Image source={icons.search} style={{ width: 20, height: 20,}}/>
        <TextInput value={search} onChangeText={handleSearch} placeholder="Search for anything" className="flex-1 text-sm font-rubik text-black-300"style={{ paddingVertical: 0 }} />
      </View>

      <TouchableOpacity>
          <Image source= {icons.filter} style={{ width: 20, height: 20, }} />
      </TouchableOpacity>

    </View>
  )
}

export default Search
