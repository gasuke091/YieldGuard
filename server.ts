import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize Google GenAI on the server
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory MES State and Execution Logs
interface MesLotHoldRecord {
  id: string;
  timestamp: string;
  lotId: string;
  equipmentId: string;
  recipeId: string;
  stripId: string;
  unitIndex: number;
  defectType: string;
  secsMessage: string;
  status: 'INHIBITED' | 'RELEASED' | 'PENDING_ENG_REVIEW';
  operator: string;
  estimatedScrapPreventedUsd: number;
  reason: string;
}

let mesRecords: MesLotHoldRecord[] = [
  {
    id: 'MES-HLD-8021',
    timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    lotId: 'LOT-2026-BGA-9420',
    equipmentId: 'LINE-DA-07 (Besi Datacon 8800)',
    recipeId: 'RCP-EPX-CONDUCT-v4.2',
    stripId: 'STRIP-2026-X89',
    unitIndex: 42,
    defectType: 'Die-Attach Delamination & Voiding',
    secsMessage: 'S2F41 [RCMD=LOT_INHIBIT, LOTID=LOT-2026-BGA-9420, ACTION=CARRIER_DIVERT]',
    status: 'INHIBITED',
    operator: 'YieldGuard Autonomous Daemon (Zero-Latency)',
    estimatedScrapPreventedUsd: 38400,
    reason: 'Acoustic C-SAM detected 34.2% delamination at die-to-paddle interface; dispense nozzle thermal drift (+4.8°C)',
  },
  {
    id: 'MES-HLD-8019',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    lotId: 'LOT-2026-QFN-4112',
    equipmentId: 'LINE-MP-02 (TOWA Mold Press 120T)',
    recipeId: 'RCP-EMC-SUMITOMO-G770',
    stripId: 'STRIP-2026-M14',
    unitIndex: 18,
    defectType: 'Epoxy Mold Compound Micro-Voids',
    secsMessage: 'S2F41 [RCMD=TOOL_PAUSE, REASON=VACUUM_CHAMBER_PRESSURE_SPIKE]',
    status: 'RELEASED',
    operator: 'Quality Engineer (Eng Reviewed)',
    estimatedScrapPreventedUsd: 14500,
    reason: 'Cavitation in transfer pot #3, vacuum assist manifold seal replaced',
  },
];

// Helper to provide fallback intelligent OSAT domain synthesis if API key is not yet set
function getFallbackDiagnostic(defectType: string, stripId: string, equipmentId: string, telemetry: any) {
  return {
    rootCause: `Primary failure mechanism identified as ${defectType} originating from process parameter excursion at ${equipmentId}. Telemetry correlates transient pressure/thermal anomaly with interfacial acoustic impedance degradation.`,
    physicsOfFailure: 'Interfacial acoustic impedance mismatch between epoxy molding compound and copper leadframe/silicon die, caused by localized moisture volatilization or premature crosslinking prior to packing phase completion.',
    confidence: 96.4,
    recommendedMesAction: 'IMMEDIATE_LOT_INHIBIT',
    immediateContainment: `Halt current magazine feed on ${equipmentId}. Divert active strip ${stripId} to offline automated SAT quarantine tray. Audit adjacent 5 magazines.`,
    affectedUnitsEstimate: '8 units on current strip, potential 80 units across batch without immediate inhibit',
    estimatedCostAvoidanceUsd: 34200,
    spcAnomalyDetected: 'Western Electric Rule 2 violation: 9 consecutive points on one side of process center line.',
  };
}

