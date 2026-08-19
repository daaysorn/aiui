import { fileURLToPath as __eveFileURLToPath } from "node:url";
import { dirname as __eveDirname } from "node:path";
import { createRequire as __eveCreateRequire } from "node:module";
const __filename = __eveFileURLToPath(import.meta.url);
__eveDirname(__filename);
__eveCreateRequire(import.meta.url);
import { defineAgent } from "eve";
import { eveChannel } from "eve/channels/eve";
import { localDev, placeholderAuth, vercelOidc } from "eve/channels/auth";
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var agent_exports = __exportAll({ default: () => agent_default });
var agent_default = defineAgent({ model: "zai/glm-5.2" });
var eve_exports = __exportAll({ default: () => eve_default });
var eve_default = eveChannel({ auth: [
	vercelOidc(),
	localDev(),
	placeholderAuth()
] });
const moduleMap = Object.freeze({ "nodes": Object.freeze({ "__root__": Object.freeze({ "modules": Object.freeze({
	"agent.ts": agent_exports,
	"channels/eve.ts": eve_exports
}) }) }) });
export { moduleMap as default, moduleMap };
