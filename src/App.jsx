import Section from './components/Section.jsx'
import Versions from './components/Versions.jsx'
import Docs from './components/Docs.jsx'
import QuickLinks from './components/QuickLinks.jsx'

export default function App() {
  return (
    <main>
      <header>
        <h1>Splunk Tracker</h1>
        <p className="sub">Version lifecycle, documentation links and handy tools.</p>
        <nav>
          <a href="#versions">Versions</a> · <a href="#docs">Docs</a> · <a href="#tools">Tools</a>
        </nav>
      </header>
      <div id="versions">
        <Section title="Splunk Enterprise versions" file="versions.json">{(d) => <Versions data={d} />}</Section>
      </div>
      <div id="docs">
        <Section title="Documentation map" file="docs.json">{(d) => <Docs data={d} />}</Section>
      </div>
      <div id="tools">
        <Section title="Quick links" file="links.json">{(d) => <QuickLinks data={d} />}</Section>
      </div>
    </main>
  )
}
