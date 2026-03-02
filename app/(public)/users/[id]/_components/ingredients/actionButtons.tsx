import { MdSettings, MdInfoOutline, MdDarkMode, MdLightMode } from 'react-icons/md'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import UserProfileEditModal from '../templates/userProfileEditModal'

export default function ActionButtons({ isOwnPage }: { isOwnPage: boolean }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex items-center gap-3 pb-2">
      {mounted && (
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 bg-background-1 border border-grass rounded-xl hover:bg-grass transition-colors cursor-pointer shadow-sm flex items-center justify-center"
          title="Toggle theme"
        >
          {theme === 'dark' ? (
            <MdLightMode size={22} className="text-foreground-0" />
          ) : (
            <MdDarkMode size={22} className="text-foreground-0" />
          )}
        </button>
      )}
      {isOwnPage ? (
        <>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 bg-background-1 border border-grass px-4 py-2 rounded-xl font-bold hover:bg-grass transition-colors cursor-pointer shadow-sm"
          >
            <MdSettings size={20} />
            <span>Edit Profile</span>
          </button>
          <UserProfileEditModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          />
        </>
      ) : (
        <>
          <button className="bg-accent-1 text-background-1 px-8 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-accent-1/20">
            Follow
          </button>
          <button className="p-2.5 bg-background-1 border border-grass rounded-xl hover:bg-grass transition-colors cursor-pointer">
            <MdInfoOutline size={22} className="text-foreground-1" />
          </button>
        </>
      )}
    </div>
  )
}
