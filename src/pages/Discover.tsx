export default function Discover() {
  return (
    <div className="page-container">
      <h1 className="text-display">DISCOVER</h1>
      <p className="text-body mt-4 mb-8">Explore potential career paths and emerging technologies.</p>
      
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer group">
            <span className="font-bold text-lg">Opportunity {i}</span>
            <span className="mono text-xs text-gray-400 group-hover:text-black transition-colors">READ MORE -&gt;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
