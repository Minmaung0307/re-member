import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import StarterSamples, { StarterSamplesPanel } from './StarterSamples';
import { STARTER_SAMPLES, SAMPLE_IDS, readDismissed } from './starterSampleData';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
jest.mock('../firebase', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
 doc: jest.fn((db, ...segments) => segments.join('/')),
 onSnapshot: jest.fn(),
 setDoc: jest.fn(),
}));
beforeEach(() => { jest.clearAllMocks(); doc.mockImplementation((db,...segments)=>segments.join("/")); onSnapshot.mockImplementation((ref,options,next)=>{next({data:()=>({}),metadata:{hasPendingWrites:false}});return jest.fn();});setDoc.mockResolvedValue(); });
test('all six menus have two unique, removable examples',()=>{
 expect(Object.keys(STARTER_SAMPLES)).toHaveLength(6);
 expect(new Set(SAMPLE_IDS).size).toBe(12);
 for(const [tab,section] of Object.entries(STARTER_SAMPLES)) {
  const change=jest.fn();render(<StarterSamplesPanel tab={tab} onChange={change}/>);
  expect(screen.getAllByRole('article')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button',{name:`${section.items[0].title} နမူနာကို ဖယ်ရန်`}));
  expect(change).toHaveBeenCalledWith([section.items[0].id],true);
  cleanup();
 }
});
test('dismissed samples remain absent and can be explicitly restored',()=>{
 const change=jest.fn();render(<StarterSamplesPanel tab="feed" dismissed={{'feed-family':true,'feed-milestone':true}} onChange={change}/>);
 expect(screen.queryAllByRole('article')).toHaveLength(0);
 fireEvent.click(screen.getByRole('button',{name:'နမူနာများ ပြန်ပြရန်'}));
 expect(change).toHaveBeenCalledWith(['feed-family','feed-milestone'],false);
});
test('only known boolean dismissal values are accepted',()=>{
 expect(readDismissed({dismissed:{'feed-family':true,'feed-milestone':'true',unknown:true}})).toEqual({'feed-family':true});
 expect(readDismissed({dismissed:[]})).toEqual({});
});
test('user deletion writes only scoped display preferences with merge',async()=>{
 render(<StarterSamples userId="alice" tab="feed"/>);
 fireEvent.click(screen.getByRole('button',{name:`${STARTER_SAMPLES.feed.items[0].title} နမူနာကို ဖယ်ရန်`}));
 await waitFor(()=>expect(screen.getAllByRole('article')).toHaveLength(1));
 expect(setDoc).toHaveBeenCalledWith('users/alice/preferences/starterSamplesV1',{dismissed:{'feed-family':true}},{merge:true});
});
test('saved account preferences survive a remount',()=>{
 onSnapshot.mockImplementation((ref,options,next)=>{next({data:()=>({dismissed:{'gallery-trip':true}}),metadata:{hasPendingWrites:false}});return jest.fn();});
 const view=render(<StarterSamples userId="alice" tab="gallery"/>);
 expect(screen.getAllByRole('article')).toHaveLength(1);view.unmount();
 render(<StarterSamples userId="alice" tab="gallery"/>);
 expect(screen.getAllByRole('article')).toHaveLength(1);
 expect(screen.queryByRole('heading',{name:STARTER_SAMPLES.gallery.items[0].title})).not.toBeInTheDocument();
});
test('account switching clears previous-account state while loading',()=>{
 onSnapshot.mockImplementation((ref,options,next)=>{if(ref.includes('/alice/'))next({data:()=>({dismissed:{'feed-family':true}}),metadata:{hasPendingWrites:false}});return jest.fn();});
 const view=render(<StarterSamples userId="alice" tab="feed"/>);expect(screen.getAllByRole('article')).toHaveLength(1);
 view.rerender(<StarterSamples userId="bob" tab="feed"/>);
 expect(screen.queryAllByRole('article')).toHaveLength(0);
 expect(screen.getByRole('status')).toBeInTheDocument();
});
test('failed preference write retains the example and explains the failure',async()=>{
 setDoc.mockRejectedValue(new Error('permission-denied'));
 render(<StarterSamples userId="alice" tab="feed"/>);
 fireEvent.click(screen.getByRole('button',{name:`${STARTER_SAMPLES.feed.items[0].title} နမူနာကို ဖယ်ရန်`}));
 await screen.findByRole('alert');
 expect(screen.getAllByRole('article')).toHaveLength(2);
});
test('pending local snapshots do not hide samples before acknowledgement',()=>{
 let emit;onSnapshot.mockImplementation((ref,options,next)=>{emit=next;next({data:()=>({}),metadata:{hasPendingWrites:false}});return jest.fn();});
 render(<StarterSamples userId="alice" tab="feed"/>);
 emit({data:()=>({dismissed:{'feed-family':true}}),metadata:{hasPendingWrites:true}});
 expect(screen.getAllByRole('article')).toHaveLength(2);
});
