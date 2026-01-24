export default function Analysis() {
  return (
    <div className="page-container">
      <h1 className="text-display">ANALYSIS</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="p-6 border border-current">
          <h3 className="font-bold uppercase tracking-widest mb-4 mono">Skill Correlation</h3>
          <div className="h-32 bg-gray-100 flex items-center justify-center">
            <span className="mono text-xs">Chart Placeholder</span>
          </div>
        </div>
        <div className="p-6 border border-current">
          <h3 className="font-bold uppercase tracking-widest mb-4 mono">Market Fit</h3>
          <div className="h-32 bg-gray-100 flex items-center justify-center">
            <span className="mono text-xs">Data Visualization</span>
          </div>
        </div>
      </div>
    </div>
  );
}
