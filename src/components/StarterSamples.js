import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { STARTER_SAMPLES, readDismissed } from './starterSampleData';
import './StarterSamples.css';

export function StarterSamplesPanel({ tab, dismissed = {}, onChange, busy = false, error = '', darkMode = false }) {
  const section = STARTER_SAMPLES[tab];
  if (!section) return null;
  const items = section.items.filter(item => !dismissed[item.id]);
  return <section className={`rm-samples ${darkMode ? 'rm-samples-dark' : ''}`} aria-label={`${section.title} — နမူနာများ`}>
    {error && <p className="rm-samples-error" role="alert">{error}</p>}
    {items.length ? <>
      <div className="rm-samples-heading"><div><span className="rm-samples-eyebrow">စတင်အသုံးပြုရန် · နမူနာများ</span><h2>{section.title}</h2></div><button type="button" className="rm-samples-clear" disabled={busy} onClick={() => onChange(section.items.map(item => item.id), true)}>ဒီမီနူးက နမူနာများ ဖယ်ရန်</button></div>
      <p className="rm-samples-hint">{section.hint}</p>
      <div className="rm-samples-grid">{items.map(item => <article className={`rm-sample-card rm-sample-${item.theme}`} key={item.id}>
        <div className="rm-sample-top"><span className="rm-sample-badge">နမူနာ</span><button type="button" disabled={busy} className="rm-sample-delete" aria-label={`${item.title} နမူနာကို ဖယ်ရန်`} title="နမူနာကို ဖယ်ရန်" onClick={() => onChange([item.id], true)}><span aria-hidden="true">×</span></button></div>
        {item.kind === 'landscape' ? <div className="rm-sample-landscape" role="img" aria-label="တောင်တန်းနှင့်နေဝန်း သရုပ်ဖော်ပုံ"><span className="rm-sample-sun"/><span className="rm-sample-mountain one"/><span className="rm-sample-mountain two"/><span className="rm-sample-landscape-label">အတူတူရှိတဲ့ အချိန်လေးတွေ</span></div> : item.kind === 'postcard' ? <div className="rm-sample-postcard"><span aria-hidden="true">♡</span><strong>ချစ်ခြင်းမေတ္တာဖြင့်…</strong></div> : <span className="rm-sample-icon" aria-hidden="true">{item.icon}</span>}
        <h3>{item.title}</h3><p className="rm-sample-text">{item.text}</p><div className="rm-sample-meta">{item.meta}</div>
      </article>)}</div>
      <p className="rm-samples-footnote">နမူနာတစ်ခုချင်းစီကို × နှိပ်ပြီး ဖယ်နိုင်ပါတယ်။ တကယ့်မှတ်တမ်းတွေကို မထိခိုက်ပါဘူး။</p>
    </> : <div className="rm-samples-hidden"><span>ဒီမီနူးက နမူနာတွေကို ဖယ်ထားပြီးပါပြီ။</span><button type="button" disabled={busy} onClick={() => onChange(section.items.map(item => item.id), false)}>နမူနာများ ပြန်ပြရန်</button></div>}
  </section>;
}

// Only an account's display preferences are stored. No sample data is inserted
// into posts/events/tasks or shared family records, and no reminders are created.
function AccountStarterSamples({ userId, tab, darkMode }) {
  const [dismissed, setDismissed] = useState({});
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setReady(false);
    const reference = doc(db, 'users', userId, 'preferences', 'starterSamplesV1');
    const unsubscribe = onSnapshot(reference, { includeMetadataChanges: true }, snapshot => {
      if (!active || snapshot.metadata?.hasPendingWrites) return;
      setDismissed(readDismissed(snapshot.data()));
      setReady(true);
      setError('');
    }, () => {
      if (!active) return;
      setError('နမူနာပြသမှုအခြေအနေကို မဖတ်နိုင်သေးပါ။ အင်တာနက်ချိတ်ဆက်မှုနဲ့ Firebase ခွင့်ပြုချက်ကို စစ်ပြီး ပြန်စမ်းပါ။');
    });
    return () => { active = false; unsubscribe(); };
  }, [userId, retry]);

  async function change(ids, hidden) {
    if (busy) return;
    setBusy(true);
    setError('');
    // Waiting for the server write prevents a failed save from looking successful.
    try {
      await setDoc(doc(db, 'users', userId, 'preferences', 'starterSamplesV1'), {
        dismissed: Object.fromEntries(ids.map(id => [id, hidden])),
      }, { merge: true });
      setDismissed(previous => ({ ...previous, ...Object.fromEntries(ids.map(id => [id, hidden])) }));
    } catch {
      setError('မသိမ်းနိုင်သေးပါ။ နမူနာကို အမြဲတမ်း ဖယ်ထားခြင်း မအောင်မြင်သေးလို့ ပြန်စမ်းပေးပါ။');
    } finally { setBusy(false); }
  }
  if (!ready) return error ? <div className="rm-samples" role="alert"><p>{error}</p><button type="button" className="rm-samples-clear" onClick={() => setRetry(value => value + 1)}>ပြန်စမ်းရန်</button></div> : <p className="rm-samples-loading" role="status">နမူနာများ ပြင်ဆင်နေပါသည်…</p>;
  return <StarterSamplesPanel tab={tab} dismissed={dismissed} onChange={change} busy={busy} error={error} darkMode={darkMode}/>;
}
export default function StarterSamples({ userId, tab, darkMode }) {
  return userId ? <AccountStarterSamples key={userId} userId={userId} tab={tab} darkMode={darkMode}/> : null;
}
