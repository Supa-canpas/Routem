'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { userStore } from '@/lib/client/stores/userStore'
import UserProfileHeader from './_components/templates/userProfileHeader'
import UserProfileContent from './_components/templates/userProfileContent'

// モックデータ: 投稿されたルート用
const MOCK_ROUTES = [
  { 
    id: '1', 
    title: 'Summer Coastal Drive', 
    thumbnail: { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800' }, 
    likes: new Array(120).fill({}), 
    category: { name: 'Driving' },
    author: { name: 'Traveler' }
  },
  { 
    id: '2', 
    title: 'Kyoto Hidden Temples', 
    thumbnail: { url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800' }, 
    likes: new Array(85).fill({}), 
    category: { name: 'Walking' },
    author: { name: 'Traveler' }
  },
  { 
    id: '3', 
    title: 'Nagano Mountain Pass', 
    thumbnail: { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800' }, 
    likes: new Array(230).fill({}), 
    category: { name: 'Cycling' },
    author: { name: 'Traveler' }
  },
  { 
    id: '4', 
    title: 'Tokyo Night Walk', 
    thumbnail: { url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800' }, 
    likes: new Array(45).fill({}), 
    category: { name: 'Walking' },
    author: { name: 'Traveler' }
  },
  { 
    id: '5', 
    title: 'Hokkaido Flower Fields', 
    thumbnail: { url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800' }, 
    likes: new Array(310).fill({}), 
    category: { name: 'Touring' },
    author: { name: 'Traveler' }
  },
  { 
    id: '6', 
    title: 'Osaka Street Food Map', 
    thumbnail: { url: 'https://images.unsplash.com/photo-1590244921278-db049a2ef398?w=800' }, 
    likes: new Array(156).fill({}), 
    category: { name: 'Food' },
    author: { name: 'Traveler' }
  },
] as any

export default function RootClient({ id }: { id: string }) {
  const router = useRouter()
  const currentUser = userStore(state => state.user)
  const [activeTab, setActiveTab] = useState<'routes' | 'likes'>('routes')



  return (
    <div className="w-full h-fit">

      <UserProfileHeader
        name={currentUser?.name}
        bio={currentUser?.bio as string}
        iconUrl={currentUser?.icon?.url}
        bgUrl={currentUser?.background?.url}
        isOwnPage={currentUser?.id === id}
      />

      <UserProfileContent
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        stats={{ routes: 12, followers: '1.2k', following: '450' }}
        routes={MOCK_ROUTES}
      />

    </div>
  )
}
