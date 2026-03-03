export function UserName({ name }: { name?: string }) {
  return <h1 className="text-3xl md:text-4xl font-black text-foreground-0">{name}</h1>
}

export function UserBio({ bio }: { bio?: string }) {
  if (!bio) return null
  return <p className="text-foreground-1 max-w-2xl text-base leading-relaxed">{bio}</p>
}

export default function ProfileInfo({ name, bio }: { name?: string; bio?: string }) {
  return (
    <div className="flex flex-col gap-1 pb-2">
      <UserName name={name} />
      <UserBio bio={bio} />
    </div>
  )
}
