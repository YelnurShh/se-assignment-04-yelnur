import { registerHooks, stripTypeScriptTypes } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
registerHooks({
  resolve(specifier, context, nextResolve) {
    let candidate;
    if (specifier.startsWith('@/')) candidate=path.join(root,'src',specifier.slice(2));
    else if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) candidate=path.resolve(path.dirname(fileURLToPath(context.parentURL)),specifier);
    if(candidate) {
      if(!path.extname(candidate) && existsSync(candidate+'.ts')) candidate+='.ts';
      if(existsSync(candidate)) return nextResolve(pathToFileURL(candidate).href,context);
    }
    return nextResolve(specifier,context);
  },
  load(url,context,nextLoad) {
    if(url.endsWith('.ts')) return {format:'module',source:stripTypeScriptTypes(readFileSync(fileURLToPath(url),'utf8'),{mode:'strip'}),shortCircuit:true};
    return nextLoad(url,context);
  }
});
