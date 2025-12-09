//index.tsx
import { Button } from '@/components/ui/button'
import { KeyRound, Search } from "lucide-react";
import { createFileRoute, Link } from '@tanstack/react-router'
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { HomePage } from '@/components/Homepage';

export const Route = createFileRoute('/')({
  component: App,
    head: () => ({
    meta: [
      {
        name: 'description',
        content: 'Dex App Website',
      },
      {title: 'DexApp | Home' },
    ],
  }),
})

export default function App() {
  return (
    <>
    <header className="sticky top-0 z-50 flex w-full h-12 items-center justify-center border-b not-even:p-4 backdrop-blur">
      <div className="container flex w-full items-center justify-between">
        <div className='flex flex-row gap-2 items-center'>
        
        <Link to="/" className="font-mono text-lg font-bold flex flex-row gap-2">
          <img src="##########" alt="" className='h-6' />
          DexApp
        </Link>
        </div>
        <div className='flex flex-row gap-2 items-center'>
          <Button className='rounded-2xl flex flex-row' variant={"outline"}>
            <Search />
            <p className='text-muted-foreground'>Search....</p>
            <KbdGroup className="ml-2 ">
              <Kbd className='border'>Ctrl</Kbd>
              <Kbd className='border'>K</Kbd>
            </KbdGroup>
          </Button>
          <div className='border-r py-4 hidden sm:inline-flex'/>
          <Button variant={"default"} className='rounded-sm px-4 h-8 bg-violet-400 hover:bg-violet-500 hidden sm:inline-flex'>
            <KeyRound />
          </Button>
          </div>
      </div>
    </header>

    <main className='flex min-h-screen flex-row justify-center items-center p-8'>
        <div>
          
        </div>
        <HomePage/>
    </main>

    <footer className=''>
      <div className="flex w-full h-16 items-center justify-center border-t p-4">
        <div className="container flex h-16 w-full items-center justify-between">
          <span className="text-sm text-muted-foreground">
            © 2025 DexApp. Made by <p className='font-bold inline'>AzureForgeLabs</p>
          </span>
        </div>
      </div>
    </footer>
    </>
  )
}



