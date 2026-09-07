'use client';

import React, { useState } from 'react';
import {
  FileText,
  Layers,
  Database,
  Calculator,
  ShieldCheck,
  Truck,
  Activity,
  Radio,
  BookOpen,
  Info,
  CheckCircle2,
} from 'lucide-react';

const SECTIONS = [
  { id: 'overview', label: 'System Overview', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'risk-methodology', label: 'Risk Methodology', icon: <Calculator className="w-3.5 h-3.5" /> },
  { id: 'hazard-model', label: 'Hazard Model', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'population-exposure', label: 'Population Exposure', icon: <Activity className="w-3.5 h-3.5" /> },
  { id: 'vulnerability-model', label: 'Vulnerability Model', icon: <Info className="w-3.5 h-3.5" /> },
  { id: 'shelter-capacity', label: 'Shelter Capacity Logic', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  { id: 'evacuation-logic', label: 'Evacuation Logic', icon: <Truck className="w-3.5 h-3.5" /> },
  { id: 'simulation-engine', label: 'Simulation Engine', icon: <Calculator className="w-3.5 h-3.5" /> },
  { id: 'cap-workflow', label: 'CAP Alert Workflow', icon: <Radio className="w-3.5 h-3.5" /> },
  { id: 'data-sources', label: 'Data Sources', icon: <Database className="w-3.5 h-3.5" /> },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="card card-border p-6 bg-white shadow-xs space-y-4 scroll-mt-4">
      <h2 className="font-bold text-sm sm:text-base text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-3">
        {title}
      </h2>
      <div className="text-xs text-gray-700 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 font-sans">
      <div>
        <h3 className="text-xl font-bold text-gray-900">How It Works</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Algorithmic formulations, multi-hazard risk equations, capacity allocation logic, and operational specifications
        </p>
      </div>
        {/* Technical Metadata Header Strip */}
        <div className="card card-border p-4 bg-white shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-gray-400">Target Environment:</span>{' '}
            <strong className="text-gray-900 font-semibold">District Emergency Operations Centres (DEOC)</strong>
          </div>
          <div>
            <span className="text-gray-400">Standard:</span>{' '}
            <strong className="text-gray-900 font-semibold">Disaster Management Act 2005 (Section 34)</strong>
          </div>
          <div>
            <span className="text-gray-400">Last Recalculation:</span>{' '}
            <strong className="font-sans font-semibold text-gray-900">06 Sep 2026 | 23:46 IST</strong>
          </div>
        </div>

        {/* 2-Column Technical Layout: Left Sticky Sidebar + Right Technical Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">
          {/* LEFT SIDEBAR NAVIGATION */}
          <nav className="hidden lg:block sticky top-4 card card-border bg-white shadow-xs p-2 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Table of Contents
            </div>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  activeSection === s.id
                    ? 'bg-gray-100 text-gray-900 font-bold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={activeSection === s.id ? 'text-primary' : 'text-gray-400'}>
                  {s.icon}
                </span>
                <span>{s.label}</span>
              </a>
            ))}
          </nav>

          {/* RIGHT DOCUMENTATION CONTENT */}
          <div className="space-y-5">
            {/* 1. System Overview */}
            <Section id="overview" title="1. System Overview & Institutional Context">
              <p>
                <strong>ByteX DSS</strong> is an institutional-grade Decision Support System engineered for District Magistrates, State Disaster Management Authorities (SDMA), and Emergency Operations Centres (DEOC). It transitions disaster management from reactive relief to predictive, capacity-constrained spatial response.
              </p>
              <div className="p-3 bg-slate-50 rounded-control border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Core Operational Axiom:</div>
                <p className="text-slate-600">
                  Risk is not merely hazard exposure; it is a mathematical function of physical vulnerability, population density, demographic dependency, and isolation severity, bounded by verifiable evacuation route accessibility and shelter intake headroom.
                </p>
              </div>
            </Section>

            {/* 2. Risk Methodology */}
            <Section id="risk-methodology" title="2. Composite Risk Scoring Methodology">
              <p>
                Settlements are ranked on a standardized 0–100 scale using a deterministic multi-criteria decision model. The four weighted sub-indices are configured according to NDMA hazard sensitivity standards:
              </p>
              <div className="p-3 bg-slate-50 rounded-control border border-slate-200 font-mono text-[11px] text-slate-900 leading-relaxed">
                Risk Score = 0.40 &times; Hazard Index + 0.25 &times; Physical Vulnerability + 0.20 &times; Demographic Exposure + 0.15 &times; Isolation Deficit
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border border-slate-200 rounded mt-2">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="p-2">Priority Tier</th>
                      <th className="p-2">Score Range</th>
                      <th className="p-2">Operational Response Directive</th>
                      <th className="p-2">Mandatory Timeframe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-bold text-red-700">Immediate</td>
                      <td className="p-2 font-mono">&ge; 65</td>
                      <td className="p-2">Immediate mandatory civilian evacuation; convoy deployment</td>
                      <td className="p-2 font-mono">&lt; 6 Hours</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-amber-700">Short-Term</td>
                      <td className="p-2 font-mono">50 &ndash; 64</td>
                      <td className="p-2">Stage emergency transit fleet; monitor hydrologic breach triggers</td>
                      <td className="p-2 font-mono">6 &ndash; 24 Hours</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-yellow-700">Medium-Term</td>
                      <td className="p-2 font-mono">35 &ndash; 49</td>
                      <td className="p-2">Pre-position supplies; plan structured rehabilitation and slope stabilization</td>
                      <td className="p-2 font-mono">24 &ndash; 72 Hours</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-emerald-700">Low / Resilient</td>
                      <td className="p-2 font-mono">&lt; 35</td>
                      <td className="p-2">Routine radar monitoring and standard advisory bulletins</td>
                      <td className="p-2 font-mono">Ongoing</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* 3. Hazard Model */}
            <Section id="hazard-model" title="3. Multi-Hazard Geospatial Integration">
              <p>
                The Hazard Index synthesizes real-time flood inundation depth polygons, slope susceptibility layers derived from CARTOSAT-3 DEM (30m resolution), rainfall rate radar reflectivity, and historical seismic fault vectors.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li><strong>Flood Inundation Index:</strong> Hydrological flood-fill modeling matching upstream gauge crests.</li>
                <li><strong>Landslide Susceptibility:</strong> Slope angle, lithology, pore-water pressure, and fault proximity.</li>
                <li><strong>Cloudburst Convective Cells:</strong> Doppler radar spatial alerts detecting &gt;100mm/hr localized events.</li>
              </ul>
            </Section>

            {/* 4. Population Exposure & Vulnerability */}
            <Section id="population-exposure" title="4. Demographic Exposure & Physical Vulnerability">
              <p>
                Demographic exposure normalizes absolute population and the vulnerable demographic dependency ratio:
              </p>
              <div className="font-mono bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
                Demographic Exposure = 0.60 &times; (Normalized Population) + 0.40 &times; ((Children + Elderly) / Total Population)
              </div>
              <p>
                Physical vulnerability integrates dwelling structural fragility (% kutcha and mud-brick structures), critical lifeline distance to Primary Health Centres (PHC), and single-artery bridge dependency.
              </p>
            </Section>

            {/* 5. Shelter Capacity Logic */}
            <Section id="shelter-capacity" title="5. Shelter Network Carrying Capacity Logic">
              <p>
                Evacuees cannot be directed blindly to nearest facilities. The allocation engine executes a constrained linear programming algorithm that minimizes transit distance subject to strict capacity headroom:
              </p>
              <div className="font-mono bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
                Remaining Headroom = Total Certified Capacity &minus; (Current Occupancy + Assigned Evacuees)
              </div>
              <p>
                If a shelter&apos;s remaining headroom reaches zero, the algorithm automatically diverts subsequent settlement queues to the next closest facility certified for triage readiness, water availability, and backup power.
              </p>
            </Section>

            {/* 6. Evacuation Routing Logic */}
            <Section id="evacuation-logic" title="6. Evacuation Routing & Fleet Optimization">
              <p>
                Fleet allocation computes the mandatory bus fleet based on a standard 42-passenger transit bus standard:
              </p>
              <div className="font-mono bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
                Buses Required = Ceil(Settlement Population / 42)
              </div>
              <p>
                Corridor selection factors bridge access status. If an arterial bridge is flagged as cut off or damaged, the transit route automatically switches to secondary high-clearance mountain bypass routes.
              </p>
            </Section>

            {/* 7. Simulation Engine */}
            <Section id="simulation-engine" title="7. Deterministic Scenario Simulation Engine">
              <p>
                The Simulation Lab provides instantaneous stress-testing without stochastic unpredictability. Adjusting climatic and infrastructure parameters immediately recalculates the multi-hazard risk matrix across all habitations, triggering automatic reallocation of evacuees to secondary facilities.
              </p>
            </Section>

            {/* 8. CAP Alert Workflow */}
            <Section id="cap-workflow" title="8. Common Alerting Protocol (ITU-T X.1303)">
              <p>
                The warning station adheres to the international ITU-T X.1303 CAP specification. Warnings are digitally signed, geo-targeted to telecommunication Base Transceiver Stations (BTS) covering red-zone coordinates, and broadcasted across cell broadcast (PWS), AIR radio frequencies, and local siren arrays.
              </p>
            </Section>

            {/* 9. Data Sources & Operational Assumptions */}
            <Section id="data-sources" title="9. Institutional Data Sources & Assumptions">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border border-slate-200 rounded">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="p-2">Dataset</th>
                      <th className="p-2">Authority / Agency</th>
                      <th className="p-2">Update Cadence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-medium">Digital Elevation Model (30m)</td>
                      <td className="p-2">ISRO / NRSC Bhuvan</td>
                      <td className="p-2">Static Baseline</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">River Discharge &amp; Gauge Crest</td>
                      <td className="p-2">Central Water Commission (CWC)</td>
                      <td className="p-2">15-minute telemetry</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Doppler Precipitation Radar</td>
                      <td className="p-2">India Meteorological Department (IMD)</td>
                      <td className="p-2">10-minute radar scan</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Demographics &amp; Kutcha Ratio</td>
                      <td className="p-2">Census of India &amp; District Magistrate Master List</td>
                      <td className="p-2">Annual verification</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        </div>
      </div>
  );
}
