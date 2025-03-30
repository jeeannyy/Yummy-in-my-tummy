import { TextEncoder, TextDecoder } from 'util';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

if (!global.TextEncoder) {
	global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
}
if (!global.TextDecoder) {
	global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;
}
