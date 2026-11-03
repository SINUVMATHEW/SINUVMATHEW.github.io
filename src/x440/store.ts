import {create} from 'zustand';
import {initialState,type LabState} from './state';
type StateUpdate=LabState|((state:LabState)=>LabState);
export const useLabStore=create<{state:LabState;setState:(update:StateUpdate)=>void}>(set=>({state:initialState,setState:update=>set(current=>({state:typeof update==='function'?update(current.state):update}))}));
