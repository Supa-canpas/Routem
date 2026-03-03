import CoverImage from '../ingredients/coverImage'
import UserAvatar from '../ingredients/userAvatar'
import ProfileInfo from '../ingredients/profileInfo'
import ActionButtons from '../ingredients/actionButtons'

export default function UserProfileHeader({
  name,
  bio,
  iconUrl,
  bgUrl,
  isOwnPage,
}: {
  name?: string
  bio?: string
  iconUrl?: string
  bgUrl?: string
  isOwnPage: boolean
}) {
  return (
    <>
      <CoverImage url={bgUrl} />
      <div className="w-full h-fit max-w-[1200px] mx-auto px-6">
        <div className="relative -mt-16 md:-mt-24 mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6 min-w-0">
            <div className="shrink-0">
              <UserAvatar url={iconUrl} name={name} />
            </div>
            <div className="md:mt-28">
              <ProfileInfo name={name} bio={bio} />
            </div>
          </div>
          <div className="md:mt-28 md:pt-2">
            <ActionButtons isOwnPage={isOwnPage} />
          </div>
        </div>
      </div>
    </>
  )
}
