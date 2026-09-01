'use client'
    
import { Header, Footer } from '@/components'
import { motion } from 'framer-motion'
import { GitCommit, Star, Bug } from 'lucide-react'

const CHANGELOG = [
  {
    version: "2.0.2",
    date: "01-09-2026",
    title: "Loading Page and Lighter Loading",
    features: [
      "Aggiunta schermata di caricamento",
      "Implementato utilizzo di Papa.parse per caricamento più leggero"
    ]
  },
  {
    version: "2.0.1",
    date: "15-08-2026",
    title: "Driver Links & UI Functionalities",
    features: [
      "I nomi sono cliccabili e portano ai profili",
      "Aggiunto filtro per vedere solo elenchi in cui è presente un determinato giocatore",
      "Implementato utilizzo della nuova raccolta dati del Golf tramite OCR"
    ],
    fixes: [
      "Fixato bug barre della distribuzione nella modalità Golf"
    ]
  },
    {
    version: "2.0.0",
    date: "15-04-2026",
    title: "Golfatine",
    features: [
      "Aggiunto l'elenco e le statistiche delle Golfatine",
      "Toggle nell'intestazione per cambiare tra Sdrogo Corse e Sdrogo Golfatine",
      "Comparazione Testa-a-testa nella pagina piloti"
    ]
  },

  {
   version: "1.1.0",
    date: "15-03-2026",
    title: "SDROGO CORSE ALL-TIME",
    features: [
      "Inserito line-chart nella pagina iniziale",
      "Aggiunto classifica all-time",
      "Implementato utilizzo del CNN per estrazione sdrogo corse all-time"
    ],
    fixes: [
      "Migliorata UI e navigazione nelle pagine",
      "Migliorato podio pagina iniziale"
    ] 
  }
]

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-zinc-950 noise-texture pt-20 pb-32">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="font-condensed text-4xl font-black uppercase tracking-tighter text-white">
            Changelog
          </h1>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-2">
            Cronologia degli aggiornamenti e patch notes
          </p>
        </div>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
          {CHANGELOG.map((release, index) => (
            <motion.div 
              key={release.version}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              {/* Timeline dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-zinc-950 bg-zinc-800 text-zinc-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 group-hover:bg-accent group-hover:text-white transition-colors">
                <GitCommit className="w-4 h-4" />
              </div>
              
              {/* Content Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-accent font-bold text-lg">v{release.version}</span>
                  <span className="font-mono text-zinc-500 text-[10px] uppercase tracking-widest">{release.date}</span>
                </div>
                <h3 className="font-condensed text-2xl font-black text-white uppercase tracking-tighter mb-4">
                  {release.title}
                </h3>
              
                {release.features && release.features.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-3 h-3 text-amber-500" />
                      <span className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Novità</span>
                    </div>
                    <ul className="space-y-2">
                      {release.features.map((feature, i) => (
                        <li key={i} className="text-zinc-300 text-sm font-mono leading-relaxed pl-5 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-zinc-700 before:rounded-full">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {release.fixes && release.fixes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Bug className="w-3 h-3 text-red-500" />
                      <span className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Fixes</span>
                    </div>
                    <ul className="space-y-2">
                      {release.fixes.map((fix, i) => (
                        <li key={i} className="text-zinc-400 text-sm font-mono leading-relaxed pl-5 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-zinc-700 before:rounded-full">{fix}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  )
}