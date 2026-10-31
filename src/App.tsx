import { useEffect, useState } from 'react'
import * as Select from '@radix-ui/react-select'
import * as Slider from '@radix-ui/react-slider'
import * as Switch from '@radix-ui/react-switch'
import * as Tabs from '@radix-ui/react-tabs'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  ArrowRight, Boxes, Check, ChevronDown, CircleDot, Database,
  FileText, Layers3, Play, RotateCcw, Search, SlidersHorizontal,
  Sparkles, Split, TableProperties, Zap,
} from 'lucide-react'
import './App.css'

const documents = [
  { name: 'architecture.md', chunks: 14, color: '#e85d3f', size: '18 KB' },
  { name: 'product-guide.pdf', chunks: 23, color: '#27867b', size: '42 KB' },
  { name: 'api-reference.txt', chunks: 18, color: '#d79a2b', size: '31 KB' },
  { name: 'support-notes.md', chunks: 11, color: '#5969a8', size: '16 KB' },
]

const results = [
  { source: 'architecture.md', section: 'Retrieval layer', score: .94, text: 'The retrieval layer uses hybrid search to combine semantic similarity with keyword precision.' },
  { source: 'product-guide.pdf', section: 'Search configuration', score: .88, text: 'Queries are embedded using the same model and dimensions as the indexed document chunks.' },
  { source: 'api-reference.txt', section: 'POST /query', score: .82, text: 'The query endpoint accepts top_k, similarity_threshold, and optional metadata filters.' },
  { source: 'support-notes.md', section: 'Relevance tuning', score: .74, text: 'Increase chunk overlap when important concepts frequently span paragraph boundaries.' },
  { source: 'architecture.md', section: 'Data flow', score: .68, text: 'Retrieved context is assembled in rank order before generation begins.' },
]

const points = [
  [16, 26, 0], [23, 34, 0], [29, 20, 0], [37, 29, 0],
  [61, 22, 1], [69, 31, 1], [76, 18, 1], [82, 27, 1],
  [23, 70, 2], [31, 79, 2], [38, 66, 2], [45, 76, 2],
  [64, 65, 3], [72, 75, 3], [81, 62, 3], [87, 72, 3],
]

const stages = ['Query', 'Embed', 'Search', 'Rerank', 'Context', 'Answer']

