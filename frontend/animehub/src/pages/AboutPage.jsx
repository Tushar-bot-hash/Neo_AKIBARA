import { ShieldCheck, Zap, Globe, Cpu, Users, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  const stats = [
    { label: "Augmented Users", value: "50K+", icon: <Users className="text-[#00f0ff]" /> },
    { label: "Cyber Artifacts", value: "1,200+", icon: <Cpu className="text-[#ff0055]" /> },
    { label: "Global Nodes", value: "24", icon: <Globe className="text-[#00f0ff]" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="mb-16 border-l-4 border-[#ff0055] pl-6">
        <span className="text-xs font-mono text-[#00f0ff] uppercase tracking-[0.4em]">Establishment // 2024</span>
        <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic mt-2">
          THE <span className="text-[#ff0055]">MANIFESTO</span>
        </h1>
        <p className="max-w-2xl text-gray-400 mt-6 text-lg leading-relaxed">
          Neo-Akihabara isn't just a marketplace. It is the central nervous system for the next generation of collectors. 
          We bridge the gap between physical reality and the digital frontier.
        </p>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded bg-gray-900 border border-[#00f0ff]/30 flex items-center justify-center shrink-0">
              <Target className="text-[#00f0ff]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Our Mission</h3>
              <p className="text-gray-500 mt-2">To provide high-fidelity anime artifacts and cyber-enhanced collectibles to the global resistance. Every item is verified on the blockchain.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="h-12 w-12 rounded bg-gray-900 border border-[#ff0055]/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="text-[#ff0055]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Authenticity Protocol</h3>
              <p className="text-gray-500 mt-2">We bypass the middleman. Our connections with Neo-Tokyo manufacturing hubs ensure 100% original merchandise, or we'll refund your credits.</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={120} className="text-[#00f0ff]" />
          </div>
          <h2 className="text-2xl font-black text-white mb-4 uppercase">System Status</h2>
          <div className="space-y-4">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-800 pb-2">
                <div className="flex items-center gap-3 text-gray-400">
                  {stat.icon}
                  <span className="text-sm font-mono">{stat.label}</span>
                </div>
                <span className="text-white font-bold font-mono">{stat.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-black border border-gray-800 rounded font-mono text-[10px] text-green-500">
            &gt; ALL SYSTEMS OPERATIONAL <br />
            &gt; NEURAL LINK STABLE <br />
            &gt; ENCRYPTION ACTIVE
          </div>
        </div>
      </div>

      {/* Visual Banner */}
      <div className="h-64 rounded-2xl bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-1000 border border-gray-800 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-6 left-6">
          <p className="text-white font-black italic text-2xl tracking-tighter uppercase">Beyond the Neon Horizon</p>
        </div>
      </div>
    </div>
  );
}