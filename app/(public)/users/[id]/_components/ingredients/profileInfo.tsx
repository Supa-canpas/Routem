export default function ProfileInfo({ name, bio }: { name?: string; bio?: string }) {
  return (
    <div className="flex flex-col min-w-0">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground-0 mb-1 truncate">{name}</h1>
      {bio && <p className="text-foreground-1 max-w-xl line-clamp-2 md:line-clamp-3 leading-relaxed">{bio}</p>}
    </div>
  )
}
