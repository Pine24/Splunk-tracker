import Section from './components/Section.jsx'
import Versions from './components/Versions.jsx'
import Docs from './components/Docs.jsx'
import QuickLinks from './components/QuickLinks.jsx'

export default function App() {
  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <div>
            <h1>Splunk Tracker</h1>
            <p className="sub">Version lifecycle, documentation links and handy tools.</p>
          </div>
          <nav>
            <a href="#versions">Versions</a>
            <a href="#docs">Docs</a>
            <a href="#tools">Tools</a>
          </nav>
        </div>
      </header>
      <main className="wrap layout">
        <Section id="versions" className="span" title="Splunk Enterprise versions" file="versions.json">
          {(d) => <Versions data={d} />}
        </Section>
        <Section id="docs" title="Documentation map" file="docs.json">
          {(d) => <Docs data={d} />}
        </Section>
        <Section id="tools" title="Quick links" file="links.json">
          {(d) => <QuickLinks data={d} />}
        </Section>
      </main>
    </>
  )
}
