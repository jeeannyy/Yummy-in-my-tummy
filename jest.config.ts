// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
	transform: {
		'^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
	},
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	moduleNameMapper: {
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
	},
};

export default config;
