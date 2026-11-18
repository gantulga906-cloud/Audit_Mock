import {AsyncLocalStorage} from 'node:async_hooks';

// Request-local identity; never mutate the legacy role map or historical actors.
const context=new AsyncLocalStorage();
export const currentIdentity=()=>context.getStore();
export const withIdentity=(identity,fn)=>context.run(identity,fn);
export const actorKey=role=>currentIdentity()?.id??role;
