export default {
	testEnvironment: 'jsdom',
	transform: {
		'^.+\\.[jt]sx?$': 'babel-jest',
	},
	moduleNameMapper: {
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
	},
	setupFiles: ['./jest.setup.js'], // 🔥 여기에 추가
};