function App() {
  const [query, setQuery] = useState('How does semantic retrieval find relevant context?')
  const [topK, setTopK] = useState([3])
  const [threshold, setThreshold] = useState([70])
  const [chunkSize, setChunkSize] = useState('512')
  const [rerank, setRerank] = useState(true)
  const [running, setRunning] = useState(false)
  const [stage, setStage] = useState(-1)
  const [runId, setRunId] = useState(0)

  const visibleResults = results
    .filter((result) => result.score * 100 >= threshold[0])
    .slice(0, topK[0])
  const complete = stage === stages.length - 1

  useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(() => {
      if (stage >= stages.length - 2) {
        setStage(stages.length - 1)
        setRunning(false)
      } else {
        setStage((value) => value + 1)
      }
    }, 650)
    return () => window.clearTimeout(timer)
  }, [running, stage, runId])

  const runPipeline = () => {
    setStage(0)
    setRunId((value) => value + 1)
    setRunning(true)
  }

  const reset = () => {
    setStage(-1)
    setRunning(false)
  }

  return (
    <Tooltip.Provider delayDuration={250}>
      <div className="app-shell">
        <header className="topbar">
          <a className="brand" href="#top"><span className="brand-icon"><Database size={18} /></span><span>Vector Lab</span><small>RETRIEVAL-AUGMENTED GENERATION</small></a>
          <nav><a href="#pipeline">Pipeline</a><a href="#vectors">Vector space</a><a href="#results">Retrieval</a></nav>
          <div className="status-pill"><span /> INDEX ONLINE</div>
        </header>

        <main id="top">
          <section className="hero">
            <div>
              <p className="kicker"><Sparkles size={14} /> Retrieval, made visible</p>
              <p className="hero-copy">Tune an end-to-end retrieval-augmented generation pipeline and watch documents become vectors, matches, and grounded answers.</p>
            </div>
            <div className="index-stats">
              <div><span>COLLECTION</span><strong>product_knowledge</strong></div>
              <div><span>VECTORS</span><strong>66</strong></div>
              <div><span>DIMENSIONS</span><strong>1,536</strong></div>
              <div><span>INDEX</span><strong>HNSW</strong></div>
            </div>
          </section>

          <section className="pipeline" id="pipeline">
            <div className="section-title"><div><span>01 / PIPELINE</span><h2>Retrieval flow</h2></div><p>Each stage exposes the transformation applied to your query.</p></div>
            <div className="stage-track">
              {stages.map((item, index) => <div className={`stage ${stage === index ? 'active' : stage > index ? 'done' : ''}`} key={item}>
                <span className="stage-number">0{index + 1}</span>
                <strong>{item}</strong>
                {index < stages.length - 1 && <ArrowRight size={15} />}
              </div>)}
            </div>
          </section>

          <section className="workbench">
            <aside className="config-panel">
              <div className="panel-heading"><SlidersHorizontal size={17} /><div><span>CONFIGURATION</span><h3>Retrieval settings</h3></div></div>
              <label className="field-label">Embedding model</label>
              <Select.Root defaultValue="small">
                <Select.Trigger className="select-trigger"><Select.Value /><Select.Icon><ChevronDown size={15} /></Select.Icon></Select.Trigger>
                <Select.Portal><Select.Content className="select-content" position="popper"><Select.Viewport>
                  <Select.Item className="select-item" value="small"><Select.ItemText>text-embedding-3-small</Select.ItemText><Select.ItemIndicator><Check size={14} /></Select.ItemIndicator></Select.Item>
                  <Select.Item className="select-item" value="large"><Select.ItemText>text-embedding-3-large</Select.ItemText><Select.ItemIndicator><Check size={14} /></Select.ItemIndicator></Select.Item>
                  <Select.Item className="select-item" value="mini"><Select.ItemText>all-MiniLM-L6-v2</Select.ItemText><Select.ItemIndicator><Check size={14} /></Select.ItemIndicator></Select.Item>
                </Select.Viewport></Select.Content></Select.Portal>
              </Select.Root>

              <div className="setting-row"><label>Top K <small>Maximum matches</small></label><output>{topK[0]}</output></div>
              <Slider.Root className="slider" value={topK} onValueChange={setTopK} min={1} max={5} step={1} aria-label="Top K"><Slider.Track className="slider-track"><Slider.Range className="slider-range" /></Slider.Track><Slider.Thumb className="slider-thumb" /></Slider.Root>

              <div className="setting-row"><label>Similarity <small>Minimum score</small></label><output>{threshold[0]}%</output></div>
              <Slider.Root className="slider" value={threshold} onValueChange={setThreshold} min={50} max={95} step={1} aria-label="Similarity threshold"><Slider.Track className="slider-track"><Slider.Range className="slider-range" /></Slider.Track><Slider.Thumb className="slider-thumb" /></Slider.Root>

              <label className="field-label">Chunk size</label>
              <div className="segment-control">{['256', '512', '1024'].map((size) => <button className={chunkSize === size ? 'selected' : ''} onClick={() => setChunkSize(size)} key={size}>{size}</button>)}</div>
              <div className="switch-row"><div><strong>Cross-encoder rerank</strong><span>Improve final ordering</span></div><Switch.Root className="switch" checked={rerank} onCheckedChange={setRerank}><Switch.Thumb className="switch-thumb" /></Switch.Root></div>

              <button className="run-button" onClick={runPipeline} disabled={running}><Play size={17} fill="currentColor" /> {running ? `Running ${stages[Math.max(stage, 0)]}...` : complete ? 'Run new query' : 'Run pipeline'}</button>
              <button className="reset-button" onClick={reset}><RotateCcw size={14} /> Reset trace</button>
            </aside>

            <div className="simulation-panel">
              <div className="query-bar"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Retrieval query" /><kbd>⌘ ↵</kbd></div>
              <Tabs.Root defaultValue="vector" className="visual-tabs">
                <Tabs.List><Tabs.Trigger value="vector">Vector space</Tabs.Trigger><Tabs.Trigger value="chunks">Source chunks</Tabs.Trigger><Tabs.Trigger value="payload">Query payload</Tabs.Trigger></Tabs.List>
                <Tabs.Content value="vector" className="visual-content" id="vectors">
                  <div className="map-header"><div><CircleDot size={15} /><strong>2D projection</strong><span>UMAP · cosine distance</span></div><div className="legend">{documents.map((doc) => <span key={doc.name}><i style={{ background: doc.color }} />{doc.name.split('.')[0]}</span>)}</div></div>
                  <div className="vector-map">
                    <svg viewBox="0 0 100 100" role="img" aria-label="Vector similarity map">
                      <defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="#d9ddd7" strokeWidth=".25" /></pattern></defs>
                      <rect width="100" height="100" fill="url(#grid)" />
                      {points.map(([x, y, group], index) => <circle key={index} cx={x} cy={y} r={stage >= 2 && index < visibleResults.length ? 2.2 : 1.25} fill={documents[group].color} opacity={stage >= 2 && index >= visibleResults.length ? .32 : .82} />)}
                      <circle className={stage >= 1 ? 'query-point visible' : 'query-point'} cx="52" cy="48" r="3" />
                      {stage >= 2 && visibleResults.map((_, index) => <line key={index} className="similarity-line" x1="52" y1="48" x2={points[index][0]} y2={points[index][1]} />)}
                    </svg>
                    <div className="map-axis axis-y">semantic dimension 2</div><div className="map-axis axis-x">semantic dimension 1</div>
                  </div>
                  <div className="map-footer"><span><i className="query-key" />Query vector</span><span>{stage >= 2 ? `${visibleResults.length} neighbors selected` : 'Run the pipeline to search'}</span></div>
                </Tabs.Content>
                <Tabs.Content value="chunks" className="visual-content chunk-grid">
                  {documents.map((doc) => <div className="doc-card" key={doc.name}><div className="doc-icon" style={{ color: doc.color }}><FileText size={20} /></div><div><strong>{doc.name}</strong><span>{doc.size} · {Math.round(doc.chunks * 512 / Number(chunkSize))} chunks</span></div><div className="chunk-bars">{Array.from({ length: 5 }, (_, index) => <i key={index} style={{ width: `${65 + ((index * 13 + doc.chunks) % 30)}%`, background: doc.color }} />)}</div></div>)}
                </Tabs.Content>
                <Tabs.Content value="payload" className="visual-content payload"><pre>{JSON.stringify({ query, top_k: topK[0], similarity_threshold: threshold[0] / 100, rerank, collection: 'product_knowledge' }, null, 2)}</pre></Tabs.Content>
              </Tabs.Root>
            </div>
          </section>

          <section className="retrieval-section" id="results">
            <div className="results-panel">
              <div className="section-title compact"><div><span>02 / RETRIEVAL</span><h2>Ranked context</h2></div><p>{stage >= 2 ? `${visibleResults.length} matches above threshold` : 'Waiting for query'}</p></div>
              <div className="result-list">
                {stage < 2 ? <div className="empty-state"><Boxes size={26} /><strong>No retrieval trace yet</strong><span>Run the pipeline to inspect ranked chunks.</span></div> : visibleResults.map((result, index) => <article className="result-card" key={result.section}>
                  <div className="rank">0{index + 1}</div><div className="result-copy"><div><strong>{result.source}</strong><span>{result.section}</span></div><p>{result.text}</p></div><div className="score"><strong>{result.score.toFixed(2)}</strong><span>COSINE</span></div>
                </article>)}
              </div>
            </div>
            <div className="answer-panel">
              <div className="panel-heading"><Zap size={17} /><div><span>GENERATED ANSWER</span><h3>Grounded response</h3></div></div>
              {complete ? <div className="answer"><p>Semantic retrieval converts the query into an embedding and compares it with stored document vectors. The closest chunks are filtered by similarity, optionally reranked, and assembled as context for the response.</p><div className="citations"><span>[1] architecture.md</span><span>[2] product-guide.pdf</span><span>[3] api-reference.txt</span></div></div> : <div className="answer-placeholder"><Sparkles size={25} /><p>The grounded response will appear after retrieval and context assembly complete.</p></div>}
              <div className="answer-metrics"><div><span>CONTEXT</span><strong>{complete ? '1,284' : '—'} tokens</strong></div><div><span>LATENCY</span><strong>{complete ? '842 ms' : '—'}</strong></div><div><span>SOURCES</span><strong>{complete ? visibleResults.length : '—'}</strong></div></div>
            </div>
          </section>

          <section className="flow-summary">
            <div><Split size={18} /><strong>Chunk</strong><span>{chunkSize} tokens</span></div><ArrowRight size={15} /><div><Layers3 size={18} /><strong>Embed</strong><span>1,536 dims</span></div><ArrowRight size={15} /><div><Database size={18} /><strong>Index</strong><span>HNSW</span></div><ArrowRight size={15} /><div><TableProperties size={18} /><strong>Retrieve</strong><span>Top {topK[0]}</span></div>
          </section>
        </main>
      </div>
    </Tooltip.Provider>
  )
}

export default App