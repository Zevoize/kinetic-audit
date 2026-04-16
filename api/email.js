export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'SENDGRID_API_KEY not configured' });

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
    return '<div style="display:inline-block;width:80px;height:8px;background:#2a2a2a;border-radius:4px;vertical-align:middle;"><div style="width:' + pct + '%;height:100%;background:#c8a84b;border-radius:4px;"></div></div> <span style="font-size:11px;color:#888;">' + val + '/10</span>';
  };

  const section = (label, content) => {
    if (!content) return '';
    return '<div style="margin-bottom:20px;"><div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#c8a84b;margin-bottom:6px;">' + label + '</div><div style="font-size:14px;line-height:1.7;color:#ccc;">' + content.replace(/\n/g, '<br>') + '</div></div>';
  };

  const stageOneContent = path === 'baseline'
    ? section("Reality (participant's words)", responses.reality) + section('Stability rating', responses.stability + ' / 5')
    : section('Situation described', responses.situation) + section('Their sphere of responsibility', responses.role);

  const htmlEmail = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#0a0a08;font-family:Helvetica,Arial,sans-serif;">'
    + '<div style="max-width:640px;margin:0 auto;padding:40px 20px;">'
    + '<div style="border-bottom:1px solid #2a2a2a;padding-bottom:24px;margin-bottom:32px;">'
    + '<div style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#7a6530;margin-bottom:6px;">Focus Academy Global</div>'
    + '<div style="font-size:24px;color:#e8e0cc;font-weight:300;">Kinetic Audit &#8212; Session Record</div>'
    + '<div style="font-size:12px;color:#5a5a52;margin-top:6px;">' + timestamp + '</div>'
    + '</div>'
    + '<div style="background:#161614;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:24px;">'
    + '<table style="width:100%;"><tr>'
    + '<td style="padding:8px;"><div style="font-size:10px;color:#7a6530;text-transform:uppercase;margin-bottom:4px;">Coach</div><div style="color:#e8e0cc;">' + coach + '</div></td>'
    + '<td style="padding:8px;"><div style="font-size:10px;color:#7a6530;text-transform:uppercase;margin-bottom:4px;">Participant</div><div style="color:#e8e0cc;">' + participantFirst + ' ' + participantLast + '</div><div style="font-size:11px;color:#5a5a52;">' + participantEmail + '</div></td>'
    + '</tr><tr>'
    + '<td style="padding:8px;"><div style="font-size:10px;color:#7a6530;text-transform:uppercase;margin-bottom:4px;">Path</div><div style="color:#e8e0cc;">' + (path === 'baseline' ? 'Kinetic Baseline' : 'Kinetic Lens') + '</div></td>'
    + '<td style="padding:8px;"><div style="font-size:10px;color:#7a6530;text-transform:uppercase;margin-bottom:4px;">Kinetic State</div><div style="color:#c8a84b;font-weight:500;">' + kineticState + '</div><div style="font-size:11px;color:#5a5a52;">' + kineticSubtitle + '</div></td>'
    + '</tr></table></div>'
    + '<div style="background:#161614;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:16px;">'
    + '<div style="font-size:10px;color:#7a6530;text-transform:uppercase;margin-bottom:14px;">Elemental Scores</div>'
    + '<table style="width:100%;"><tr>'
    + '<td style="font-size:11px;color:#2d6b2d;text-transform:uppercase;width:60px;padding:5px 0;">Earth</td><td>' + scoreBar(scores.Earth) + '</td>'
    + '<td style="font-size:11px;color:#2d4a8a;text-transform:uppercase;padding:5px 20px;">Air</td><td>' + scoreBar(scores.Air) + '</td>'
    + '</tr><tr>'
    + '<td style="font-size:11px;color:#1e5a6e;text-transform:uppercase;padding:5px 0;">Water</td><td>' + scoreBar(scores.Water) + '</td>'
    + '<td style="font-size:11px;color:#7a2a1a;text-transform:uppercase;padding:5px 20px;">Fire</td><td>' + scoreBar(scores.Fire) + '</td>'
    + '</tr></table></div>'
    + '<div style="background:#161614;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:16px;">'
    + '<div style="font-size:10px;color:#2d6b2d;text-transform:uppercase;margin-bottom:14px;">Stage 1 &#8212; Earth</div>'
    + stageOneContent + '</div>'
    + '<div style="background:#161614;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:16px;">'
    + '<div style="font-size:10px;color:#1e5a6e;text-transform:uppercase;margin-bottom:14px;">Stage 3 &#8212; Water</div>'
    + section('What this is teaching them', responses.teach)
    + section('What this moment needs', responses.need) + '</div>'
    + '<div style="background:#161614;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:16px;">'
    + '<div style="font-size:10px;color:#7a2a1a;text-transform:uppercase;margin-bottom:14px;">Stage 4 &#8212; Fire</div>'
    + '<div style="font-size:15px;font-style:italic;color:#e8e0cc;">&quot;' + responses.commitment + '&quot;</div></div>'
    + '<div style="background:#1c1c14;border:1px solid rgba(200,168,75,.2);border-radius:10px;padding:20px;margin-bottom:24px;">'
    + '<div style="font-size:10px;color:#c8a84b;text-transform:uppercase;margin-bottom:18px;">AI-Generated Reading &#183; Focusynthesis&#174; Model</div>'
    + section('The Mechanics', aiResults.diagnosis)
    + section('Resonance Gap', aiResults.resonanceGap)
    + section('Protocol', aiResults.protocol)
    + section('Behavioural Observation', aiResults.behaviour) + '</div>'
    + '<div style="border-top:1px solid #2a2a2a;padding-top:20px;text-align:center;font-size:10px;color:#3a3a32;">Focus Academy Global &#183; focusacademy.global &#183; Focusynthesis&#174; &#183; Internal session record</div>'
    + '</div></body></html>';

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        personalizations: [{
          to: [
            { email: 'hello@stephanebrowet.be' },
            { email: 'scnaessens@gmail.com' },
          ],
        }],
        from: { email: 'audit@send.focusacademy.global', name: 'Kinetic Audit' },
        subject: 'Kinetic Audit — ' + participantFirst + ' ' + participantLast + ' — ' + kineticState + ' — ' + timestamp,
        content: [{ type: 'text/html', value: htmlEmail }],
      }),
    });

    if (response.status === 202) {
      return res.status(200).json({ success: true });
    }

    const err = await response.text();
    console.error('SendGrid error:', err);
    return res.status(502).json({ error: 'Email send failed', detail: err });

  } catch (err) {
    console.error('Email function error:', err);
    return res.status(500).json({ error: 'Email failed', detail: err.message });
  }
}
