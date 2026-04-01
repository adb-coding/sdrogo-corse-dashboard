import { Header, TopThree, Leaderboard, PlaylistViewer } from '@/components'
import { PerformanceChart } from '@/components/PerformanceChart'
import { getProcessedData } from '@/lib/data_server'

export default function Home() {
  const { players, playlists } = getProcessedData()

  return (
    <main className="min-h-screen bg-zinc-950 noise-texture pt-20 pb-32 md:pb-8">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <section>
          <TopThree players={players} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="font-condensed text-2xl font-bold uppercase tracking-wider text-zinc-300">
              Classifica Globale
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-bold">
                Live Stats: {players.length} Piloti
              </span>
            </div>
          </div>
          <Leaderboard 
            players={players} 
          />
        </section>

        <section>
          <PerformanceChart players={players} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="font-condensed text-2xl font-bold uppercase tracking-wider text-zinc-300">
              Storico Elenchi
            </h2>
          </div>
          <PlaylistViewer playlists={playlists} />
        </section>
      </div>

      <footer className="border-t border-zinc-800 mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em]">
            Sdrogo Corse Dashboard 2026 &copy; Tutti i video e i contenuti sono di proprietà dei rispettivi creatori.
          </p>
          <p className="text-zinc-500 text-[10px] font-mono tracking-[0.3em]">
          Si ringrazia @antobeviz per la creazione delle statistiche
          </p>
        </div>
      </footer>
    </main>
  )
}

