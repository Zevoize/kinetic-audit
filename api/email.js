export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'RESEND_API_KEY not configured' });

  const { auditData } = req.body;
  if (!auditData) return res.status(400).json({ error: 'No audit data provided' });

  const {
    coach, timestamp, path,
    participantFirst, participantLast, participantEmail,
    scores, kineticState, kineticSubtitle,
    responses, aiResults
  } = auditData;

  const scoreBar = (val) => {
    const pct = Math.round((val / 10) * 100);
    return `<div style="display:inline-block;width:80px;height:8px;background:#2a2a2a;border-radius:4px;vertical-align:middle;">
      <div style="width:${pct}%;height:100%;background:#c8a84b;border-radius:4px;"></div>
    </div> <span style="font-size:11px;color:#888;">${val}/10</span>`;
  };

  const section = (label, content) => content ? `
    <div style="margin-bottom:20px;">
      <div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#c8a84b;margin-bottom:6px;">${label}</div>
      <div style="font-size:14px;line-height:1.7;color:#ccc;">${content.replace(/\n/g, '<br>')}</div>
    </div>` : '';

  const htmlEmail = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a08;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:640px;margin:0 auto;padding:40px 20px;">

  <!-- Header -->
  <div style="border-bottom:1px solid #2a2a2a;padding-bottom:24px;margin-bottom:32px;">
    <div style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#7a6530;margin-bottom:6px;">Focus Academy Global</div>
    <div style="font-size:24px;color:#e8e0cc;font-weight:300;">Kinetic Audit — Session Record</div>
    <div style="font-size:12px;color:#5a5a52;margin-top:6px;">${timestamp}</div>
  </div>

  <!-- Session Info -->
  <div style="background:#161614;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:24px;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div>
        <div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#7a6530;margin-bottom:4px;">Coach</div>
        <div style="font-size:15px;color:#e8e0cc;">${coach}</div>
      </div>
      <div>
        <div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#7a6530;margin-bottom:4px;">Participant</div>
        <div style="font-size:15px;color:#e8e0cc;">${participantFirst} ${participantLast}</div>
        <div style="font-size:11px;color:#5a5a52;">${participantEmail}</div>
      </div>
      <div>
        <div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#7a6530;margin-bottom:4px;">Audit Path</div>
        <div style="font-size:14px;color:#e8e0cc;">${path === 'baseline' ? 'Kinetic Baseline' : 'Kinetic Lens'}</div>
      </div>
      <div>
        <div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#7a6530;margin-bottom:4px;">Kinetic State</div>
        <div style="font-size:14px;color:#c8a84b;font-weight:500;">${kineticState}</div>
        <div style="font-size:11px;color:#5a5a52;">${kineticSubtitle}</div>
      </div>
    </div>
  </div>

  <!-- Elemental Scores -->
  <div style="background:#161614;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:24px;">
    <div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#7a6530;margin-bottom:14px;">Elemental Scores</div>
    <table style="width:100%;border-collapse:collapse;">
      <tr style="margin-bottom:10px;">
        <td style="font-size:11px;color:#2d6b2d;text-transform:uppercase;letter-spacing:.06em;width:60px;padding:5px 0;">Earth</td>
        <td style="padding:5px 0;">${scoreBar(scores.Earth)}</td>
        <td style="font-size:11px;color:#2d4a8a;text-transform:uppercase;letter-spacing:.06em;width:40px;padding:5px 0 5px 20px;">Air</td>
        <td style="padding:5px 0;">${scoreBar(scores.Air)}</td>
      </tr>
      <tr>
        <td style="font-size:11px;color:#1e5a6e;text-transform:uppercase;letter-spacing:.06em;padding:5px 0;">Water</td>
        <td style="padding:5px 0;">${scoreBar(scores.Water)}</td>
        <td style="font-size:11px;color:#7a2a1a;text-transform:uppercase;letter-spacing:.06em;padding:5px 0 5px 20px;">Fire</td>
        <td style="padding:5px 0;">${scoreBar(scores.Fire)}</td>
      </tr>
    </table>
  </div>

  <!-- Stage 1 Responses -->
  <div style="background:#161614;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:16px;">
    <div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#2d6b2d;margin-bottom:14px;">Stage 1 — Earth · Ground</div>
    ${path === 'baseline'
      ? section('Reality (participant\'s words)', responses.reality) +
        section('Stability rating', responses.stability + ' / 5')
      : section('Situation described', responses.situation) +
        section('Their sphere of responsibility', responses.role)
    }
  </div>

  <!-- Stage 2 Scores -->
  <div style="background:#161614;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:16px;">
    <div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#2d4a8a;margin-bottom:14px;">Stage 2 — Air · Diagnostic Scores</div>
    <div style="font-size:12px;color:#888;line-height:1.6;">
      Computed from 8 diagnostic statements rated 1–5 (forward and reverse scored).<br>
      Earth: ${scores.Earth}/10 &nbsp;·&nbsp; Air: ${scores.Air}/10 &nbsp;·&nbsp; Water: ${scores.Water}/10 &nbsp;·&nbsp; Fire: ${scores.Fire}/10
    </div>
  </div>

  <!-- Stage 3 Responses -->
  <div style="background:#161614;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:16px;">
    <div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#1e5a6e;margin-bottom:14px;">Stage 3 — Water · Resonance Check</div>
    ${section('What this situation is teaching them', responses.teach)}
    ${section('What this moment feels like it needs', responses.need)}
  </div>

  <!-- Stage 4 Commitment -->
  <div style="background:#161614;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:16px;">
    <div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#7a2a1a;margin-bottom:14px;">Stage 4 — Fire · 24-Hour Commitment</div>
    <div style="font-size:15px;font-style:italic;color:#e8e0cc;line-height:1.6;">"${responses.commitment}"</div>
  </div>

  <!-- AI Results -->
  <div style="background:#1c1c14;border:1px solid rgba(200,168,75,.2);border-radius:10px;padding:20px;margin-bottom:24px;">
    <div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#c8a84b;margin-bottom:18px;">AI-Generated Analysis · Focusynthesis® Model</div>
    ${section('Diagnosis', aiResults.diagnosis)}
    ${section('Resonance Gap', aiResults.resonanceGap)}
    ${section('Protocol', aiResults.protocol)}
    ${section('Behavioural Observation', aiResults.behaviour)}
  </div>

  <!-- Footer -->
  <div style="border-top:1px solid #2a2a2a;padding-top:20px;text-align:center;">
    <div style="font-size:10px;color:#3a3a32;letter-spacing:.06em;">Focus Academy Global · focusacademy.global · Focusynthesis® · Internal session record</div>
  </div>

</div>
</body>
</html>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Kinetic Audit <audit@send.focusacademy.global>',
        to: ['hello@stephanebrowet.be', 'scnaessens@gmail.com'],
        subject: `Kinetic Audit — ${participantFirst} ${participantLast} — ${kineticState} — ${timestamp}`,
        html: htmlEmail,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return res.status(502).json({ error: 'Email send failed', detail: err });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    console.error('Email function error:', err);
    return res.status(500).json({ error: 'Email failed', detail: err.message });
  }
}
