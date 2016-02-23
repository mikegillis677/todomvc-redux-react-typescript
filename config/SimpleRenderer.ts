import * as fs from "fs";
import * as path from "path";

export interface SimpleRendererOptions {
  styleUrl: string;
  scriptUrl: string;
}

export class Renderer {
  html: string;

  constructor(options:SimpleRendererOptions) {
    var html = fs.readFileSync(path.resolve(__dirname, "../client/index.html"), "utf-8");
    this.html = html
      .replace("STYLE_URL", options.styleUrl)
      .replace("SCRIPT_URL", options.scriptUrl);
  }

  render(_path:any, callback: (err:any, html:string) => any) {
    callback(null, this.html);
  }
}
