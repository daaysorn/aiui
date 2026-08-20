import { fileURLToPath as __eveFileURLToPath } from "node:url";
import { dirname as __eveDirname } from "node:path";
import { createRequire as __eveCreateRequire } from "node:module";
const __filename = __eveFileURLToPath(import.meta.url);
__eveDirname(__filename);
__eveCreateRequire(import.meta.url);
import { defineAgent } from "eve";
import { eveChannel } from "eve/channels/eve";
import { localDev } from "eve/channels/auth";
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
const ACCESS_COOKIE = "aiui_access_token";
function readCookie(header, name) {
	if (!header) return null;
	for (const part of header.split(";")) {
		const trimmed = part.trim();
		if (!trimmed.startsWith(`${name}=`)) continue;
		const value = trimmed.slice(name.length + 1).trim();
		return value ? decodeURIComponent(value) : null;
	}
	return null;
}
function resolveApiOrigin() {
	return (process.env.API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim() || "").replace(/\/$/, "") || null;
}
const daaybotSessionAuth = async (request) => {
	const token = readCookie(request.headers.get("cookie"), ACCESS_COOKIE);
	if (!token) return null;
	const apiOrigin = resolveApiOrigin();
	if (!apiOrigin) return null;
	try {
		const response = await fetch(`${apiOrigin}/v1/user/me`, {
			headers: { authorization: `Bearer ${token}` },
			cache: "no-store"
		});
		if (!response.ok) return null;
		const body = await response.json();
		const user = body.data?.user ?? body.user;
		const userId = user?.id?.trim();
		if (!userId) return null;
		const attributes = {};
		if (user.email?.trim()) attributes.email = user.email.trim();
		if (user.name?.trim()) attributes.name = user.name.trim();
		return {
			authenticator: "daaybot",
			principalType: "user",
			principalId: userId,
			attributes
		};
	} catch {
		return null;
	}
};
var eve_exports = __exportAll({ default: () => eve_default });
var eve_default = eveChannel({
	auth: [daaybotSessionAuth, localDev()],
	cors: true
});
const moduleMap = Object.freeze({ "nodes": Object.freeze({ "__root__": Object.freeze({ "modules": Object.freeze({
	"agent.ts": agent_exports,
	"channels/eve.ts": eve_exports
}) }) }) });
export { moduleMap as default, moduleMap };
