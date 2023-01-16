import type { OfSchema } from 'accurtype'
export type InConfig = OfSchema<typeof configSchema>
export const configSchema = {
	"$schema": "http://json-schema.org/draft-07/schema",
	"type": "object",
	"properties": {
		"disp": {
			"type": "object",
			"properties": {
				"path": {
					"type": "boolean",
					"default": true
				},
				"stat": {
					"type": "boolean",
					"default": true
				}
			}
		},
		"req": {
			"type": "array",
			"items": {
				"type": "string",
				"enum": [
					"ts",
					"node-esm",
					"node-cjs",
					"webpack-esm",
					"webpack-cjs"
				]
			},
			"default": [
				"ts",
				"node-esm",
				"node-cjs",
				"webpack-esm",
				"webpack-cjs"
			]
		},
		"cfg": {
			"type": "object",
			"properties": {
				"ts": {
					"type": "object",
					"properties": {
						"path": {
							"type": "string",
							"default": ""
						},
						"cmd": {
							"type": "string",
							"default": ""
						},
						"cjsMod": {
							"type": "boolean",
							"default": false
						}
					}
				},
				"webpack": {
					"type": "object",
					"properties": {
						"path": {
							"type": "string",
							"default": ""
						},
						"cmd": {
							"type": "string",
							"default": ""
						}
					}
				}
			}
		},
		"sign": {
			"type": "string",
			"default": "a"
		},
		"file": {
			"type": "string",
			"default": null
		},
		"pack": {
			"type":"string",
			"default": ""
		}
	}
} as const