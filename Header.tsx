import Image from 'next/image'

export default function Header() {
  return (
    <header className="flex items-center mb-8">
      <Image src="/img/mg-logoback.png" alt="Real.st Logo" width={40} height={40} />
      <span className="text-white text-2xl font-bold ml-2">real.st</span>
    </header>
  )
}