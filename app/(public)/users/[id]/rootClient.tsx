'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { userStore } from '@/lib/client/stores/userStore'
import { User } from '@/lib/client/types'
import { getDataFromServerWithJson } from '@/lib/client/helpers'
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
  const [targetUser, setTargetUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'routes' | 'likes'>('routes')

  const isOwnPage = currentUser?.id === id
  const displayUser = isOwnPage ? currentUser : targetUser

  useEffect(() => {
    if (isOwnPage) {
      setIsLoading(false)
      return
    }

    const fetchUser = async () => {
      setIsLoading(true)
      try {
        const user = await getDataFromServerWithJson<User>(`/api/v1/users/${id}`)
        setTargetUser(user)
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [id, isOwnPage])

  if (isLoading && !isOwnPage) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-grass"></div>
      </div>
    )
  }

  if (!displayUser && !isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-xl font-bold">User not found</p>
      </div>
    )
  }

  return (
    <div className="w-full h-fit">

      <UserProfileHeader
        name={displayUser?.name}
        bio={displayUser?.bio as string}
        iconUrl={displayUser?.icon?.url}
        bgUrl={displayUser?.background?.url}
        isOwnPage={isOwnPage}
      />

      <UserProfileContent
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        stats={{ 
          routes: displayUser?.routes?.length || 0, 
          followers: '0', 
          following: '0' 
        }}
        routes={displayUser?.routes || []}
      />

    </div>
  )
}
