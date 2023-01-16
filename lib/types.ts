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
		"imp": {
			"type": "object",
			"properties": {
				"cjs": {
					"type": "string",
					"default": ""
				},
				"esm": {
					"type": "string",
					"default": ""
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
					"type": "string",
					"default": ""
				},
				"webpack": {
					"type": "string",
					"default": ""
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
		}
	}
} as const