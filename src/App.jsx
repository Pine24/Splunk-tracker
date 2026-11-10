import Section from './components/Section.jsx'
import Versions from './components/Versions.jsx'
import Splunkbase from './components/Splunkbase.jsx'
import Docs from './components/Docs.jsx'
import QuickLinks from './components/QuickLinks.jsx'

export default function App() {
  return (
    <main>
      <header>
        <h1>Splunk Tracker</h1>
        <p className="sub">Version lifecycle, docs, Splunkbase updates and handy tools.</p>
        <nav>
          <a href="#versions">Versions</a> · <a href="#apps">Apps</a> · <a href="#docs">Docs</a> · <a href="#tools">Tools</a>
        </nav>
      </header>
      <div id="versions">
        <Section title="Splunk Enterprise versions" file="versions.json">{(d) => <Versions data={d} />}</Section>
      </div>
      <div id="apps">
        <Section title="Splunk-maintained apps (Splunkbase)" file="splunkbase.json">{(d) => <Splunkbase data={d} />}</Section>
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
