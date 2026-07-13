import type { Config } from "vike/types";
import vikeReact from "vike-react/config";

// Default config (can be overridden by pages)
// https://vike.dev/config

const config: Config = {
  // https://vike.dev/head-tags
  title: "Ndalama",
  description: "Fintech for Zambian entrepreneurs",

  extends: [vikeReact],

  passToClient: ["user"],
};

export default config;
