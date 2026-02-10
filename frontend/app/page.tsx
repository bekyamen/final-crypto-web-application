import { Header } from '@/components/header'
import { MarketTicker } from '@/components/market-ticker'
import { Hero } from '@/components/hero'
import { StatsSection } from '@/components/stats'
import { FeaturesSection } from '@/components/features'
import { WhyChooseUsSection } from '@/components/why-choose-us'
import { TestimonialsSection } from '@/components/testimonials'
import { SecuritySection } from '@/components/security'
import { Footer } from '@/components/footer'
import { SupportChatbot } from '@/components/support-chatbot'
import { CryptoTable } from '@/components/crypto-table'
import { TopGainersSection } from '@/components/top-gainers'
import { NewListingsSection } from '@/components/new-listings'
import FloatingChat from '@/components/FloatingChat'


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <MarketTicker />
      <Header />
      <main>
        <Hero />
        <StatsSection />
        <WhyChooseUsSection />
        <FeaturesSection />
        
        {/* Market Data Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
              <span className="text-sm text-blue-400 font-medium">Live Market Data</span>
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-slate-100">Catch Your Next </span>
              <span className="text-orange-400">Trading Opportunity</span>
            </h2>
            
            <p className="text-slate-400 text-lg">
              Real-time market data and insights to help you make informed trading decisions
            </p>
          </div>

          {/* Main Crypto Table */}
          <div className="mb-12">
            <CryptoTable />
          </div>

          {/* Top Gainers and New Listings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TopGainersSection />
            <NewListingsSection />
          </div>
        </section>

        <TestimonialsSection />
        <SecuritySection />
      </main>
      <Footer />
      <FloatingChat />
      <SupportChatbot />
    </div>
  )
}
