'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdClose, MdPhotoCamera } from 'react-icons/md'
import Image from 'next/image'
import { userStore } from '@/lib/client/stores/userStore'

interface UserProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserProfileEditModal({ isOpen, onClose }: UserProfileEditModalProps) {
  const { user, edit } = userStore()
  const [name, setName] = useState(user.name || '')
  const [bio, setBio] = useState(user.bio || '')
  const [iconUrl, setIconUrl] = useState(user.icon?.url || '')
  const [bgUrl, setBgUrl] = useState(user.background?.url || '')
  const [iconId, setIconId] = useState<string | null>(null)
  const [bgId, setBgId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const iconInputRef = useRef<HTMLInputElement>(null)
  const bgInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setName(user.name || '')
      setBio(user.bio || '')
      setIconUrl(user.icon?.url || '')
      setBgUrl(user.background?.url || '')
      setIconId(null)
      setBgId(null)
    }
  }, [isOpen, user])

  const handleImageUpload = async (file: File, type: 'user-profiles', context?: 'icon' | 'background') => {
    try {
      let url = `/api/v1/uploads?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}&type=${type}`
      if (context) url += `&context=${context}`
      
      const res = await fetch(url)
      const { uploadUrl, publicUrl, imageId } = await res.json()

      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      return { publicUrl, imageId }
    } catch (error) {
      console.error('Image upload failed:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const profile: any = { name, bio }
    if (iconId) profile.icon = iconId
    if (bgId) profile.background = bgId

    edit(
      profile,
      () => setIsSubmitting(true),
      (user) => {
        console.log('User updated:', user)
        setIsSubmitting(false)
        onClose()
      },
      (err) => {
        setIsSubmitting(false)
        setError(err?.message || 'Failed to update profile')
      }
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-background-1 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-grass/20">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-grass/10 rounded-full transition-colors"
              >
                <MdClose size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[80vh]">
              {/* Background Image Edit */}
              <div className="relative h-48 bg-grass/10">
                {bgUrl && (
                  <Image
                    src={bgUrl}
                    alt="Background"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => bgInputRef.current?.click()}
                    className="p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
                  >
                    <MdPhotoCamera size={24} />
                  </button>
                </div>
                <input
                  type="file"
                  ref={bgInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const res = await handleImageUpload(file, 'user-profiles', 'background')
                      if (res) {
                        setBgUrl(res.publicUrl)
                        setBgId(res.imageId)
                      }
                    }
                  }}
                />
              </div>

              {/* Icon Edit */}
              <div className="relative px-6 -mt-12 mb-6">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-background-1 bg-grass/20 shadow-lg">
                  {iconUrl && (
                    <Image
                      src={iconUrl}
                      alt="Icon"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => iconInputRef.current?.click()}
                      className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
                    >
                      <MdPhotoCamera size={20} />
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={iconInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const res = await handleImageUpload(file, 'user-profiles', 'icon')
                        if (res) {
                          setIconUrl(res.publicUrl)
                          setIconId(res.imageId)
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-foreground-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background-0 border border-grass/30 rounded-xl px-4 py-3 focus:outline-none focus:border-grass transition-colors"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-foreground-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-background-0 border border-grass/30 rounded-xl px-4 py-3 h-32 resize-none focus:outline-none focus:border-grass transition-colors"
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 font-bold hover:bg-grass/10 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-2.5 bg-accent-1 text-background-1 font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-accent-1/20 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
