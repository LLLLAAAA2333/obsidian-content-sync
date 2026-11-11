import { Plugin } from "obsidian";
import { registerPlain } from "./app/plain";
export default class PlainDirectorySync extends Plugin {
	host?: Awaited<ReturnType<typeof registerPlain>>;
	async onload() {
		this.host = await registerPlain(this);
	}
	onunload() {
		this.host = undefined;
	}
}