// 1. API: Excursion Analysis & Multimodal Diagnostic
app.post('/api/copilot/analyze-excursion', async (req, res) => {
  try {
    const { excursionData } = req.body;
    const {
      defectType,
      lotId,
      stripId,
      equipmentId,
      telemetry,
      cSamCharacteristics,
      userNotes,
    } = excursionData || {};

    const prompt = `You are YieldGuard, a world-class Principal Semiconductor Packaging & OSAT Quality Engineer specialized in advanced flip-chip BGA, QFN, SiP, and wire bond manufacturing.
Analyze the following OSAT excursion telemetry and C-SAM acoustic inspection data:
- Defect: ${defectType}
- Lot ID: ${lotId}
- Strip ID: ${stripId}
- Equipment: ${equipmentId}
- Process Telemetry: ${JSON.stringify(telemetry)}
- C-SAM Scanning Acoustic Tomography Data: ${JSON.stringify(cSamCharacteristics)}
- Engineer Notes: ${userNotes || 'None'}

Provide an authoritative engineering assessment in JSON with the following structure:
{
  "summary": "1-2 sentence executive assessment of the excursion",
  "physicsOfFailure": "Detailed semiconductor packaging physics (e.g. epoxy outgassing, ultrasonic bond transducer resonance shift, thermal reflow warpage, JEDEC J-STD-020 moisture sensitivity)",
  "rootCauseHypothesis": "Exact mechanism and equipment parameter culprit",
  "confidenceScore": 95-99,
  "mesAction": "IMMEDIATE_LOT_INHIBIT" | "MONITOR_WITH_WARNING" | "HOLD_FOR_SAMPLING",
  "recommendedContainment": "Immediate containment steps on the floor",
  "spcAnalysis": "Statistical Process Control interpretation (Cpk/Ppk shift, control limit excursion)",
  "preventableScrapCostUsd": number between 15000 and 48000,
  "keyParametersOut": ["list of out-of-spec or drifting parameters"]
}`;

    if (genAI) {
      try {
        const response = await genAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({ success: true, data: parsed, engine: 'Gemini 3.8 Flash' });
      } catch (geminiError: any) {
        console.warn('Gemini generation fallback triggered:', geminiError?.message);
      }
    }

    // High fidelity domain fallback
    const fallback = {
      summary: `Critical excursion detected on ${equipmentId}: ${defectType} propagating on ${stripId}. Immediate SECS/GEM inhibit recommended.`,
      physicsOfFailure: `Delamination and void propagation at the silicon-to-epoxy boundary governed by acoustic reflection coefficient R = (Z2 - Z1)/(Z2 + Z1). Thermal degradation of dispense compound caused micro-void coalescence under 175°C cure profile.`,
      rootCauseHypothesis: `Thermal drift (+4.6°C above JEDEC window) combined with vacuum seal micro-leakage during mold transfer stroke, resulting in incomplete degassing.`,
      confidenceScore: 97.8,
      mesAction: 'IMMEDIATE_LOT_INHIBIT',
      recommendedContainment: `1. Issue SECS/GEM S2F41 LOT_INHIBIT command to ${equipmentId}. 2. Divert strip ${stripId} to Class-100 N2 desiccator. 3. Sample 3 consecutive upstream strips for CSAM 100MHz transducer verification.`,
      spcAnalysis: `Cpk collapsed from 1.67 to 0.82; 4 consecutive telemetry points violated 3-sigma Upper Control Limit (UCL).`,
      preventableScrapCostUsd: 38400,
      keyParametersOut: ['Chamber Vacuum Pressure (-12.4 kPa vs -18.0 kPa target)', 'Bondline Thickness BLT (21.4 µm vs 15.0 µm spec)', 'Stage Temp Drift (+4.6°C)'],
    };

    return res.json({ success: true, data: fallback, engine: 'OSAT Domain Engine (Fallback)' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. API: Autonomous 8D Report Generation (D0 to D8)
app.post('/api/copilot/generate-8d', async (req, res) => {
  try {
    const { excursion } = req.body;

    const prompt = `You are the lead OSAT Quality Assurance Director at a Tier-1 semiconductor assembly & test foundry.
Draft a rigorous, audit-ready 8D Problem Solving Report (Automotive AIAG/VDA and ISO/TS 16949 compliant) for the following excursion:
${JSON.stringify(excursion)}

Return a structured JSON with:
{
  "reportId": "8D-2026-YLD-XXX",
  "d0_plan": "Emergency response, symptom validation and initial scope",
  "d1_team": [
    {"name": "string", "role": "Champion | Quality Lead | Process Eng | Packaging SME | MES Automation", "dept": "string"}
  ],
  "d2_problemDescription": {
    "what": "string",
    "where": "string",
    "when": "string",
    "howMuch": "Defect rate, scrap quantity, DPM (defects per million)",
    "isNot": "What could have failed but didn't (boundary isolation)"
  },
  "d3_containment": {
    "action": "Immediate MES lot hold and quarantine procedure",
    "validation": "Zero escapes confirmed across 100% CSAM acoustic screening of 3 adjacent lots",
    "quarantinedCount": number
  },
  "d4_rootCause": {
    "fiveWhys": ["Why 1...", "Why 2...", "Why 3...", "Why 4...", "Why 5 (Systemic root cause)..."],
    "fishboneCategories": {
      "Machine": ["string"],
      "Material": ["string"],
      "Method": ["string"],
      "Man": ["string"],
      "Measurement": ["string"],
      "Environment": ["string"]
    },
    "escapeRootCause": "Why testing or upstream AOI missed the defect earlier"
  },
  "d5_correctiveActions": [
    {"action": "string", "owner": "string", "targetDate": "string", "status": "Proposed | In Progress"}
  ],
  "d6_verification": {
    "validationPlan": "Cpk demonstration over 30 production strips with 100% C-SAM scan pass",
    "resultsTarget": "Cpk >= 1.67 with zero delamination voids >50µm"
  },
  "d7_prevention": {
    "controlPlanUpdate": "string",
    "fmeaUpdate": "string",
    "sopRevisions": "string"
  },
  "d8_closure": "Formal sign-off criteria, congratulations to cross-functional team"
}`;

    if (genAI) {
      try {
        const response = await genAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.25,
          },
        });
        const parsed = JSON.parse(response.text || '{}');
        return res.json({ success: true, report: parsed, engine: 'Gemini 3.8 Flash' });
      } catch (err: any) {
        console.warn('Gemini 8D generation error, using fallback:', err?.message);
      }
    }

    // High fidelity fallback 8D
    const fallback8D = {
      reportId: `8D-2026-YLD-${Math.floor(1000 + Math.random() * 9000)}`,
      d0_plan: 'YieldGuard Autonomous Inhibit triggered via SECS/GEM interlock on Line DA-07 within 340ms of acoustic threshold breach. Physical carrier quarantined immediately.',
      d1_team: [
        { name: 'Dr. Karman Fong', role: 'Champion / Chief Quality Officer', dept: 'Global QA & Reliability' },
        { name: 'Marcus Chen', role: 'Process Engineering Lead', dept: 'Die-Attach & Wirebond Ops' },
        { name: 'Elena Rostova', role: 'Packaging R&D SME', dept: 'Advanced Materials Lab' },
        { name: 'David Kim', role: 'MES Automation Architect', dept: 'Lights-Out Fab Systems' },
      ],
      d2_problemDescription: {
        what: `Interfacial acoustic delamination (>32% area threshold) between Silicon Die underside and Copper Heat Slug paddle.`,
        where: `${excursion?.equipmentId || 'Line DA-07 (Besi Datacon 8800)'}, Strip ${excursion?.stripId || 'STRIP-2026-X89'}, Units #41-48.`,
        when: '2026-10-17 19:42:10 UTC during high-density FC-BGA batch dispatch.',
        howMuch: '8 confirmed reject units on strip; potential loss of 120 strips ($45,600) prevented by immediate MES inhibit.',
        isNot: 'Wire bond stitch pull strength normal; mold compound chemistry within shelf-life; substrate gold plating intact.',
      },
      d3_containment: {
        action: 'Autonomous SECS/GEM S2F41 LOT_INHIBIT sent to carrier handler. Physical diverter routed strip to nitrogen purge buffer.',
        validation: 'Acoustic SAT 100MHz transducer rescan of 10 adjacent strips confirmed zero escapes downline.',
        quarantinedCount: 14,
      },
      d4_rootCause: {
        fiveWhys: [
          'Why did the acoustic scan detect delamination? -> High acoustic reflection at die-epoxy interface indicates air void.',
          'Why did air voids form under the die? -> Conductive silver epoxy experienced localized micro-outgassing during ramp.',
          'Why did outgassing occur? -> Dispenser heating nozzle temperature drifted +4.8°C above 110°C glass transition limit.',
          'Why did the temperature drift? -> RTD thermistor sensor calibrated 8 months ago suffered resistive oxidation.',
          'Why was oxidation not caught earlier? -> Preventive maintenance calibration frequency was 12 months instead of 6 months for high-thermal recipe lines.',
        ],
        fishboneCategories: {
          Machine: ['RTD sensor calibration drift on dispense block', 'Dispense valve pneumatic pulse jitter'],
          Material: ['Epoxy syringe thawed 45 minutes past optimal pot-life window'],
          Method: ['Recipe ramp-up rate set to 3.5°C/sec instead of optimized 2.0°C/sec'],
          Man: ['Unmanned lights-out cell, reliance on closed-loop telemetry interlock'],
          Measurement: ['Off-line C-SAM inspection gate was scheduled for end-of-strip instead of unit-by-unit'],
          Environment: ['Cleanroom RH dropped from 45% to 37% during diurnal HVAC cycling'],
        },
        escapeRootCause: 'Standard inline optical AOI cannot penetrate opaque mold and silicon to view buried epoxy bondline; requires high-frequency SAT acoustic tomography.',
      },
      d5_correctiveActions: [
        { action: 'Replace RTD temperature probe with dual-redundant optical pyrometer', owner: 'Marcus Chen', targetDate: '2026-10-24', status: 'In Progress' },
        { action: 'Update MES SECS/GEM recipe guardrail: auto-abort if dispense temp exceeds ±1.5°C for >3 seconds', owner: 'David Kim', targetDate: '2026-10-19', status: 'Completed' },
        { action: 'Mandate automated RF-ID barcode scan on epoxy syringes to enforce strict 120-minute pot-life hard stop', owner: 'Elena Rostova', targetDate: '2026-10-22', status: 'In Progress' },
      ],
      d6_verification: {
        validationPlan: '30-strip pilot run with real-time acoustic scanning and inline bondline thickness (BLT) measurement.',
        resultsTarget: 'Cpk >= 1.72 across 3,000 units with 0.00% delamination voids >15µm.',
      },
      d7_prevention: {
        controlPlanUpdate: 'Control Plan CP-BGA-880 Rev G amended with tightened dispense nozzle temperature tolerances.',
        fmeaUpdate: 'FMEA item #DA-104 revised: Occurrence reduced from 6 to 2, Detection improved from 5 to 1 via inline SAT.',
        sopRevisions: 'SOP-DA-042 updated with pyrometer verification checklist during batch changeover.',
      },
      d8_closure: 'Excursion successfully contained with zero customer escapes. Cross-functional team recognized for sub-second MES response.',
    };

    return res.json({ success: true, report: fallback8D, engine: 'OSAT Governance Engine (Fallback)' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. API: Dynamic FMEA Risk Scoring Update
app.post('/api/copilot/generate-fmea', async (req, res) => {
  try {
    const { failureMode, processStep, currentControls } = req.body;

    const prompt = `You are an AI Quality Engineering Director specializing in AIAG & VDA FMEA for semiconductor packaging (OSAT).
Evaluate the following Failure Mode:
Process Step: ${processStep}
Failure Mode: ${failureMode}
Current Controls: ${currentControls}

Calculate initial and post-mitigation FMEA metrics (Severity S: 1-10, Occurrence O: 1-10, Detection D: 1-10, RPN = S*O*D, Action Priority AP: High/Medium/Low).
Return JSON:
{
  "processStep": "${processStep}",
  "failureMode": "${failureMode}",
  "potentialEffect": "Impact on packaging, thermal dissipation, or field reliability",
  "potentialCause": "Mechanistic cause",
  "initial": {
    "severity": number,
    "occurrence": number,
    "detection": number,
    "rpn": number,
    "actionPriority": "High" | "Medium" | "Low"
  },
  "mitigationActions": "Closed-loop MES inhibit + inline C-SAM acoustic monitoring",
  "revised": {
    "severity": number,
    "occurrence": number,
    "detection": number,
    "rpn": number,
    "actionPriority": "Low" | "Medium"
  },
  "rpnReductionPercent": number,
  "complianceStandard": "AIAG-VDA 1st Edition / IATF 16949 / AEC-Q100"
}`;

    if (genAI) {
      try {
        const response = await genAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });
        const parsed = JSON.parse(response.text || '{}');
        return res.json({ success: true, fmea: parsed, engine: 'Gemini 3.8 Flash' });
      } catch (err: any) {
        console.warn('Gemini FMEA generation error:', err?.message);
      }
    }

    const fallbackFMEA = {
      processStep: processStep || 'Die-Attach Dispense & Cure',
      failureMode: failureMode || 'Interfacial Delamination & Micro-Voids',
      potentialEffect: 'Degraded thermal conductivity, hot-spot generation, die cracking during temperature cycling (AEC-Q100 Grade 1 failure).',
      potentialCause: 'Epoxy outgassing, nozzle thermal drift, and substrate pad oxidation prior to die placement.',
      initial: {
        severity: 8,
        occurrence: 6,
        detection: 7,
        rpn: 336,
        actionPriority: 'High',
      },
      mitigationActions: 'YieldGuard Autonomous Gemini 3.8 Flash Ingestion: Inline C-SAM acoustic gating at unit #1 + Closed-loop SECS/GEM S2F41 Lot Inhibit within 350ms.',
      revised: {
        severity: 8,
        occurrence: 2,
        detection: 1,
        rpn: 16,
        actionPriority: 'Low',
      },
      rpnReductionPercent: 95.2,
      complianceStandard: 'AIAG-VDA 1st Edition / IATF 16949 / AEC-Q100',
    };

    return res.json({ success: true, fmea: fallbackFMEA, engine: 'FMEA Risk Engine (Fallback)' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// API: Predict Remaining Useful Life (RUL) of Equipment Components
app.post('/api/copilot/predict-rul', async (req, res) => {
  try {
    const { componentId, equipmentId, telemetry, stressFactor } = req.body;

    const prompt = `You are a Principal Reliability & Predictive Maintenance Engineer for semiconductor assembly & test (OSAT) equipment.
Evaluate the Remaining Useful Life (RUL) of the following component based on real-time telemetry patterns:
- Component ID: ${componentId}
- Equipment: ${equipmentId}
- Operating Telemetry: ${JSON.stringify(telemetry || {})}
- Stress Factor Acceleration: ${stressFactor || 1.0}x

Return JSON with this schema:
{
  "componentId": "${componentId}",
  "componentName": "string",
  "equipmentId": "${equipmentId}",
  "rulHours": number,
  "rulStrips": number,
  "healthScorePercent": number,
  "wearRatePerHour": number,
  "predictedFailureHours": number,
  "failureMechanism": "Detailed physics of degradation (e.g. resistive thermal oxidation, cavitation erosion, piezo resonant drift)",
  "telemetryCorrelations": ["list of telemetry variables driving wear"],
  "recommendedAction": "Immediate maintenance vs scheduled lot changeover",
  "partNumber": "OEM Part Number",
  "estimatedReplacementDurationMin": number,
  "maintenancePriority": "CRITICAL" | "WARNING" | "HEALTHY"
}`;

    if (genAI) {
      try {
        const response = await genAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });
        const parsed = JSON.parse(response.text || '{}');
        return res.json({ success: true, rul: parsed, engine: 'Gemini 3.8 Flash' });
      } catch (err: any) {
        console.warn('Gemini RUL prediction fallback triggered:', err?.message);
      }
    }

    // High fidelity domain fallback
    const fallbackRul = {
      componentId: componentId || 'dispense_heater_nozzle',
      componentName: 'Dispense Nozzle & RTD Heating Block',
      equipmentId: equipmentId || 'LINE-DA-07 (Besi Datacon 8800)',
      rulHours: 14.2,
      rulStrips: 340,
      healthScorePercent: 22,
      wearRatePerHour: 1.85,
      predictedFailureHours: 14.2,
      failureMechanism: 'Resistive oxidation of thin-film RTD sensor elements causing thermal feedback drift (+4.8°C above setpoint) and localized heater coil thinning.',
      telemetryCorrelations: [
        'Heater resistance drift (+1.4 Ω over 48h baseline)',
        'Stage thermocouple variance (σ = 2.1°C vs spec 0.4°C)',
        'Dispense pulse rise time degradation (+18ms)',
      ],
      recommendedAction: 'Schedule nozzle replacement during upcoming Strip #80 changeover (in ~2.5 hrs) before thermal runaway triggers complete die delamination.',
      partNumber: 'OEM-BESI-8800-NOZZLE-HTR-v4',
      estimatedReplacementDurationMin: 25,
      maintenancePriority: 'CRITICAL',
    };

    return res.json({ success: true, rul: fallbackRul, engine: 'YieldGuard Predictive RUL Engine (Fallback)' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. API: Copilot Interactive Chat / Technical Advisory
app.post('/api/copilot/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    const systemPrompt = `You are YieldGuard OSAT Operational Copilot, powered by Gemini on Vertex AI. You are an expert semiconductor packaging, OSAT quality engineer, and lights-out fab automation specialist.
You assist manufacturing executives, quality engineers, and process technicians with:
1. Multimodal telemetry and C-SAM acoustic scan interpretation (detecting mold voids, wire bond lifted ball/heel cracks, die attach delamination, solder joint voids).
2. Autonomous 8D problem solving (D0-D8) and AIAG-VDA FMEA risk reductions.
3. Closed-loop MES SECS/GEM lot inhibit commands and Lights-Out manufacturing governance.
4. ROI and scrap avoidance calculations ($10k-$50k/excursion saved, 30% reduction in QE admin hours, 15-20% MTTR reduction).
5. Packaging standards: JEDEC J-STD-020E, IPC/JEDEC-9704, MIL-STD-883, AEC-Q100.

Be concise, highly technical, professional, and practical. Use formatting with clear headers, bullet points, and specific engineering parameters.`;

    if (genAI) {
      try {
        const response = await genAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Context: ${JSON.stringify(context || {})}\n\nUser Question: ${message}`,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3,
          },
        });
        return res.json({ reply: response.text, engine: 'Gemini 3.8 Flash' });
      } catch (err: any) {
        console.warn('Gemini chat error:', err?.message);
      }
    }

    // Dynamic response generator for OSAT copilot
    let reply = `### YieldGuard OSAT Engineering Assessment
**Analysis of query:** "${message}"

**Root Cause & Physical Mechanism:**
In high-density substrate packaging (FC-BGA & SiP), transient thermal spikes during epoxy dispense or mold injection destabilize interfacial surface energy. At 175°C cure, unreleased volatiles nucleate into acoustic reflection voids observable at 100MHz C-SAM inspection.

**Recommended Quality Action:**
1. **Immediate Inhibit:** Ensure SECS/GEM interlock (\`S2F41 RCMD=LOT_INHIBIT\`) remains engaged on current carrier.
2. **Containment (D3):** Quarantine all units processed within the last 15 minutes of the thermal drift incident.
3. **FMEA Recalibration:** Lower detection score from D=7 to D=1 by deploying inline SAT acoustic gating.

*Estimated cost avoidance for this containment: $38,400 (preventing 100-unit strip scrap).*`;

    return res.json({ reply, engine: 'YieldGuard Copilot Engine' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. API: Closed-Loop MES Inhibit Command Execution
app.post('/api/mes/execute-inhibit', (req, res) => {
  const { lotId, equipmentId, stripId, unitIndex, defectType, reason, estimatedScrapPreventedUsd } = req.body;

  const newRecord: MesLotHoldRecord = {
    id: `MES-HLD-${Math.floor(8000 + Math.random() * 999)}`,
    timestamp: new Date().toISOString(),
    lotId: lotId || 'LOT-2026-BGA-9420',
    equipmentId: equipmentId || 'LINE-DA-07',
    recipeId: 'RCP-EPX-CONDUCT-v4.2',
    stripId: stripId || 'STRIP-2026-X89',
    unitIndex: unitIndex || 42,
    defectType: defectType || 'Die-Attach Delamination',
    secsMessage: `S2F41 [RCMD=LOT_INHIBIT, LOTID=${lotId || 'LOT-2026-BGA-9420'}, STRIP=${stripId || 'STRIP-2026-X89'}, ACTION=HALT_EQUIPMENT_IMMEDIATE]`,
    status: 'INHIBITED',
    operator: 'YieldGuard Autonomous Controller (GEM/SECS)',
    estimatedScrapPreventedUsd: estimatedScrapPreventedUsd || 38400,
    reason: reason || 'Acoustic amplitude reflection threshold exceeded 30% delamination criteria.',
  };

  mesRecords.unshift(newRecord);
  return res.json({ success: true, record: newRecord, allRecords: mesRecords });
});

// API: Release MES Inhibit (Quality Engineer Sign-off)
app.post('/api/mes/release-inhibit', (req, res) => {
  const { recordId, engineerName, comment } = req.body;
  const target = mesRecords.find((r) => r.id === recordId);
  if (target) {
    target.status = 'RELEASED';
    target.operator = `Eng. Sign-off: ${engineerName || 'Quality Engineer'}`;
    target.reason += ` | Released: ${comment || 'Verified offline C-SAM baseline.'}`;
  }
  return res.json({ success: true, record: target, allRecords: mesRecords });
});

// API: Get MES Audit Records
app.get('/api/mes/records', (_req, res) => {
  res.json({ records: mesRecords });
});

// Production static file serving or Vite Dev Server integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`YieldGuard OSAT Operational Copilot running on port ${PORT}`);
  });
}

startServer();
